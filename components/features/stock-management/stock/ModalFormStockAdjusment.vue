<script setup lang="ts">
import { computed, ref } from "vue";
import { storeToRefs } from "pinia";
import { useForm } from "vee-validate";
import { number, object, string } from "yup";
import type { FieldConfig } from "~/components/general/FormGenerator/index.vue";
import type { ElementEvent } from "~/types/element";
import { useStockOnHand } from "~/store/stock-on-hand/stock-on-hand-store";
import { v4 as uuidv4 } from "uuid";
import { useStockTransaction } from "~/store/stock-management/stock-transaction-store";
import moment from "moment";
import type { SessionResponseType } from "~/types/user-type";

const idempotencyKey = uuidv4();

const emit = defineEmits(["opened", "closed"]);
const stockTransactionStore = useStockTransaction();
const { loadingWrite } = storeToRefs(stockTransactionStore);

const stockOnHandStore = useStockOnHand();
const { selectedData } = storeToRefs(stockOnHandStore);
const { data: authData } = useAuth();

const isManagementRole = computed(() => {
  const session = authData.value as SessionResponseType | null;
  const roleName = session?.data?.role?.name || "";
  return roleName.toLowerCase() === "management";
});

const modalInstance = ref<ElementEvent | null>(null);

const formSchema = object({
  current_qty: number().required(),
  qty: number()
    .typeError("On Hand Quantity After is required")
    .required("On Hand Quantity After is required"),
  note: string().nullable(),
});

const createInitialValues = () => {
  const current = selectedData.value?.on_hand_qty ?? 0;
  return {
    current_qty: current,
    qty: current,
    note: "",
  };
};

const form = useForm<any>({
  validationSchema: formSchema,
  initialValues: createInitialValues(),
});
const { values } = form;

const adjustment = computed(() => {
  const current = Number(values.current_qty || 0);
  const next = Number(values.qty || 0);
  return next - current;
});

const formFields = computed<FieldConfig[]>(() => [
  {
    name: "current_qty",
    label: "On Hand Quantity (Current)",
    type: "number",
    placeholder: "0",
    grid: 12,
    disabled: true,
  },
  {
    name: "qty",
    label: "On Hand Quantity After ",
    type: "number",
    placeholder: "Enter new on-hand quantity",
    grid: 12,
    requiredMark: true,
    helperText: `Adjustment : ${adjustment.value}`,
  },
  {
    name: "note",
    label: "Notes",
    type: "textarea",
    placeholder: "Reason for adjustment...",
    grid: 12,
  },
]);

const handleModalMounted = (instance: ElementEvent) => {
  modalInstance.value = instance;
};

const resetForm = () => {
  form.resetForm({ values: createInitialValues() });
};

const open = () => {
  console.log({ value: selectedData.value });

  resetForm();
  modalInstance.value?.show();
};

const close = () => {
  modalInstance.value?.hide();
};

const handleCancel = () => {
  resetForm();
  close();
};

const handleFormSubmit = async (val: any) => {
  if (isManagementRole.value) {
    return;
  }
  const data = selectedData.value;
  await stockTransactionStore.createDataStockTransaction(
    {
      lines: [
        {
          qty: Number(val.qty),
          facility_sku_id: data.facility_sku_id,
          uom: data.unit_of_measure,
        },
      ],
      note: val.note,
      reference_no: val.reference_no,
      reference_type: val.reference_type,
      trx_date: moment().format("YYYY-MM-DD"),
      trx_type: "IN",
    },
    {
      uuid: idempotencyKey,
    }
  );

  await stockOnHandStore.getDataStockOnHand({
    page: 1,
    limit: 10,
  });
  resetForm();
  close();

  // TODO: call real adjustment API when available

  resetForm();
  close();
};

const handleModalOpened = () => emit("opened");
const handleModalClosed = () => emit("closed");

defineExpose({
  open,
  close,
});
</script>

<template>
  <GeneralModal
    id="modal-stock-adjustment"
    title="Stock Adjustment"
    :is-has-close="true"
    class-modal="max-w-xl"
    @mounted="handleModalMounted"
    @modal-opened="handleModalOpened"
    @modal-closed="handleModalClosed"
  >
    <template #body>
      <div class="space-y-4">
        <div
          class="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-800 space-y-1"
        >
          <div class="space-y-0.5">
            <p class="text-xs font-medium text-slate-500">Warehouse</p>
            <p class="text-sm font-semibold text-slate-900">
              {{ selectedData?.warehouse || "-" }}
            </p>
          </div>

          <div class="space-y-0.5 pt-2">
            <p class="text-xs font-medium text-slate-500">SKU</p>
            <p class="text-sm font-semibold text-slate-900">
              {{
                selectedData
                  ? `${selectedData.sku_code} - ${selectedData.sku_name}`
                  : "-"
              }}
            </p>
          </div>
        </div>

        <GeneralFormGenerator
          id="FormStockAdjustment"
          :form-context="form"
          :fields="formFields"
          :validation-schema="formSchema"
          class-name="space-y-2"
          @submit="handleFormSubmit"
        />

        <!-- <p class="text-xs text-gray-500">
          Adjustment:
          <span class="font-semibold text-gray-800">{{ adjustment }}</span>
        </p> -->

        <div class="flex justify-end mt-2 gap-3 pt-2">
          <GeneralOutlinedButton
            label="Cancel"
            type="button"
            @on-click="handleCancel"
          />
          <GeneralButton
            v-if="!isManagementRole"
            type="submit"
            :loading="loadingWrite"
            :disabled="loadingWrite"
            form="FormStockAdjustment"
            color="primary"
            label="Submit"
          />
        </div>
      </div>
    </template>
  </GeneralModal>
</template>
