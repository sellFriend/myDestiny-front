import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profileApi, queryKeys, ApiError, type Gender, type PublicProfile } from '@/lib/api';

export interface Profile {
  id: string;
  name: string;
  age: number;
  isStudent: boolean;
  school?: string;
  major?: string;
  occupation?: string;
  mbti: string;
  hobbies: string[];
  intro: string;
  contact: string;
  photo?: string;
  cardColor: string;
}

export type FetchStatus = 'loading' | 'success' | 'error';
export type ErrorType = 'timeout' | 'network' | 'server';

const TUTORIAL_COOKIE = 'madam_tutorial_seen';

const CARD_COLORS = [
  'bg-pastel-lime',
  'bg-pastel-lilac',
  'bg-pastel-mint',
  'bg-pastel-coral',
  'bg-pastel-cream',
  'bg-pastel-pink',
] as const;

function hasTutorialBeenSeen(): boolean {
  try {
    return document.cookie.includes(`${TUTORIAL_COOKIE}=1`);
  } catch {
    return false;
  }
}

function markTutorialSeen() {
  try {
    document.cookie = `${TUTORIAL_COOKIE}=1; max-age=31536000; path=/`;
  } catch {
    // ignore
  }
}

/** URL 쿼리의 gender 값을 허용된 값으로만 좁힌다. (그 외/없음은 무시) */
function parseGenderParam(raw: string | null): Gender | undefined {
  if (raw === 'male' || raw === 'female') return raw;
  return undefined;
}

/** 콤마/슬래시로 구분된 취미 문자열을 태그 배열로 변환 */
function parseHobbies(hobby: string | null): string[] {
  if (!hobby) return [];
  return hobby
    .split(/[,/·]/)
    .map((h) => h.trim())
    .filter(Boolean);
}

function toProfile(item: PublicProfile, index: number): Profile {
  return {
    id: item.id,
    name: item.name,
    age: item.age,
    isStudent: item.isStudent,
    school: item.schoolName ?? undefined,
    major: item.major ?? undefined,
    occupation: item.occupation ?? undefined,
    mbti: item.mbti ?? '',
    hobbies: parseHobbies(item.hobby),
    intro: item.introduction ?? '',
    contact: '',
    photo: item.firstPhotoUrl ?? undefined,
    cardColor: CARD_COLORS[index % CARD_COLORS.length],
  };
}

/** react-query 에러를 SwipeCardStack이 구분하는 에러 타입으로 변환 */
function toErrorType(err: unknown): ErrorType {
  if (err instanceof ApiError && (err.status ?? 0) >= 500) return 'server';
  return 'network';
}

export function useSwipeCards(enabled = true) {
  const [searchParams] = useSearchParams();
  // URL의 ?gender=male|female 를 추천 목록 필터로 그대로 활용한다.
  const gender = parseGenderParam(searchParams.get('gender'));

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.profiles.public({ gender }),
    queryFn: () => profileApi.listPublic({ gender }),
    enabled,
  });

  const [swipedIds, setSwipedIds] = useState<Set<string>>(new Set());
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showTutorial, setShowTutorial] = useState(() => !hasTutorialBeenSeen());

  // 성별 필터가 바뀌면 새 목록을 처음부터 보여준다.
  // (이전 필터에서 스와이프한 기록이 남으면 새로 받은 카드가 걸러져 빈 화면이 된다)
  useEffect(() => {
    setSwipedIds(new Set());
    setSelectedProfile(null);
  }, [gender]);

  const profiles = useMemo(() => {
    const mapped = (data ?? []).map(toProfile);
    return mapped.filter((p) => !swipedIds.has(p.id));
  }, [data, swipedIds]);

  // dev의 SwipeCardStack은 status/errorType/hasMore로 로딩·에러·빈 화면을 그린다.
  // react-query 상태를 거기에 맞게 매핑한다.
  const status: FetchStatus = isLoading ? 'loading' : isError ? 'error' : 'success';
  const errorType: ErrorType | null = isError ? toErrorType(error) : null;
  // listPublic은 전체 추천 목록을 한 번에 반환하므로 추가 배치(prefetch)가 없다.
  const hasMore = false;

  const swipeProfile = (profileId: string) => {
    setSwipedIds((prev) => {
      if (prev.has(profileId)) return prev;
      const next = new Set(prev);
      next.add(profileId);
      return next;
    });
  };

  const swipeTutorial = () => {
    markTutorialSeen();
    setShowTutorial(false);
  };

  const openDetail = (profile: Profile) => setSelectedProfile(profile);
  const closeDetail = () => setSelectedProfile(null);

  return {
    profiles,
    hasMore,
    status,
    errorType,
    isLoading,
    isError,
    selectedProfile,
    showTutorial,
    swipeProfile,
    swipeTutorial,
    openDetail,
    closeDetail,
    refetch,
  };
}
