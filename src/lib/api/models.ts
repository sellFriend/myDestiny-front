// API 요청/응답 DTO 타입 (mydestiny-api-spec 기준)
import type {
  ConsentStatus,
  Gender,
  GenderUpper,
  MatchingStatus,
  NotificationType,
  ProfileStatus,
  ProfileVisibility,
  UserRole,
} from './types';

// ── Auth ──────────────────────────────────────────────
export interface TokenResponse {
  accessToken: string;
  refreshToken: string | null;
}

// ── User ──────────────────────────────────────────────
export interface MeResponse {
  id: string;
  email: string | null;
  nickname: string;
  role: UserRole;
  phoneVerified: boolean;
  maskedPhone: string | null;
}

// ── Registrant ────────────────────────────────────────
export interface RegistrantSummary {
  id: string;
  nickname: string;
  bio: string | null;
  publishedProfileCount: number;
  followerCount: number;
  isFollowing: boolean;
}

// ── Follow ────────────────────────────────────────────
export interface FollowStatus {
  following: boolean;
  mutual: boolean;
  followerCount: number;
  followingCount: number;
}

// ── Form ──────────────────────────────────────────────
// 폼 제출은 친구(B) 본인 인증(Bearer)으로 처리한다. (폼_인증.pdf 2장)
// 필수: name, age, phoneNumber / 나머지는 옵션.
export interface FormSubmitRequest {
  /** 카카오 프로필 사진을 그대로 쓸지 여부 (false면 직접 올린 사진 사용) */
  useKakaoPhoto?: boolean;
  name: string;
  age: number;
  /** 서버는 대문자 enum 을 받는다. (폼_인증.pdf 2장: "MALE") */
  gender?: GenderUpper | null;
  job?: string | null;
  intro?: string | null;
  mbti?: string | null;
  hobbies?: string | null;
  phoneNumber: string;
  email?: string | null;
  kakaoId?: string | null;
  instagramId?: string | null;
}

export interface FormSubmitResponse {
  acquaintanceId: string;
  /** 사진 업로드 단계에서 쓰는 토큰. 사진은 madamId 가 아닌 이 토큰으로 관리한다. (form-photo-guide.md) */
  uploadToken: string;
  /** 제출 직후 상태. 통합 후 PENDING_APPROVAL(승인 대기)로 내려온다. */
  status: ProfileStatus;
}

/** 폼 사진 한 장. displayOrder 오름차순으로 정렬된다. */
export interface FormPhoto {
  id: string;
  url: string;
  displayOrder: number;
}

/**
 * GET /form/{madamId} 의 prefill 데이터. 친구가 같은 마담 폼에 다시 들어오면
 * 기존 작성분(DRAFT/PENDING_APPROVAL)을 채워 내려준다. (친구_등록_거절_재수정요청 가이드 2장)
 * 본인 폼·거절·승인 완료(PUBLISHED)·로그인 안 됨 → null.
 */
export interface FormDraft {
  acquaintanceId: string;
  uploadToken: string;
  status: ProfileStatus;
  name: string;
  age: number;
  /** 서버는 소문자 gender 를 내려준다. ("female") */
  gender: Gender | null;
  job: string | null;
  intro: string | null;
  mbti: string | null;
  hobbies: string | null;
  phoneNumber: string | null;
  kakaoId: string | null;
  instagramId: string | null;
  photoUrls: string[];
}

/** GET /form/{madamId} 응답. draft 가 객체면 기존 작성분 prefill, null 이면 빈 폼. */
export interface FormPrefillResponse {
  draft: FormDraft | null;
}

// ── Acquaintance ──────────────────────────────────────
export interface InviteLinkResponse {
  formUrl: string;
  expiresAt: string;
}

/**
 * GET /api/profiles/my-form 응답: 마담 본인의 폼 숏링크.
 * formUrl 끝의 UUID 가 마담 식별 코드(=madamId, 카카오 로그인 시의 userId)다.
 */
export interface MyFormResponse {
  formUrl: string;
}

/**
 * GET /api/profiles 응답 항목 = 주선자 친구 목록 카드.
 * (마이그레이션 후 /api/profiles 가 ProfileSummary[] 대신 이 목록을 반환한다.)
 */
export interface AcquaintanceDetail {
  id: string;
  name: string;
  age: number;
  gender: Gender | null;
  job: string | null;
  intro: string | null;
  mbti: string | null;
  hobbies: string | null;
  /** ProfileStatus — DRAFT / PENDING_APPROVAL(승인 대기) / PUBLISHED(승인 완료) 등 */
  registrationStatus: ProfileStatus;
  /** 승인(PUBLISHED) 시각. 미승인 시 null */
  verifiedAt: string | null;
  photoUrls: string[];
}

