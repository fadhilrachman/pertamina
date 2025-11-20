import { toast } from "vue3-toastify";
import { defineStore } from "pinia";
import { postRegister } from "~/services/auth/auth-services";

export const useAuthRegister = defineStore("authRegister", {
  state: () => ({
    loadingWrite: false,
  }),
  actions: {
    async registerAPI(body: any) {
      this.loadingWrite = true;
      try {
        await postRegister(body); // API_UNCOMMENT
        toast.success("Success register");
        return true;
      } catch (error) {
        console.error("Register error:", error);
        toast.error("Failed register", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },
  },
});
