<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useSuperadminCompanyStore } from "~/store/superadmin/company-store";
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
    name: "owner_email",
    label: "Owner Email",
    requiredMark: true,
    type: "email",
    placeholder: "e.g., owner@company.com",
    grid: 6,
  },
];

const modalInstance = ref<ElementEvent | null>(null);

const companyStore = useSuperadminCompanyStore();
const { loadingWrite, selectedData } = storeToRefs(companyStore);
const { createCompany, updateCompany, refetchDataCompanies } = companyStore;

const formSchema = object({
  name: string().required("Company Name is required"),
  pic_name: string().required("PIC Name is required"),
  address: string().required("Address is required"),
  email: string().email().required("Email is required"),
  owner_email: string().email().required("Owner Email is required"),
});

const createInitialValues = (): CompanyType => ({
  name: "",
  pic_name: "",
  address: "",
  email: "",
  owner_email: "",
  logo: "",
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
  form.resetForm({ values: createInitialValues() });
  close();
};

async function handleFormSubmit(values: Record<string, any>) {
  try {
    const payload = {
      name: values.name,
      pic_name: values.pic_name,
      address: values.address,
      email: values.email,
      owner_email: values.owner_email,
    };

    if (props.mode === "update" && selectedData.value?.id) {
      await updateCompany({ id: selectedData.value.id, ...payload });
    } else {
      await createCompany(payload);
    }

    await refetchDataCompanies();
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
    id="modal-superadmin-company"
    :title="isUpdateMode ? 'Update Company' : 'Add New Company'"
    :is-has-close="true"
    class-modal="max-w-sm"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body>
      <GeneralFormGenerator
        id="FormSuperadminCompany"
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
          form="FormSuperadminCompany"
          color="primary"
          :label="isUpdateMode ? 'Update' : 'Create'"
        />
      </div>
    </template>
  </GeneralModal>
</template>