// ── Profile (DatingProfile) ───────────────────────────
export interface ProfileCreateRequest {
  name: string;
  age: number;
  gender?: Gender | null;
  isStudent: boolean;
  schoolName?: string | null;
  major?: string | null;
  occupation?: string | null;
  mbti?: string | null;
  hobby?: string | null;
  introduction?: string | null;
  subjectPhone: string;
  kakaoId?: string | null;
  instagramId?: string | null;
}

export type ProfileUpdateRequest = Partial<Omit<ProfileCreateRequest, 'subjectPhone'>>;

export interface ProfileSummary {
  id: string;
  name: string;
  status: ProfileStatus;
  visibility: ProfileVisibility;
  firstPhotoUrl: string | null;
  createdAt: string;
}

/** 공개 프로필 목록 항목 (연락처 미포함) */
export interface PublicProfile {
  id: string;
  name: string;
  age: number;
  gender: Gender | null;
  isStudent: boolean;
  schoolName: string | null;
  major: string | null;
  occupation: string | null;
  mbti: string | null;
  hobby: string | null;
  introduction: string | null;
  firstPhotoUrl: string | null;
}

export interface ProfileDetail {
  id: string;
  registrantId: string;
  registrantNickname: string;
  status: ProfileStatus;
  name: string;
  age: number;
  gender: Gender | null;
  isStudent: boolean;
  schoolName: string | null;
  major: string | null;
  occupation: string | null;
  mbti: string | null;
  hobby: string | null;
  introduction: string | null;
  kakaoId: string | null; // 등록자 본인만, 그 외 null
  instagramId: string | null; // 등록자 본인만, 그 외 null
  subjectPhone: string | null; // 등록자 본인만, 그 외 null
  photoUrls: string[];
  createdAt: string;
  updatedAt: string;
}

// ── Invitation ────────────────────────────────────────
export interface InvitationInfo {
  profileId: string;
  registrantNickname: string;
  subjectName: string;
  status: ProfileStatus;
}

// ── Card ──────────────────────────────────────────────
export interface CardSummary {
  id: string;
  name: string;
  age: number;
  gender: Gender | null;
  mbti: string | null;
  thumbnail: string | null;
}

export interface CardDetail {
  id: string;
  name: string;
  age: number;
  gender: Gender | null;
  job: string | null;
  intro: string | null;
  mbti: string | null;
  hobbies: string | null;
  photoUrls: string[];
}

// ── Matching ──────────────────────────────────────────
export interface MatchingProfileRef {
  id: string;
  name: string;
  gender: GenderUpper;
  /**
   * 대표 썸네일. 요청함 카드/상세의 아바타·사진에 사용한다.
   * TODO(API): 백엔드 매칭 응답의 프로필 ref에 추가 요청됨. 도착 전까지는 이니셜 폴백.
   */
  photoUrl?: string | null;
}

export interface MatchingCreateRequest {
  requesterProfileId: string;
  targetProfileId: string;
  message?: string | null;
}

export interface MatchingResponse {
  id: string;
  requesterProfile: MatchingProfileRef;
  targetProfile: MatchingProfileRef;
  requesterNickname: string;
  receiverNickname: string;
  status: MatchingStatus;
  message: string | null;
  rejectReason: string | null;
  createdAt: string;
  receiverRespondedAt: string | null;
  receiverExpiresAt: string | null;
}

export interface MatchingContact {
  name: string;
  kakaoId: string | null;
  instagramId: string | null;
}

// ── Candidate Consent ─────────────────────────────────
export interface CandidateConsent {
  id: string;
  matchingId: string;
  myProfile: MatchingProfileRef;
  counterpartProfile: MatchingProfileRef;
  requesterNickname: string;
  receiverNickname: string;
  status: ConsentStatus;
  expiresAt: string;
  createdAt: string;
}

export interface ConsentApproveResponse {
  consentStatus: ConsentStatus;
  matchingStatus: MatchingStatus;
}

// ── Phone Verification ────────────────────────────────
export interface PhoneVerifyResponse {
  profileId: string;
  newStatus: Extract<ProfileStatus, 'PENDING_APPROVAL' | 'REVIEW_REQUIRED'>;
}

// ── Notification ──────────────────────────────────────
export interface NotificationItem {
  id: string;
  type: NotificationType;
  matchingId: string | null;
  consentId: string | null;
  isRead: boolean;
  createdAt: string;
}
