import { defineEventHandler, getCookie, createError, readBody, setCookie } from "h3";
import { useRuntimeConfig } from "#imports";
import { $fetch } from "ofetch";

interface RefreshTokenResponse {
  status: string;
  data?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface ErrorResponse {
  response?: {
    status?: number;
    statusText?: string;
    data?: {
      message?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const apiBaseUrl = config.public.baseAPI;

    if (!apiBaseUrl) {
      throw createError({
        statusCode: 500,
        statusMessage: "Server Error",
        message: "API base URL not configured",
      });
    }

    const body = (await readBody(event).catch(() => ({}))) as {
      refresh_token?: string;
    };

    const cookieRefreshToken = getCookie(event, "refresh_token");
    const refreshToken = body?.refresh_token || cookieRefreshToken;

    if (!refreshToken) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
        message: "No refresh token provided",
      });
    }

    const response = await $fetch<RefreshTokenResponse>(
      `${apiBaseUrl}/api/v1/auth/refresh-token`,
      {
        method: "POST",
        body: { refresh_token: refreshToken },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (response.data?.access_token) {
      setCookie(event, "session_token", response.data.access_token, {
        httpOnly: true,
        path: "/",
      });

      setCookie(event, "auth.token", response.data.access_token, {
        httpOnly: false,
        path: "/",
      });
    }

    if (response.data?.refresh_token) {
      setCookie(event, "refresh_token", response.data.refresh_token, {
        httpOnly: true,
        path: "/",
      });
    }

    return response;
  } catch (error: unknown) {
    const err = error as ErrorResponse;
    throw createError({
      statusCode: err.response?.status || 500,
      statusMessage: err.response?.statusText || "Internal Server Error",
      message:
        err.response?.data?.message ||
        "An error occurred during token refresh",
    });
  }
}
);

