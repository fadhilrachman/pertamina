<script setup lang="ts">
import { watch, type PropType } from "vue";
import {
  Field,
  ErrorMessage,
  type FieldSlotProps,
  type FormContext,
} from "vee-validate";
import type { AnyObjectSchema } from "yup";
import GeneralTextInput from "~/components/general/TextInput/index.vue";
import GeneralDropdownSearch from "~/components/general/DropdownSearch/index.vue";

type FieldType =
  | "text"
  | "number"
  | "email"
  | "password"
  | "date"
  | "textarea"
  | "select"
  | "file"
  | "search-select"
  | "array";

interface SelectOption {
  id: string | number;
  label: string;
}

export interface FieldConfig {
  label?: string;
  type: FieldType;
  name: string;
  placeholder?: string;
  requiredMark?: boolean;
  helperText?: string;
  disabled?: boolean;
  grid?: keyof typeof listColSpan;
  defaultValue?: any;
  options?: ReadonlyArray<SelectOption>;
  multiple?: boolean;
  min?: number;
  max?: number;
  // array-type specific config
  fields?: ReadonlyArray<FieldConfig>;
  addButtonLabel?: string;
  minItems?: number;
  maxItems?: number;
  creatable?: boolean;
}

const listColSpan = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

const props = defineProps({
  id: {
    type: String,
    default: "formGenerator",
  },
  fields: {
    type: Array as PropType<readonly FieldConfig[]>,
    required: true,
  },
  columns: {
    type: Number,
    default: 12,
  },
  className: {
    type: String,
    default: "",
  },
  validationSchema: {
    type: Object as PropType<AnyObjectSchema | undefined>,
    default: undefined,
  },
  modelValue: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
  formContext: {
    type: Object as PropType<FormContext<any>>,
    required: true,
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", payload: Record<string, any>): void;
  (e: "submit", payload: Record<string, any>): void;
}>();

const { handleSubmit, values, setValues } = props.formContext;

watch(
  () => props.modelValue,
  (next) => {
    if (!next) return;
    setValues({ ...values.value, ...next }, false);
  },
  { deep: true }
);

watch(
  values,
  (current) => {
    emit("update:modelValue", { ...current });
  },
  { deep: true }
);

const onSubmit = handleSubmit((formData) => {
  emit("submit", formData);
});

function normalizeSpan(
  value?: FieldConfig["grid"] | number
): keyof typeof listColSpan {
  const parsed = Number(value);
  if (Number.isInteger(parsed) && parsed >= 1 && parsed <= 12) {
    return parsed as keyof typeof listColSpan;
  }
  return 12;
}

function getColSpanClass(field: FieldConfig) {
  const spanKey = normalizeSpan(field.grid ?? props.columns);
  return listColSpan[spanKey];
}

function handleFileChange(
  field: FieldConfig,
  event: Event,
  control: FieldSlotProps["field"]
) {
  if (!(event.target instanceof HTMLInputElement)) {
    return;
  }
  const files = event.target.files ? Array.from(event.target.files) : [];
  const parsed = field.multiple ? files : files[0] ?? null;
  control.onChange(parsed);
}

function ensureArray<T>(value: T[] | null | undefined | T): T[] {
  if (Array.isArray(value)) return value;
  return [];
}

function createArrayItem(field: FieldConfig) {
  const item: Record<string, any> = {};
  (field.fields || []).forEach((child) => {
    if (child.defaultValue !== undefined) {
      item[child.name] = child.defaultValue;
    } else if (child.type === "file") {
      item[child.name] = null;
    } else {
      item[child.name] = "";
    }
  });
  return item;
}

function addArrayItem(field: FieldConfig, control: FieldSlotProps["field"]) {
  const current = ensureArray(control.value as any);
  const nextLength = current.length + 1;
  if (typeof field.maxItems === "number" && nextLength > field.maxItems) {
    return;
  }
  const updated = [...current, createArrayItem(field)];
  control.onChange(updated);
}

function removeArrayItem(
  field: FieldConfig,
  control: FieldSlotProps["field"],
  index: number
) {
  const current = ensureArray(control.value as any);
  if (current.length <= (field.minItems ?? 0)) return;
  const updated = [...current];
  updated.splice(index, 1);
  control.onChange(updated);
}

function updateArrayItem(
  field: FieldConfig,
  control: FieldSlotProps["field"],
  index: number,
  key: string,
  value: unknown
) {
  const current = ensureArray(control.value as any);
  const updated = [...current];
  const existing = (updated[index] || {}) as Record<string, any>;
  updated[index] = {
    ...existing,
    [key]: value,
  };
  control.onChange(updated);
}

function baseInputClasses(disabled?: boolean) {
  const cursor = disabled ? "cursor-not-allowed" : "cursor-text";
  const background = disabled
    ? "bg-gray-100 text-gray-500"
    : "bg-white text-gray-900";
  return `w-full rounded-lg border px-3 text-sm transition focus:outline-none ${cursor} ${background}`;
}

function stateClasses(invalid: boolean) {
  return invalid
    ? "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-100"
    : "border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100";
}

function textareaClasses(invalid: boolean, disabled?: boolean) {
  return `${baseInputClasses(disabled)} min-h-[120px] p-3 ${stateClasses(
    invalid
  )}`;
}

function selectClasses(invalid: boolean, disabled?: boolean) {
  return `${baseInputClasses(disabled)} h-10 bg-white ${stateClasses(invalid)}`;
}

function dateInputClasses(invalid: boolean, disabled?: boolean) {
  return `${baseInputClasses(disabled)} h-10 ${stateClasses(invalid)}`;
}

function fileInputClasses(invalid: boolean, disabled?: boolean) {
  const disabledClass = disabled ? "cursor-not-allowed bg-gray-100" : "";
  const state = invalid
    ? "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-100"
    : "border-dashed border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100";
  return `h-10 w-full rounded-lg border px-3 text-sm ${state} file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 ${disabledClass}`;
}
</script>

<template>
  <form
    :id="id"
    :class="['grid grid-cols-12 gap-4', className]"
    @submit.prevent="onSubmit"
  >
    <template v-for="field in fields" :key="field.name">
      <Field :name="field.name" v-slot="{ field: fieldBinding, meta }">
        <div :class="['flex flex-col  space-y-1', getColSpanClass(field)]">
          <label
            v-if="field.label"
            :for="`${id}-${field.name}`"
            class="text-sm font-medium text-gray-700 flex items-center justify-between gap-2"
          >
            <div class="flex items-center gap-1">
              <span>{{ field.label }}</span>
              <span v-if="field.requiredMark" class="text-error-500">*</span>
            </div>

            <GeneralButton
              v-if="field.type === 'array'"
              type="button"
              color="primary"
              size="xs"
              class="!h-8"
              :label="field.addButtonLabel || 'Add'"
              @on-click="addArrayItem(field, fieldBinding)"
            >
              <template #prefix>
                <IconsPlus size="16" class="text-white" />
              </template>
            </GeneralButton>
          </label>

          <template
            v-if="
              field.type === 'text' ||
              field.type === 'password' ||
              field.type === 'email' ||
              field.type === 'number'
            "
          >
            <GeneralTextInput
              :id="`${id}-${field.name}`"
              :model-value="fieldBinding.value"
              :type="field.type"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :invalid="meta.touched && !meta.valid"
              :min="field.min"
              :max="field.max"
              @update:model-value="fieldBinding.onChange"
            />
          </template>

          <template v-else-if="field.type === 'textarea'">
            <textarea
              :id="`${id}-${field.name}`"
              :value="fieldBinding.value"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :class="
                textareaClasses(meta.touched && !meta.valid, field.disabled)
              "
              @input="
                fieldBinding.onChange(
                  ($event.target as HTMLTextAreaElement).value
                )
              "
            />
          </template>

          <template v-else-if="field.type === 'date'">
            <GeneralTextInput
              :id="`${id}-${field.name}`"
              type="date"
              :value="fieldBinding.value"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :invalid="meta.touched && !meta.valid"
              @input="
                fieldBinding.onChange(($event.target as HTMLInputElement).value)
              "
            />
          </template>

          <template v-else-if="field.type === 'select'">
            <GeneralDropdown
              :id="`${id}-${field.name}`"
              variant="field"
              :model-value="fieldBinding.value"
              :options="field.options || []"
              :placeholder="field.placeholder || 'Select option'"
              :disabled="field.disabled"
              :required="field.requiredMark"
              :invalid="meta.touched && !meta.valid"
              :multiple="field.multiple"
              @update:model-value="fieldBinding.onChange"
            />
          </template>

          <template v-else-if="field.type === 'array'">
            <div
              class="mt-1 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4"
            >
              <div
                v-if="
                  !Array.isArray(fieldBinding.value) ||
                  fieldBinding.value.length === 0
                "
                class="text-xs text-gray-400"
              >
                No items. Click "Add" to start.
              </div>

              <div
                v-for="(item, index) in ensureArray(fieldBinding.value as any)"
                :key="index"
                class="flex items-start gap-3"
              >
                <div class="grid flex-1 grid-cols-12 gap-3">
                  <template
                    v-for="child in field.fields || []"
                    :key="child.name"
                  >
                    <div
                      :class="[
                        'flex flex-col space-y-1',
                        getColSpanClass(child),
                      ]"
                    >
                      <label
                        v-if="child.label"
                        :for="`${id}-${field.name}-${child.name}-${index}`"
                        class="text-xs font-medium text-gray-600"
                      >
                        {{ child.label }}
                      </label>

                      <GeneralTextInput
                        v-if="
                          child.type === 'text' ||
                          child.type === 'email' ||
                          child.type === 'number'
                        "
                        :id="`${id}-${field.name}-${child.name}-${index}`"
                        :model-value="(item as any)?.[child.name]"
                        :type="child.type"
                        :placeholder="child.placeholder"
                        :disabled="child.disabled"
                        :invalid="false"
                        :min="child.min"
                        :max="child.max"
                        @update:model-value="
                          (val) =>
                            updateArrayItem(
                              field,
                              fieldBinding,
                              index,
                              child.name,
                              val
                            )
                        "
                      />

                      <textarea
                        v-else-if="child.type === 'textarea'"
                        :id="`${id}-${field.name}-${child.name}-${index}`"
                        :value="(item as any)?.[child.name]"
                        :placeholder="child.placeholder"
                        :disabled="child.disabled"
                        :class="textareaClasses(false, child.disabled)"
                        @input="
                          updateArrayItem(
                            field,
                            fieldBinding,
                            index,
                            child.name,
                            ($event.target as HTMLTextAreaElement).value
                          )
                        "
                      />

                      <GeneralTextInput
                        v-else-if="child.type === 'date'"
                        :id="`${id}-${field.name}-${child.name}-${index}`"
                        type="date"
                        :value="(item as any)?.[child.name]"
                        :placeholder="child.placeholder"
                        :disabled="child.disabled"
                        :invalid="false"
                        @input="
                          updateArrayItem(
                            field,
                            fieldBinding,
                            index,
                            child.name,
                            ($event.target as HTMLInputElement).value
                          )
                        "
                      />

                      <GeneralDropdown
                        v-else-if="child.type === 'select'"
                        :id="`${id}-${field.name}-${child.name}-${index}`"
                        variant="field"
                        :model-value="(item as any)?.[child.name]"
                        :options="child.options || []"
                        :placeholder="child.placeholder || 'Select option'"
                        :disabled="child.disabled"
                        :required="child.requiredMark"
                        :invalid="false"
                        :multiple="child.multiple"
                        @update:model-value="
                          (val) =>
                            updateArrayItem(
                              field,
                              fieldBinding,
                              index,
                              child.name,
                              val
                            )
                        "
                      />

                      <GeneralDropdownSearch
                        v-else-if="child.type === 'search-select'"
                        :id="`${id}-${field.name}-${child.name}-${index}`"
                        :model-value="(item as any)?.[child.name]"
                        :options="child.options || []"
                        :placeholder="child.placeholder || 'Search option'"
                        :disabled="child.disabled"
                        :invalid="false"
                        :multiple="child.multiple"
                        @update:model-value="
                          (val) =>
                            updateArrayItem(
                              field,
                              fieldBinding,
                              index,
                              child.name,
                              val
                            )
                        "
                      />
                    </div>
                  </template>
                </div>

                <GeneralIconButton
                  v-if="
                    ensureArray(fieldBinding.value as any).length >
                    (field.minItems ?? 0)
                  "
                  class="mt-6 h-8 w-8 bg-red-50"
                  color="default"
                  :bordered="false"
                  @on-click="removeArrayItem(field, fieldBinding, index)"
                >
                  <template #icon>
                    <IconsDelete size="16" class="text-red-500" />
                  </template>
                </GeneralIconButton>
              </div>
            </div>
          </template>

          <template v-else-if="field.type === 'search-select'">
            <GeneralDropdownSearch
              :id="`${id}-${field.name}`"
              :model-value="fieldBinding.value"
              :options="field.options || []"
              :placeholder="field.placeholder || 'Search option'"
              :disabled="field.disabled"
              :invalid="meta.touched && !meta.valid"
               :creatable="field.creatable"
              :multiple="field.multiple"
              @update:model-value="fieldBinding.onChange"
            />
          </template>

          <template v-else-if="field.type === 'file'">
            <input
              :id="`${id}-${field.name}`"
              type="file"
              :multiple="field.multiple"
              :disabled="field.disabled"
              :class="
                fileInputClasses(meta.touched && !meta.valid, field.disabled)
              "
              @change="handleFileChange(field, $event, fieldBinding)"
            />
          </template>

          <p v-if="field.helperText" class="text-xs text-gray-500">
            {{ field.helperText }}
          </p>

          <ErrorMessage :name="field.name" v-slot="{ message }">
            <p
              v-if="
                (meta.touched || meta.dirty || meta.submitCount > 0) && message
              "
              class="text-xs text-error-500"
            >
              {{ message }}
            </p>
          </ErrorMessage>
        </div>
      </Field>
    </template>
  </form>
</template>
