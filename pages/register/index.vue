<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import { object, string } from "yup";
import { toast } from "vue3-toastify";
import { useAuthStore } from "~/store/auth";
import { useAuthRegister } from "~/store/master-data/auth-store";

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
  },
  layout: "login",
  layoutTransition: {
    mode: "out-in",
  },
});

const { getSession } = useAuth();
const $auth = useAuthStore();

const isShowPw = ref();
const isShowNotificationError = ref(false);
const { registerAPI } = useAuthRegister();
const schema = object({
  email: string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: string().required("Password is required"),
  firstname: string().required("Firstname is required"),
  lastname: string().required("Lastname is required"),
});

const { handleSubmit, errors } = useForm({ validationSchema: schema });

const { value: email } = useField<string>("email");
const { value: password } = useField<string>("password");
const { value: firstname } = useField<string>("firstname");
const { value: lastname } = useField<string>("lastname");
const { value: confirmPassword } = useField<string>("confirmPassword");
const { value: company } = useField<string>("company");
const router = useRouter();
const onSubmitLogin = handleSubmit(async (values) => {
  try {
    // if (password.value !== confirmPassword.value) {
    //   toast.error("Password and confirm password do not match", {
    //     toastClassName: "toastify-error",
    //   });
    //   return;
    // }

    await registerAPI({
      first_name: firstname.value,
      last_name: lastname.value,
      password: password.value,
      email: email.value,
      company: {
        name: company.value,
      },
    });
    router.push("/login");
  } catch (error) {}
});

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === "Enter") {
    onSubmitLogin();
  }
}
</script>

<template>
  <main
    class="bg-primary-100 flex min-h-screen w-full items-center justify-center"
  >
    <div class="bg-white rounded-lg p-5 max-w-[560px] w-full">
      <div class="text-center space-y-3">
        <h3 class="font-semibold text-2xl">PDSI IMS</h3>
        <div>
          <p class="text-neutral-500">Pertamina Drilling Services Indonesia</p>
          <small class="font-light text-neutral-500"
            >Inventory Management System</small
          >
        </div>
      </div>
      <form
        class="space-y-4"
        @submit.prevent="onSubmitLogin"
        @keydown.enter.prevent="handleKeyPress"
      >
        <div>
          <GeneralTextInput
            v-model="company"
            id="inputCompanyName"
            type="text"
            label="Company Name"
            placeholder="Company Name"
            class="mb35"
            required
          />
          <p v-if="errors.company" class="text-sm text-red-500">
            {{ errors.company }}
          </p>
        </div>
        <div>
          <GeneralTextInput
            v-model="firstname"
            id="inputFirstname"
            type="text"
            label="Firstname"
            placeholder="First Name"
            class="mb35"
            required
          />
          <p v-if="errors.firstname" class="text-sm text-red-500">
            {{ errors.firstname }}
          </p>
        </div>
        <div>
          <GeneralTextInput
            v-model="lastname"
            id="inputLastname"
            type="text"
            label="Lastname"
            placeholder="Last Name"
            class="mb35"
            required
          />
          <p v-if="errors.lastname" class="text-sm text-red-500">
            {{ errors.lastname }}
          </p>
        </div>
        <div>
          <GeneralTextInput
            v-model="email"
            id="inputEmail"
            type="text"
            label="Email"
            placeholder="Email Addess"
            class="mb35"
            required
          />
          <p v-if="errors.email" class="text-sm text-red-500">
            {{ errors.email }}
          </p>
        </div>
        <div>
          <GeneralTextInput
            v-model="password"
            id="inputPass"
            :type="isShowPw ? 'text' : 'password'"
            label="Password"
            placeholder="Password"
            class="mb-2"
            required
          >
            <template #suffix>
              <div
                class="pointer-events-auto cursor-pointer"
                @click.stop="isShowPw = !isShowPw"
              >
                <IconsEye v-if="isShowPw" size="20" class="stroke-gray-700" />
                <IconsEyeOff v-else size="20" class="stroke-gray-700" />
              </div>
            </template>
          </GeneralTextInput>
          <p v-if="errors.password" class="text-sm text-red-500">
            {{ errors.password }}
          </p>
        </div>

        <div>
          <GeneralTextInput
            v-model="confirmPassword"
            id="inputPass"
            :type="isShowPw ? 'text' : 'password'"
            label="Confirm Password"
            placeholder="Confirm Password"
            class="mb-2"
            required
          >
            <template #suffix>
              <div
                class="pointer-events-auto cursor-pointer"
                @click.stop="isShowPw = !isShowPw"
              >
                <IconsEye v-if="isShowPw" size="20" class="stroke-gray-700" />
                <IconsEyeOff v-else size="20" class="stroke-gray-700" />
              </div>
            </template>
          </GeneralTextInput>
          <p v-if="errors.confirmPassword" class="text-sm text-red-500">
            {{ errors.confirmPassword }}
          </p>
        </div>

        <p class="w-full text-sm text-black hover:underline">
          <nuxt-link to="/forgot-password">Forgot password?</nuxt-link>
        </p>
        <div>
          <GeneralButton
            type="submit"
            label="Register"
            :disabled="$auth.isLoading"
            :loading="$auth.isLoading"
            variant="primary"
            class="w-full h-12"
          />
          <div class="flex justify-end text-sm space-x-1">
            <p>Already have an account??</p>
            <a href="/login" class="text-blue-500">Login</a>
          </div>
        </div>
      </form>
    </div>
  </main>
</template>
