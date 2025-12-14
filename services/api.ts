import { useIsUnauthorized } from "~/composables/is-unauthorized";

const formatBearer = (token: string) =>
  token.startsWith("Bearer ") ? token : `Bearer ${token}`;

let refreshPromise: Promise<string | null> | null = null;

async function handleUnauthorized() {
  useIsUnauthorized().value = true;

  const { signOut } = useAuth();
  await signOut({ callbackUrl: "/login" });
}

async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshCookie = process.client
        ? useCookie<string | null>("refresh_token")
        : null;

      const bodyPayload =
        refreshCookie && refreshCookie.value
          ? { refresh_token: refreshCookie.value }
          : undefined;

      const response = await fetch("/api/auth/refresh-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: bodyPayload ? JSON.stringify(bodyPayload) : undefined,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json().catch(() => null);
      const newToken = data?.data?.access_token as string | undefined;

      if (newToken) {
        const { token, getSession } = useAuth();

        if (token) {
          token.value = newToken;
        }

        if (typeof getSession === "function") {
          try {
            await getSession({ force: true } as any);
          } catch (err) {
            console.warn("Failed to refresh session after token refresh", err);
          }
        }
      }

      return newToken ?? null;
    } catch (error) {
      console.error("Failed to refresh token", error);
      return null;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

export const api = {
  provider: <Body = unknown>(
    url: string,
    queryParams?: Record<any, any> | undefined,
    body?: Body | FormData,
    headers?: Record<string, string> | undefined,
    isByte?: boolean
  ): { newUrl: string; newHeaders: Record<string, string> } => {
    const { token } = useAuth();
    const baseUrl = useRuntimeConfig().public.baseAPI;

    const tokenValue = token?.value;
    if (tokenValue) {
      const bearerToken = tokenValue.startsWith("Bearer ")
        ? tokenValue
        : `Bearer ${tokenValue}`;
      headers = {
        ...headers,
        Authorization: bearerToken,
      };
    }

    let newHeaders = { ...headers };

    if (!(body instanceof FormData)) {
      newHeaders = {
        "Content-Type": isByte
          ? "application/octret-stream"
          : "application/json",
        ...headers,
      };
    }

    newHeaders = {
      Accept: isByte ? "application/octret-stream" : "application/json",
      ...newHeaders,
    };

    const newUrl = queryParams
      ? `${baseUrl}${url}?${new URLSearchParams(queryParams)}`
      : `${baseUrl}${url}`;

    return { newUrl, newHeaders };
  },

  afterResponse: async <T>(response: Response, isByte: boolean) => {
    const data = isByte ? await response.blob() : await response.json();

    if (response.status >= 400) throw data;

    return data;
  },

  get: async (
    url: string,
    option?: {
      queryParams?: Record<any, any>;
      headers?: Record<string, string>;
      isByte?: boolean;
    }
  ) => {
    const isByte = option?.isByte || false;

    const doRequest = async (overrideToken?: string) => {
      const mergedHeaders = overrideToken
        ? {
            ...(option?.headers || {}),
            Authorization: formatBearer(overrideToken),
          }
        : option?.headers;

      const { newUrl, newHeaders } = api.provider(
        url,
        option?.queryParams,
        undefined,
        mergedHeaders,
        option?.isByte
      );

      return await fetch(newUrl, {
        method: "GET",
        headers: newHeaders,
      });
    };

    let response = await doRequest();

    if (response.status === 401 && !response.url.includes("syncfms")) {
      const refreshedToken = await tryRefreshToken();
      if (refreshedToken) {
        response = await doRequest(refreshedToken);
      }

      if (response.status === 401 || !refreshedToken) {
        await handleUnauthorized();
        const errorData = isByte
          ? await response.blob()
          : await response.json();
        throw errorData;
      }
    }

    return await api.afterResponse(response, isByte);
  },

  post: async (
    url: string,
    option?: {
      queryParams?: Record<string, string>;
      body?: unknown | FormData;
      headers?: Record<string, string>;
      isByte?: boolean;
    }
  ) => {
    const isByte = option?.isByte || false;

    const doRequest = async (overrideToken?: string) => {
      const mergedHeaders = overrideToken
        ? {
            ...(option?.headers || {}),
            Authorization: formatBearer(overrideToken),
          }
        : option?.headers;

      const { newUrl, newHeaders } = api.provider(
        url,
        option?.queryParams,
        option?.body,
        mergedHeaders,
        option?.isByte
      );

      return await fetch(newUrl, {
        method: "POST",
        headers: newHeaders,
        body:
          option?.body instanceof FormData
            ? option.body
            : JSON.stringify(option?.body),
      });
    };

    let response = await doRequest();

    if (response.status === 401 && !response.url.includes("syncfms")) {
      const refreshedToken = await tryRefreshToken();
      if (refreshedToken) {
        response = await doRequest(refreshedToken);
      }

      if (response.status === 401 || !refreshedToken) {
        await handleUnauthorized();
        const errorData = isByte
          ? await response.blob()
          : await response.json();
        throw errorData;
      }
    }

    return await api.afterResponse(response, isByte);
  },

  put: async (
    url: string,
    option?: {
      queryParams?: Record<string, string>;
      body?: Record<any, any>;
      headers?: Record<string, string>;
      isByte?: boolean;
    }
  ) => {
    const isByte = option?.isByte || false;

    const doRequest = async (overrideToken?: string) => {
      const mergedHeaders = overrideToken
        ? {
            ...(option?.headers || {}),
            Authorization: formatBearer(overrideToken),
          }
        : option?.headers;

      const { newUrl, newHeaders } = api.provider(
        url,
        option?.queryParams,
        option?.body,
        mergedHeaders,
        option?.isByte
      );

      return await fetch(newUrl, {
        method: "PUT",
        headers: newHeaders,
        body:
          option?.body instanceof FormData
            ? option.body
            : JSON.stringify(option?.body),
      });
    };

    let response = await doRequest();

    if (response.status === 401 && !response.url.includes("syncfms")) {
      const refreshedToken = await tryRefreshToken();
      if (refreshedToken) {
        response = await doRequest(refreshedToken);
      }

      if (response.status === 401 || !refreshedToken) {
        await handleUnauthorized();
        const errorData = isByte
          ? await response.blob()
          : await response.json();
        throw errorData;
      }
    }

    return await api.afterResponse(response, isByte);
  },

  delete: async (
    url: string,
    option?: {
      queryParams?: Record<string, string>;
      body?: Record<any, any>;
      headers?: Record<string, string>;
      isByte?: boolean;
    }
  ) => {
    const isByte = option?.isByte || false;

    const doRequest = async (overrideToken?: string) => {
      const mergedHeaders = overrideToken
        ? {
            ...(option?.headers || {}),
            Authorization: formatBearer(overrideToken),
          }
        : option?.headers;

      const { newUrl, newHeaders } = api.provider(
        url,
        option?.queryParams,
        option?.body,
        mergedHeaders,
        option?.isByte
      );

      return await fetch(newUrl, {
        method: "DELETE",
        headers: newHeaders,
      });
    };

    let response = await doRequest();

    if (response.status === 401 && !response.url.includes("syncfms")) {
      const refreshedToken = await tryRefreshToken();
      if (refreshedToken) {
        response = await doRequest(refreshedToken);
      }

      if (response.status === 401 || !refreshedToken) {
        await handleUnauthorized();
        const errorData = isByte
          ? await response.blob()
          : await response.json();
        throw errorData;
      }
    }

    return await api.afterResponse(response, isByte);
  },
};
