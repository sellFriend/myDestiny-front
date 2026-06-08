import {
  MatchingStatus,
  type GenderUpper,
  type MatchingProfileRef,
  type MatchingResponse,
  type MatchingStatus as MatchingStatusType,
} from '@/lib/api';

export type RequestTab = 'received' | 'sent' | 'matched';

/**
 * 뷰어 관점에서 매칭의 두 사람을 '상대(counterpart)'와 '내 지인(mine)'으로 가른다.
 * - 받은 요청: 내가 받는 쪽 → 내 지인은 target, 평가 대상(상대)은 requester
 * - 보낸 요청: 내가 제안한 쪽 → 내 지인은 requester, 상대는 target
 * - 성사됨: 방향 정보가 없어 requester를 상대로 둔다. (TODO(API): direction 도착 시 정밀화)
 */
export function matchingSides(
  matching: MatchingResponse,
  tab: RequestTab,
): { counterpart: MatchingProfileRef; mine: MatchingProfileRef } {
  if (tab === 'sent') {
    return { counterpart: matching.targetProfile, mine: matching.requesterProfile };
  }
  return { counterpart: matching.requesterProfile, mine: matching.targetProfile };
}

export type StepState = 'done' | 'current' | 'todo';
export interface MatchingStep {
  label: string;
  state: StepState;
}

/**
 * 매칭 진행을 사용자 관점 3단계(제안 · 수락 · 성사)로 환산한다. (goal-gradient)
 * '당사자 동의'는 백엔드 내부 단계라 별도로 노출하지 않고, 수락 이후 성사를 향해 진행 중인 것으로 합친다.
 * 무산/만료/취소처럼 끝난 흐름은 terminal 로 표시한다.
 */
export function matchingSteps(status: MatchingStatusType): {
  steps: MatchingStep[];
  terminal: { label: string } | null;
} {
  const labels = ['제안', '수락', '성사'];

  const terminalLabel: Partial<Record<MatchingStatusType, string>> = {
    [MatchingStatus.REJECTED_BY_RECEIVER]: '상대가 거절했어요',
    [MatchingStatus.CONSENT_REJECTED]: '인연이 무산됐어요',
    [MatchingStatus.CONSENT_EXPIRED]: '인연이 무산됐어요',
    [MatchingStatus.CANCELLED]: '요청이 취소됐어요',
    [MatchingStatus.CANCELLED_AFTER_MATCH]: '성사가 취소됐어요',
    [MatchingStatus.EXPIRED]: '응답 기한이 지났어요',
  };
  if (terminalLabel[status]) {
    return { steps: [], terminal: { label: terminalLabel[status]! } };
  }

  // 현재 도달한 단계 인덱스 (0=제안, 1=수락, 2=성사, 3=성사 완료)
  // 수락(ACCEPTED) 이후 당사자 동의 단계들은 모두 '성사를 향해 진행 중'(index 2)으로 합친다.
  const reached: Record<string, number> = {
    [MatchingStatus.PENDING]: 0,
    [MatchingStatus.ACCEPTED_BY_RECEIVER]: 2,
    [MatchingStatus.CONSENT_PENDING]: 2,
    [MatchingStatus.CONSENT_PARTIALLY_APPROVED]: 2,
    [MatchingStatus.MATCHED]: 3,
  };
  const current = reached[status] ?? 0;

  const steps = labels.map((label, index): MatchingStep => ({
    label,
    state: index < current ? 'done' : index === current ? 'current' : 'todo',
  }));
  return { steps, terminal: null };
}

/** 매칭 상태 → 사용자에게 보일 한 단어 라벨 + 배지 톤 (모노크롬 유지) */
export function statusMeta(status: MatchingStatusType): { label: string; className: string } {
  switch (status) {
    case MatchingStatus.PENDING:
      return { label: '응답 대기중', className: 'bg-black/5 text-black/50' };
    case MatchingStatus.ACCEPTED_BY_RECEIVER:
      return { label: '수락함', className: 'bg-black text-white' };
    case MatchingStatus.CONSENT_PENDING:
    case MatchingStatus.CONSENT_PARTIALLY_APPROVED:
      return { label: '성사 진행중', className: 'bg-black/5 text-black/50' };
    case MatchingStatus.MATCHED:
      return { label: '성사됨', className: 'bg-black text-white' };
    case MatchingStatus.REJECTED_BY_RECEIVER:
      return { label: '거절함', className: 'bg-black/10 text-black/40' };
    case MatchingStatus.CONSENT_REJECTED:
      return { label: '무산됨', className: 'bg-black/10 text-black/40' };
    case MatchingStatus.CANCELLED:
      return { label: '취소함', className: 'bg-black/10 text-black/40' };
    case MatchingStatus.CANCELLED_AFTER_MATCH:
      return { label: '성사 취소됨', className: 'bg-black/10 text-black/40' };
    case MatchingStatus.EXPIRED:
    case MatchingStatus.CONSENT_EXPIRED:
      return { label: '기한 만료', className: 'bg-black/10 text-black/40' };
    default:
      return { label: '진행중', className: 'bg-black/5 text-black/50' };
  }
}

export function genderTag(gender: GenderUpper): string {
  if (gender === 'FEMALE') return '여';
  if (gender === 'MALE') return '남';
  return '';
}

/** createdAt(ISO) → "오늘" / "어제" / "n일 전" / "M월 D일" */
export function formatSince(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  if (days <= 0) return '오늘';
  if (days === 1) return '어제';
  if (days < 7) return `${days}일 전`;
  return `${then.getMonth() + 1}월 ${then.getDate()}일`;
}

/** 응답/동의 기한까지 남은 시간을 부드럽게 안내 (goal-gradient) */
export function formatRemaining(iso: string | null): string | null {
  return remainingMeta(iso)?.label ?? null;
}

/**
 * 남은 기한을 라벨 + 긴급 여부로 안내한다.
 * urgent(24시간 미만)일 때 카드에서 시각적으로 강조해 막판 응답을 유도한다. (goal-gradient)
 */
export function remainingMeta(iso: string | null): { label: string; urgent: boolean } | null {
  if (!iso) return null;
  const until = new Date(iso);
  if (Number.isNaN(until.getTime())) return null;
  const ms = until.getTime() - Date.now();
  if (ms <= 0) return { label: '곧 만료돼요', urgent: true };
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return { label: `${days}일 안에 응답해 주세요`, urgent: false };
  const hours = Math.max(1, Math.floor(ms / 3_600_000));
  return { label: `${hours}시간 안에 응답해 주세요`, urgent: true };
}
