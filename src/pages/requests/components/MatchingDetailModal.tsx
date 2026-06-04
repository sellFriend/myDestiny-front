import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useDragControls } from 'framer-motion';
import { Check, ChevronDown, Clock, Heart, Loader2, X } from 'lucide-react';
import {
  MatchingStatus,
  matchingApi,
  queryKeys,
  type GenderUpper,
  type MatchingResponse,
} from '@/lib/api';
import { ContactRow } from '@/pages/requests/components/ContactRow';
import { ProfileAvatar } from '@/pages/requests/components/ProfileAvatar';
import {
  genderTag,
  matchingSides,
  matchingSteps,
  remainingMeta,
  statusMeta,
  type RequestTab,
} from '@/pages/requests/utils';

/** 시트를 닫히게 하는 드래그 임계값 — 거리(끌어내림) 또는 속도(튕김) (친구 초대 시트와 동일) */
const DRAG_CLOSE_DISTANCE = 120;
const DRAG_CLOSE_VELOCITY = 600;

interface MatchingDetailModalProps {
  matching: MatchingResponse;
  variant: RequestTab;
  busy?: boolean;
  onClose: () => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onCancel?: (id: string) => void;
}

/** 닉네임이 나(본인)인지 — '나님' 같은 어색한 표기를 피하기 위한 판별 */
function isMe(nickname: string) {
  return nickname === '나';
}

function genderText(gender: GenderUpper, fallback: string) {
  const tag = genderTag(gender);
  if (tag === '여') return '여성';
  if (tag === '남') return '남성';
  return fallback;
}

/** 성사된 인연의 연락처를 상세 안에서 바로 펼쳐 보여준다 (별도 모달 없이). */
function ContactReveal({ matchingId }: { matchingId: string }) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.matchings.contact(matchingId),
    queryFn: () => matchingApi.contact(matchingId),
  });

  if (isLoading) {
    return (
      <div className="flex h-20 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-black/30" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-20 flex-col items-center justify-center gap-2.5 text-center">
        <p className="text-sm text-black/50">연락처를 불러오지 못했어요</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-pill bg-black px-4 py-2 text-sm font-semibold text-white"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <ContactRow label="카카오톡 ID" value={data?.kakaoId ?? null} />
      <ContactRow label="인스타그램" value={data?.instagramId ?? null} />
    </div>
  );
}

