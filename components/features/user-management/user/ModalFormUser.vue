<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useUserStore } from "~/store/user-management/user-store";
import type { UserType } from "~/types/user-type";
import { getRoles } from "~/services/user-managements/role-services";
import type { RoleType } from "~/types/role-types";

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
  role_id: string;
};

const modalInstance = ref<ElementEvent | null>(null);

const userStore = useUserStore();
const { loadingWrite, selectedData } = storeToRefs(userStore);
const { createDataUser, updateDataUser, getDataUser } = userStore;

const roles = ref<RoleType[]>([]);
const roleOptions = computed(() =>
  roles.value.map((role) => ({
    id: role.id ?? "",
    label: role.name,
  }))
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
    togglePassword: true,
    helperText:
      "Password must contain uppercase, lowercase, and be at least 8 characters.",
  },
  {
    name: "role_id",
    label: "Role",
    requiredMark: true,
    type: "select",
    placeholder: "Select role",
    grid: 12,
    options: roleOptions.value,
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
  role_id: string().required("Role is required"),
});

const createInitialValues = (): UserFormValues => ({
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  role_id: "",
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
          first_name: current.first_name || "",
          last_name: current.last_name || "",
          email: current.email || "",
          password: "",
          role_id: current.role_id || "",
        },
      });
    } else {
      form.resetForm({ values: createInitialValues() });
    }
  },
  { immediate: true }
);

onMounted(() => {
  (async () => {
    try {
      const response: any = await getRoles({ page: 1, limit: 100, search: "" });
      const raw = response.data ?? {};
      let list: RoleType[] = [];

      if (Array.isArray(raw.data)) {
        list = raw.data;
      } else if (Array.isArray(raw.list)) {
        list = raw.list;
      } else if (Array.isArray(raw)) {
        list = raw;
      }

      roles.value = list;
    } catch (error) {
      // silently ignore; dropdown will be empty
      console.error("Failed to load roles for user form", error);
    }
  })();
});

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

async function handleFormSubmit(values: UserFormValues) {
  try {
    const basePayload = {
      email: values.email,
      first_name: values.first_name,
      last_name: values.last_name,
      role_id: values.role_id,
    };

    if (props.mode === "update" && selectedData.value?.id) {
      const updatePayload: any = {
        id: selectedData.value.id,
        ...basePayload,
      };

      if (values.password) {
        updatePayload.password = values.password;
      }

      await updateDataUser(updatePayload);
    } else {
      await createDataUser({
        ...basePayload,
        password: values.password,
      });
    }

    await getDataUser({ page: 1, limit: 10 });
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
    id="modal-add-user"
    :title="isUpdateMode ? 'Update User' : 'Add User'"
    :is-has-close="true"
    class-modal="max-w-sm"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body>
      <GeneralFormGenerator
        id="FormUser"
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
          form="FormUser"
          color="primary"
          :label="isUpdateMode ? 'Update' : 'Create'"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
