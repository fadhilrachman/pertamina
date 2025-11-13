<script setup lang="ts">
definePageMeta({
  auth: false,
});
import { ref } from "vue";
import { object, string } from "yup";
import { usePageStore } from "~/store/page";
``;

// const $page = usePageStore();
// onBeforeMount(() => {
//   $page.setTitle("Dashboard");
// });

const formFields = [
  {
    name: "fullName",
    label: "Full Name",
    type: "text",
    placeholder: "Masukkan nama lengkap",
    grid: 6,
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Masukkan email",
    grid: 6,
  },
  {
    name: "role",
    label: "Role",
    type: "select",
    placeholder: "Pilih role",
    grid: 6,
    options: [
      { id: "admin", label: "Admin" },
      { id: "manager", label: "Manager" },
      { id: "viewer", label: "Viewer" },
    ],
  },
  {
    name: "notes",
    label: "Catatan",
    type: "textarea",
    placeholder: "Catatan tambahan",
    grid: 12,
  },
] as const;

const formValues = ref<Record<string, any>>({
  fullName: "",
  email: "",
  role: "",
  notes: "",
});

const formSchema = object({
  fullName: string().required("Nama lengkap wajib diisi"),
  // email: string().email("Email tidak valid").required("Email wajib diisi"),
  // role: string().required("Role wajib dipilih"),
  // notes: string().nullable(),
});

function handleFormSubmit(values: Record<string, any>) {
  console.log("Submit dashboard form:", values);
}
</script>

<template>
  <section class="space-y-6">
    <h1 class="text-2xl font-semibold text-gray-900">Dashboard</h1>
    <p class="text-gray-500">
      Contoh penssgsssssssssssssssssssssssssssssssssssssssssssgunaan
      <code>GeneralFormGenerator</code> untuk membuat form dinamis.
    </p>

    <GeneralFormGenerator
      id="dashboardForm"
      :fields="formFields"
      :validation-schema="formSchema"
      class-name="bg-white p-6 rounded-xl shadow-sm"
      @submit="handleFormSubmit"
    />

    <div class="flex justify-end">
      <GeneralButton
        label="Simpan"
        type="submit"
        color="primary"
        class="px-6"
        form="dashboardForm"
      />
    </div>

    <div class="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
      <p class="mb-2 font-medium text-gray-700">Nilai form terkini:</p>
      <pre>{{ formValues }}</pre>
    </div>
  </section>
</template>
