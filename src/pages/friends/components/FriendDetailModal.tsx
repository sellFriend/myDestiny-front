import { useState } from 'react';
import { Bell, BellOff, Check, Pencil, Trash2, X } from 'lucide-react';
import { type Friend } from '@/pages/friends/components/FriendCard';

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

  const fallbackGradient = FALLBACK_GRADIENTS[friend.cardColor] ?? 'from-black/15 to-black/5';
  const accentTint = ACCENT_TINTS[friend.cardColor] ?? 'bg-black/[0.03]';

  const occupationLine = friend.isStudent
    ? `${friend.school} · ${friend.major}`
    : friend.occupation;

  const isPending = friend.status === 'pending';
  const isDeactivated = friend.status === 'approved' && !friend.isActive;

  const handleDelete = () => {
    onDelete(friend.id);
    onClose();
  };

  const handleReform = async () => {
    await onRequestReform(friend);
    setReformRequested(true);
  };

  const primaryBtn =
    'flex flex-1 items-center justify-center gap-2 rounded-pill bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-black/85 active:scale-[0.98]';
  const ghostBtn =
    'flex flex-1 items-center justify-center gap-2 rounded-pill bg-black/[0.05] py-3.5 text-sm font-semibold text-black/60 transition-colors hover:bg-black/[0.09] hover:text-black/80';

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex justify-center bg-black/50 sm:items-center sm:p-6"
        onClick={onClose}
      >
        <div
          className="relative flex h-full w-full flex-col overflow-y-auto bg-white sm:h-[72vh] sm:max-h-[600px] sm:max-w-4xl sm:flex-row sm:overflow-hidden sm:rounded-block sm:shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition-colors bg-black/40 text-white hover:bg-black/55 sm:bg-black/[0.06] sm:text-black/55 sm:hover:bg-black/10 sm:hover:text-black/80"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Photo column */}
          <div className="relative flex-shrink-0 bg-black/5 sm:w-1/2">
            {friend.photo ? (
              <button
                type="button"
                onClick={() => setIsImageOpen(true)}
                className="block h-[58vh] w-full cursor-zoom-in sm:h-full"
                aria-label="사진 크게 보기"
              >
                <img
                  src={friend.photo}
                  alt={friend.name}
                  className="h-full w-full object-cover"
                />
              </button>
            ) : (
              <div
                className={`flex h-[58vh] items-center justify-center bg-gradient-to-br ${fallbackGradient} sm:h-full`}
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
          <div className="flex flex-col sm:min-h-0 sm:flex-1">
            {/* Identity header (subtle accent) */}
            <div className={`${accentTint} flex-shrink-0 border-b border-black/5 px-6 pt-6 pb-5`}>
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
            <div className="px-6 py-6 space-y-6 sm:flex-1 sm:overflow-y-auto">
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
            <div className="flex-shrink-0 space-y-3 border-t border-black/5 px-6 py-5">
              {/* 폼 재수정 요청 결과 인라인 흔적 (토스트와 이중 피드백) */}
              {reformRequested && (
                <p className="flex items-center justify-center gap-1.5 text-xs font-medium text-black/45">
                  <Check className="h-3.5 w-3.5" />
                  수정 링크를 복사했어요. 친구에게 공유해 보세요.
                </p>
              )}

              {isPending ? (
                <>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onApprove(friend.id);
                        onClose();
                      }}
                      className={primaryBtn}
                    >
                      <Check className="h-4 w-4" />
                      등록 승인
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onReject(friend.id);
                        onClose();
                      }}
                      className={`${ghostBtn} max-w-[40%]`}
                    >
                      등록 거절
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleReform}
                    className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-medium text-black/45 transition-colors hover:text-black/70"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    폼 다시 수정 요청하기
                  </button>
                </>
              ) : (
                <>
                  {isDeactivated ? (
                    <button
                      type="button"
                      onClick={() => {
                        onActivate(friend.id);
                        onClose();
                      }}
                      className={primaryBtn}
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
                    onClick={handleDelete}
                    className="flex w-full items-center justify-center gap-1.5 py-1 text-sm font-medium text-black/40 transition-colors hover:text-black/65"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    친구 삭제
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
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
