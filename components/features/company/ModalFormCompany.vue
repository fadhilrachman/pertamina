<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { mixed, object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useCompanyStore } from "~/store/company/company-store";
import type { CompanyType } from "~/types/company-type";

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
    label: "Company Name",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., PT Contoh Sejahtera",
    grid: 6,
  },
  {
    name: "pic_name",
    label: "PIC Name",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., John Doe",
    grid: 6,
  },
  {
    name: "address",
    label: "Address",
    requiredMark: true,
    type: "textarea",
    placeholder: "Company address",
    grid: 12,
  },
  {
    name: "email",
    label: "Email",
    requiredMark: true,
    type: "email",
    placeholder: "e.g., admin@company.com",
    grid: 6,
  },
  {
    name: "password",
    label: "Password",
    requiredMark: true,
    type: "password",
    placeholder: "Set account password",
    grid: 6,
  },
  {
    name: "logo",
    label: "Upload Logo Image",
    requiredMark: false,
    type: "file",
    placeholder: "Upload company logo",
    grid: 12,
    helperText: "PNG/JPG up to 2MB",
  },
];
const modalInstance = ref<ElementEvent | null>(null);

const companyStore = useCompanyStore();
const { loadingWrite, selectedData } = storeToRefs(companyStore);
const { createDataCompany, updateDataCompany, getDataCompany } = companyStore;

const formSchema = object({
  name: string().required("Company Name is required"),
  pic_name: string().required("PIC Name is required"),
  address: string().required("Address is required"),
  email: string().email().required("Email is required"),
  password: string().required("Password is required"),
  logo: mixed().nullable(),
});

const createInitialValues = (): CompanyType => ({
  name: "",
  pic_name: "",
  address: "",
  email: "",
  password: "",
  logo: null,
});

const form = useForm<CompanyType>({
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
      form.resetForm({ values: selectedData as CompanyType });
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
    id="modal-add-company"
    :title="isUpdateMode ? 'Update Company' : 'Add New Company'"
    :is-has-close="true"
    class-modal="max-w-sm"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body class="">
      <GeneralFormGenerator
        id="FormCompany"
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
          form="FormCompany"
          color="primary"
          :label="isUpdateMode ? 'Update' : 'Create'"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