/** 진행 단계 스테퍼 — 어디까지 왔는지 한눈에 (goal-gradient) */
function StatusStepper({ status }: { status: MatchingStatus }) {
  const { steps, terminal } = matchingSteps(status);

  if (terminal) {
    return (
      <div className="flex items-center gap-2 rounded-2xl bg-black/[0.04] px-4 py-3">
        <X className="h-4 w-4 text-black/40" />
        <span className="text-sm font-medium text-black/55">{terminal.label}</span>
      </div>
    );
  }

  return (
    <ol className="flex items-center">
      {steps.map((step, index) => (
        <li key={step.label} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center gap-1.5">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                step.state === 'done'
                  ? 'bg-black text-white'
                  : step.state === 'current'
                    ? 'bg-pastel-coral text-black'
                    : 'bg-black/[0.07] text-black/30'
              }`}
            >
              {step.state === 'done' ? <Check className="h-3.5 w-3.5" /> : index + 1}
            </span>
            <span
              className={`whitespace-nowrap text-[11px] font-medium ${
                step.state === 'todo' ? 'text-black/30' : 'text-black/60'
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <span
              className={`mx-1 -mt-5 h-0.5 flex-1 rounded-full ${
                step.state === 'done' ? 'bg-black' : 'bg-black/[0.08]'
              }`}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

export function MatchingDetailModal({
  matching,
  variant,
  busy = false,
  onClose,
  onAccept,
  onReject,
  onCancel,
}: MatchingDetailModalProps) {
  const isMatched = variant === 'matched';
  // 성사된 인연은 두 사람이 동등하게 중요하므로 내 지인도 기본으로 펼친다.
  const [isMineOpen, setIsMineOpen] = useState(isMatched);
  const dragControls = useDragControls();

  // 시트가 열린 동안 배경 스크롤 잠금
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const { status, message } = matching;
  const { counterpart, mine } = matchingSides(matching, variant);
  const isPending = status === MatchingStatus.PENDING;
  const badge = statusMeta(status);

  // 헤더: 누가 → 누구에게 보냈는지 (받음/보냄 관점이 다르다)
  const directionLabel =
    variant === 'received'
      ? `${matching.requesterNickname}님이 제안했어요`
      : variant === 'sent'
        ? `${matching.receiverNickname}님에게 제안했어요`
        : '두 분의 인연이 이어졌어요';

  // 상대 지인 섹션 라벨
  const counterpartLabel =
    variant === 'received'
      ? '이런 분을 소개받았어요'
      : variant === 'sent'
        ? '이 분에게 소개했어요'
        : '성사된 인연';

  // 내 지인 보조 라벨: 받음(내 지인이 받는 쪽) vs 보냄(내 지인을 내보낸 쪽)이 다르다
  const mineFoldLabel =
    variant === 'received' ? (
      <>
        내 지인 <span className="font-bold text-black/80">{mine.name}</span>님에게 들어온
        제안이에요
      </>
    ) : variant === 'sent' ? (
      <>
        내 지인 <span className="font-bold text-black/80">{mine.name}</span>님을 소개한 제안이에요
      </>
    ) : (
      <>
        <span className="font-bold text-black/80">{mine.name}</span>님과 인연이 닿았어요
      </>
    );

  // 메시지 작성자는 항상 제안한 마담(requester). 그게 나면 '나님' 대신 '내가'로.
  const messageAuthorLabel = isMe(matching.requesterNickname)
    ? '내가 남긴 한마디'
    : `${matching.requesterNickname}님의 한마디`;

  const deadline =
    variant === 'received' && isPending ? remainingMeta(matching.receiverExpiresAt) : null;

  const primaryBtn =
    'flex items-center justify-center gap-1.5 rounded-pill bg-black py-3.5 text-sm font-bold text-white transition-all hover:bg-black/85 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40';
  const ghostBtn =
    'flex items-center justify-center gap-1.5 rounded-pill bg-black/[0.05] py-3.5 text-sm font-semibold text-black/55 transition-colors hover:bg-black/[0.09] hover:text-black/80 disabled:pointer-events-none disabled:opacity-40';

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 sm:items-center sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={(event) => event.stopPropagation()}
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: 0 }}
        dragElastic={{ top: 0, bottom: 0 }}
        dragSnapToOrigin
        onDragEnd={(_, info) => {
          if (info.offset.y > DRAG_CLOSE_DISTANCE || info.velocity.y > DRAG_CLOSE_VELOCITY) {
            onClose();
          }
        }}
        className="flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-[1.5rem] bg-white sm:max-h-[85vh] sm:max-w-md sm:rounded-block sm:shadow-2xl"
      >
        {/* 그래버 — 끌어서 시트를 닫는 드래그 핸들 */}
        <div
          className="flex shrink-0 cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing"
          onPointerDown={(event) => dragControls.start(event)}
        >
          <div className="h-1 w-9 rounded-full bg-black/15" />
        </div>

        {/* 헤더: 관계 맥락 + 상태 배지 (Common Region) */}
        <div className="relative shrink-0 border-b border-black/[0.06] px-6 pb-5 pt-3">
          <span
            className={`inline-flex rounded-pill px-2.5 py-1 text-[11px] font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
          <p className="mt-2.5 text-[1.0625rem] font-bold text-black">{directionLabel}</p>

          <div className="mt-5">
            <StatusStepper status={status} />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          {/* 상대 지인 — 결정의 주인공이라 크게 (Serial Position) */}
          <section>
            <p className="mb-2.5 text-[11px] font-semibold text-black/35">{counterpartLabel}</p>
            <div className="flex items-center gap-4 rounded-2xl bg-black/[0.025] px-5 py-4">
              <ProfileAvatar profile={counterpart} size={64} />
              <div className="min-w-0">
                <p className="text-lg font-bold text-black">{counterpart.name}</p>
                <p className="mt-0.5 text-sm text-black/45">
                  {genderText(counterpart.gender, '프로필')}
                </p>
              </div>
            </div>
          </section>

          {/* 내 지인 — 이미 아는 사람이라 접어둠 (Progressive Disclosure) */}
          <section className="mt-3">
            <button
              type="button"
              onClick={() => setIsMineOpen((prev) => !prev)}
              className="flex w-full items-center gap-3 rounded-2xl px-5 py-4 text-left transition-colors hover:bg-black/[0.025]"
            >
              <Heart
                className={`h-4 w-4 shrink-0 ${
                  isMatched ? 'fill-pastel-coral text-pastel-coral' : 'text-black/25'
                }`}
              />
              <span className="min-w-0 flex-1 text-sm text-black/55">{mineFoldLabel}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-black/30 transition-transform ${
                  isMineOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isMineOpen && (
              <div className="mt-2 flex items-center gap-4 rounded-2xl bg-black/[0.025] px-5 py-4">
                <ProfileAvatar profile={mine} size={56} />
                <div className="min-w-0">
                  <p className="text-base font-bold text-black">{mine.name}</p>
                  <p className="mt-0.5 text-sm text-black/45">{genderText(mine.gender, '내 지인')}</p>
                </div>
              </div>
            )}
          </section>

          {/* 마담 메시지 */}
          {message && (
            <section className="mt-3 rounded-2xl bg-black/[0.035] px-5 py-4">
              <p className="mb-1 text-[11px] font-semibold text-black/35">{messageAuthorLabel}</p>
              <p className="text-sm leading-relaxed text-black/70">{message}</p>
            </section>
          )}

          {/* 기한 */}
          {deadline && (
            <p
              className={`mt-3 flex items-center gap-1.5 text-xs font-medium ${
                deadline.urgent ? 'text-pastel-coral' : 'text-black/45'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              {deadline.label}
            </p>
          )}

          {/* 성사됨 — 연락처를 별도 모달 없이 여기서 바로 (progressive disclosure) */}
          {isMatched && (
            <section className="mt-5">
              <p className="mb-2.5 text-[11px] font-semibold text-black/35">연락처</p>
              <ContactReveal matchingId={matching.id} />
            </section>
          )}
        </div>

        {/* 액션 */}
        {variant === 'received' && isPending ? (
          <div className="flex shrink-0 gap-2 border-t border-black/[0.06] px-6 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
            <button
              type="button"
              disabled={busy}
              onClick={() => onReject?.(matching.id)}
              className={`${ghostBtn} flex-1`}
            >
              거절
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onAccept?.(matching.id)}
              className={`${primaryBtn} flex-1`}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              수락하기
            </button>
          </div>
        ) : variant === 'sent' && isPending ? (
          <div className="shrink-0 border-t border-black/[0.06] px-6 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]">
            <button
              type="button"
              disabled={busy}
              onClick={() => onCancel?.(matching.id)}
              className={`${ghostBtn} w-full`}
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              요청 취소
            </button>
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
