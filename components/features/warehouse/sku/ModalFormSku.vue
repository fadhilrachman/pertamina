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
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const idempotencyKey = ref<string>("");
const generateIdempotencyKey = () => {
  idempotencyKey.value = uuidv4();
};

const emit = defineEmits(["opened", "closed"]);
const route = useRoute();
const warehouseId = route.params.warehouse_id;
const modalInstance = ref<ElementEvent | null>(null);

const facilitiesSkuStore = useFacilitiesSkuStore();
const transactionStore = useStockTransaction();
const skuStore = useSkuStore();

const { loadingWrite: loadingFacilitiesSku } = storeToRefs(facilitiesSkuStore);
const { loadingWrite: loadingTransaction } = transactionStore;
const { loadingWrite, data: skuData } = storeToRefs(skuStore);
const { createDataSku, getDataSku } = skuStore;

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
      id: item.sku_code,
      label: `${item.sku_code} - ${item.name}`,
    })) || []
);

const formSchema = object({
  sku_code: string().required("SKU Code is required"),
  name: string().required("Name is required"),
  // category: string().required("Category is required"),
  unit: string().required("UOM is required"),
  max_stock: string().required("Maximum Stock Level is required"),
  min_stock: string().required("Minimum Stock is required"),
  description: string(),
});

const createInitialValues = (): PayloadSKUType => ({
  sku_code: "",
  name: "",
  unit: "",
  description: "",
  status: "active",
  category: "",
  max_stock: "",
  min_stock: "",
});

const form = useForm<PayloadSKUType>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});

const { values, setFieldValue } = form;

const skuList = computed(
  () =>
    skuData.value?.data?.data ||
    (Array.isArray(skuData.value?.data) ? skuData.value?.data : [])
);

const selectedSku = computed<any | null>(() => {
  if (!values.sku_code) return null;
  return (
    skuList.value.find(
      (item: any) => String(item.sku_code) === String(values.sku_code)
    ) || null
  );
});

watch(
  () => values.sku_code,
  (code) => {
    const sku =
      skuList.value.find(
        (item: any) => String(item.sku_code) === String(code)
      ) || null;

    if (sku) {
      setFieldValue("name", sku.name ?? "", false);
      setFieldValue("category", (sku as any).category ?? "", false);
      setFieldValue("unit", sku.unit ?? "", false);
      // setFieldValue("max_stock", (sku as any).max_stock ?? "0", false);
      // setFieldValue("min_stock", (sku as any).min_stock ?? "0", false);
    } else {
      // reset to defaults for new SKU code
      setFieldValue("name", "", false);
      setFieldValue("category", "", false);
      setFieldValue("unit", "", false);
      // setFieldValue("max_stock", "0", false);
      // setFieldValue("min_stock", "0", false);
    }
  }
);

const formFields = computed<FieldConfig[]>(() => {
  const isExistingSku = !!selectedSku.value;
  return [
    {
      name: "sku_code",
      label: "SKU Code",
      requiredMark: true,
      type: "search-select",
      placeholder: "Select SKU",
      grid: 6,
      creatable: true,
      options: skuOptions.value,
    },
    {
      name: "name",
      label: "Name",
      requiredMark: true,
      type: "text",
      placeholder: "e.g., Cardboard Box 30x30",
      grid: 6,
      disabled: isExistingSku,
    },
    {
      name: "category",
      label: "Category",
      requiredMark: true,
      type: "text",
      placeholder: "e.g., Raw Material, Finished Good",
      grid: 6,
      disabled: isExistingSku,
    },
    {
      name: "unit",
      label: "UOM",
      requiredMark: true,
      type: "text",
      placeholder: "e.g., Units, Liters, Kg",
      grid: 6,
      disabled: isExistingSku,
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
    {
      name: "beginning_inventory",
      label: "Beginning Inventory",
      type: "number",
      placeholder: "0",
      grid: 6,
      requiredMark: true,
      min: 0,
    },
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
  form.resetForm({ values: createInitialValues() });
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
  const isExistingSku = !!selectedSku.value;

  // const isExistingSku = skuOptions.value !== undefined;
  console.log({ values });

  try {
    generateIdempotencyKey();
    const lockKey = `stock_${values.sku_id || values.sku_code || "unknown"}`;

    if (isExistingSku) {
      const idSku = skuData.value?.data?.data?.find(
        (item) => item.sku_code === values.sku_code
      )?.id;

      // console.log({ idSku, skuData });

      const resultSku = await facilitiesSkuStore.createDataFacilitiesSku({
        sku_id: idSku as string,
        facility_id: warehouseId as string,
        high_stock_threshold: Number(values.max_stock),
        low_stock_threshold: Number(values.min_stock),
        description: values.description,
        status: "active",
        // max_stock: values.max_stock as any,
        // min_stock: values.min_stock,
        // uom: values.unit,
      });

      if (Number(values.beginning_inventory) != 0) {
        await transactionStore.createDataStockTransaction(
          {
            lines: [
              {
                qty: Number(values.beginning_inventory),
                facility_sku_id: resultSku?.data?.id,
                uom: "kg", //TEMPORARY
              },
            ],
            note: values.description,
            // reference_no: val.reference_no,
            // reference_type: val.reference_type,
            trx_date: moment().format("YYYY-MM-DD"),
            trx_type: "IN",
          },
          {
            uuid: idempotencyKey.value,
            lockKey,
          }
        );
      }
    } else {
      const resultSku = await createDataSku(values);
      const resultSkuFacilities =
        await facilitiesSkuStore.createDataFacilitiesSku({
          sku_id: resultSku.data.id as string,
          facility_id: warehouseId as string,
          high_stock_threshold: Number(values.max_stock),
          low_stock_threshold: Number(values.min_stock),
          description: values.description,
          status: "active",
          // max_stock: values.max_stock as any,
          // min_stock: values.min_stock,
          // uom: values.unit,
        });
      if (Number(values.beginning_inventory) != 0) {
        await transactionStore.createDataStockTransaction(
          {
            lines: [
              {
                qty: Number(values.beginning_inventory),
                facility_sku_id: resultSkuFacilities?.data?.id,
                uom: "kg", //TEMPORARY
              },
            ],
            note: values.description,
            // reference_no: val.reference_no,
            // reference_type: val.reference_type,
            trx_date: moment().format("YYYY-MM-DD"),
            trx_type: "IN",
          },
          {
            uuid: idempotencyKey.value,
            lockKey,
          }
        );
      }

      console.log({ resultSku });
    }
    facilitiesSkuStore.getDataFacilitiesSku({
      facility_id: warehouseId as string,
      limit: 10,
      page: 1,
    });
    // form.resetForm({ values: createInitialValues() });

    // getDataSku({ page: 1, limit: 10 });
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
    id="modal-add-sku"
    title="Add New SKU"
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
          :disabled="loadingWrite || loadingFacilitiesSku || loadingTransaction"
          :loading="loadingWrite || loadingFacilitiesSku || loadingTransaction"
          type="submit"
          form="FormSKU"
          color="primary"
          label="Create"
        />
      </div>
    </template>
  </GeneralModal>
</template>

<style scoped></style>
