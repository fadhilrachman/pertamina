<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useSuperadminUserStore } from "~/store/superadmin/user-store";
import type { UserType } from "~/types/user-type";
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

type UserFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_superadmin: string;
  company_id: string;
};

const modalInstance = ref<ElementEvent | null>(null);

const userStore = useSuperadminUserStore();
const { loadingWrite, selectedData } = storeToRefs(userStore);
const { createUser, updateUser, getDataUsers } = userStore;
const companyStore = useSuperadminCompanyStore();
const { data: companyData } = storeToRefs(companyStore);

const companyOptions = computed(
  () =>
    companyData.value?.data?.data?.map((item: CompanyType) => ({
      id: item.id || "",
      label: item.name,
    })) || []
);

const formSchema = object({
  first_name: string().required("First name is required"),
  last_name: string().required("Last name is required"),
  email: string().required("Email is required"),
  password: string().required("Password is required"),
  is_superadmin: string().required("User type is required"),
  company_id: string().when("is_superadmin", {
    is: "false",
    then: (schema) => schema.required("Company is required for regular user"),
    otherwise: (schema) => schema.optional(),
  }),
});

const createInitialValues = (): UserFormValues => ({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  is_superadmin: "false",
  company_id: "",
});

const form = useForm<UserFormValues>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});

const isSuperadminSelected = computed(
  () => form.values.is_superadmin === "true"
);

watch(
  () => form.values.is_superadmin,
  (next) => {
    if (next === "true") {
      form.setFieldValue("company_id", "");
    }
  }
);

const formFields = computed<FieldConfig[]>(() => [
  {
    name: "first_name",
    label: "First Name",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., John",
    grid: 12,
  },
  {
    name: "last_name",
    label: "Last Name",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., Doe",
    grid: 12,
  },
  {
    name: "email",
    label: "Email",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., johndoe@example.com",
    grid: 12,
  },
  {
    name: "password",
    label: "Password",
    requiredMark: true,
    type: "password",
    placeholder: "Min. 8 characters",
    grid: 12,
    // helperText:
    //   "Password must contain uppercase, lowercase, and be at least 8 characters.",
    togglePassword: true,
  },
  {
    name: "is_superadmin",
    label: "User Type",
    requiredMark: true,
    type: "switch",
    switchLabel: "Superadmin",
    grid: 12,
  },
  {
    name: "company_id",
    label: "Company",
    type: "search-select",
    placeholder: "Select company",
    grid: 12,
    options: companyOptions.value,
    disabled: isSuperadminSelected.value,
  },
]);

watch(
  () => ({
    mode: props.mode,
    selectedData: selectedData.value,
  }),
  ({ mode, selectedData }) => {
    if (mode === "update" && selectedData) {
      const current = selectedData as UserType;
      const fallbackCompany =
        current.company_id ||
        current.companies?.find((company: any) => company?.is_default)
          ?.company_id ||
        current.companies?.[0]?.company_id ||
        current.companies?.[0]?.id ||
        "";
      const isSuperadmin = (current as any).is_superadmin;
      form.resetForm({
        values: {
          first_name: (current as any).first_name || "",
          last_name: (current as any).last_name || "",
          email: current.email || "",
          password: "",
          is_superadmin: isSuperadmin ? "true" : "false",
          company_id: isSuperadmin ? "" : String(fallbackCompany),
        },
      });
    } else {
      form.resetForm({ values: createInitialValues() });
    }
  },
  { immediate: true }
);

const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

onMounted(() => {
  companyStore.getDataCompanies({ page: 1, limit: 1000, search: "" });
});

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

async function handleFormSubmit(payload: Record<string, any>) {
  const values = payload as UserFormValues;
  const isSuperadmin = values.is_superadmin === "true";

  const basePayload = {
    email: values.email,
    first_name: values.first_name,
    last_name: values.last_name,
    is_superadmin: isSuperadmin,
    company_id: isSuperadmin
      ? undefined
      : values.company_id?.toString() || undefined,
  };

  try {
    if (props.mode === "update" && selectedData.value?.id) {
      await updateUser({
        id: selectedData.value.id,
        ...basePayload,
        ...(values.password && { password: values.password }),
      });
    } else {
      await createUser({
        ...basePayload,
        password: values.password,
      });
    }

    await getDataUsers({ page: 1, limit: 10 });
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
    id="modal-superadmin-user"
    :title="isUpdateMode ? 'Update User' : 'Add User'"
    :is-has-close="true"
    class-modal="max-w-md"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body>
      <GeneralFormGenerator
        id="FormSuperadminUser"
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
          form="FormSuperadminUser"
          color="primary"
          :label="isUpdateMode ? 'Update' : 'Create'"
        />
      </div>
    </template>
  </GeneralModal>
</template>
