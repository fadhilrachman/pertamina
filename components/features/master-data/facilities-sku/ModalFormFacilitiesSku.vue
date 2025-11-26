<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { number, object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import type {
  FacilitiesSkuType,
  PayloadFacilitiesSkuType,
} from "~/types/facilities-sku-type";
import { useSkuStore } from "~/store/master-data/sku-store";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";

const props = withDefaults(
  defineProps<{
    mode?: "add" | "update";
  }>(),
  {
    mode: "add",
  }
);
const isUpdateMode = computed(() => props.mode === "update");
const route = useRoute();

const skuStore = useSkuStore();
const { data: skuData } = storeToRefs(skuStore);
const emit = defineEmits(["opened", "closed"]);
const facilitiesStore = useFacilitiesSkuStore();
const { loadingWrite, selectedData } = storeToRefs(facilitiesStore);
const {
  createDataFacilitiesSku,
  updateDataFacilitiesSku,
  getDataFacilitiesSku,
} = facilitiesStore;
const skuOptions = computed(
  () =>
    skuData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: `${item.sku_code} - ${item.name}`,
    })) || []
);

const formFields = computed<FieldConfig[]>(() => [
  {
    name: "sku_id",
    label: "Sku Name",
    requiredMark: true,
    type: "search-select",
    placeholder: "Select SKU",
    grid: 12,
    options: skuOptions.value,
  },
  {
    name: "low_stock_threshold",
    label: "Low Stock Threshold",
    requiredMark: true,
    type: "number",
    placeholder: "e.g., 10",
    grid: 6,
    min: 0,
  },
  {
    name: "high_stock_threshold",
    label: "High Stock Threshold",
    requiredMark: true,
    type: "number",
    placeholder: "e.g., 10",
    grid: 6,
    min: 0,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "e.g., Description",
    grid: 12,
    min: 0,
  },
]);

const modalInstance = ref<ElementEvent | null>(null);

const formSchema = object({
  sku_id: string().required("SKU is required"),
  low_stock_threshold: number()
    .typeError("Low stock threshold is required")
    .min(0, "Minimum value is 0")
    .required("Low stock threshold is required"),
  high_stock_threshold: number()
    .typeError("High stock threshold is required")
    .min(0, "Minimum value is 0")
    .required("High stock threshold is required"),
});

const createInitialValues = (): PayloadFacilitiesSkuType => ({
  low_stock_threshold: "",
  high_stock_threshold: "",
  sku_id: "",
  description: "",
});
const form = useForm<PayloadFacilitiesSkuType>({
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
      form.resetForm({ values: selectedData as FacilitiesSkuType });
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
  if (!skuData.value?.data?.data?.length) {
    skuStore.getDataSku({ page: 1, limit: 1000 });
  }
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

async function handleFormSubmit(values: Record<string, any>) {
  try {
    let payload = {
      low_stock_threshold: Number(values.low_stock_threshold ?? 0),
      high_stock_threshold: Number(values.high_stock_threshold ?? 0),
      sku_id: String(values.sku_id ?? ""),
      description: values.description,
      facility_id: route.query.facility_id,
    };
    const action =
      props.mode === "update"
        ? updateDataFacilitiesSku
        : createDataFacilitiesSku;
    await action(payload as any);

    await handleCancel();
    getDataFacilitiesSku({
      page: 1,
      limit: 10,
      facility_id: route.query.facility_id as string,
    });

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
    :title="isUpdateMode ? 'Update SKU' : 'Add SKU'"
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
