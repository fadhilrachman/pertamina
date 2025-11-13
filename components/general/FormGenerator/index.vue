<script setup lang="ts">
import { computed, watch, type PropType } from "vue";
import {
  Field,
  ErrorMessage,
  useForm,
  type FieldSlotProps,
} from "vee-validate";
import type { AnyObjectSchema } from "yup";
import GeneralTextInput from "~/components/general/TextInput/index.vue";

type FieldType = "text" | "email" | "date" | "textarea" | "select" | "file";

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
  initialValues: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", payload: Record<string, any>): void;
  (e: "submit", payload: Record<string, any>): void;
}>();

const fallbackInitials = computed(() => {
  const base: Record<string, any> = {};
  props.fields.forEach((field) => {
    base[field.name] =
      props.modelValue[field.name] ??
      props.initialValues[field.name] ??
      field.defaultValue ??
      (field.type === "file" ? null : "");
  });
  return base;
});

const { handleSubmit, values, setValues } = useForm({
  validationSchema: props.validationSchema,
  initialValues: fallbackInitials.value,
});

watch(
  fallbackInitials,
  (next) => {
    setValues({ ...next }, false);
  },
  { immediate: true, deep: true }
);

watch(
  () => props.modelValue,
  (next) => {
    if (!next) return;
    setValues({ ...fallbackInitials.value, ...next }, false);
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
        <div :class="['flex flex-col space-y-1', getColSpanClass(field)]">
          <label
            v-if="field.label"
            :for="`${id}-${field.name}`"
            class="text-sm text-gray-700 flex items-center gap-1"
          >
            <span>{{ field.label }}</span>
            <span v-if="field.requiredMark" class="text-error-500">*</span>
          </label>

          <template v-if="field.type === 'text' || field.type === 'email'">
            <GeneralTextInput
              :id="`${id}-${field.name}`"
              :model-value="fieldBinding.value"
              :type="field.type"
              :placeholder="field.placeholder"
              :disabled="field.disabled"
              :invalid="meta.touched && !meta.valid"
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
            <input
              :id="`${id}-${field.name}`"
              type="date"
              :value="fieldBinding.value"
              :placeholder="field.placeholder"
              :required="field.requiredMark"
              :disabled="field.disabled"
              :class="
                dateInputClasses(meta.touched && !meta.valid, field.disabled)
              "
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

          <!-- <p v-if="field.helperText" class="text-xs text-gray-500">
            {{ field.helperText }}
          </p> -->

          <ErrorMessage :name="field.name" v-slot="{ message }">
            <p class="text-xs text-error-500">
              {{ message }}
            </p>
          </ErrorMessage>
        </div>
      </Field>
    </template>
  </form>
</template>
