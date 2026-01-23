<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";
import { useVehiclesStore } from "~/store/master-data/vehicles-store";
import { v4 as uuidv4 } from "uuid";
import type { ElementEvent } from "~/types/element";
import { useStockOnHand } from "~/store/stock-on-hand/stock-on-hand-store";

const idempotencyKey = ref<string>("");
const generateIdempotencyKey = () => {
  idempotencyKey.value = uuidv4();
};
const props = withDefaults(
  defineProps<{
    mode?: "add" | "update";
  }>(),
  {
    mode: "add",
  },
);
const isUpdateMode = computed(() => props.mode === "update");

const emit = defineEmits(["opened", "closed"]);

const stockTransactionStore = useStockTransaction();
const stockOnHandStore = useStockOnHand();

const { loadingWrite } = storeToRefs(stockTransactionStore);
const facilitiesStore = useFacilitiesStore();
const { selectedData } = storeToRefs(stockOnHandStore);

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
      : []),
);

const facilitiesSkuOptions = computed(
  () =>
    facilitiesSkuList.value.map((item) => ({
      id: item.id,
      label: `${item.sku_code} - ${item.sku_name}`,
    })) || [],
);

const vehicleOptions = computed(
  () =>
    vehiclesData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.license_plate,
    })) || [],
);
const facilitiesOptions = computed(
  () =>
    facilitiesData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || [],
);

const formSchema = object({
  sku_id: string().required("SKU Name is required"),
  facility_id: string().required("Facility Name is required"),
  vehicle_id: string().required("Vehicle is required"),
  qty: string().required("QTY is required"),
  uom: string().required("Unit of Measure is required"),
  date: string().required("Date is required"),
});
const createInitialValues = (): any => ({
  sku_id: "",
  facility_id: "",
  uom: "",
  qty: "",
  description: "",
  date: "",
  vehicle_id: "",
});

const form = useForm<any>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});
const { values } = form;

const formFields = computed<FieldConfig[]>(() => [
  {
    name: "facility_id",
    label: "Receiving Warehouse ",
    type: "search-select",
    placeholder: "Select Warehouse",
    grid: 6,
    requiredMark: true,
    options: facilitiesOptions.value,
    disabled: props.mode == "update",
  },
  {
    name: "sku_id",
    label: "SKU Name",
    type: "search-select",
    placeholder: "Select SKU",
    grid: 6,
    requiredMark: true,
    options: facilitiesSkuOptions.value,
    disabled: !values.facility_id || props.mode == "update",
  },
  {
    name: "vehicle_id",
    label: "Vehicle",
    type: "search-select",
    placeholder: "Select Vehicle",
    grid: 6,
    requiredMark: true,
    options: vehicleOptions.value,
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
    name: "uom",
    label: "UOM.",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Unit, Liter, Kg",
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
watch(
  () => values.facility_id,
  (next, prev) => {
    // Debug perubahan facility_id
    if (props.mode != "update") {
      form.setValues({
        sku_id: "",
      });
      if (!next) return;
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
    } else {
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
  },
);

onMounted(() => {
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});

const modalInstance = ref<ElementEvent | null>(null);

const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const resetForm = () => {
  form.resetForm({ values: createInitialValues() });
};

const open = async () => {
  if (props.mode === "update") {
    const data = selectedData.value;

    if (!data) return;

    // load fasilitas-SKU untuk facility ini dulu
    await facilitiesSkuStore.getDataFacilitiesSku({
      page: 1,
      limit: 1000,
      facility_id: data.facility_id,
    });

    const facilitySku = facilitiesSkuList.value.find(
      (item) => item.sku_code === data.sku_code,
    );

    form.resetForm({
      values: {
        facility_id: data.facility_id,
        sku_id: facilitySku?.id ?? "",
        uom: data.unit_of_measure,
      },
    });
  } else {
    resetForm();
  }
  modalInstance.value?.show();
};

const close = () => {
  modalInstance.value?.hide();
};

const handleCancel = () => {
  //   resetForm();
  close();
};

const handleFormSubmit = async (val: any) => {
  generateIdempotencyKey();
  const lockKey = `stock_${val.sku_id || "unknown"}`;
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
      //   reference_no: val.reference_no,
      //   reference_type: val.reference_type,
      trx_date: val.date,
      vehicle_id: val.vehicle_id,
      trx_type: "OUT",
    },
    {
      uuid: idempotencyKey.value,
      lockKey,
    },
  );
  await stockOnHandStore.getDataStockOnHand({
    page: 1,
    limit: 10,
  });
  resetForm();
  close();
};

const handleModalOpened = () => emit("opened");
const handleModalClosed = () => emit("closed");

defineExpose({
  open,
  close,
});
</script>

<template>
  <GeneralModal
    id="modal-stock-out"
    title="Stock Out"
    :is-has-close="true"
    class-modal="max-w-2xl"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body>
      <div class="space-y-4">
        <!-- <p class="text-gray-500 text-sm">Add new stock out transaction.</p> -->

        <div class="bg-white rounded-lg">
          <GeneralFormGenerator
            id="FormStockOut"
            :form-context="form"
            :fields="formFields"
            :validation-schema="formSchema"
            class-name=""
            @submit="handleFormSubmit"
          />
        </div>

        <div class="flex justify-end mt-4 gap-3 pt-2">
          <GeneralOutlinedButton
            label="Cancel"
            type="button"
            @on-click="handleCancel"
          />
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
    </template>
  </GeneralModal>
</template>
