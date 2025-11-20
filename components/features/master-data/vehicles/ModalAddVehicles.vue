<script setup lang="ts">
import { ref } from "vue";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useVehiclesStore } from "~/store/master-data/vehicles-store";

const formFields: FieldConfig[] = [
  {
    name: "vehicle_id",
    label: "Vehicle ID",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., V001",
    grid: 6,
  },
  {
    name: "plate_number",
    label: "Plate Number",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., B 1234 ABC",
    grid: 6,
  },
  {
    name: "type",
    label: "Vehicle Type",
    requiredMark: true,
    type: "select",
    placeholder: "Select type",
    grid: 6,
    options: [
      { id: "Truck", label: "Truck" },
      { id: "Pickup", label: "Pickup" },
      { id: "Van", label: "Van" },
      { id: "Trailer", label: "Trailer" },
      { id: "Box Truck", label: "Box Truck" },
    ],
  },
  {
    name: "capacity",
    label: "Capacity",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., 10,000 KG",
    grid: 6,
  },
  {
    name: "assigned_facility",
    label: "Assigned Facility",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., SBS Warehouse",
    grid: 12,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Additional description",
    grid: 12,
  },
];

const modalInstance = ref<ElementEvent | null>(null);

const { createDataVehicles, loadingWrite, getDataVehicles } =
  useVehiclesStore();

const formSchema = object({
  vehicle_id: string().required("Vehicle ID is required"),
  plate_number: string().required("Plate Number is required"),
  type: string().required("Vehicle Type is required"),
  capacity: string().required("Capacity is required"),
  assigned_facility: string().required("Assigned Facility is required"),
  notes: string().nullable(),
});

type VehicleFormValues = {
  vehicle_id: string;
  plate_number: string;
  type: string;
  capacity: string;
  assigned_facility: string;
  notes: string | null;
};

const createInitialValues = (): VehicleFormValues => ({
  vehicle_id: "",
  plate_number: "",
  type: "",
  capacity: "",
  assigned_facility: "",
  notes: "",
});

const form = useForm<VehicleFormValues>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});
const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const open = () => modalInstance.value?.show();
const close = () => modalInstance.value?.hide();

const handleCancel = () => {
  close();
  form.resetForm({ values: createInitialValues() });
};

async function handleFormSubmit(values: Record<string, any>) {
  try {
    await createDataVehicles(values);
    getDataVehicles({ page: "1", per_page: "10" });
    handleCancel();

    return true;
  } catch (error) {
    throw error;
  }
}

defineExpose({
  open,
  close,
});
</script>

<template>
  <GeneralModal
    id="modal-add-sku"
    title="Add New SKU"
    :is-has-close="true"
    class-modal="max-w-xl"
    @mounted="handleModalMounted"
  >
    <template #body>
      <GeneralFormGenerator
        id="AddSku"
        :form-context="form"
        :fields="formFields"
        :validation-schema="formSchema"
        class-name=""
        @submit="handleFormSubmit"
      />

      <div class="flex justify-end gap-3 pt-2">
        <GeneralOutlinedButton label="Cancel" @on-click="handleCancel" />
        <GeneralButton
          :disabled="loadingWrite"
          :loading="loadingWrite"
          type="submit"
          form="AddSku"
          color="primary"
          label="Create"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
