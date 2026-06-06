// 도메인별 API 호출 함수 모음 (mydestiny-api-spec 5장 기준)
// 모든 함수는 공통 래퍼를 벗긴 data 만 반환한다.
import { apiClient, unwrap } from './client';
import { getAccessToken } from './tokenStore';
import type {
  Gender,
  ProfileStatus,
  ProfileVisibility,
} from './types';
import type {
  AcquaintanceDetail,
  CandidateConsent,
  CardDetail,
  CardSummary,
  ConsentApproveResponse,
  FollowStatus,
  FormPhoto,
  FormPrefillResponse,
  FormSubmitRequest,
  FormSubmitResponse,
  InvitationInfo,
  InviteLinkResponse,
  MatchingContact,
  MatchingCreateRequest,
  MatchingResponse,
  MeResponse,
  MyFormResponse,
  NotificationItem,
  PhoneVerifyResponse,
  ProfileCreateRequest,
  ProfileDetail,
  ProfileUpdateRequest,
  PublicProfile,
  RegistrantSummary,
  TokenResponse,
} from './models';

// ── 5.1 Auth ──────────────────────────────────────────
export const authApi = {
  refresh: (refreshToken: string) =>
    unwrap<TokenResponse>(
      apiClient.post('/api/auth/refresh', null, { headers: { 'X-Refresh-Token': refreshToken } }),
    ),
  logout: () => unwrap<null>(apiClient.post('/api/auth/logout')),
};

// ── 5.2 User ──────────────────────────────────────────
export const userApi = {
  me: () => unwrap<MeResponse>(apiClient.get('/api/users/me')),
  updateNickname: (nickname: string) =>
    unwrap<null>(apiClient.patch('/api/users/me/nickname', { nickname })),
};

// ── 5.3 Registrant ────────────────────────────────────
export const registrantApi = {
  list: () => unwrap<RegistrantSummary[]>(apiClient.get('/api/registrants')),
  get: (userId: string) => unwrap<RegistrantSummary>(apiClient.get(`/api/registrants/${userId}`)),
  following: (userId: string) =>
    unwrap<RegistrantSummary[]>(apiClient.get(`/api/registrants/${userId}/following`)),
  followers: (userId: string) =>
    unwrap<RegistrantSummary[]>(apiClient.get(`/api/registrants/${userId}/followers`)),
  updateBio: (bio: string) => unwrap<null>(apiClient.patch('/api/registrants/me/bio', { bio })),
};

// ── 5.4 Follow ────────────────────────────────────────
export const followApi = {
  follow: (userId: string) => unwrap<null>(apiClient.post(`/api/users/${userId}/follow`)),
  unfollow: (userId: string) => unwrap<null>(apiClient.delete(`/api/users/${userId}/follow`)),
  status: (userId: string) =>
    unwrap<FollowStatus>(apiClient.get(`/api/users/${userId}/follow-status`)),
};

