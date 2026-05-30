import { useState, useEffect, useCallback, useRef } from "react";

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

export type FetchStatus = "loading" | "success" | "error";
export type ErrorType = "timeout" | "network" | "server";

const TUTORIAL_COOKIE = "madam_tutorial_seen";
const FETCH_TIMEOUT_MS = 10_000;

// 남은 카드가 이 수 이하가 되면 다음 배치를 백그라운드에서 붙여 넣음.
// 유저가 카드 한 장당 0.3s씩 스와이프 한다고 가정할 때
// threshold * 0.3s > API 응답시간이면 빈 화면이 생기지 않는다.
const PREFETCH_THRESHOLD = 3;

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

const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    name: "김지우",
    age: 27,
    isStudent: false,
    occupation: "디자이너",
    mbti: "ENFP",
    hobbies: ["여행", "사진", "카페투어"],
    intro: "여행과 사진을 좋아하는 자유로운 영혼. 주말엔 항상 어딘가에 있어요.",
    contact: "@jiwoo.k",
    cardColor: "bg-pastel-lime",
  },
  {
    id: "2",
    name: "박서준",
    age: 29,
    isStudent: false,
    occupation: "개발자",
    mbti: "INTJ",
    hobbies: ["독서", "음악", "영화"],
    intro: "조용하지만 깊은 대화를 좋아합니다. 책과 음악이 일상의 전부예요.",
    contact: "010-1234-5678",
    cardColor: "bg-pastel-lilac",
  },
  {
    id: "3",
    name: "이소연",
    age: 26,
    isStudent: true,
    school: "연세대학교",
    major: "경영학과",
    mbti: "ESFJ",
    hobbies: ["요리", "운동", "SNS"],
    intro: "에너지 넘치는 경영학도. 새로운 사람 만나는 걸 좋아해요!",
    contact: "@soyeon.lee",
    cardColor: "bg-pastel-mint",
  },
  {
    id: "4",
    name: "최민준",
    age: 30,
    isStudent: false,
    occupation: "의사",
    mbti: "ISFP",
    hobbies: ["등산", "요가", "독서"],
    intro: "바쁜 일상 속에서도 소소한 행복을 찾는 편이에요.",
    contact: "010-9876-5432",
    cardColor: "bg-pastel-coral",
  },
  {
    id: "5",
    name: "한예진",
    age: 25,
    isStudent: true,
    school: "서울대학교",
    major: "국어국문학과",
    mbti: "INFJ",
    hobbies: ["글쓰기", "고양이", "카페"],
    intro: "글 쓰는 것을 좋아하고 고양이 두 마리와 살아요.",
    contact: "@yejin_h",
    cardColor: "bg-pastel-cream",
  },
];

// 실제 API 연결 시 이 함수만 교체하면 된다.
// TODO: Replace with real API call (e.g. GET /api/profiles?cursor=xxx)
let _mockBatch = 0;
async function fetchProfilesFromApi(): Promise<Profile[]> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 실제 API가 더 이상 데이터 없으면 [] 반환 → hasMore = false
  // Mock은 무한 배치를 시뮬레이션하기 위해 배치마다 고유 id를 붙인다.
  _mockBatch++;
  return MOCK_PROFILES.map((p) => ({ ...p, id: `${_mockBatch}-${p.id}` }));
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms),
  );
  return Promise.race([promise, timeout]);
}

function toErrorType(err: unknown): ErrorType {
  const msg = err instanceof Error ? err.message : "";
  if (msg === "timeout") return "timeout";
  if (msg === "server") return "server";
  return "network";
}

export function useSwipeCards() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [status, setStatus] = useState<FetchStatus>("loading");
  const [errorType, setErrorType] = useState<ErrorType | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showTutorial, setShowTutorial] = useState(
    () => !hasTutorialBeenSeen(),
  );

  // 동시에 여러 번 프리패치가 실행되지 않도록 방지
  const isFetchingNextRef = useRef(false);

  // 다음 배치를 현재 스택 뒤에 조용히 붙여 넣는다.
  // profiles 가 0 에 닿을 일이 없어 빈 화면 / 깜빡임이 발생하지 않는다.
  const appendNextBatch = useCallback(async () => {
    if (isFetchingNextRef.current) return;
    isFetchingNextRef.current = true;
    try {
      const data = await withTimeout(fetchProfilesFromApi(), FETCH_TIMEOUT_MS);
      if (data.length === 0) {
        setHasMore(false);
        return;
      }
      setProfiles((prev) => [...prev, ...data]);
    } catch {
      // 프리패치 실패는 조용히 넘긴다.
      // profiles 가 바닥났을 때 아래 엣지 케이스 effect 가 처리한다.
    } finally {
      isFetchingNextRef.current = false;
    }
  }, []);

  // 초기(또는 retry) 로드
  const loadProfiles = useCallback(async () => {
    isFetchingNextRef.current = false;
    setHasMore(true);
    setStatus("loading");
    setErrorType(null);
    try {
      const data = await withTimeout(fetchProfilesFromApi(), FETCH_TIMEOUT_MS);
      if (data.length === 0) setHasMore(false);
      setProfiles(data);
      setStatus("success");
    } catch (err) {
      setErrorType(toErrorType(err));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  // 남은 카드가 threshold 이하가 되면 다음 배치 append 시작
  useEffect(() => {
    if (
      status === "success" &&
      hasMore &&
      profiles.length > 0 &&
      profiles.length <= PREFETCH_THRESHOLD
    ) {
      appendNextBatch();
    }
  }, [profiles.length, status, hasMore, appendNextBatch]);

  // 엣지 케이스: 프리패치 실패 등으로 profiles 가 0 에 도달한 경우
  useEffect(() => {
    if (profiles.length > 0 || status !== "success" || showTutorial || !hasMore) return;
    loadProfiles();
  }, [profiles.length, status, showTutorial, hasMore, loadProfiles]);

  const swipeProfile = useCallback((profileId: string) => {
    setProfiles((prev) => {
      if (prev[0]?.id !== profileId) return prev;
      return prev.slice(1);
    });
  }, []);

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
    selectedProfile,
    showTutorial,
    swipeProfile,
    swipeTutorial,
    openDetail,
    closeDetail,
    refetch: loadProfiles,
  };
}
