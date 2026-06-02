import { Check, Heart, Loader2, MessageCircleMore, X } from 'lucide-react';
import { MatchingStatus, type MatchingResponse } from '@/lib/api';
import {
  formatRemaining,
  formatSince,
  genderTag,
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
  onViewContact?: (matching: MatchingResponse) => void;
}

function NameChip({ name, gender }: { name: string; gender: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="font-black text-black">{name}</span>
      {gender && <span className="text-xs font-semibold text-black/35">{gender}</span>}
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
  onViewContact,
}: MatchingCardProps) {
  const { requesterProfile, targetProfile, status, message } = matching;
  const badge = statusMeta(status);
  const isPending = status === MatchingStatus.PENDING;

  const requester = { name: requesterProfile.name, gender: genderTag(requesterProfile.gender) };
  const target = { name: targetProfile.name, gender: genderTag(targetProfile.gender) };

  const isMatched = variant === 'matched';
  const surface = isMatched
    ? 'bg-pastel-mint/40 border-transparent'
    : 'bg-white border-black/10';

  return (
    <article className={`rounded-block border ${surface} p-5 sm:p-6`}>
      {/* eyebrow + 상태 배지 */}
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-black/35">
          {variant === 'received' ? '받은 제안' : variant === 'sent' ? '보낸 요청' : '성사된 인연'}
        </span>
        <span className={`rounded-pill px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}>
          {badge.label}
        </span>
      </div>

      {/* 핵심 정보 */}
      {variant === 'received' && (
        <>
          <h3 className="text-lg leading-snug">
            <NameChip {...requester} />
            <span className="text-black/50">님을 소개받았어요</span>
          </h3>
          <p className="mt-1 text-sm text-black/50">
            <strong className="font-semibold text-black/70">{matching.requesterNickname}</strong>
            님이 <NameChip {...target} />님에게 연결하고 싶어해요
          </p>
        </>
      )}

      {variant === 'sent' && (
        <>
          <h3 className="text-lg leading-snug">
            <NameChip {...requester} />
            <span className="text-black/40"> → </span>
            <NameChip {...target} />
          </h3>
          <p className="mt-1 text-sm text-black/50">
            <strong className="font-semibold text-black/70">{matching.receiverNickname}</strong>
            님에게 보낸 소개 요청
          </p>
        </>
      )}

      {variant === 'matched' && (
        <>
          <h3 className="flex items-center gap-2 text-lg leading-snug">
            <NameChip {...requester} />
            <Heart className="h-4 w-4 fill-black text-black" />
            <NameChip {...target} />
          </h3>
          <p className="mt-1 text-sm text-black/50">
            두 분의 인연이 이어졌어요. 이제 연락처를 확인할 수 있어요.
          </p>
        </>
      )}

      {/* 메시지 */}
      {message && (
        <p className="mt-3 rounded-xl bg-black/[0.04] px-4 py-3 text-sm leading-relaxed text-black/60">
          “{message}”
        </p>
      )}

      {/* 기한 안내 (받은 요청, 대기중) */}
      {variant === 'received' && isPending && formatRemaining(matching.receiverExpiresAt) && (
        <p className="mt-3 text-xs font-medium text-black/45">
          ⏳ {formatRemaining(matching.receiverExpiresAt)}
        </p>
      )}

      {/* 액션 영역 */}
      {variant === 'received' && isPending ? (
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onAccept?.(matching.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80 disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            수락하기
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onReject?.(matching.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-pill border border-black/15 py-3 text-sm font-semibold text-black/55 transition-colors hover:border-black/35 hover:text-black disabled:opacity-40"
          >
            <X className="h-4 w-4" />
            거절하기
          </button>
        </div>
      ) : variant === 'sent' && isPending ? (
        <div className="mt-4">
          <button
            type="button"
            disabled={busy}
            onClick={() => onCancel?.(matching.id)}
            className="flex w-full items-center justify-center gap-1.5 rounded-pill border border-black/15 py-3 text-sm font-semibold text-black/55 transition-colors hover:border-black/35 hover:text-black disabled:opacity-40"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
            요청 취소하기
          </button>
        </div>
      ) : variant === 'matched' ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onViewContact?.(matching)}
            className="flex w-full items-center justify-center gap-1.5 rounded-pill bg-black py-3 text-sm font-semibold text-white transition-colors hover:bg-black/80"
          >
            <MessageCircleMore className="h-4 w-4" />
            연락처 보기
          </button>
        </div>
      ) : (
        <p className="mt-3 font-mono text-[10px] uppercase tracking-widest text-black/30">
          {formatSince(matching.createdAt)}
        </p>
      )}
    </article>
  );
}
