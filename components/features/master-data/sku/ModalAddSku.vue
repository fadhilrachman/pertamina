<script setup lang="ts">
import { reactive, ref } from "vue";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";

const modalInstance = ref<ElementEvent | null>(null);

const formFields: FieldConfig[] = [
  {
    name: "sku_code",
    label: "SKU Code",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., SKU-001",
    grid: 6,
  },
  {
    name: "name",
    label: "Name",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Cardboard Box 30x30",
    grid: 6,
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    placeholder: "Select SKU category",
    grid: 6,
    requiredMark: true,
    options: [
      { id: "admin", label: "Admin" },
      { id: "manager", label: "Manager" },
      { id: "viewer", label: "Viewer" },
    ],
  },
  {
    name: "uom",
    label: "Unit of Measure",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Unit, Liter, Kg",
    grid: 6,
  },
  {
    name: "max",
    label: "Maximum Stock Level",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., 500",
    grid: 6,
  },

  {
    name: "min",
    label: "Minimum Stock Level",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., 50",
    grid: 12,
  },

  {
    name: "notes",
    label: "Description",
    type: "textarea",
    placeholder: "Add a SKU description",
    requiredMark: true,
    grid: 12,
  },
];

const formSchema = object({
  sku_code: string().required("SKU Code is required"),
  name: string().required("Name is required"),
  category: string().required("Category is required"),
  uom: string().required("Unit of Measure is required"),
  max: string().required("Maximum Stock Level is required"),
  min: string().required("Minimum Stock Level is required"),
  notes: string().required("Description is required"),
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
    id="modal-add-sku"
    title="Add New SKU"
    :is-has-close="true"
    class-modal="max-w-xl"
    @mounted="handleModalMounted"
  >
    <template #body>
      <GeneralFormGenerator
        id="AddSku"
        :fields="formFields"
        :validation-schema="formSchema"
        class-name=""
        @submit="handleFormSubmit"
      />

      <div class="flex justify-end gap-3 pt-2">
        <GeneralOutlinedButton label="Cancel" @on-click="handleCancel" />
        <GeneralButton
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
