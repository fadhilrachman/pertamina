<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";
import { v4 as uuidv4 } from "uuid";
import type { SessionResponseType } from "~/types/user-type";

const idempotencyKey = uuidv4();
const stockTransactionStore = useStockTransaction();
const { loadingWrite } = storeToRefs(stockTransactionStore);
const facilitiesStore = useFacilitiesStore();
const facilitiesSkuStore = useFacilitiesSkuStore();
const { data: facilitiesSkuData } = storeToRefs(facilitiesSkuStore);
const { data: facilitiesData } = storeToRefs(facilitiesStore);
const { data: authData } = useAuth();

const isManagementRole = computed(() => {
  const session = authData.value as SessionResponseType | null;
  const roleName = session?.data?.role?.name || "";
  return roleName.toLowerCase() === "management";
});

const facilitiesSkuList = computed(
  () =>
    facilitiesSkuData.value?.data?.data ||
    (Array.isArray(facilitiesSkuData.value?.data)
      ? facilitiesSkuData.value?.data
      : [])
);

const facilitiesSkuOptions = computed(
  () =>
    facilitiesSkuList.value.map((item) => ({
      id: item.id,
      label: `${item.sku_code} - ${item.sku_name}`,
    })) || []
);

const facilitiesOptions = computed(
  () =>
    facilitiesData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const formSchema = object({
  sku_id: string().required("SKU Name is required"),
  facility_id: string().required("Facility Name is required"),
  qty: string().required("QTY is required"),
  date: string().required("Date is required"),
});
const createInitialValues = (): any => ({
  sku_id: "",
  facility_id: "",
  // uom: "",
  qty: "",
  description: "",
  // reference_type: "",
  date: "",
  attachments: [] as File[],
});

const form = useForm<any>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});
const { values, setFieldValue } = form;

type StockInFormValues = {
  sku_id: string;
  facility_id: string;
  qty: string | number;
  note?: string;
  reference_no?: string;
  reference_type?: string;
  date: string;
  attachments?: File[];
};

const handleSubmit = async (val: Record<string, any>) => {
  const payload = val as StockInFormValues;

  const res = await stockTransactionStore.createDataStockTransaction(
    {
      lines: [
        {
          qty: Number(payload.qty),
          facility_sku_id: payload.sku_id,
          uom: "kg", // TEMPORARY
        },
      ],
      note: payload.note,
      reference_no: payload.reference_no,
      reference_type: payload.reference_type,
      trx_date: payload.date,
      trx_type: "IN",
    },
    {
      uuid: idempotencyKey,
    }
  );

  const transactionId = (res as any)?.data?.id;

  if (transactionId && payload.attachments?.length) {
    await stockTransactionStore.uploadTransactionAttachments({
      transactionId,
      files: payload.attachments as File[],
    });
  }

  form.resetForm({ values: createInitialValues() });
};
const formFields = computed<FieldConfig[]>(() => [
  {
    name: "facility_id",
    label: "Receiving Warehouse ",
    type: "search-select",
    placeholder: "Select Warehouse",
    grid: 6,
    requiredMark: true,
    options: facilitiesOptions.value,
  },
  {
    name: "sku_id",
    label: "SKU Name",
    type: "search-select",
    placeholder: "Select SKU",
    grid: 6,
    requiredMark: true,
    options: facilitiesSkuOptions.value,
    disabled: !values.facility_id,
  },

  {
    label: "Quantity",
    name: "qty",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., 150",
    grid: 6,
  },

  {
    name: "reference_no",
    label: "Reference No.",
    // requiredMark: true,
    type: "text",
    placeholder: "e.g., PO-12345",
    grid: 6,
  },

  {
    name: "date",
    label: "Date Received  ",
    requiredMark: true,
    type: "date",
    placeholder: "e.g., 2024-05-30",
    grid: 6,
  },

  {
    name: "note",
    label: "Notes",
    type: "textarea",
    placeholder: "e.g., Incoming from vendor ABC",
    grid: 12,
  },
]);

watch(
  () => values.facility_id,
  (next, prev) => {
    console.log({ values });
    form.setValues({
      sku_id: "",
    });
    facilitiesSkuStore.getDataFacilitiesSku({
      page: 1,
      limit: 1000,
      facility_id: next,
    });
  },
  { immediate: true }
);

onMounted(() => {
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});
</script>

<template>
  <main class="space-y-6">
    <header class="flex justify-between items-end">
      <GeneralTitle
        title="Stock In"
        subtitle="Add New Stock to Warehouse Inventory"
      />
    </header>
    <section class="max-w-[700px]">
      <div class="bg-white rounded-lg p-6">
        <GeneralFormGenerator
          id="FormStockIn"
          :form-context="form"
          :fields="formFields"
          :validation-schema="formSchema"
          class-name=""
          @submit="handleSubmit"
        />
        <div class="mt-4">
          <GeneralAttachmentUpload
            label="Attachments"
            hint="Optional supporting photos or PDFs."
            accept="image/*,application/pdf"
            :model-value="values.attachments"
            :max-files="5"
            :max-size-mb="50"
            @update:model-value="(files) => setFieldValue('attachments', files)"
          />
        </div>
        <div class="flex justify-end mt-4 gap-3 pt-2">
          <GeneralOutlinedButton label="Cancel" type="button" />
          <GeneralButton
            v-if="!isManagementRole"
            :loading="loadingWrite"
            :disabled="loadingWrite"
            type="submit"
            form="FormStockIn"
            color="primary"
            label="Submit"
          />
        </div>
      </div>
    </section>
  </main>
</template>
