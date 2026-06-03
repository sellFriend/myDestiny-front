import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  authApi,
  clearTokens,
  hasAccessToken,
  queryKeys,
  setTokens,
  subscribeToken,
  userApi,
  type MeResponse,
} from '@/lib/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'https://fixlog.art/destiny';

interface AuthContextValue {
  user: MeResponse | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  /** OAuth 콜백/개발 주입 등으로 토큰을 받은 뒤 로그인 상태로 전환 */
  setSession: (accessToken: string, refreshToken?: string | null) => void;
  /** 카카오 OAuth2 로그인 시작 (백엔드 리다이렉트) */
  loginWithKakao: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [tokenPresent, setTokenPresent] = useState(hasAccessToken);

  // 토큰 변경(주입/갱신/제거)을 구독해 로그인 상태를 동기화한다.
  useEffect(() => subscribeToken((token) => setTokenPresent(Boolean(token))), []);

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.me,
    queryFn: userApi.me,
    enabled: tokenPresent,
  });

  const setSession = (accessToken: string, refreshToken?: string | null) => {
    setTokens(accessToken, refreshToken);
    void queryClient.invalidateQueries({ queryKey: queryKeys.me });
  };

  const loginWithKakao = () => {
    window.location.href = `${BASE_URL}/oauth2/authorization/kakao`;
  };

  const logout = () => {
    void authApi.logout().catch(() => undefined);
    clearTokens();
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoggedIn: tokenPresent && Boolean(user),
        isLoading: tokenPresent && isLoading,
        setSession,
        loginWithKakao,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
