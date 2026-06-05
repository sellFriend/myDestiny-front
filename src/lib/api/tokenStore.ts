// 액세스/리프레시 토큰 저장소 (localStorage)
// 인증 헤더 주입과 토큰 갱신에서 공용으로 사용한다.

const ACCESS_TOKEN_KEY = 'madam_access_token';
const REFRESH_TOKEN_KEY = 'madam_refresh_token';
// 카카오 로그인 직후 콜백으로 받은 본인 프로필 사진 URL. (kakao-photo-flow.md 1장)
const KAKAO_PROFILE_IMAGE_KEY = 'madam_kakao_profile_image';

type TokenListener = (accessToken: string | null) => void;

const listeners = new Set<TokenListener>();

function readItem(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeItem(key: string, value: string | null) {
  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // localStorage 접근 불가 환경은 무시한다.
  }
}

export function getAccessToken(): string | null {
  return readItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return readItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string | null, refreshToken?: string | null) {
  writeItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken !== undefined) {
    writeItem(REFRESH_TOKEN_KEY, refreshToken);
  }
  listeners.forEach((listener) => listener(accessToken));
}

/** 카카오 로그인 직후 받은 본인 프로필 사진 URL (폼 사진 모달 미리보기용) */
export function getKakaoProfileImage(): string | null {
  return readItem(KAKAO_PROFILE_IMAGE_KEY);
}

export function setKakaoProfileImage(url: string | null) {
  writeItem(KAKAO_PROFILE_IMAGE_KEY, url);
}

export function clearTokens() {
  setTokens(null, null);
  writeItem(KAKAO_PROFILE_IMAGE_KEY, null);
}

export function hasAccessToken(): boolean {
  return Boolean(getAccessToken());
}

/** 토큰 변경(로그인/로그아웃/갱신)을 구독한다. */
export function subscribeToken(listener: TokenListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
