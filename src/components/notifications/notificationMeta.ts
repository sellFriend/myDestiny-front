import { NotificationType, type NotificationItem, type NotificationType as NType } from '@/lib/api';

/** 알림 타입 → 사용자에게 보일 제목/설명 (모노크롬 UI 톤 유지) */
export function notificationMeta(type: NType): { title: string; desc: string } {
  switch (type) {
    case NotificationType.FORM_SUBMITTED:
      return { title: '지인이 폼을 제출했어요', desc: '내용을 확인하고 승인 또는 거절해 주세요' };
    case NotificationType.MATCH_REQUEST:
      return { title: '새로운 매칭 요청이 왔어요', desc: '받은 요청에서 확인해 주세요' };
    case NotificationType.MATCH_ACCEPTED:
      return { title: '매칭 요청이 수락됐어요', desc: '진행 상황을 확인해 보세요' };
    case NotificationType.MATCH_REJECTED:
      return { title: '매칭 요청이 거절됐어요', desc: '다른 인연을 찾아보세요' };
    case NotificationType.MATCHED:
      return { title: '매칭이 성사됐어요!', desc: '연락처를 확인할 수 있어요' };
    case NotificationType.MATCH_CONSENT_REQUESTED:
      return { title: '당사자 동의 요청이 왔어요', desc: '요청함에서 확인해 주세요' };
    case NotificationType.MATCH_COUNTERPART_CONSENTED:
      return { title: '상대 당사자가 동의했어요', desc: '진행 상황을 확인해 보세요' };
    case NotificationType.MATCH_CONSENT_REJECTED:
      return { title: '당사자 동의가 거절됐어요', desc: '이번 인연은 무산됐어요' };
    case NotificationType.VERIFICATION_DONE:
      return { title: '본인 인증이 완료됐어요', desc: '프로필이 공개 준비됐어요' };
    case NotificationType.ACQUAINTANCE_BLOCKED:
      return { title: '지인이 차단됐어요', desc: '지인 관리 목록에서 제외됐어요' };
    case NotificationType.MATCH_REQUEST_EXPIRED:
      return { title: '매칭 요청 기한이 만료됐어요', desc: '응답 기한이 지났어요' };
    case NotificationType.MATCH_CONSENT_EXPIRED:
      return { title: '당사자 동의 기한이 만료됐어요', desc: '동의 기한이 지났어요' };
    case NotificationType.MATCH_CANCELLED:
      return { title: '매칭 요청이 취소됐어요', desc: '상대가 다른 분과 매칭됐어요' };
    case NotificationType.MATCH_RELEASED:
      return { title: '성사된 매칭이 취소됐어요', desc: '상대가 매칭을 취소했어요' };
    default:
      return { title: '새로운 알림이 있어요', desc: '확인해 주세요' };
  }
}

/** form_submitted 알림은 matchingId 필드에 acquaintanceId 값이 담긴다 (서버 동일 컬럼 사용). */
export function isFormSubmitted(n: NotificationItem): boolean {
  return n.type === NotificationType.FORM_SUBMITTED;
}

/** form_submitted 알림에서 지인 ID(acquaintanceId) 추출 */
export function acquaintanceIdOf(n: NotificationItem): string | null {
  return isFormSubmitted(n) ? n.matchingId : null;
}

/** createdAt(ISO) → "방금" / "n분 전" / "n시간 전" / "n일 전" / "M월 D일" */
export function timeAgo(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return '';
  const diff = Date.now() - then.getTime();
  if (diff < 60_000) return '방금';
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${then.getMonth() + 1}월 ${then.getDate()}일`;
}
