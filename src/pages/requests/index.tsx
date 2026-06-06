import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Inbox } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import type { MatchingResponse } from '@/lib/api';
import { MatchingCard } from '@/pages/requests/components/MatchingCard';
import { MatchingCardSkeleton } from '@/pages/requests/components/MatchingCardSkeleton';
import { MatchingDetailModal } from '@/pages/requests/components/MatchingDetailModal';
import { RejectReasonDialog } from '@/pages/requests/components/RejectReasonDialog';
import { useMatchingActions, useMatchings } from '@/pages/requests/hooks/useMatchings';
import type { RequestTab } from '@/pages/requests/utils';

const TABS: { key: RequestTab; label: string }[] = [
  { key: 'received', label: '받은 요청' },
  { key: 'sent', label: '보낸 요청' },
  { key: 'matched', label: '성사됨' },
];

const EMPTY_COPY: Record<RequestTab, { title: string; desc: string }> = {
  received: {
    title: '아직 받은 요청이 없어요',
    desc: '다른 주선자가 소개를 제안하면 여기에서 바로 확인할 수 있어요.',
  },
  sent: {
    title: '아직 보낸 요청이 없어요',
    desc: '마음에 드는 카드를 찾아 소개를 먼저 제안해보세요.',
  },
  matched: {
    title: '아직 성사된 인연이 없어요',
    desc: '양쪽이 모두 동의하면 여기에서 연락처를 확인할 수 있어요.',
  },
};

const RequestsPage = () => {
  const [tab, setTab] = useState<RequestTab>('received');
  const [detailTarget, setDetailTarget] = useState<MatchingResponse | null>(null);
  // 거절 사유 입력 다이얼로그 대상 — 즉시 거절 대신 사유를 먼저 받는다. (matching-frontend-guide §4.3)
  const [rejectTarget, setRejectTarget] = useState<MatchingResponse | null>(null);

  const { isLoggedIn, loginWithKakao } = useAuth();
  const { received, sent, matched, pendingReceivedCount } = useMatchings(tab, isLoggedIn);
  const { accept, reject, cancel, busyId, feedback, clearFeedback } = useMatchingActions();

  // 거절 버튼 → 사유 다이얼로그 열기 (상세 모달이 열려 있으면 닫고 다이얼로그로 전환)
  const requestReject = (id: string) => {
    const target = received.data?.find((m) => m.id === id) ?? null;
    if (!target) return;
    setDetailTarget(null);
    setRejectTarget(target);
  };

  // 수락/거절/취소 실패(이미 처리됨·기한 만료 등) 안내 토스트 — 잠시 후 자동 사라짐
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(clearFeedback, 4000);
    return () => window.clearTimeout(timer);
  }, [feedback, clearFeedback]);

  const activeQuery = tab === 'received' ? received : tab === 'sent' ? sent : matched;
  const items = activeQuery.data ?? [];

  const renderContent = () => {
    if (activeQuery.isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <MatchingCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (activeQuery.isError) {
      return (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <p className="mb-2 text-lg font-black text-black">불러오지 못했어요</p>
          <p className="mb-5 text-sm text-black/40">잠시 후 다시 시도해 주세요</p>
          <button
            type="button"
            onClick={() => activeQuery.refetch()}
            className="rounded-pill bg-black px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black/80"
          >
            다시 시도
          </button>
        </div>
      );
    }

    if (items.length === 0) {
      const copy = EMPTY_COPY[tab];
      return (
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
            <Inbox className="h-5 w-5 text-black/30" />
          </div>
          <p className="mb-2 text-lg font-black text-black">{copy.title}</p>
          <p className="max-w-xs text-sm leading-relaxed text-black/40">{copy.desc}</p>
          {tab === 'sent' && (
            <Link
              to={ROUTES.EXPLORE}
              className="mt-6 rounded-pill bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              카드 둘러보기
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {items.map((matching) => (
          <MatchingCard
            key={matching.id}
            matching={matching}
            variant={tab}
            busy={busyId === matching.id}
            onAccept={accept}
            onReject={requestReject}
            onCancel={cancel}
            onOpenDetail={setDetailTarget}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 pt-6 pb-28 sm:pt-8 md:pb-8">
        <h1 className="mb-5 text-xl font-black text-black sm:mb-6">요청함</h1>

        {!isLoggedIn ? (
          <div className="flex h-64 flex-col items-center justify-center text-center">
            <p className="mb-2 text-lg font-black text-black">로그인이 필요해요</p>
            <p className="mb-6 text-sm text-black/40">받은 요청과 성사된 인연을 확인해보세요</p>
            <button
              type="button"
              onClick={() => loginWithKakao()}
              className="rounded-pill bg-[#FEE500] px-6 py-3 text-sm font-semibold text-[#191600] transition-[filter] hover:brightness-95"
            >
              카카오로 시작하기
            </button>
          </div>
        ) : (
          <>
            {/* 모바일: 상단 탭 */}
            <div
              role="tablist"
              aria-label="요청함 탭"
              className="mb-5 flex gap-2 overflow-x-auto md:hidden"
            >
              {TABS.map(({ key, label }) => {
                const isActive = tab === key;
                const count = key === 'received' ? pendingReceivedCount : 0;
                return (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-black text-white' : 'bg-black/5 text-black/50 hover:text-black'
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span
                        className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                          isActive ? 'bg-white text-black' : 'bg-black text-white'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="md:flex md:gap-8">
              {/* 웹: 좌측 사이드바 */}
              <aside className="hidden w-52 shrink-0 md:block">
                <nav role="tablist" aria-label="요청함 메뉴" className="flex flex-col gap-1">
                  {TABS.map(({ key, label }) => {
                    const isActive = tab === key;
                    const count = key === 'received' ? pendingReceivedCount : 0;
                    return (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={isActive}
                        type="button"
                        onClick={() => setTab(key)}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                          isActive ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5 hover:text-black'
                        }`}
                      >
                        {label}
                        {count > 0 && (
                          <span
                            className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                              isActive ? 'bg-white text-black' : 'bg-black text-white'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* 콘텐츠 */}
              <section className="min-w-0 flex-1" role="tabpanel">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    {renderContent()}
                  </motion.div>
                </AnimatePresence>
              </section>
            </div>
          </>
        )}
      </main>

      {feedback && (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex justify-center px-5 md:bottom-8">
          <p
            role="status"
            className="pointer-events-auto max-w-sm rounded-pill bg-black px-5 py-3 text-center text-sm font-medium text-white shadow-lg"
          >
            {feedback}
          </p>
        </div>
      )}

      {detailTarget && (
        <MatchingDetailModal
          matching={detailTarget}
          variant={tab}
          busy={busyId === detailTarget.id}
          onClose={() => setDetailTarget(null)}
          onAccept={(id) => {
            accept(id);
            setDetailTarget(null);
          }}
          onReject={requestReject}
          onCancel={(id) => {
            cancel(id);
            setDetailTarget(null);
          }}
        />
      )}

      {rejectTarget && (
        <RejectReasonDialog
          matching={rejectTarget}
          busy={busyId === rejectTarget.id}
          onClose={() => setRejectTarget(null)}
          onConfirm={(reason) => {
            reject({ id: rejectTarget.id, reason });
            setRejectTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default RequestsPage;
