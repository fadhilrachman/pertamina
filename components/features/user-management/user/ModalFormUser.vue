<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useUserStore } from "~/store/user-management/user-store";
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
  role: string;
  name: string;
  username: string;
  password: string;
};

const modalInstance = ref<ElementEvent | null>(null);

const userStore = useUserStore();
const { loadingWrite, selectedData } = storeToRefs(userStore);
const { createDataUser, updateDataUser, getDataUser } = userStore;

const roleOptions = computed(() => [
  { id: "admin", label: "admin" },
  { id: "staf", label: "staf" },
]);

const formFields = computed<FieldConfig[]>(() => [
  {
    name: "role",
    label: "Role",
    requiredMark: true,
    type: "select",
    placeholder: "Select role",
    grid: 12,
    options: roleOptions.value,
  },
  {
    name: "name",
    label: "Name",
    requiredMark: true,
    type: "text",
    placeholder: "e.g., John Doe",
    grid: 12,
  },
  {
    name: "username",
    label: "Username / Email",
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
]);

const formSchema = object({
  role: string().required("Role is required"),
  name: string().required("Name is required"),
  username: string().required("Username is required"),
  password: string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /[a-z]/,
      "Password must contain at least one lowercase letter"
    )
    .matches(
      /[A-Z]/,
      "Password must contain at least one uppercase letter"
    ),
});

const createInitialValues = (): UserFormValues => ({
  role: "",
  name: "",
  username: "",
  password: "",
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
          role: current.role || "",
          name: current.name || "",
          username: current.email || "",
          password: "",
        },
      });
    } else {
      form.resetForm({ values: createInitialValues() });
    }
  },
  { immediate: true }
);

onMounted(() => {
  // no-op for now; roles are static (admin, staf)
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
  close();
};

async function handleFormSubmit(values: UserFormValues) {
  try {
    const payload = {
      role: values.role,
      name: values.name,
      email: values.username,
      password: values.password,
    };

    if (props.mode === "update" && selectedData.value?.id) {
      await updateDataUser({ id: selectedData.value.id, ...payload });
    } else {
      await createDataUser(payload);
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
