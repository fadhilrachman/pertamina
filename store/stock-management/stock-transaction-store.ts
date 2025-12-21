import type {
  QueryParams,
  ResponseApi,
  ResponseApiDetail,
} from "~/types/common";
import { toast } from "vue3-toastify";
import { defineStore } from "pinia";
import type {
  PayloadStockTransactionType,
  StockTransactionType,
} from "~/types/stock-transaction-type";
import {
  getTransactions,
  postStockTransactions,
} from "~/services/stock-management/stock-transactions-services";
import { importStockAdjustment } from "~/services/import/import-services";
import type { ImportResponse } from "~/types/import";

export const useStockTransaction = defineStore("stockTransaction", {
  state: () => ({
    loadingList: false,
    loadingWrite: false,
    loadingDetail: false,
    data: {} as ResponseApi<StockTransactionType>,
    dataDetail: {} as ResponseApiDetail<StockTransactionType>,
    selectedData: {} as StockTransactionType,
    selectedLineIndex: 0 as number,
    activeLocks: new Set<string>(),
  }),
  actions: {
    acquireLock(key: string) {
      if (!key) return true;
      if (this.activeLocks.has(key)) {
        return false;
      }
      this.activeLocks.add(key);
      return true;
    },
    releaseLock(key: string) {
      if (!key) return;
      this.activeLocks.delete(key);
    },
    setSelectedData(data: StockTransactionType) {
      this.selectedData = data;
    },
    setSelectedLineIndex(index: number) {
      this.selectedLineIndex = index;
    },
    async getDataTransactions(
      params: QueryParams & {
        facility_id?: string;
        sku_id?: string;
        trx_type?: string;
      }
    ) {
      this.loadingList = true;
      try {
        const data = await getTransactions(params); // API_UNCOMMENT
        this.data = data;
      } catch (error) {
        toast.error("Failed get data Transaction", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        // toast
        this.loadingList = false;
      }
    },

    // async getDataDetailSku({ id }: { id: string }) {
    //   this.loadingDetail = true;
    //   try {
    //     // const { data } = await getSkuDetail({ id }); // API_UNCOMMENT
    //     // this.dataDetail = data;
    //   } catch (error) {
    //     toast.error("Failed get data SKU", {
    //       toastClassName: "toastify-error",
    //     });
    //     throw error;
    //   } finally {
    //     // toast
    //     this.loadingDetail = false;
    //   }
    // },

    async createDataStockTransaction(
      body: PayloadStockTransactionType,
      { uuid, lockKey }: { uuid: string; lockKey?: string }
    ) {
      const acquired = lockKey ? this.acquireLock(lockKey) : true;
      if (!acquired) {
        toast.error("Another operation for this item is in progress.", {
          toastClassName: "toastify-error",
        });
        return false;
      }

      this.loadingWrite = true;
      try {
        await postStockTransactions(body, { uuid }); // API_UNCOMMENT
        const trxType = (body.trx_type || "").toLowerCase();
        let trxLabel = "Stock transaction";

        if (trxType === "in") {
          trxLabel = "Stock in";
        } else if (trxType === "out") {
          trxLabel = "Stock out";
        } else if (trxType === "adjustment" || trxType === "adjusment") {
          trxLabel = "Stock adjustment";
        }

        toast.success(`Success create data ${trxLabel}`);
        return true;
      } catch (error) {
        console.log({ error });

        const trxType = (body.trx_type || "").toLowerCase();
        let trxLabel = "Stock transaction";

        if (trxType === "in") {
          trxLabel = "Stock in";
        } else if (trxType === "out") {
          trxLabel = "Stock out";
        } else if (trxType === "adjustment" || trxType === "adjusment") {
          trxLabel = "Stock adjustment";
        }

        toast.error(`Failed create data ${trxLabel}`, {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
        if (lockKey) {
          this.releaseLock(lockKey);
        }
      }
    },

    async importStockAdjustment(file: File): Promise<ImportResponse> {
      this.loadingWrite = true;
      try {
        const response = await importStockAdjustment(file);
        toast.success("Success import stock adjustment", {
          toastClassName: "toastify-success",
        });
        return response;
      } catch (error: any) {
        toast.error(error?.message || "Failed import stock adjustment", {
          toastClassName: "toastify-error",
        });
        throw error;
      } finally {
        this.loadingWrite = false;
      }
    },

    // async updateDataSku(body: any) {
    //   this.loadingWrite = true;
    //   try {
    //     await putSku(body); // API_UNCOMMENT
    //     toast.success("Success update data SKU");
    //     return true;
    //   } catch (error) {
    //     toast.error("Failed update data SKU", {
    //       toastClassName: "toastify-error",
    //     });
    //     throw error;
    //   } finally {
    //     this.loadingWrite = false;
    //   }
    // },

    // async deleteDataSku({ id }: { id: string }) {
    //   this.loadingWrite = true;
    //   try {
    //     await deleteSku({ id }); // API_UNCOMMENT
    //     toast.success("Success delete data SKU");
    //     return true;
    //   } catch (error) {
    //     toast.error("Failed delete data SKU", {
    //       toastClassName: "toastify-error",
    //     });
    //     throw error;
    //   } finally {
    //     this.loadingWrite = false;
    //   }
    // },
  },
});
