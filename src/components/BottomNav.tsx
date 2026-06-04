import { Link, useLocation } from 'react-router-dom';
import { Compass, Inbox, Users, type LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface NavTab {
  to: string;
  label: string;
  Icon: LucideIcon;
}

// 순서: 내 친구 / 탐색 / 요청함 — 핵심 액션인 탐색을 가운데 배치
const NAV_TABS: NavTab[] = [
  { to: ROUTES.FRIENDS, label: '내 친구', Icon: Users },
  { to: ROUTES.EXPLORE, label: '탐색', Icon: Compass },
  { to: ROUTES.REQUESTS, label: '요청함', Icon: Inbox },
];

/**
 * 모바일 전용 하단 탭 네비게이션.
 * 셋 다 동일한 플랫 탭(아이콘 + 라벨)으로 두어 의미를 명확히 한다.
 * 데스크탑(md↑)에서는 AppHeader 상단 네비를 쓰므로 숨긴다.
 */
export function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.07] bg-white/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="하단 네비게이션"
    >
      <div className="mx-auto grid h-[72px] max-w-md grid-cols-3">
        {NAV_TABS.map(({ to, label, Icon }) => {
          const active = pathname === to;

          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? 'page' : undefined}
              className="flex flex-col items-center justify-center gap-1"
            >
              <span className="relative">
                <Icon
                  className={`h-6 w-6 transition-colors ${active ? 'text-black' : 'text-black/30'}`}
                  strokeWidth={active ? 2 : 1.6}
                />
              </span>

              <span
                className={`text-[13px] transition-colors ${
                  active ? 'font-semibold text-black' : 'font-medium text-black/40'
                }`}
              >
                {label}
              </span>

              {/* 라벨 아래 활성 인디케이터 — 자리는 항상 확보해 레이아웃이 흔들리지 않게 */}
              <span className="flex h-1.5 items-center justify-center">
                <span
                  className={`h-1 w-1 rounded-full bg-black transition-opacity ${
                    active ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
