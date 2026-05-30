import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';

interface AppHeaderProps {
  pendingRequestCount?: number;
  variant?: 'app' | 'landing';
}

const TABS = [
  { label: '탐색', to: ROUTES.EXPLORE },
  { label: '내 친구', to: ROUTES.FRIENDS },
  { label: '요청함', to: ROUTES.REQUESTS },
] as const;

export function AppHeader({ pendingRequestCount = 0, variant = 'app' }: AppHeaderProps) {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();

  const isLanding = variant === 'landing';

  const headerClass = isLanding
    ? 'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-black/5'
    : 'flex items-center justify-between px-5 py-3.5 border-b border-black/5 bg-white';

  return (
    <>
      <header className={headerClass}>
        <Link to={ROUTES.HOME} className="text-base font-black tracking-tight text-black shrink-0">
          madam
        </Link>

        {isLoggedIn && (
          <nav className={`hidden md:flex items-center ${isLanding ? 'gap-8' : 'gap-7'}`}>
            {TABS.map(({ label, to }) => {
              const isActive = location.pathname === to;
              const hasBadge = to === ROUTES.REQUESTS && pendingRequestCount > 0;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative text-sm pb-0.5 transition-colors ${
                    isActive && !isLanding
                      ? 'font-bold text-black border-b-2 border-black'
                      : isActive && isLanding
                      ? 'font-bold text-black'
                      : 'text-black/45 hover:text-black'
                  }`}
                >
                  {label}
                  {hasBadge && (
                    <span className="absolute -top-1.5 -right-3.5 min-w-[16px] h-4 px-1 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      {pendingRequestCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        )}

        {isLoggedIn ? (
          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden sm:block text-sm text-black/50">
              {user?.name}님! 안녕하세요.
            </span>
            <button
              type="button"
              onClick={logout}
              className="text-sm font-medium text-black/40 hover:text-black transition-colors"
            >
              로그아웃
            </button>
          </div>
        ) : isLanding ? (
          <Link
            to={ROUTES.LOGIN}
            className="px-5 py-2 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-colors shrink-0"
          >
            로그인
          </Link>
        ) : (
          <Link
            to={ROUTES.LOGIN}
            className="text-sm font-semibold text-black hover:text-black/60 transition-colors shrink-0"
          >
            로그인
          </Link>
        )}
      </header>
    </>
  );
}
