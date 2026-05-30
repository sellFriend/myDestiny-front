import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

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

    if (accessToken) {
      setSession(accessToken, refreshToken);
      navigate(ROUTES.EXPLORE, { replace: true });
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
