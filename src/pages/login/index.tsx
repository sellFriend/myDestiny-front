import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const { isLoggedIn, loginWithKakao } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate(ROUTES.HOME, { replace: true });
  }, [isLoggedIn, navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center px-5 py-3.5 border-b border-black/5">
        <Link to={ROUTES.HOME} className="text-base font-black tracking-tight text-black">
          My Destiny
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-black text-black mb-2">로그인</h1>
          <p className="text-sm text-black/40 mb-10">계속하려면 카카오 계정으로 로그인하세요.</p>

          <button
            type="button"
            onClick={loginWithKakao}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-pill text-sm font-semibold text-[#191600] bg-[#FEE500] hover:brightness-95 transition-[filter]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 3C6.97 3 3 6.2 3 10.15c0 2.54 1.69 4.77 4.23 6.03-.18.65-.67 2.4-.77 2.77-.12.46.17.45.36.33.15-.1 2.36-1.6 3.32-2.26.6.09 1.22.13 1.86.13 5.03 0 9-3.2 9-7.15S17.03 3 12 3Z"
                fill="#191600"
              />
            </svg>
            카카오로 시작하기
          </button>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
