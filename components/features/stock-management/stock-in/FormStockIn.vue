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

const idempotencyKey = uuidv4();
const stockTransactionStore = useStockTransaction();
const { loadingWrite } = storeToRefs(stockTransactionStore);
const facilitiesStore = useFacilitiesStore();
const facilitiesSkuStore = useFacilitiesSkuStore();
const { data: facilitiesSkuData } = storeToRefs(facilitiesSkuStore);
const { data: facilitiesData } = storeToRefs(facilitiesStore);

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
  uom: string().required("Unit of Measure is required"),
  // reference_no: string().required("Reference No. is required"),
  reference_type: string().required("Reference Type is required"),
  date: string().required("Date is required"),
});
const createInitialValues = (): any => ({
  sku_id: "",
  facility_id: "",
  uom: "",
  qty: "",
  description: "",
  reference_type: "",
  date: "",
});

const form = useForm<any>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});
const { values } = form;
const formFields = computed<FieldConfig[]>(() => [
  {
    name: "sku_id",
    label: "SKU Name",
    type: "search-select",
    placeholder: "Select SKU",
    grid: 6,
    requiredMark: true,
    options: facilitiesSkuOptions.value,
    // disabled: !values.facility_id,
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
    name: "facility_id",
    label: "Receiving Warehouse ",
    type: "search-select",
    placeholder: "Select Warehouse",
    grid: 6,
    requiredMark: true,
    options: facilitiesOptions.value,
  },
  // {
  //   name: "uom",
  //   label: "UOM.",
  //   requiredMark: true,
  //   type: "text",
  //   placeholder: "e.g., Unit, Liter, Kg",

  //   grid: 6,
  // },
  {
    name: "reference_no",
    label: "Reference No.",
    // requiredMark: true,
    type: "text",
    placeholder: "e.g., PO-12345",
    grid: 6,
  },
  // {
  //   name: "reference_type",
  //   label: "Reference Type",
  //   requiredMark: true,
  //   type: "text",
  //   placeholder: "e.g., Purchase Order",
  //   grid: 6,
  // },
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

// Hanya fetch data SKU fasilitas ketika facility_id berubah dan terisi
watch(
  () => values.facility_id,
  (next, prev) => {
    // Debug perubahan facility_id
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
          @submit="
            async (val) => {
              console.log({ val });

              await stockTransactionStore.createDataStockTransaction(
                {
                  lines: [
                    {
                      qty: Number(val.qty),
                      facility_sku_id: val.sku_id,
                      uom: val.uom,
                    },
                  ],
                  note: val.note,
                  reference_no: val.reference_no,
                  reference_type: val.reference_type,
                  trx_date: val.date,
                  trx_type: 'IN',
                },
                {
                  uuid: idempotencyKey,
                }
              );
              createInitialValues();
            }
          "
        />
        <div class="flex justify-end mt-4 gap-3 pt-2">
          <GeneralOutlinedButton label="Cancel" type="button" />
          <GeneralButton
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
