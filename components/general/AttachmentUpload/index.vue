<script setup lang="ts">
import { computed, ref, type PropType } from "vue";

const props = defineProps({
  modelValue: {
    type: Array as PropType<File[]>,
    default: () => [],
  },
  accept: {
    type: String,
    default: "image/*,application/pdf",
  },
  maxFiles: {
    type: Number,
    default: 5,
  },
  maxSizeMb: {
    type: Number,
    default: 5,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "Attachments",
  },
  hint: {
    type: String,
    default: "",
  },
});

const emit = defineEmits<{
  (e: "update:modelValue", value: File[]): void;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const errorMessage = ref("");
const maxBytes = computed(() => props.maxSizeMb * 1024 * 1024);
const files = computed(() => props.modelValue || []);

const normalizedAccept = computed(() =>
  (props.accept || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
);

const formatSize = (bytes: number) => {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes} B`;
};

const isAcceptedFile = (file: File) => {
  if (!normalizedAccept.value.length) return true;
  const type = file.type.toLowerCase();
  const extension = file.name.toLowerCase().split(".").pop() || "";

  return normalizedAccept.value.some((rule) => {
    if (rule.endsWith("/*")) {
      return type.startsWith(rule.replace("/*", "/"));
    }
    if (rule.startsWith(".")) {
      return `.${extension}` === rule;
    }
    return type === rule;
  });
};

const emitFiles = (next: File[]) => {
  emit("update:modelValue", next);
};

const validateAndAddFiles = (selected: FileList | File[] | null) => {
  if (!selected || props.disabled) return;

  const incoming = Array.from(selected);
  const existing = files.value.slice();
  const availableSlots = props.maxFiles - existing.length;

  if (availableSlots <= 0) {
    errorMessage.value = `Maximum ${props.maxFiles} file${props.maxFiles > 1 ? "s" : ""} allowed.`;
    return;
  }

  const accepted: File[] = [];
  let message = "";

  for (const file of incoming) {
    if (accepted.length >= availableSlots) {
      message = `Only ${props.maxFiles} file${props.maxFiles > 1 ? "s" : ""} allowed.`;
      break;
    }

    if (!isAcceptedFile(file)) {
      message = "Only image or PDF files are allowed.";
      continue;
    }

    if (file.size > maxBytes.value) {
      message = `Each file must be under ${props.maxSizeMb} MB.`;
      continue;
    }

    accepted.push(file);
  }

  if (accepted.length) {
    emitFiles([...existing, ...accepted]);
  }

  errorMessage.value = message;
};

const handleFileInput = (event: Event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  validateAndAddFiles(event.target.files);
  event.target.value = "";
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  validateAndAddFiles(event.dataTransfer?.files || null);
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
};

const removeFile = (index: number) => {
  if (props.disabled) return;
  const current = files.value.slice();
  current.splice(index, 1);
  emitFiles(current);
};

const openPicker = () => {
  if (props.disabled) return;
  fileInputRef.value?.click();
};
</script>

<template>
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <div class="space-y-0.5">
        <p class="text-sm font-medium text-gray-700">{{ label }}</p>
        <p v-if="hint" class="text-xs text-gray-500">
          {{ hint }}
        </p>
      </div>
      <span class="text-[11px] font-medium text-gray-500">
        Max {{ maxFiles }} file{{ maxFiles > 1 ? "s" : "" }} • {{ maxSizeMb }} MB each
      </span>
    </div>

    <div
      class="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-center transition hover:border-primary-300 hover:bg-primary-50"
      :class="{
        'cursor-pointer': !disabled,
        'opacity-60 pointer-events-none': disabled,
      }"
      @click="openPicker"
      @drop="handleDrop"
      @dragover="handleDragOver"
    >
      <div class="flex flex-col items-center space-y-2 text-gray-600">
        <IconsUpload size="22" class="text-primary-500" />
        <div class="space-y-1">
          <p class="text-sm font-semibold text-gray-700">
            Drag & drop files or <span class="text-primary-600">browse</span>
          </p>
          <p class="text-xs text-gray-500">
            Accepted: Images or PDF ({{ accept }})
          </p>
        </div>
      </div>
      <input
        ref="fileInputRef"
        type="file"
        class="hidden"
        :accept="accept"
        multiple
        :disabled="disabled"
        @change="handleFileInput"
      />
    </div>

    <div v-if="files.length" class="space-y-2">
      <div
        v-for="(file, index) in files"
        :key="`${file.name}-${index}`"
        class="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
      >
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary-50 text-primary-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              class="h-4 w-4"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M7 3.75A2.25 2.25 0 0 1 9.25 1.5h4.5L18.75 6v14.25A2.25 2.25 0 0 1 16.5 22.5h-7.5A2.25 2.25 0 0 1 6.75 20.25v-16.5Z"
              />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 8.25h4.5" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 15.75h6" />
            </svg>
          </div>
          <div class="flex flex-col">
            <span class="font-medium text-gray-800">{{ file.name }}</span>
            <span class="text-xs text-gray-500">{{ formatSize(file.size) }}</span>
          </div>
        </div>
        <button
          type="button"
          class="text-xs font-medium text-red-600 hover:text-red-700"
          @click.stop="removeFile(index)"
        >
          Remove
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="text-xs text-error-500">
      {{ errorMessage }}
    </p>
  </div>
</template>
