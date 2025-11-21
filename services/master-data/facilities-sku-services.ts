import { api } from "~/services/api";
import type { QueryParams } from "~/types/common";
import type { PayloadFacilitiesSkuType } from "~/types/facilities-sku-type";

export async function postFacilitiesSku(
  payload: PayloadFacilitiesSkuType & { facilities_id: string }
) {
  return await api.post(`/api/v1/facilities/${payload.facilities_id}/skus`, {
    body: payload,
  });
}

export async function getFacilitiesSku(
  params: QueryParams & {
    search?: string;
    status?: string;
    facilities_id: string;
  }
) {
  return await api.get(`/api/v1/facilities/${params.facilities_id}/skus`, {
    queryParams: params,
  });
}
export async function getSkuDetail(params: { id: string }) {
  return await api.get(`/api/v1/skus/${params.id}`);
}

export async function putFacilitiesSku(
  payload: PayloadFacilitiesSkuType & { facilities_id: string } & { id: string }
) {
  return await api.put(
    `/api/v1/facilities/${payload.facilities_id}/skus/${payload.id}`,
    { body: payload }
  );
}

export async function deleteFacilitiesSku(params: {
  id: string;
  facilities_id: string;
}) {
  return await api.delete(
    `/api/v1/facilities/${params.facilities_id}/skus/${params.id}`
  );
}
