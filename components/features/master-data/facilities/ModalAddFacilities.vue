<script setup lang="ts">
import { reactive, ref } from "vue";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";

const modalInstance = ref<ElementEvent | null>(null);

const formFields: FieldConfig[] = [
  {
    name: "facility_code",
    label: "Facility Code",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., WH-001",
    grid: 6,
  },
  {
    name: "name",
    label: "Facility Name",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Central Warehouse",
    grid: 6,
  },
  {
    name: "address",
    label: "Address",
    requiredMark: true,
    type: "text",
    placeholder: "Street address",
    grid: 12,
  },
  {
    name: "city",
    label: "City",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Jakarta",
    grid: 6,
  },
  {
    name: "capacity",
    label: "Capacity",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., 120,000",
    grid: 6,
  },
  {
    name: "status",
    label: "Status",
    requiredMark: true,
    type: "select",
    placeholder: "Select status",
    grid: 12,
    options: [
      { id: "ACTIVE", label: "Active" },
      { id: "INACTIVE", label: "Inactive" },
      { id: "PENDING", label: "Pending" },
    ],
  },
];

const formSchema = object({
  facility_code: string().required("Facility Code is required"),
  name: string().required("Facility Name is required"),
  address: string().required("Address is required"),
  city: string().required("City is required"),
  capacity: string().required("Capacity is required"),
  status: string().required("Status is required"),
  notes: string().nullable(),
});
const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const open = () => modalInstance.value?.show();
const close = () => modalInstance.value?.hide();

const handleCancel = () => {
  close();
};

function handleFormSubmit(values: Record<string, any>) {
  console.log("Submit dashboard form:", values);
}

defineExpose({
  open,
  close,
});
</script>

<template>
  <GeneralModal
    id="modal-add-facilities"
    title="Add New Warehouse"
    :is-has-close="true"
    class-modal="max-w-xl"
    @mounted="handleModalMounted"
  >
    <template #body>
      <GeneralFormGenerator
        id="AddFacilities"
        :fields="formFields"
        :validation-schema="formSchema"
        class-name=""
        @submit="handleFormSubmit"
      />

      <div class="flex justify-end gap-3 pt-2">
        <GeneralOutlinedButton label="Cancel" @on-click="handleCancel" />
        <GeneralButton
          type="submit"
          form="AddFacilities"
          color="primary"
          label="Create"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
