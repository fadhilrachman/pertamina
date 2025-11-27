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

const skuStore = useSkuStore();
const { data: skuData } = storeToRefs(skuStore);
const emit = defineEmits(["opened", "closed"]);
const facilitiesSkuStore = useFacilitiesSkuStore();
const { loadingWrite, selectedData } = storeToRefs(facilitiesSkuStore);
const {
  createDataFacilitiesSku,
  updateDataFacilitiesSku,
  getDataFacilitiesSku,
} = facilitiesSkuStore;

const facilitiesStore = useFacilitiesStore();
const { data: facilitiesData } = storeToRefs(facilitiesStore);

const facilitiesOptions = computed(
  () =>
    facilitiesData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: item.name,
    })) || []
);
const skuOptions = computed(
  () =>
    skuData.value?.data?.data?.map((item) => ({
      id: item.id,
      label: `${item.sku_code} - ${item.name}`,
    })) || []
);

const formFields = computed<FieldConfig[]>(() => [
  {
    name: "facility_id",
    label: "Facility",
    requiredMark: true,
    type: "search-select",
    placeholder: "Select Facility",
    grid: 12,
    options: facilitiesOptions.value,
  },
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
  facility_id: string().required("Facility is required"),
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
  facility_id: "",
  description: "",
});
const form = useForm<PayloadFacilitiesSkuType>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});
const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

onMounted(() => {
  if (!skuData.value?.data?.data?.length) {
    skuStore.getDataSku({ page: 1, limit: 1000 });
  }
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
});

// watch(
//   () => ({
//     mode: props.mode,
//   }),
//   ({ mode }) => {
//     console.log("uhuyyyyyyyyyy");
//     console.log({ selectedData });

//   },
//   { immediate: true }
// );

const open = () => {
  if (props.mode === "update") {
    const current = selectedData.value as FacilitiesSkuType;
    form.resetForm({
      values: {
        facility_id: current.facility_id,
        sku_id: current.sku_id,
        low_stock_threshold: current.low_stock_threshold ?? "",
        high_stock_threshold: current.high_stock_threshold ?? 0,
        description: current.description ?? "",
      },
    });
  } else {
    form.resetForm({ values: createInitialValues() });
  }
  modalInstance.value?.show();
};
const close = () => {
  modalInstance.value?.hide();
};

const handleCancel = () => {
  // form.resetForm({ values: createInitialValues() });
  close();
};

async function handleFormSubmit(values: Record<string, any>) {
  try {
    let payload = {
      low_stock_threshold: Number(values.low_stock_threshold ?? 0),
      high_stock_threshold: Number(values.high_stock_threshold ?? 0),
      sku_id: String(values.sku_id ?? ""),
      description: values.description,
      facility_id: String(values.facility_id ?? ""),
      status: "active",
    };
    const isUpdate = props.mode === "update";
    const action = isUpdate ? updateDataFacilitiesSku : createDataFacilitiesSku;

    if (isUpdate) {
      payload = {
        ...(payload as any),
        id: (selectedData.value as FacilitiesSkuType | undefined)?.id,
      } as any;
    }

    await action(payload as any);

    await handleCancel();
    getDataFacilitiesSku({
      page: 1,
      limit: 10,
      facility_id: String(values.facility_id ?? ""),
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
    :title="isUpdateMode ? 'Update Facility SKU' : 'Add Facility SKU'"
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