// ── 5.5 Form ──────────────────────────────────────────
// 폼 조회는 public 이지만, 제출은 친구(B) 본인 인증(Bearer)이 필요하다. (폼_인증.pdf 2장)
// 마담 코드(madamId)는 path, B 의 accessToken 은 Authorization 헤더, 프로필 데이터는 body 로 분리해 전달한다.
export const formApi = {
  /**
   * 폼 링크 유효성 확인 + prefill 조회. Authorization 이 있으면(=친구 로그인 상태) 기존
   * 작성분(draft)을 함께 받아 폼을 미리 채운다. (친구_등록_거절_재수정요청 가이드 2장)
   */
  getForm: (madamId: string) => {
    const token = getAccessToken();
    return unwrap<FormPrefillResponse>(
      apiClient.get(
        `/form/${madamId}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
      ),
    );
  },
  submit: (madamId: string, body: FormSubmitRequest) =>
    unwrap<FormSubmitResponse>(
      apiClient.post(`/form/${madamId}`, body, {
        headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
      }),
    ),
  // ── 사진은 제출 응답의 uploadToken 으로 별도 관리한다. (form-photo-guide.md)
  // /form/** 은 client 의 PUBLIC_PATHS 라 인터셉터가 Authorization 을 생략한다.
  // 사진 API 는 백엔드가 accessToken 을 요구하므로 submit 처럼 헤더를 직접 넣는다.
  listPhotos: (uploadToken: string) =>
    unwrap<FormPhoto[]>(
      apiClient.get(`/form/${uploadToken}/photos`, {
        headers: { Authorization: `Bearer ${getAccessToken() ?? ''}` },
      }),
    ),
  uploadPhoto: (uploadToken: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return unwrap<FormPhoto>(
      apiClient.post(`/form/${uploadToken}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${getAccessToken() ?? ''}`,
        },
      }),
    );
  },
  replacePhoto: (uploadToken: string, photoId: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return unwrap<FormPhoto>(
      apiClient.put(`/form/${uploadToken}/photos/${photoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${getAccessToken() ?? ''}`,
        },
      }),
    );
  },
};

// ── 5.6 Acquaintance (주선자 친구 관리) ────────────────
// acquaintances→profiles 통합으로 URL 이 /api/profiles/** 로 이전됐다(클린 컷). 상세 조회는
// profileApi.get(ProfileDetail) 로 일원화하고, 여기엔 친구 관리 액션만 남긴다.
export const acquaintanceApi = {
  invite: () => unwrap<InviteLinkResponse>(apiClient.post('/api/profiles/invite')),
  /** 마담 본인의 폼 숏링크 조회 — 친구 추가 시 복사할 formUrl 을 반환한다. */
  myForm: () => unwrap<MyFormResponse>(apiClient.get('/api/profiles/my-form')),
  approve: (id: string) => unwrap<null>(apiClient.post(`/api/profiles/${id}/approve`)),
  reject: (id: string) => unwrap<null>(apiClient.post(`/api/profiles/${id}/reject`)),
  /**
   * 승인 대기(PENDING_APPROVAL) 카드에 폼 수정 요청 — 카드를 DRAFT 로 되돌리고
   * 친구에게 edit_requested 알림을 보낸다. (PENDING_APPROVAL 상태에서만 가능, 그 외 409)
   */
  requestEdit: (id: string) =>
    unwrap<null>(apiClient.post(`/api/profiles/${id}/request-edit`)),
};

// ── 5.7 Profile (DatingProfile) ───────────────────────
export const profileApi = {
  create: (body: ProfileCreateRequest) =>
    unwrap<ProfileDetail>(apiClient.post('/api/profiles', body)),
  // 통합 후 GET /api/profiles 는 주선자 친구 목록(AcquaintanceDetail[])을 반환한다.
  listMine: () => unwrap<AcquaintanceDetail[]>(apiClient.get('/api/profiles')),
  listPublic: (params?: { registrantId?: string; gender?: Gender }) =>
    unwrap<PublicProfile[]>(
      apiClient.get('/api/profiles/public', {
        params: {
          ...(params?.registrantId ? { registrantId: params.registrantId } : {}),
          ...(params?.gender ? { gender: params.gender } : {}),
        },
      }),
    ),
  get: (id: string) => unwrap<ProfileDetail>(apiClient.get(`/api/profiles/${id}`)),
  update: (id: string, body: ProfileUpdateRequest) =>
    unwrap<ProfileDetail>(apiClient.patch(`/api/profiles/${id}`, body)),
  remove: (id: string) => unwrap<null>(apiClient.delete(`/api/profiles/${id}`)),
  uploadPhoto: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return unwrap<string>(
      apiClient.post(`/api/profiles/${id}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },
  deletePhoto: (id: string, photoId: string) =>
    unwrap<null>(apiClient.delete(`/api/profiles/${id}/photos/${photoId}`)),
  setVisibility: (id: string, visibility: ProfileVisibility) =>
    unwrap<null>(apiClient.patch(`/api/profiles/${id}/visibility`, null, { params: { visibility } })),
  report: (id: string, reason: string) =>
    unwrap<null>(apiClient.post(`/api/profiles/${id}/reports`, { reason })),
};

// ── 5.8 Invitation (당사자 승인 흐름) ──────────────────
export const invitationApi = {
  create: (profileId: string) =>
    unwrap<InviteLinkResponse>(apiClient.post(`/api/profiles/${profileId}/invite`)),
  info: (token: string) => unwrap<InvitationInfo>(apiClient.get(`/api/invitations/${token}`)),
  myProfile: (token: string) =>
    unwrap<ProfileDetail>(apiClient.get(`/api/invitations/${token}/profile`)),
  updateProfile: (token: string, body: ProfileUpdateRequest) =>
    unwrap<ProfileDetail>(apiClient.patch(`/api/invitations/${token}/profile`, body)),
  consent: (token: string) => unwrap<null>(apiClient.post(`/api/invitations/${token}/consent`)),
  approve: (token: string) =>
    unwrap<ProfileDetail>(apiClient.post(`/api/invitations/${token}/approve`)),
  reject: (token: string, reason?: string) =>
    unwrap<null>(apiClient.post(`/api/invitations/${token}/reject`, reason ? { reason } : {})),
};

// ── 5.9 Card ──────────────────────────────────────────
export const cardApi = {
  list: () => unwrap<CardSummary[]>(apiClient.get('/api/cards')),
  get: (id: string) => unwrap<CardDetail>(apiClient.get(`/api/cards/${id}`)),
};

// ── 5.10 Matching ─────────────────────────────────────
export const matchingApi = {
  create: (body: MatchingCreateRequest) =>
    unwrap<MatchingResponse>(apiClient.post('/api/matchings', body)),
  sent: () => unwrap<MatchingResponse[]>(apiClient.get('/api/matchings/sent')),
  received: () => unwrap<MatchingResponse[]>(apiClient.get('/api/matchings/received')),
  matched: () => unwrap<MatchingResponse[]>(apiClient.get('/api/matchings/matched')),
  get: (id: string) => unwrap<MatchingResponse>(apiClient.get(`/api/matchings/${id}`)),
  accept: (id: string) => unwrap<MatchingResponse>(apiClient.post(`/api/matchings/${id}/accept`)),
  reject: (id: string, reason?: string) =>
    unwrap<MatchingResponse>(apiClient.post(`/api/matchings/${id}/reject`, reason ? { reason } : {})),
  cancel: (id: string) => unwrap<null>(apiClient.post(`/api/matchings/${id}/cancel`)),
  contact: (id: string) => unwrap<MatchingContact>(apiClient.get(`/api/matchings/${id}/contact`)),
};

// ── 5.11 Candidate Consent ────────────────────────────
export const consentApi = {
  pending: () => unwrap<CandidateConsent[]>(apiClient.get('/api/candidate-consents/pending')),
  approve: (id: string) =>
    unwrap<ConsentApproveResponse>(apiClient.post(`/api/candidate-consents/${id}/approve`)),
  reject: (id: string) => unwrap<null>(apiClient.post(`/api/candidate-consents/${id}/reject`)),
};

// ── 5.12 Phone Verification ───────────────────────────
export const phoneApi = {
  send: (phoneNumber: string) =>
    unwrap<null>(apiClient.post('/api/phone-verifications/send', { phoneNumber })),
  verify: (phoneNumber: string, code: string) =>
    unwrap<PhoneVerifyResponse>(apiClient.post('/api/phone-verifications/verify', { phoneNumber, code })),
};

// ── 5.13 Notification ─────────────────────────────────
export const notificationApi = {
  list: () => unwrap<NotificationItem[]>(apiClient.get('/api/notifications')),
  markRead: (id: string) => unwrap<null>(apiClient.patch(`/api/notifications/${id}/read`)),
};

// ── 5.14 Block ────────────────────────────────────────
export const blockApi = {
  block: (acquaintanceId: string) => unwrap<null>(apiClient.post('/api/blocks', { acquaintanceId })),
  unblock: (acquaintanceId: string) =>
    unwrap<null>(apiClient.delete(`/api/blocks/${acquaintanceId}`)),
};

// ── 5.15 Admin ────────────────────────────────────────
export const adminApi = {
  profiles: (status?: ProfileStatus) =>
    unwrap<unknown[]>(apiClient.get('/api/admin/profiles', { params: status ? { status } : undefined })),
  suspendProfile: (id: string) => unwrap<null>(apiClient.patch(`/api/admin/profiles/${id}/suspend`)),
  reviewProfile: (id: string, approved: boolean, reason?: string) =>
    unwrap<ProfileDetail>(apiClient.patch(`/api/admin/profiles/${id}/review`, { approved, reason })),
  reports: (status?: string) =>
    unwrap<unknown[]>(apiClient.get('/api/admin/reports', { params: status ? { status } : undefined })),
  updateReport: (id: string, status: string, memo?: string) =>
    unwrap<unknown>(apiClient.patch(`/api/admin/reports/${id}`, { status, memo })),
  matchings: (status?: string) =>
    unwrap<unknown[]>(apiClient.get('/api/admin/matchings', { params: status ? { status } : undefined })),
};
