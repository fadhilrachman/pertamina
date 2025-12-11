<script setup lang="ts">
import { useField, useForm } from "vee-validate";
import { object, string } from "yup";
import { useAuthStore } from "~/store/auth";
import type { SessionResponseType } from "~/types/user-type";

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    // navigateAuthenticatedTo: "/dashboard",
  },
  layout: "login",
  layoutTransition: {
    mode: "out-in",
  },
});

const { getSession, data } = useAuth();
const $auth = useAuthStore();
const router = useRouter();

const isShowPw = ref();
const isShowNotificationError = ref(false);

const schema = object({
  email: string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: string().required("Password is required"),
  // .min(8, "Password must be at least 8 characters")
  // .matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
  //   "Password must contain upper, lower, number, and symbol"
  // ),
});

const { handleSubmit, errors } = useForm({ validationSchema: schema });

const { value: email } = useField<string>("email");
const { value: password } = useField<string>("password");

const onSubmitLogin = handleSubmit(async (values) => {
  isShowNotificationError.value = false;
  $auth.email = values.email;
  $auth.password = values.password;

  await $auth.login().catch((e) => {
    if (e?.statusCode === 400 || e?.statusCode === 401) {
      isShowNotificationError.value = true;
    }
  });
});

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === "Enter") {
    onSubmitLogin();
  }
}

onMounted(async () => {
  await getSession();
  const session = (data.value as SessionResponseType | null) ?? null;
  if (!session?.data) return;

  const target = $auth.resolveRedirectPath(session.data);
  router.replace(target);
});
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

        <p class="w-full text-sm text-black hover:underline">
          <nuxt-link to="/forgot-password">Forgot password?</nuxt-link>
        </p>
        <div>
          <GeneralButton
            type="submit"
            label="Login"
            :disabled="$auth.isLoading"
            :loading="$auth.isLoading"
            variant="primary"
            class="w-full h-12"
          />
          <!-- <div class="flex justify-end text-sm space-x-1">
            <p>Don't have an account?</p>
            <a href="/register" class="text-blue-500">Register</a>
          </div> -->
        </div>
      </form>
    </div>
  </main>
</template>
