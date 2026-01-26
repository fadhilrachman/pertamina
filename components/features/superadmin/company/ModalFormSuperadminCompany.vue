<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { mixed, object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useSuperadminCompanyStore } from "~/store/superadmin/company-store";
import type { CompanyType } from "~/types/company-type";

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_LOGO_TYPES = ["image/png", "image/jpeg"];

const props = withDefaults(
  defineProps<{
    mode?: "add" | "update";
  }>(),
  {
    mode: "add",
  },
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
    name: "logo",
    label: "Logo",
    requiredMark: false,
    type: "file",
    helperText: "PNG/JPG up to 2MB",
    accept: "image/png,image/jpeg",
    grid: 12,
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
  logo: mixed<File | string | null>()
    .nullable()
    .test("fileType", "Logo must be an image (PNG/JPG)", (value) => {
      if (!value || typeof value === "string") return true;
      return ACCEPTED_LOGO_TYPES.includes(value.type);
    }),
  // .test(
  //   "fileSize",
  //   "Logo size must be under 2MB",
  //   (value) => {
  //     if (!value || typeof value === "string") return true;
  //     return value.size <= MAX_LOGO_SIZE;
  //   }
  // ),
});

const createInitialValues = (): CompanyType => ({
  name: "",
  pic_name: "",
  address: "",
  email: "",
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
  { immediate: true },
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function resolveLogoValue(logo: CompanyType["logo"]) {
  // if (!logo) return undefined;
  if (logo instanceof File) {
    return await readFileAsDataUrl(logo);
  }
  if (typeof logo === "string" && logo.trim() !== "") {
    return logo;
  }
  return logo;

  // return undefined;
}

async function handleFormSubmit(values: Record<string, any>) {
  try {
    const logo = await resolveLogoValue(values.logo);
    const payload = {
      name: values.name,
      pic_name: values.pic_name,
      address: values.address,
      email: values.email,
      logo,
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
