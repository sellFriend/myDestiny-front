import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import {
  FORM_KAKAO_AUTHED_KEY,
  POST_LOGIN_REDIRECT_KEY,
  useAuth,
} from '@/contexts/AuthContext';

/**
 * 카카오 OAuth2 로그인 후 백엔드가 리다이렉트하는 콜백 화면.
 * URL: /oauth2/callback?accessToken=...&refreshToken=...
 */
const OAuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setSession } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    // 카카오 로그인 직후 본인 프로필 사진 URL이 함께 내려온다. (kakao-photo-flow.md 1장)
    const profileImageUrl = searchParams.get('profileImageUrl');

    if (accessToken) {
      setSession(accessToken, refreshToken, profileImageUrl);
      // 로그인 전에 보던 화면(예: 친구 B의 폼)이 있으면 그곳으로 돌려보낸다.
      const returnTo = sessionStorage.getItem(POST_LOGIN_REDIRECT_KEY);
      sessionStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
      // 폼 진입을 위한 로그인이었다면, 해당 폼은 이번 세션에서 카카오 인증을 마쳤다고 표시한다.
      if (returnTo?.startsWith(`${ROUTES.FORM}/`)) {
        sessionStorage.setItem(FORM_KAKAO_AUTHED_KEY, returnTo);
      }
      navigate(returnTo ?? ROUTES.EXPLORE, { replace: true });
    } else {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [navigate, searchParams, setSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-6 h-6 rounded-full border-2 border-black/20 border-t-black animate-spin" />
        <p className="text-sm text-black/40">로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default OAuthCallbackPage;
