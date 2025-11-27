import { api } from "~/services/api";

export async function getDashboardOverview(params: { facility_id?: string }) {
  return await api.get("/api/v1/dashboard/overview", { queryParams: params });
}

export async function getDashboardStockDistribution(params: {
  facility_id?: string;
}) {
  return await api.get("/api/v1/dashboard/stock-distribution", {
    queryParams: params,
  });
}

export async function getDashboardTopMovingSku(params: {
  facility_id?: string;
}) {
  return await api.get("/api/v1/dashboard/top-moving-skus", {
    queryParams: params,
  });
}

// export async function getDashboardTopMovingSku(params: {facility_id?: string}) {
//   return await api.get("/api/v1/dashboard", { queryParams: params });
// }
