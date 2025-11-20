<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useSkuStore } from "~/store/master-data/sku-store";
import type { RoleType } from "~/types/role-types";
import { useRoleStore } from "~/store/user-management/role-store";
import { useCompanyStore } from "~/store/company/company-store";

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
    name: "name",
    label: "Name",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Cardboard Box 30x30",
    grid: 12,
  },
];
const modalInstance = ref<ElementEvent | null>(null);

const companyStore = useCompanyStore();
const { loadingWrite, selectedData } = storeToRefs(companyStore);
const { createDataCompany, updateDataCompany, getDataCompany } = companyStore;

const formSchema = object({
  name: string().required("Name is required"),
});

const createInitialValues = (): RoleType => ({
  name: "",
});

const form = useForm<RoleType>({
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
      form.resetForm({ values: selectedData as RoleType });
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
  // form.resetForm({ values: createInitialValues() });
};

async function handleFormSubmit(values: Record<string, any>) {
  try {
    const action =
      props.mode === "update" ? updateDataCompany : createDataCompany;
    await action(values);
    await getDataCompany({ page: 1, limit: 10 });
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
    id="modal-add-role"
    :title="isUpdateMode ? 'Update Role' : 'Add New Role'"
    :is-has-close="true"
    class-modal="max-w-sm"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body class="">
      <GeneralFormGenerator
        id="FormROle"
        :form-context="form"
        :fields="formFields"
        :validation-schema="formSchema"
        class-name=""
        @submit="handleFormSubmit"
      />

      <div class="flex justify-end mt-4 gap-3 pt-2">
        <GeneralOutlinedButton
          label="Cancel"
          @on-click="handleCancel"
          type="button"
        />
        <GeneralButton
          :disabled="loadingWrite"
          :loading="loadingWrite"
          type="submit"
          form="FormROle"
          color="primary"
          :label="isUpdateMode ? 'Update' : 'Create'"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
