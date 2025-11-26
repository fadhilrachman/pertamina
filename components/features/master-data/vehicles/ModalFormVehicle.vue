<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useSkuStore } from "~/store/master-data/sku-store";
import type { PayloadVehicleType } from "~/types/vehicle-type";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { useVehiclesStore } from "~/store/master-data/vehicles-store";

const props = withDefaults(
  defineProps<{
    mode?: "add" | "update";
  }>(),
  {
    mode: "add",
  }
);
const isUpdateMode = computed(() => props.mode === "update");
const facilitiesStore = useFacilitiesStore();
const { data: facilitiesData } = storeToRefs(facilitiesStore);
const facilitiesOptions = computed(
  () =>
    facilitiesData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const emit = defineEmits(["opened", "closed"]);

const formFields = computed<FieldConfig[]>(() => [
  {
    name: "license_plate",
    label: "License Plate",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., B1234ABC",
    grid: 6,
  },
  {
    name: "vehicle_id",
    label: "Vehicle ID",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., VE0031",
    grid: 6,
  },

  {
    name: "facility_id",
    label: "Facility",
    type: "search-select",
    placeholder: "Select Facility",
    grid: 6,
    requiredMark: true,
    options: facilitiesOptions.value,
  },
  {
    name: "capacity",
    label: "Capacity",
    requiredMark: true,
    type: "number",
    placeholder: "e.g., 12",
    grid: 6,
  },
  {
    name: "type",
    label: "Type",
    type: "select",
    placeholder: "Select type",
    grid: 6,
    requiredMark: true,
    options: [
      { id: "Truck", label: "Truck" },
      { id: "Van", label: "Van" },
      { id: "Pickup", label: "Pickup" },
    ],
  },
]);
const modalInstance = ref<ElementEvent | null>(null);

const skuStore = useVehiclesStore();
const { loadingWrite, selectedData } = storeToRefs(skuStore);
const { createDataVehicles, updateDataVehicles, getDataVehicles } = skuStore;

const formSchema = object({
  capacity: string().required("Capacity is required"),
  facility_id: string().required("Facility is required"),
  license_plate: string().required("License Plate is required"),
  type: string().required("Type is required"),
  vehicle_id: string().required("Type is required"),
});

const createInitialValues = (): PayloadVehicleType => ({
  capacity: "",
  facility_id: "",
  license_plate: "",
  type: "",
  vehicle_id: "",
});

const form = useForm<PayloadVehicleType>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});

watch(
  () => ({
    mode: props.mode,
    selectedData: selectedData.value,
  }),
  ({ mode, selectedData }) => {
    if (mode === "update" && selectedData) {
      form.resetForm({ values: selectedData as PayloadVehicleType });
    } else {
      form.resetForm({ values: createInitialValues() });
    }
  },
  { immediate: true }
);
const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const open = () => {
  modalInstance.value?.show();
};
const close = () => {
  modalInstance.value?.hide();
};

const handleCancel = () => {
  close();
  form.resetForm({ values: createInitialValues() });
};

async function handleFormSubmit(values: any) {
  try {
    const action =
      props.mode === "update" ? updateDataVehicles : createDataVehicles;
    let payload =
      props.mode == "update"
        ? {
            ...values,
            capacity: Number(values.capacity),
            id: selectedData.value.id,
          }
        : { ...values, capacity: Number(values.capacity) };
    await action(payload);
    getDataVehicles({ page: 1, limit: 10 });
    handleCancel();

    return true;
  } catch (error) {
    throw error;
  }
}

const handleModalOpened = () => emit("opened");
const handleModalClosed = () => emit("closed");

defineExpose({
  open,
  close,
});

onMounted(() => {
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});
</script>

<template>
  <GeneralModal
    id="modal-add-vehicle"
    :title="isUpdateMode ? 'Update Vehicle' : 'Add New Vehicle'"
    :is-has-close="true"
    class-modal="max-w-xl"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body>
      <GeneralFormGenerator
        id="FormVehicle"
        :form-context="form"
        :fields="formFields"
        :validation-schema="formSchema"
        class-name=""
        @submit="handleFormSubmit"
      />

      <div class="flex justify-end gap-3 pt-2">
        <GeneralOutlinedButton
          label="Cancel"
          @on-click="handleCancel"
          type="button"
        />
        <GeneralButton
          :disabled="loadingWrite"
          :loading="loadingWrite"
          type="submit"
          form="FormVehicle"
          color="primary"
          :label="isUpdateMode ? 'Update' : 'Create'"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
