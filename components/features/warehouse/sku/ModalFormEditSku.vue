<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import type { ElementEvent } from "~/types/element";
import { object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import { useSkuStore } from "~/store/master-data/sku-store";
import type { PayloadSKUType } from "~/types/sku-type";
import { useFacilitiesStore } from "~/store/master-data/facilities-store";
import { useFacilitiesSkuStore } from "~/store/master-data/facilities-sku-store";
import type { FacilitiesSkuType } from "~/types/facilities-sku-type";

const emit = defineEmits(["opened", "closed"]);

const route = useRoute();
const warehouseId = route.params.warehouse_id;
const modalInstance = ref<ElementEvent | null>(null);

const skuStore = useSkuStore();
const facilitiesSkuStore = useFacilitiesSkuStore();

const { loadingWrite, data: skuData } = storeToRefs(skuStore);
const {
  loadingWrite: loadingFacilitiesSku,
  selectedData: selectedFacilitiesSku,
} = storeToRefs(facilitiesSkuStore);

const { updateDataSku, getDataSku } = skuStore;

const facilitiesStore = useFacilitiesStore();
const { data: facilitiesData } = storeToRefs(facilitiesStore);

const skuOptions = computed(
  () =>
    skuData.value?.data?.data?.map((item) => ({
      id: item.sku_code,
      label: `${item.sku_code}`,
    })) || [],
);

const formSchema = object({
  sku_code: string().required("SKU Code is required"),
  name: string().required("Name is required"),
  category: string().required("Category is required"),
  unit: string().required("UOM is required"),
  max_stock: string().required("Maximum Stock Level is required"),
  min_stock: string().required("Minimum Stock is required"),
  description: string(),
});

const createInitialValues = (): any => ({
  sku_code: "",
  name: "",
  unit: "",
  description: "",
  status: "active",
  category: "",
  max_stock: "",
  min_stock: "",
  beginning_inventory_by_warehouse: [],
});

const form = useForm<PayloadSKUType>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});

const { values, setFieldValue } = form;

const skuList = computed(
  () =>
    skuData.value?.data?.data ||
    (Array.isArray(skuData.value?.data) ? skuData.value?.data : []),
);

const selectedSku = computed<any | null>(() => {
  if (!values.sku_code) return null;
  return (
    skuList.value.find(
      (item: any) => String(item.sku_code) === String(values.sku_code),
    ) || null
  );
});

watch(
  () => values.sku_code,
  (code) => {
    const sku =
      skuList.value.find(
        (item: any) => String(item.sku_code) === String(code),
      ) || null;

    if (sku) {
      // setFieldValue("name", sku.name ?? "", false);
      setFieldValue("category", (sku as any).category ?? "", false);
      setFieldValue("unit", sku.unit ?? "", false);
      // setFieldValue("max_stock", (sku as any).max_stock ?? "0", false);
      // setFieldValue("min_stock", (sku as any).min_stock ?? "0", false);
    } else {
      // setFieldValue("name", "", false);
      setFieldValue("category", "", false);
      setFieldValue("unit", "", false);
      // setFieldValue("max_stock", "0", false);
      // setFieldValue("min_stock", "0", false);
    }
  },
);

const formFields = computed<FieldConfig[]>(() => {
  return [
    {
      name: "sku_code",
      label: "SKU Code",
      requiredMark: true,
      type: "search-select",
      placeholder: "Select SKU",
      grid: 6,
      creatable: false,
      options: skuOptions.value,
      disabled: true,
    },
    {
      name: "name",
      label: "Name",
      requiredMark: true,
      type: "text",
      placeholder: "e.g., Cardboard Box 30x30",
      grid: 6,
      // disabled: isExistingSku,
    },
    {
      name: "category",
      label: "Category",
      requiredMark: true,
      type: "text",
      placeholder: "e.g., Raw Material, Finished Good",
      grid: 6,
      // disabled: isExistingSku,
    },
    {
      name: "unit",
      label: "UOM",
      requiredMark: true,
      type: "text",
      placeholder: "e.g., Units, Liters, Kg",
      grid: 6,
      // disabled: isExistingSku,
    },
    {
      name: "max_stock",
      label: "Maximum Stock Level",
      requiredMark: true,
      type: "number",
      placeholder: "0",
      grid: 6,
      // disabled: isExistingSku,
    },
    {
      name: "min_stock",
      label: "Minimum Stock",
      requiredMark: true,
      type: "number",
      placeholder: "0",
      grid: 6,
      // disabled: isExistingSku,
    },
    // {
    //   name: "beginning_inventory",
    //   label: "Beginning Inventory",
    //   type: "number",
    //   placeholder: "0",
    //   grid: 6,
    //   requiredMark: true,
    //   min: 0,
    // },
    {
      name: "description",
      label: "Description",
      type: "textarea",
      placeholder: "Add a SKU description",
      grid: 12,
    },
  ];
});

onMounted(() => {
  facilitiesStore.getDataFacilities({ page: 1, limit: 1000 });
  skuStore.getDataSku({ page: 1, limit: 1000 });
});

const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const open = () => {
  const current = selectedFacilitiesSku.value as FacilitiesSkuType | undefined;

  if (current && current.id) {
    form.resetForm({
      values: {
        // ambil dari data facilities SKU
        sku_code: current.sku_code ?? "",
        // name/category/unit akan diisi ulang oleh watcher berdasarkan master SKU
        name: current.sku_name ?? "",
        category: "",
        unit: "",
        // map threshold -> max/min stock
        max_stock: current.high_stock_threshold ?? "0",
        min_stock: current.low_stock_threshold ?? "0",
        description: current.description ?? "",
        status: current.status ?? "active",
        beginning_inventory_by_warehouse:
          (current as any).beginning_inventory_by_warehouse || [],
      } as any,
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
  close();
};

async function handleFormSubmit(values: Record<string, any>) {
  try {
    await updateDataSku({
      id: selectedFacilitiesSku.value?.sku_id as string,
      name: values.name,
      category: values.category,
      unit: values.unit,
      description: values.description,
      status: "active",
    });
    await facilitiesSkuStore.updateDataFacilitiesSku({
      facility_id: warehouseId as string,
      sku_id: selectedFacilitiesSku.value?.sku_id as string,
      high_stock_threshold: Number(values.max_stock),
      low_stock_threshold: Number(values.min_stock),
      description: values.description,
      status: "active",
      id: selectedFacilitiesSku.value?.id as string,
    });
    form.resetForm({ values: createInitialValues() });

    facilitiesSkuStore.getDataFacilitiesSku({
      facility_id: warehouseId as string,
      limit: 10,
      page: 1,
    });
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
    id="modal-edit-sku"
    title="Update SKU"
    :is-has-close="true"
    class-modal="max-w-xl"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body>
      <GeneralFormGenerator
        id="FormEditSKU"
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
          :disabled="loadingWrite || loadingFacilitiesSku"
          :loading="loadingWrite || loadingFacilitiesSku"
          type="submit"
          form="FormEditSKU"
          color="primary"
          label="Update"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
