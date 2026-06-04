import type { MouseEvent } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { MatchingStatus, type MatchingResponse } from '@/lib/api';
import { ProfileAvatar } from '@/pages/requests/components/ProfileAvatar';
import {
  formatSince,
  genderTag,
  matchingSides,
  statusMeta,
  type RequestTab,
} from '@/pages/requests/utils';

interface MatchingCardProps {
  matching: MatchingResponse;
  variant: RequestTab;
  busy?: boolean;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
  onOpenDetail?: (matching: MatchingResponse) => void;
}

function Name({ name, gender }: { name: string; gender: string }) {
  return (
    <span className="inline-flex min-w-0 items-baseline gap-0.5">
      <span className="truncate font-bold text-black">{name}</span>
      {/* 성별 태그 — 앱(모바일)에선 공간 절약 위해 숨기고 웹에서만 노출 */}
      {gender && (
        <span className="hidden shrink-0 text-xs font-medium text-black/30 md:inline">
          {gender}
        </span>
      )}
    </span>
  );
}

export function MatchingCard({
  matching,
  variant,
  busy = false,
  onAccept,
  onReject,
  onCancel,
  onOpenDetail,
}: MatchingCardProps) {
  const { status, message } = matching;
  const badge = statusMeta(status);
  const isPending = status === MatchingStatus.PENDING;
  const isMatched = variant === 'matched';

  // 리스트의 시각 초점은 '상대(counterpart)' 한 명 — 겹친 두 아바타의 혼란을 없앤다. (Hick)
  const { counterpart, mine } = matchingSides(matching, variant);

  const contextLine =
    variant === 'received'
      ? `${matching.requesterNickname}님이 소개를 제안했어요`
      : variant === 'sent'
        ? `${matching.receiverNickname}님에게 보낸 제안이에요`
        : '두 분의 인연이 이어졌어요';

  const primaryBtn =
    'flex items-center justify-center gap-1.5 rounded-pill bg-black py-3 text-sm font-bold text-white transition-all hover:bg-black/85 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40';
  const ghostBtn =
    'flex items-center justify-center gap-1.5 rounded-pill bg-black/[0.05] py-3 text-sm font-semibold text-black/55 transition-colors hover:bg-black/[0.09] hover:text-black/80 disabled:pointer-events-none disabled:opacity-40';

  // 버튼 클릭이 카드 상세 열기로 번지지 않도록 차단
  const stop = (handler?: () => void) => (event: MouseEvent) => {
    event.stopPropagation();
    handler?.();
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail?.(matching)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpenDetail?.(matching);
        }
      }}
      className="cursor-pointer rounded-block border border-black/[0.08] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition-colors hover:border-black/[0.16] sm:p-6"
    >
      {/* 상단: 상대 사진(단일 초점) + 관계 한 줄 + 상태 배지 */}
      <div className="flex items-start gap-3.5">
        <ProfileAvatar profile={counterpart} size={48} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="flex min-w-0 items-center gap-1.5 text-[1.0625rem] leading-snug">
              <Name name={counterpart.name} gender={genderTag(counterpart.gender)} />
              <Heart
                className={`h-3.5 w-3.5 shrink-0 ${
                  isMatched ? 'fill-pastel-coral text-pastel-coral' : 'text-black/20'
                }`}
              />
              <Name name={mine.name} gender={genderTag(mine.gender)} />
            </h3>
            <span
              className={`shrink-0 rounded-pill px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>
          <p className="mt-1 truncate text-sm text-black/45">{contextLine}</p>
        </div>
      </div>

      {/* 마담 한마디 — 앱(모바일)에선 숨기고 웹(md↑)에서만. 상세에선 항상 노출 */}
      {message && (
        <div className="mt-3.5 hidden rounded-2xl bg-black/[0.035] px-4 py-3 md:block">
          <p className="mb-0.5 text-[11px] font-semibold text-black/35">
            {matching.requesterNickname === '나'
              ? '내가 남긴 한마디'
              : `${matching.requesterNickname}님의 한마디`}
          </p>
          <p className="line-clamp-2 text-sm leading-relaxed text-black/70">{message}</p>
        </div>
      )}

      {/* 액션: 수락/거절을 동일 너비로 균형 — 강조는 채움 vs 고스트로만 (절제된 위계) */}
      {variant === 'received' && isPending ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={stop(() => onReject?.(matching.id))}
            className={`${ghostBtn} flex-1`}
          >
            거절
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={stop(() => onAccept?.(matching.id))}
            className={`${primaryBtn} flex-1`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            수락하기
          </button>
        </div>
      ) : variant === 'sent' && isPending ? (
        <button
          type="button"
          disabled={busy}
          onClick={stop(() => onCancel?.(matching.id))}
          className={`${ghostBtn} mt-4 w-full`}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          요청 취소
        </button>
      ) : variant === 'matched' ? (
        <button
          type="button"
          onClick={stop(() => onOpenDetail?.(matching))}
          className={`${primaryBtn} mt-4 w-full`}
        >
          연락처 보기
        </button>
      ) : (
        <p className="mt-3.5 text-xs text-black/30">{formatSince(matching.createdAt)}</p>
      )}
    </article>
  );
}
