// API 요청/응답 DTO 타입 (mydestiny-api-spec 기준)
import type {
  ConsentStatus,
  Gender,
  GenderUpper,
  MatchingStatus,
  NotificationType,
  ProfileStatus,
  ProfileVisibility,
  RegistrationStatus,
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

// ── Form (public) ─────────────────────────────────────
export interface FormSubmitRequest {
  name: string;
  age: number;
  gender?: Gender | null;
  job?: string | null;
  intro?: string | null;
  mbti?: string | null;
  hobbies?: string | null;
  phoneNumber: string;
  email: string;
  kakaoId?: string | null;
  instagramId?: string | null;
}

export interface FormSubmitResponse {
  acquaintanceId: string;
  status: RegistrationStatus;
}

// ── Acquaintance ──────────────────────────────────────
export interface InviteLinkResponse {
  formUrl: string;
  expiresAt: string;
}

export interface AcquaintanceDetail {
  id: string;
  name: string;
  age: number;
  gender: Gender | null;
  job: string | null;
  intro: string | null;
  mbti: string | null;
  hobbies: string | null;
  registrationStatus: RegistrationStatus;
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
