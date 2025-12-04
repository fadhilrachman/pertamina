<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import type {
  FacilitiesType,
  PayloadFacilitiesType,
} from "~/types/facilities-type";
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

const formFields: FieldConfig[] = [
  {
    name: "code",
    label: "Facility Code",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., WH-001",
    grid: 6,
  },
  {
    name: "name",
    label: "Name",
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
      { id: "active", label: "Active" },
      { id: "inactive", label: "Inactive" },
    ],
  },
];

const modalInstance = ref<ElementEvent | null>(null);

const facilitiesStore = useFacilitiesStore();
const { loadingWrite, selectedData } = storeToRefs(facilitiesStore);
const { createDataFacilities, updateDataFacilities, getDataFacilities } =
  facilitiesStore;

const formSchema = object({
  code: string().required("Facility Code is required"),
  name: string().required("Facility Name is required"),
  address: string().required("Address is required"),
  city: string().required("City is required"),
  capacity: string().required("Capacity is required"),
  status: string().required("Status is required"),
});

const createInitialValues = (): PayloadFacilitiesType => ({
  code: "",
  name: "",
  address: "",
  city: "",
  capacity: "",
  status: "active",
});
const form = useForm<FacilitiesType>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});

// watch(
//   () => ({
//     mode: props.mode,
//     selectedData: selectedData.value,
//   }),
//   ({ mode, selectedData }) => {

//   },
//   { immediate: true }
// );
const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const open = () => {
  if (props.mode === "update") {
    form.resetForm({ values: selectedData.value as FacilitiesType });
  } else {
    form.resetForm({ values: createInitialValues() });
  }
  modalInstance.value?.show();
};
const close = () => {
  modalInstance.value?.hide();
};

const handleCancel = () => {
  close();
};

async function handleFormSubmit(values: Record<string, any>) {
  try {
    const action =
      props.mode === "update" ? updateDataFacilities : createDataFacilities;
    await action(values);
    form.resetForm({ values: createInitialValues() });

    getDataFacilities({ page: 1, limit: 10 });
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
    :title="isUpdateMode ? 'Update Warehouse' : 'Add New Warehouse'"
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
