<script setup lang="ts">
import { computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import type { PayloadSKUType } from "~/types/sku-type";
import { useSkuStore } from "~/store/master-data/sku-store";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";

const stockTransactionStore = useStockTransaction();
const { loadingWrite } = storeToRefs(stockTransactionStore);
const skuStore = useSkuStore();
const facilitiesStore = useFacilitiesStore();
const { data: skuData } = storeToRefs(skuStore);
const { data: facilitiesData } = storeToRefs(facilitiesStore);

const skuOptions = computed(
  () =>
    skuData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: `${item.sku_code} - ${item.name}`,
    })) || []
);

const facilitiesOptions = computed(
  () =>
    facilitiesData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const formFields = computed<FieldConfig[]>(() => [
  {
    name: "sku_id",
    label: "Sku Name",
    type: "search-select",
    placeholder: "Select SKU",
    grid: 6,
    requiredMark: true,
    options: skuOptions.value,
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
  {
    label: "Quantity",
    name: "qty",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., 150",
    grid: 6,
  },

  {
    name: "uom",
    label: "UOM.",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Unit, Liter, Kg",

    grid: 6,
  },
  {
    name: "reference_no",
    label: "Reference No.",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., PO-12345",
    grid: 6,
  },
  {
    name: "reference_type",
    label: "Reference Type",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Purchase Order",
    grid: 6,
  },
  {
    name: "date",
    label: "Date ",
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

const formSchema = object({
  sku_id: string().required("SKU Name is required"),
  facility_id: string().required("Facility Name is required"),
  qty: string().required("QTY is required"),
  uom: string().required("Unit of Measure is required"),
  reference_no: string().required("Reference No. is required"),
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

onMounted(() => {
  skuStore.getDataSku({ page: 1, limit: 1000 });
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});
</script>

<template>
  <main class="space-y-6">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Stock In</h1>
        <p class="text-gray-500">Add New Stock to Warehouse Inventory</p>
      </div>
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
              await stockTransactionStore.createDataStockTransaction({
                lines: [
                  {
                    facility_id: val.facility_id,
                    qty: val.qty,
                    sku_id: val.sku_id,
                    uom: val.uom,
                  },
                ],
                note: val.note,
                reference_no: val.reference_no,
                reference_type: val.reference_type,
                trx_date: val.date,
                trx_type: 'OUT',
              });
              createInitialValues();
              console.log({ val });
            }
          "
        />
      </div>
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
    </section>
  </main>
</template>
