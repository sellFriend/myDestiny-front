import { useState } from "react";

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

const TUTORIAL_COOKIE = "madam_tutorial_seen";

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

export function useSwipeCards() {
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [showTutorial, setShowTutorial] = useState(
    () => !hasTutorialBeenSeen(),
  );

  const swipeProfile = (profileId: string) => {
    setProfiles((prev) => {
      if (prev[0]?.id !== profileId) {
        return prev;
      }

      return prev.slice(1);
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
    selectedProfile,
    showTutorial,
    swipeProfile,
    swipeTutorial,
    openDetail,
    closeDetail,
  };
}
