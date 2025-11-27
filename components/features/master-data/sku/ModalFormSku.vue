<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useSkuStore } from "~/store/master-data/sku-store";
import type { PayloadSKUType } from "~/types/sku-type";

const props = withDefaults(
  defineProps<{
    mode?: "add" | "update";
  }>(),
  {
    mode: "add",
  }
);
const isUpdateMode = computed(() => props.mode === "update");

const emit = defineEmits(["opened", "closed"]);

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
    name: "status",
    label: "Status",
    type: "select",
    placeholder: "Select status",
    grid: 6,
    requiredMark: true,
    options: [
      { id: "active", label: "Active" },
      { id: "inactive", label: "Inactive" },
    ],
  },
  {
    name: "unit",
    label: "Unit of Measure",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Unit, Liter, Kg",
    grid: 6,
  },
  // {
  //   name: "max",
  //   label: "Maximum Stock Level",
  //   requiredMark: true,
  //   type: "text",
  //   placeholder: "e.g., 500",
  //   grid: 6,
  // },

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
    label: "Description",
    type: "textarea",
    placeholder: "Add a SKU description",
    grid: 12,
  },
];
const modalInstance = ref<ElementEvent | null>(null);

const skuStore = useSkuStore();
const { loadingWrite, selectedData } = storeToRefs(skuStore);
const { createDataSku, updateDataSku, getDataSku } = skuStore;

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

// watch(
//   () => ({
//     mode: props.mode,
//     selectedData: selectedData.value,
//   }),
//   ({ mode, selectedData }) => {
//     if (mode === "update" && selectedData) {
//       form.resetForm({ values: selectedData as PayloadSKUType });
//     } else {
//       form.resetForm({ values: createInitialValues() });
//     }
//   },
//   { immediate: true }
// );
const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const open = () => {
  if (props.mode === "update") {
    console.log("update");

    form.resetForm({ values: selectedData.value as PayloadSKUType });
  } else {
    console.log("add");

    form.resetForm({ values: createInitialValues() });
  }
  console.log(form.values);

  modalInstance.value?.show();
};
const close = () => {
  modalInstance.value?.hide();
};

const handleCancel = () => {
  close();
  // form.resetForm({ values: createInitialValues() });
};

async function handleFormSubmit(values: Record<string, any>) {
  try {
    const action = props.mode === "update" ? updateDataSku : createDataSku;
    await action(values);
    form.resetForm({ values: createInitialValues() });

    getDataSku({ page: 1, limit: 10 });
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
</script>

<template>
  <GeneralModal
    id="modal-add-sku"
    :title="isUpdateMode ? 'Update SKU' : 'Add New SKU'"
    :is-has-close="true"
    class-modal="max-w-xl"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body>
      <GeneralFormGenerator
        id="FormSKU"
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
          form="FormSKU"
          color="primary"
          :label="isUpdateMode ? 'Update' : 'Create'"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
