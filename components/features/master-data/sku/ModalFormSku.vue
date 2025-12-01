<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useSkuStore } from "~/store/master-data/sku-store";
import type { PayloadSKUType } from "~/types/sku-type";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";

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

const modalInstance = ref<ElementEvent | null>(null);

const skuStore = useSkuStore();
const { loadingWrite, selectedData } = storeToRefs(skuStore);
const { createDataSku, updateDataSku, getDataSku } = skuStore;

const facilitiesStore = useFacilitiesStore();
const { data: facilitiesData } = storeToRefs(facilitiesStore);

const facilitiesOptions = computed(
  () =>
    facilitiesData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);

const formFields = computed<FieldConfig[]>(() => [
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
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Raw Material, Finished Good",
    grid: 6,
  },
  {
    name: "unit",
    label: "UOM",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Units, Liters, Kg",
    grid: 6,
  },
  {
    name: "max_stock",
    label: "Maximum Stock Level",
    requiredMark: true,
    type: "number",
    placeholder: "0",
    grid: 6,
  },
  {
    name: "min_stock",
    label: "Minimum Stock",
    requiredMark: true,
    type: "number",
    placeholder: "0",
    grid: 6,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Add a SKU description",
    grid: 12,
  },
  {
    name: "beginning_inventory_by_warehouse",
    label: "Beginning Inventory by Warehouse",
    type: "array",
    grid: 12,
    addButtonLabel: "Add Warehouse",
    fields: [
      {
        name: "facility_id",
        label: "Warehouse",
        type: "search-select",
        placeholder: "Select Warehouse",
        grid: 6,
        requiredMark: true,
        options: facilitiesOptions.value,
      },
      {
        name: "beginning_inventory",
        label: "Beginning Inventory",
        type: "number",
        placeholder: "0",
        grid: 6,
        requiredMark: true,
        defaultValue: 0,
        min: 0,
      },
    ],
  },
]);

const formSchema = object({
  sku_code: string().required("SKU Code is required"),
  name: string().required("Name is required"),
  category: string().required("Category is required"),
  unit: string().required("UOM is required"),
  max_stock: string().required("Maximum Stock Level is required"),
  min_stock: string().required("Minimum Stock is required"),
  description: string(),
});

const createInitialValues = (): PayloadSKUType => ({
  sku_code: "",
  name: "",
  unit: "",
  description: "",
  status: "active",
  category: "",
  max_stock: "0",
  min_stock: "0",
  beginning_inventory_by_warehouse: [],
});

const form = useForm<PayloadSKUType>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});

onMounted(() => {
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
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
