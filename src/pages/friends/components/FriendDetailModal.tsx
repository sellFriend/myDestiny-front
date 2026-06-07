import { useEffect, useState } from 'react';
import { motion, useAnimationControls, useDragControls, type PanInfo } from 'framer-motion';
import { Bell, BellOff, Check, Pencil, Trash2, X } from 'lucide-react';
import { type Friend } from '@/pages/friends/components/FriendCard';

/** 아래로 끌어 닫는 임계값 — 거리(px) 또는 속도 */
const DRAG_CLOSE_DISTANCE = 110;
const DRAG_CLOSE_VELOCITY = 600;
const SHEET_SPRING = { type: 'spring', stiffness: 360, damping: 40 } as const;

interface FriendDetailModalProps {
  friend: Friend;
  onClose: () => void;
  onDelete: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDeactivate: (id: string) => void;
  onActivate: (id: string) => void;
  /** 폼 재수정 요청: 새 숏링크 생성 + 클립보드 복사 + 토스트. 복사 성공 여부를 반환. */
  onRequestReform: (friend: Friend) => Promise<boolean> | boolean;
}

// 사진이 없을 때만 쓰이는 옅은 폴백 그라디언트
const FALLBACK_GRADIENTS: Record<string, string> = {
  'bg-pastel-lime': 'from-[#ceff6e]/55 to-[#ceff6e]/15',
  'bg-pastel-lilac': 'from-[#c5b8ff]/55 to-[#c5b8ff]/15',
  'bg-pastel-mint': 'from-[#b8ffe5]/60 to-[#b8ffe5]/20',
  'bg-pastel-coral': 'from-[#ff8b7b]/45 to-[#ff8b7b]/15',
  'bg-pastel-cream': 'from-[#fff6d3]/70 to-[#fff6d3]/30',
  'bg-pastel-pink': 'from-[#ffb8d0]/55 to-[#ffb8d0]/15',
};

// 이름 영역에 살짝 깔리는 포인트 틴트 (친구 카드와 동일 톤)
const ACCENT_TINTS: Record<string, string> = {
  'bg-pastel-lime': 'bg-[#ceff6e]/20',
  'bg-pastel-lilac': 'bg-[#c5b8ff]/20',
  'bg-pastel-mint': 'bg-[#b8ffe5]/25',
  'bg-pastel-coral': 'bg-[#ff8b7b]/15',
  'bg-pastel-cream': 'bg-[#fff6d3]/35',
  'bg-pastel-pink': 'bg-[#ffb8d0]/20',
};

