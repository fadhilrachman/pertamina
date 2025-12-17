<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
  layout: "login",
  layoutTransition: {
    mode: "out-in",
  },
});

const email = ref("");
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

      <form class="space-y-4 mt-4" @submit.prevent>
        <div class="space-y-1">
          <h2 class="text-xl font-semibold">Setup New Password</h2>
          <p class="text-neutral-600">
            Enter your email to setup a new password. We will send you a link to
            create a new password.
          </p>
        </div>

        <GeneralTextInput
          v-model="email"
          id="inputEmail"
          type="text"
          label="Email"
          placeholder="Enter Email Address"
          required
        />

        <div class="space-y-3">
          <GeneralButton
            type="submit"
            label="Send Link"
            variant="primary"
            class="w-full h-12"
          />
          <p class="w-full text-sm text-black hover:underline text-right">
            <nuxt-link to="/login">Back to login</nuxt-link>
          </p>
        </div>
      </form>
    </div>
  </main>
</template>
