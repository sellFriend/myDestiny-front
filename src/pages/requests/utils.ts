import { MatchingStatus, type GenderUpper, type MatchingStatus as MatchingStatusType } from '@/lib/api';

export type RequestTab = 'received' | 'sent' | 'matched';

/** 매칭 상태 → 사용자에게 보일 한 단어 라벨 + 배지 톤 (모노크롬 유지) */
export function statusMeta(status: MatchingStatusType): { label: string; className: string } {
  switch (status) {
    case MatchingStatus.PENDING:
      return { label: '응답 대기중', className: 'bg-black/5 text-black/50' };
    case MatchingStatus.ACCEPTED_BY_RECEIVER:
      return { label: '수락함', className: 'bg-black text-white' };
    case MatchingStatus.CONSENT_PENDING:
      return { label: '당사자 동의 대기', className: 'bg-black/5 text-black/50' };
    case MatchingStatus.CONSENT_PARTIALLY_APPROVED:
      return { label: '동의 진행중', className: 'bg-black/5 text-black/50' };
    case MatchingStatus.MATCHED:
      return { label: '성사됨', className: 'bg-black text-white' };
    case MatchingStatus.REJECTED_BY_RECEIVER:
      return { label: '거절함', className: 'bg-black/10 text-black/40' };
    case MatchingStatus.CONSENT_REJECTED:
      return { label: '무산됨', className: 'bg-black/10 text-black/40' };
    case MatchingStatus.CANCELLED:
      return { label: '취소함', className: 'bg-black/10 text-black/40' };
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
  if (!iso) return null;
  const until = new Date(iso);
  if (Number.isNaN(until.getTime())) return null;
  const ms = until.getTime() - Date.now();
  if (ms <= 0) return '곧 만료돼요';
  const days = Math.floor(ms / 86_400_000);
  if (days >= 1) return `${days}일 안에 응답해 주세요`;
  const hours = Math.max(1, Math.floor(ms / 3_600_000));
  return `${hours}시간 안에 응답해 주세요`;
}
