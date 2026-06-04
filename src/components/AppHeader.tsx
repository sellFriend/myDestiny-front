import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, Menu, X } from 'lucide-react';
import logoUrl from '@/assets/my-destiny-logo.png';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { BottomNav } from '@/components/BottomNav';

interface AppHeaderProps {
  variant?: 'app' | 'landing';
}

const TABS = [
  { label: '탐색', to: ROUTES.EXPLORE },
  { label: '내 친구', to: ROUTES.FRIENDS },
  { label: '요청함', to: ROUTES.REQUESTS },
] as const;

// 모바일 햄버거 드로어는 하단 네비게이션(BottomNav)으로 대체하여 임시 비활성화.
// 코드는 유지하므로 이 플래그만 true 로 돌리면 다시 살아난다.
const SIDEBAR_ENABLED = false;

export function AppHeader({ variant = 'app' }: AppHeaderProps) {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLanding = variant === 'landing';

  useEffect(() => {
    if (!isLanding) return;
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isLanding]);

  const closeMenu = () => setIsMenuOpen(false);
  const closeAccount = () => setIsAccountOpen(false);

  // 라우트가 바뀌면 열려 있던 메뉴/계정 팝오버를 닫는다.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsAccountOpen(false);
  }, [location.pathname]);

  // 계정 팝오버가 열렸을 때 ESC 로 닫기.
  useEffect(() => {
    if (!isAccountOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsAccountOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAccountOpen]);

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
    ? `fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm border-b transition-[border-color,box-shadow] duration-200 ${scrolled ? 'border-black/10 shadow-sm' : 'border-black/5'}`
    : 'flex items-center justify-between px-5 py-4 border-b border-black/5 bg-white';

  return (
    <>
      <header className={headerClass}>
        <Link to={ROUTES.HOME} className="shrink-0" aria-label="My Destiny 홈">
          <img src={logoUrl} alt="My Destiny" className="h-12 w-auto" />
        </Link>

        {isLoggedIn && (
          <nav className={`hidden md:flex items-center ${isLanding ? 'gap-8' : 'gap-7'}`}>
            {TABS.map(({ label, to }) => {
              const isActive = location.pathname === to;
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
                </Link>
              );
            })}
          </nav>
        )}

        {isLoggedIn ? (
          <div className="flex items-center gap-1.5 shrink-0 md:gap-2.5">
            <NotificationBell enabled={isLoggedIn} />

            {/* 모바일 햄버거 — SIDEBAR_ENABLED 로 토글 (현재 하단 네비로 대체) */}
            {SIDEBAR_ENABLED && (
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-black hover:bg-black/5 transition-colors"
                aria-label="메뉴 열기"
                aria-expanded={isMenuOpen}
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* 계정 메뉴 — 아바타 탭 시 팝오버 (로그아웃 포함) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAccountOpen((v) => !v)}
                className="flex items-center gap-1 rounded-pill py-1.5 pl-3 pr-2 text-sm font-semibold text-black transition-colors hover:bg-black/5"
                aria-label="계정 메뉴"
                aria-haspopup="menu"
                aria-expanded={isAccountOpen}
              >
                <span className="max-w-[100px] truncate">{user?.nickname}</span>
                <ChevronDown
                  className={`h-4 w-4 text-black/40 transition-transform duration-200 ${
                    isAccountOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isAccountOpen && (
                  <>
                    {/* 바깥 클릭 시 닫기 */}
                    <button
                      type="button"
                      aria-hidden
                      tabIndex={-1}
                      onClick={closeAccount}
                      className="fixed inset-0 z-[60] cursor-default"
                    />
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.14, ease: 'easeOut' }}
                      className="absolute right-0 top-[calc(100%+8px)] z-[70] w-40 overflow-hidden rounded-block border border-black/10 bg-white p-1.5 shadow-xl"
                    >
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          closeAccount();
                          logout();
                        }}
                        className="flex w-full items-center gap-2 rounded-block px-3 py-2.5 text-sm font-semibold text-black/70 transition-colors hover:bg-black/5 hover:text-black"
                      >
                        <LogOut className="h-4 w-4" />
                        로그아웃
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
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

      {/* 모바일 네비게이션 드로어 — SIDEBAR_ENABLED 로 토글 (현재 비활성화, 코드 유지) */}
      <AnimatePresence>
        {SIDEBAR_ENABLED && isMenuOpen && isLoggedIn && (
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

      {/* 모바일 하단 네비게이션 */}
      {isLoggedIn && !isLanding && <BottomNav />}
    </>
  );
}
