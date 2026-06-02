// react-query 쿼리 키 팩토리 — 무효화 일관성을 위해 한 곳에서 관리한다.
export const queryKeys = {
  me: ['me'] as const,

  registrants: {
    all: ['registrants'] as const,
    detail: (userId: string) => ['registrants', userId] as const,
    following: (userId: string) => ['registrants', userId, 'following'] as const,
    followers: (userId: string) => ['registrants', userId, 'followers'] as const,
  },

  followStatus: (userId: string) => ['follow-status', userId] as const,

  profiles: {
    mine: ['profiles', 'mine'] as const,
    public: (registrantId?: string) => ['profiles', 'public', registrantId ?? 'all'] as const,
    detail: (id: string) => ['profiles', id] as const,
  },

  acquaintances: {
    detail: (id: string) => ['acquaintances', id] as const,
  },

  invitations: {
    info: (token: string) => ['invitations', token] as const,
    myProfile: (token: string) => ['invitations', token, 'profile'] as const,
  },

  cards: {
    all: ['cards'] as const,
    detail: (id: string) => ['cards', id] as const,
  },

  matchings: {
    sent: ['matchings', 'sent'] as const,
    received: ['matchings', 'received'] as const,
    matched: ['matchings', 'matched'] as const,
    detail: (id: string) => ['matchings', id] as const,
    contact: (id: string) => ['matchings', id, 'contact'] as const,
  },

  consents: {
    pending: ['consents', 'pending'] as const,
  },

  notifications: ['notifications'] as const,
} as const;
