import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, ApiErrorBody } from './types';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './tokenStore';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://fixlog.art/destiny';

/** 토큰 갱신/로그인이 필요 없는 public 경로 (Authorization 헤더 생략) */
const PUBLIC_PATHS = [/^\/oauth2\//, /^\/login\//, /^\/api\/auth\/refresh$/, /^\/form\//, /^\/api\/invitations\/[^/]+$/];

function isPublicPath(url?: string): boolean {
  if (!url) return false;
  const path = url.startsWith('http') ? new URL(url).pathname : url;
  return PUBLIC_PATHS.some((pattern) => pattern.test(path));
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!isPublicPath(config.url)) {
    const token = getAccessToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  return config;
});

/** 사용자에게 보여줄 메시지를 담는 에러 */
export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function extractMessage(error: AxiosError<ApiErrorBody>): string {
  return (
    error.response?.data?.message ??
    error.message ??
    '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.'
  );
}

// --- 401 자동 토큰 갱신 ---
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string | null }>>(
      `${BASE_URL}/api/auth/refresh`,
      null,
      { headers: { 'X-Refresh-Token': refreshToken } },
    );
    const next = data.data.accessToken;
    setTokens(next, data.data.refreshToken ?? refreshToken);
    return next;
  } catch {
    clearTokens();
    return null;
  }
}

/**
 * 매물(친구)로 등록된 사용자의 전체 차단(필터 단 403)인지 판별한다.
 * 필터 단 403 은 GlobalExceptionHandler 를 거치지 않아 공통 래퍼(success 필드)가 없다.
 * 서비스 단 403(링크 발급 불가 등)은 { success:false, ... } 형태라 구분된다. (cross-role-block-guide.md)
 */
function isRoleBlockedForbidden(error: AxiosError<ApiErrorBody>): boolean {
  return error.response?.status === 403 && error.response.data?.success === undefined;
}

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const status = error.response?.status;

    // 매물 사용자 전체 차단 → 로그아웃 처리 후 안내 페이지로 이동한다.
    if (isRoleBlockedForbidden(error)) {
      clearTokens();
      if (typeof window !== 'undefined' && window.location.pathname !== '/blocked') {
        window.location.href = '/blocked';
      }
      return Promise.reject(new ApiError(extractMessage(error), status));
    }

    if (
      status === 401 &&
      original &&
      !original._retried &&
      !isPublicPath(original.url) &&
      getRefreshToken()
    ) {
      original._retried = true;
      refreshPromise ??= refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
      const newToken = await refreshPromise;
      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return apiClient(original);
      }
    }

    return Promise.reject(new ApiError(extractMessage(error), status));
  },
);

/** 공통 응답 래퍼에서 data 만 꺼내는 헬퍼 */
export async function unwrap<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const { data } = await promise;
  return data.data;
}
