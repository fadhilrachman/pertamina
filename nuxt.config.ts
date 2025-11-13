// https://nuxt.com/docs/api/configuration/nuxt-config

export default defineNuxtConfig({
  // devtools: {
  //   enabled: true,
  //
  //   timeline: {
  //     enabled: true,
  //   },
  // },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
    layoutTransition: { name: "layout", mode: "out-in" },
    head: {
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },

  build: {
    transpile: ["@vuepic/vue-datepicker", "gsap"],
  },

  css: ["@/assets/css/global.css"],

  modules: [
    "@vite-pwa/nuxt", // comment for now: regenerating the service worker during dev hurts hot reload speed.
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@sidebase/nuxt-auth",
    "nuxt3-leaflet",
    "@nuxt/image",
    "@nuxt/test-utils/module",
  ],

  ssr: false,

  auth: {
    provider: {
      type: "local",
      endpoints: {
        signIn: {
          path: `/login`,
          method: "post",
        },
        signOut: {
          path: "/signOut",
          method: "post",
        },
        getSession: {
          path: "/getSession",
          method: "get",
        },
      },
      pages: {
        login: "/login",
      },
      token: {
        signInResponseTokenPointer: "/data/access_token",
        maxAgeInSeconds: 60 * 60 * 24,
      },
    },
    globalAppMiddleware: false, /// IMPORTANT
  },

  runtimeConfig: {
    appKey: process.env.APP_KEY,
    public: {
      baseAPI: process.env.API_BASE_URL,
      // auth: false,
    },
  },

  compatibilityDate: "2025-01-31",
});
