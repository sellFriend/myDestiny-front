export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  OAUTH_CALLBACK: '/oauth2/callback',
  EXPLORE: '/explore',
  FRIENDS: '/friends',
  REQUESTS: '/requests',
  REGISTER: '/register',
  /** 주선자의 폼 숏링크. 친구(B)가 이 경로로 폼에 접근한다. (formUrl = `${origin}/form/{madamId}`) */
  FORM: '/form',
  /** 매물(친구)로 등록된 사용자가 서비스 진입 시 강제 이동되는 안내 페이지 (cross-role-block-guide.md) */
  BLOCKED: '/blocked',
} as const;
