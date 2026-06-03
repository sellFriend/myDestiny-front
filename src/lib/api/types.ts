// 공통 API 응답 형식 및 도메인 enum 정의 (mydestiny-api-spec 기준)

/** 모든 API 공통 응답 래퍼 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** 인증 실패 등 일부 에러에서 반환되는 형식 */
export interface ApiErrorBody {
  status?: number;
  error?: string;
  message: string;
  success?: false;
  data?: null;
}

export type Gender = 'male' | 'female' | 'other';
/** 매칭/상세 응답 등 일부 엔드포인트는 대문자 gender 를 사용 */
export type GenderUpper = 'MALE' | 'FEMALE' | 'OTHER';

export type UserRole = 'USER' | 'ADMIN';

export const ProfileStatus = {
  DRAFT: 'DRAFT',
  INVITED: 'INVITED',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  PUBLISHED: 'PUBLISHED',
  REJECTED: 'REJECTED',
  REPORTED: 'REPORTED',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
} as const;
export type ProfileStatus = (typeof ProfileStatus)[keyof typeof ProfileStatus];

export const ProfileVisibility = {
  PUBLIC: 'PUBLIC',
  FOLLOWERS_ONLY: 'FOLLOWERS_ONLY',
  PRIVATE: 'PRIVATE',
} as const;
export type ProfileVisibility = (typeof ProfileVisibility)[keyof typeof ProfileVisibility];

export const MatchingStatus = {
  PENDING: 'PENDING',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REJECTED_BY_RECEIVER: 'REJECTED_BY_RECEIVER',
  ACCEPTED_BY_RECEIVER: 'ACCEPTED_BY_RECEIVER',
  CONSENT_PENDING: 'CONSENT_PENDING',
  CONSENT_PARTIALLY_APPROVED: 'CONSENT_PARTIALLY_APPROVED',
  CONSENT_REJECTED: 'CONSENT_REJECTED',
  CONSENT_EXPIRED: 'CONSENT_EXPIRED',
  MATCHED: 'MATCHED',
} as const;
export type MatchingStatus = (typeof MatchingStatus)[keyof typeof MatchingStatus];

export const ConsentStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
} as const;
export type ConsentStatus = (typeof ConsentStatus)[keyof typeof ConsentStatus];

export const RegistrationStatus = {
  DRAFT: 'draft',
  VERIFICATION_PENDING: 'verification_pending',
  VERIFIED: 'verified',
} as const;
export type RegistrationStatus = (typeof RegistrationStatus)[keyof typeof RegistrationStatus];

export const NotificationType = {
  FORM_SUBMITTED: 'form_submitted',
  MATCH_REQUEST: 'match_request',
  MATCH_ACCEPTED: 'match_accepted',
  MATCH_REJECTED: 'match_rejected',
  VERIFICATION_DONE: 'verification_done',
  ACQUAINTANCE_BLOCKED: 'acquaintance_blocked',
  MATCH_CONSENT_REQUESTED: 'match_consent_requested',
  MATCH_COUNTERPART_CONSENTED: 'match_counterpart_consented',
  MATCH_CONSENT_REJECTED: 'match_consent_rejected',
  MATCHED: 'matched',
  MATCH_REQUEST_EXPIRED: 'match_request_expired',
  MATCH_CONSENT_EXPIRED: 'match_consent_expired',
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];