export function FriendDetailModal({
  friend,
  onClose,
  onDelete,
  onApprove,
  onReject,
  onDeactivate,
  onActivate,
  onRequestReform,
}: FriendDetailModalProps) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  // 폼 재수정 요청 후 모달 안에 남기는 인라인 흔적 (토스트와 이중 피드백)
  const [reformRequested, setReformRequested] = useState(false);
  // 되돌릴 수 없는 파괴 액션(거절/삭제)은 한 번 더 확인받는다.
  const [confirming, setConfirming] = useState<null | 'reject' | 'delete'>(null);

  // ── 모바일 전체화면 시트 드래그 제어 ─────────────────────────────────
  const [viewportH, setViewportH] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 800,
  );
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : true,
  );
  const controls = useAnimationControls();
  const dragControls = useDragControls();

  // 시트가 열린 동안 배경 스크롤 잠금
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // 뷰포트 크기 / 모바일 여부 추적 (회전·리사이즈 대응)
  useEffect(() => {
    const onResize = () => {
      setViewportH(window.innerHeight);
      setIsMobile(window.matchMedia('(max-width: 639px)').matches);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // 최초 마운트 시 아래에서 전체화면으로 올라오는 애니메이션 (데스크탑은 변환 없음)
  // StrictMode 이중 실행에도 안전하도록 가드/중단 없이 매번 목표로 애니메이트한다.
  useEffect(() => {
    if (isMobile) {
      void controls.start({ y: 0, transition: SHEET_SPRING });
    } else {
      controls.set({ y: 0 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeSheet = () => {
    if (!isMobile) {
      onClose();
      return;
    }
    void controls
      .start({ y: viewportH, transition: { duration: 0.22, ease: 'easeIn' } })
      .then(onClose);
  };

  // 아래로 충분히 끌면 닫고, 아니면 전체화면으로 되돌린다.
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_CLOSE_DISTANCE || info.velocity.y > DRAG_CLOSE_VELOCITY) {
      closeSheet();
    } else {
      void controls.start({ y: 0, transition: SHEET_SPRING });
    }
  };

  const fallbackGradient = FALLBACK_GRADIENTS[friend.cardColor] ?? 'from-black/15 to-black/5';
  const accentTint = ACCENT_TINTS[friend.cardColor] ?? 'bg-black/[0.03]';

  const occupationLine = friend.isStudent
    ? `${friend.school} · ${friend.major}`
    : friend.occupation;

  const isPending = friend.status === 'pending';
  const isDeactivated = friend.status === 'approved' && !friend.isActive;

  // 파괴 액션은 confirming 단계를 거친 뒤에만 실제로 실행한다.
  const handleConfirm = () => {
    if (confirming === 'reject') {
      // 거절은 페이지가 API 성공 시 토스트와 함께 모달을 닫는다. (여기서 닫지 않음)
      onReject(friend.id);
    } else if (confirming === 'delete') {
      onDelete(friend.id);
      onClose();
    }
  };

  const handleReform = async () => {
    // 링크 복사까지 성공(true)했을 때만 인라인 흔적을 남긴다.
    // 409(매칭에 묶임·상태 불일치 등)는 토스트로만 안내하고 흔적은 띄우지 않는다.
    const copied = await onRequestReform(friend);
    setReformRequested(copied === true);
  };

  const primaryBtn =
    'flex flex-1 items-center justify-center gap-2 rounded-pill bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-black/85 active:scale-[0.98]';
  const ghostBtn =
    'flex flex-1 items-center justify-center gap-2 rounded-pill bg-black/[0.05] py-3.5 text-sm font-semibold text-black/60 transition-colors hover:bg-black/[0.09] hover:text-black/80';
  // 파괴 액션 진입점: 하단에 옅은 적색 텍스트로 위계를 가장 낮춘다.
  const dangerTextBtn =
    'flex w-full items-center justify-center gap-1.5 py-1 text-sm font-medium text-[#c0432f]/70 transition-colors hover:text-[#c0432f]';
  // 확인 패널의 실행 버튼: 명확한 적색으로 되돌릴 수 없음을 알린다.
  const dangerBtn =
    'flex flex-1 items-center justify-center gap-2 rounded-pill bg-[#e05a4a] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#cf4c3d] active:scale-[0.98]';

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 sm:flex sm:items-center sm:justify-center sm:p-6"
        onClick={closeSheet}
      >
        <motion.div
          initial={isMobile ? { y: viewportH } : { y: 0 }}
          animate={controls}
          drag={isMobile ? 'y' : false}
          dragControls={dragControls}
          dragListener={false}
          dragConstraints={{ top: 0, bottom: viewportH }}
          dragElastic={0.05}
          onDragEnd={handleDragEnd}
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-0 top-0 flex h-[100dvh] flex-col overflow-hidden rounded-t-[1.75rem] bg-white shadow-[0_-8px_40px_rgba(0,0,0,0.12)] sm:relative sm:h-[72vh] sm:max-h-[600px] sm:w-full sm:max-w-4xl sm:flex-row sm:rounded-block sm:shadow-2xl"
        >
          {/* 닫기 버튼 — 데스크탑 전용(모바일은 그래버 끌어내리기로 닫음) */}
          <button
            type="button"
            onClick={closeSheet}
            className="absolute right-3.5 top-3.5 z-30 hidden h-8 w-8 items-center justify-center rounded-full bg-black/[0.05] text-black/45 transition-colors hover:bg-black/10 hover:text-black/80 sm:flex"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>

          {/* 그래버 — 아래로 끌면 닫힘 (모바일 전용) */}
          <div
            className="flex shrink-0 cursor-grab touch-none justify-center pb-2 pt-3 active:cursor-grabbing sm:hidden"
            onPointerDown={(event) => dragControls.start(event)}
          >
            <div className="h-1 w-10 rounded-full bg-black/15" />
          </div>

          {/* 본문 래퍼 — 모바일: 사진 고정 + 정보 스크롤 + 버튼 하단 고정 / 데스크탑: 좌우 분할 */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:flex-row sm:overflow-visible">
            {/* Photo column */}
            <div className="relative flex-shrink-0 bg-black/5 sm:w-1/2">
            {friend.photo ? (
              <button
                type="button"
                onClick={() => setIsImageOpen(true)}
                className="block h-[34vh] w-full cursor-zoom-in sm:h-full"
                aria-label="사진 크게 보기"
              >
                <img
                  src={friend.photo}
                  alt={friend.name}
                  className="h-full w-full object-cover"
                />
                {/* 탭 힌트 — 탐색 상세 모달과 동일하게 사진 하단 그라데이션 위에 표기 */}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-center bg-gradient-to-t from-black/45 to-transparent pb-3 pt-8 text-[11px] font-semibold text-white/90">
                  탭하여 사진 크게 보기
                </span>
              </button>
            ) : (
              <div
                className={`flex h-[34vh] items-center justify-center bg-gradient-to-br ${fallbackGradient} sm:h-full`}
              >
                <span className="text-8xl font-black text-white/70 select-none">
                  {friend.name.charAt(0)}
                </span>
              </div>
            )}

            <span
              className={`absolute top-4 left-4 rounded-pill px-3 py-1 text-[11px] font-semibold ${
                isPending
                  ? 'bg-white/90 text-black/60 backdrop-blur-sm'
                  : isDeactivated
                    ? 'bg-black/55 text-white backdrop-blur-sm'
                    : 'bg-black text-white'
              }`}
            >
              {isPending ? '승인 대기' : isDeactivated ? '비활성' : '등록된 친구'}
            </span>
          </div>

          {/* Content column */}
          <div className="flex min-h-0 flex-1 flex-col">
            {/* Identity header (subtle accent) */}
            <div className={`${accentTint} flex-shrink-0 border-b border-black/5 px-6 pt-5 pb-4 sm:pt-6 sm:pb-5`}>
              <div className="flex items-baseline gap-2">
                <h2 className="text-3xl font-black tracking-tight text-black sm:text-[2rem]">
                  {friend.name}
                </h2>
                <span className="text-lg font-bold text-black/45">{friend.age}세</span>
              </div>
              {occupationLine && (
                <p className="mt-1 text-sm font-medium text-black/55">{occupationLine}</p>
              )}
            </div>

            {/* Details */}
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5 sm:space-y-6 sm:py-6">
              {/* 상태 맥락 안내 */}
              {isPending && (
                <p className="rounded-2xl bg-black/[0.04] px-4 py-3 text-sm leading-relaxed text-black/55">
                  친구가 폼 작성을 마쳤어요. 내용을 확인하고 등록을 승인해 주세요.
                </p>
              )}
              {isDeactivated && (
                <p className="rounded-2xl bg-black/[0.04] px-4 py-3 text-sm leading-relaxed text-black/55">
                  지금은 매칭 요청을 받지 않아요. 다시 활성화하면 소개를 받을 수 있어요.
                </p>
              )}

              <section>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/35">
                  MBTI
                </p>
                <span className="rounded-pill bg-black px-3.5 py-1.5 text-sm font-bold text-white">
                  {friend.mbti}
                </span>
              </section>

              <section>
                <p className="mb-2.5 font-mono text-[10px] uppercase tracking-widest text-black/35">
                  취미
                </p>
                <div className="flex flex-wrap gap-2">
                  {friend.hobbies.map((h) => (
                    <span
                      key={h}
                      className="rounded-pill border border-black/10 bg-black/[0.03] px-3 py-1.5 text-sm text-black/70"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-black/35">
                  소개글
                </p>
                <p className="text-[15px] leading-relaxed text-black/70">{friend.intro}</p>
              </section>
            </div>

            {/* CTA — 상태별로 핵심 행동을 다르게 (Von Restorff: 가장 중요한 동작 강조) */}
            <div className="flex-shrink-0 space-y-3 border-t border-black/5 px-6 pt-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)] sm:py-5">
              {/* 폼 재수정 요청 결과 인라인 흔적 (토스트와 이중 피드백) */}
              {reformRequested && (
                <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-black/45">
                  <Check className="h-3.5 w-3.5" />
                  수정 링크를 복사했어요. 친구에게 공유해 보세요.
                </p>
              )}

              {confirming ? (
                /* 파괴 액션 확인 단계 — 위계 최상단에 경고, 실행은 적색 버튼으로만 */
                <>
                  <p className="text-center text-sm leading-relaxed text-black/60">
                    {confirming === 'reject'
                      ? '등록을 거절하면 이 친구의 폼이 삭제돼요. 계속할까요?'
                      : '친구를 삭제하면 되돌릴 수 없어요. 계속할까요?'}
                  </p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setConfirming(null)} className={ghostBtn}>
                      취소
                    </button>
                    <button type="button" onClick={handleConfirm} className={dangerBtn}>
                      <Trash2 className="h-4 w-4" />
                      {confirming === 'reject' ? '거절하기' : '삭제하기'}
                    </button>
                  </div>
                </>
              ) : isPending ? (
                /* 승인 대기: 등록됨 모달과 동일하게 상단 2버튼(행) + 하단 파괴 액션 레이아웃 */
                <>
                  <div className="flex gap-2">
                    <button type="button" onClick={handleReform} className={ghostBtn}>
                      <Pencil className="h-4 w-4" />
                      폼 수정 요청
                    </button>
                    <button
                      type="button"
                      onClick={() => onApprove(friend.id)}
                      className={primaryBtn}
                    >
                      <Check className="h-4 w-4" />
                      등록 승인
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfirming('reject')}
                    className={dangerTextBtn}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    등록 거절
                  </button>
                </>
              ) : (
                /* 등록됨: 중립 액션 → 파괴(삭제) 순. 위계 규칙을 대기 모달과 동일하게 유지 */
                <>
                  {isDeactivated ? (
                    <button
                      type="button"
                      onClick={() => {
                        onActivate(friend.id);
                        onClose();
                      }}
                      className={`${primaryBtn} w-full`}
                    >
                      <Bell className="h-4 w-4" />
                      다시 활성화
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button type="button" onClick={handleReform} className={ghostBtn}>
                        <Pencil className="h-4 w-4" />
                        폼 수정 요청
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeactivate(friend.id);
                          onClose();
                        }}
                        className={ghostBtn}
                      >
                        <BellOff className="h-4 w-4" />
                        비활성화
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setConfirming('delete')}
                    className={dangerTextBtn}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    친구 삭제
                  </button>
                </>
              )}
            </div>
          </div>
          </div>
        </motion.div>
      </div>

      {/* Image lightbox */}
      {isImageOpen && friend.photo && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsImageOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageOpen(false)}
            className="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={friend.photo}
            alt={friend.name}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
