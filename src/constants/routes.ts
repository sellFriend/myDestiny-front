export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  OAUTH_CALLBACK: '/oauth2/callback',
  EXPLORE: '/explore',
  FRIENDS: '/friends',
  REQUESTS: '/requests',
  REGISTER: '/register',
  /** 마담의 폼 숏링크. 친구(B)가 이 경로로 폼에 접근한다. (formUrl = `${origin}/form/{madamId}`) */
  FORM: '/form',
} as const;
