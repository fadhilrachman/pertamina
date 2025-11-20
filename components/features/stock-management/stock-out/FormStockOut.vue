<script setup lang="ts">
import { useForm } from "vee-validate";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import type { PayloadSKUType } from "~/types/sku-type";

const formFields: FieldConfig[] = [
  {
    name: "sku_code",
    label: "Sku Name",
    type: "select",
    placeholder: "Select SKU",
    grid: 6,
    requiredMark: true,
    options: [
      { id: "active", label: "Active" },
      { id: "inactive", label: "Inactive" },
    ],
  },
  {
    name: "name",
    label: "Quantity",
    requiredMark: true,
    type: "text",
    placeholder: "Enter received quantity",
    grid: 6,
  },
  {
    name: "status",
    label: "Receiving Warehouse ",
    type: "select",
    placeholder: "Select Warehouse",
    grid: 6,
    requiredMark: true,
    options: [
      { id: "active", label: "Active" },
      { id: "inactive", label: "Inactive" },
    ],
  },
  {
    name: "unit",
    label: "Reference No.",
    requiredMark: true,
    type: "text",
    placeholder: "Enter inbound reference number",
    grid: 6,
  },
  {
    name: "max",
    label: "Date Received",
    requiredMark: true,
    type: "date",
    placeholder: "Select date received",
    grid: 6,
  },

  // {
  //   name: "min",
  //   label: "Minimum Stock Level",
  //   requiredMark: true,
  //   type: "text",
  //   placeholder: "e.g., 50",
  //   grid: 12,
  // },

  {
    name: "description",
    label: "Notes",
    type: "textarea",
    placeholder: "Add a Description",
    grid: 12,
  },
];
const formSchema = object({
  sku_code: string().required("SKU Code is required"),
  name: string().required("Name is required"),
  status: string().required("Status is required"),
  unit: string().required("Unit of Measure is required"),
  description: string(),
});
const createInitialValues = (): PayloadSKUType => ({
  sku_code: "",
  name: "",
  unit: "",
  description: "",
  status: "",
});

const form = useForm<PayloadSKUType>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
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
          id="FormSKU"
          :form-context="form"
          :fields="formFields"
          :validation-schema="formSchema"
          class-name=""
          @submit="() => {}"
        />
      </div>
      <div class="flex justify-end mt-4 gap-3 pt-2">
        <GeneralOutlinedButton label="Cancel" type="button" />
        <GeneralButton
          type="submit"
          form="FormROle"
          color="primary"
          label="Submit"
        />
      </div>
    </section>
  </main>
</template>
