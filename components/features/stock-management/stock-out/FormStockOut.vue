<script setup lang="ts">
import { computed, onMounted, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";
import { useVehiclesStore } from "~/store/master-data/vehicles-store";
import { v4 as uuidv4 } from "uuid";

const idempotencyKey = uuidv4();
const stockTransactionStore = useStockTransaction();
const { loadingWrite } = storeToRefs(stockTransactionStore);
const facilitiesStore = useFacilitiesStore();
const facilitiesSkuStore = useFacilitiesSkuStore();
const vehicleStore = useVehiclesStore();
const { data: vehiclesData } = storeToRefs(vehicleStore);
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

const vehicleOptions = computed(
  () =>
    vehiclesData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.license_plate,
    })) || []
);
const facilitiesOptions = computed(
  () =>
    facilitiesData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const purposeOptions = [
  { id: "Sparepart", label: "Sparepart" },
  { id: "Transfer", label: "Transfer" },
  { id: "Consumption", label: "Consumption" },
  { id: "Other", label: "Other" },
] as const;

const formSchema = object({
  sku_id: string().required("SKU Name is required"),
  facility_id: string().required("Facility Name is required"),
  vehicle_id: string().required("Vehicle is required"),
  purpose: string().required("Purpose is required"),
  qty: string().required("QTY is required"),
  // uom: string().required("Unit of Measure is required"),
  date: string().required("Date is required"),
});
const createInitialValues = (): any => ({
  sku_id: "",
  facility_id: "",
  // uom: "",
  qty: "",
  description: "",
  date: "",
  vehicle_id: "",
  purpose: "",
});

const form = useForm<any>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});
const { values } = form;
const formFields = computed<FieldConfig[]>(() => [
  {
    name: "sku_id",
    label: "Sku Name",
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

  {
    name: "vehicle_id",
    label: "Vehicle",
    type: "search-select",
    placeholder: "Select Vehicle",
    grid: 6,
    requiredMark: true,
    options: vehicleOptions.value,
    // disabled: !values.facility_id,
  },

  {
    name: "purpose",
    label: "Purpose",
    type: "select",
    placeholder: "Select Purpose",
    grid: 6,
    requiredMark: true,
    options: purposeOptions,
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
    name: "date",
    label: "Date Out",
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
    form.setValues({
      sku_id: "",
    });
    facilitiesSkuStore.getDataFacilitiesSku({
      page: 1,
      limit: 1000,
      facility_id: next,
    });
    vehicleStore.getDataVehicles({
      page: 1,
      limit: 1000,
      facility_id: next,
    });
  }
  // { immediate: true }
);

onMounted(() => {
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});
</script>

<template>
  <main class="space-y-6">
    <header class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-semibold text-gray-900">Stock Out</h1>
        <p class="text-gray-500">Add New Stock to Warehouse Inventory</p>
      </div>
    </header>
    <section class="max-w-[700px]">
      <div class="bg-white rounded-lg p-6">
        <GeneralFormGenerator
          id="FormStockOut"
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
                  purpose: val.purpose,
                  trx_date: val.date,
                  vehicle_id: val.vehicle_id,
                  trx_type: 'OUT',
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
          <!-- <GeneralOutlinedButton label="Cancel" type="button" /> -->
          <GeneralButton
            :loading="loadingWrite"
            :disabled="loadingWrite"
            type="submit"
            form="FormStockOut"
            color="primary"
            label="Submit"
          />
        </div>
      </div>
    </section>
  </main>
</template>
