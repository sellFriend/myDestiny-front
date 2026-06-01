import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isLanding = variant === 'landing';

  const closeMenu = () => setIsMenuOpen(false);

  // 라우트가 바뀌면 메뉴를 닫는다.
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // 메뉴가 열려 있을 때 배경 스크롤 잠금 + ESC로 닫기.
  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const headerClass = isLanding
    ? 'fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-black/5'
    : 'flex items-center justify-between px-5 py-3.5 border-b border-black/5 bg-white';

  return (
    <>
      <header className={headerClass}>
        <Link to={ROUTES.HOME} className="text-base font-black tracking-tight text-black shrink-0">
          My Destiny
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
            <span className="hidden md:block text-sm text-black/50">
              {user?.nickname}님! 안녕하세요.
            </span>
            <button
              type="button"
              onClick={logout}
              className="hidden md:block text-sm font-medium text-black/40 hover:text-black transition-colors"
            >
              로그아웃
            </button>

            {/* 모바일 햄버거 */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors"
              aria-label="메뉴 열기"
              aria-expanded={isMenuOpen}
            >
              <Menu className="h-5 w-5" />
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

      {/* 모바일 네비게이션 드로어 */}
      <AnimatePresence>
        {isMenuOpen && isLoggedIn && (
          <div className="fixed inset-0 z-[80] md:hidden">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            />

            <motion.aside
              className="absolute right-0 top-0 flex h-full w-[78%] max-w-xs flex-col border-l border-black/10 bg-white"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              role="dialog"
              aria-modal="true"
              aria-label="네비게이션 메뉴"
            >
              <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
                <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-black/40">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-black/50 transition-colors hover:bg-black/5 hover:text-black"
                  aria-label="메뉴 닫기"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
                {TABS.map(({ label, to }) => {
                  const isActive = location.pathname === to;
                  const hasBadge = to === ROUTES.REQUESTS && pendingRequestCount > 0;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={closeMenu}
                      className={`flex items-center justify-between rounded-block px-4 py-3.5 text-lg font-black transition-colors ${
                        isActive
                          ? 'bg-black text-white'
                          : 'text-black hover:bg-black/5'
                      }`}
                    >
                      {label}
                      {hasBadge && (
                        <span
                          className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                            isActive ? 'bg-white text-black' : 'bg-black text-white'
                          }`}
                        >
                          {pendingRequestCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-black/5 px-5 py-4">
                <p className="mb-3 text-sm text-black/50">{user?.nickname}님! 안녕하세요.</p>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    logout();
                  }}
                  className="w-full rounded-pill border border-black/15 py-3 text-sm font-semibold text-black/60 transition-colors hover:border-black/40 hover:text-black"
                >
                  로그아웃
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
