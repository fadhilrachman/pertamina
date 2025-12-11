<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useSuperadminUserStore } from "~/store/superadmin/user-store";
import type { UserType } from "~/types/user-type";

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
};

const modalInstance = ref<ElementEvent | null>(null);

const userStore = useSuperadminUserStore();
const { loadingWrite, selectedData } = storeToRefs(userStore);
const { createUser, updateUser, getDataUsers } = userStore;

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
    helperText:
      "Password must contain uppercase, lowercase, and be at least 8 characters.",
  },
  {
    name: "is_superadmin",
    label: "User Type",
    requiredMark: true,
    type: "select",
    placeholder: "Select user type",
    grid: 12,
    options: [
      { id: "false", label: "User" },
      { id: "true", label: "Superadmin" },
    ],
  },
]);

const formSchema = object({
  first_name: string().required("First name is required"),
  last_name: string().required("Last name is required"),
  email: string().required("Email is required"),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter"),
  is_superadmin: string().required("User type is required"),
});

const createInitialValues = (): UserFormValues => ({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  is_superadmin: "false",
});

const form = useForm<UserFormValues>({
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
      const current = selectedData as UserType;
      form.resetForm({
        values: {
          first_name: (current as any).first_name || "",
          last_name: (current as any).last_name || "",
          email: current.email || "",
          password: "",
          is_superadmin: (current as any).is_superadmin ? "true" : "false",
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

const open = () => {
  modalInstance.value?.show();
};
const close = () => {
  modalInstance.value?.hide();
};

const handleCancel = () => {
  close();
};

async function handleFormSubmit(values: UserFormValues) {
  try {
    const payload = {
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      password: values.password,
      is_superadmin: values.is_superadmin === "true",
    };

    if (props.mode === "update" && selectedData.value?.id) {
      const updatePayload: any = {
        id: selectedData.value.id,
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
        is_superadmin: payload.is_superadmin,
      };

      if (values.password) {
        updatePayload.password = values.password;
      }

      await updateUser(updatePayload);
    } else {
      await createUser(payload);
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
    class-modal="max-w-sm"
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
