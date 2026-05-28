import { useState } from 'react';

export interface Profile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  mbti: string;
  intro: string;
  tags: string[];
  cardColor: string;
}

const MOCK_PROFILES: Profile[] = [
  {
    id: '1',
    name: '김지우',
    age: 27,
    occupation: '디자이너',
    mbti: 'ENFP',
    intro: '여행과 사진을 좋아하는 자유로운 영혼. 주말엔 항상 어딘가에 있어요.',
    tags: ['여행', '사진', '카페투어'],
    cardColor: 'bg-pastel-lime',
  },
  {
    id: '2',
    name: '박서준',
    age: 29,
    occupation: '개발자',
    mbti: 'INTJ',
    intro: '조용하지만 깊은 대화를 좋아합니다. 책과 음악이 일상의 전부예요.',
    tags: ['독서', '음악', '영화'],
    cardColor: 'bg-pastel-lilac',
  },
  {
    id: '3',
    name: '이소연',
    age: 26,
    occupation: '마케터',
    mbti: 'ESFJ',
    intro: '에너지 넘치는 마케터. 새로운 사람 만나는 걸 좋아해요!',
    tags: ['요리', '운동', 'SNS'],
    cardColor: 'bg-pastel-mint',
  },
  {
    id: '4',
    name: '최민준',
    age: 30,
    occupation: '의사',
    mbti: 'ISFP',
    intro: '바쁜 일상 속에서도 소소한 행복을 찾는 편이에요.',
    tags: ['등산', '요가', '독서'],
    cardColor: 'bg-pastel-coral',
  },
  {
    id: '5',
    name: '한예진',
    age: 25,
    occupation: '작가',
    mbti: 'INFJ',
    intro: '글 쓰는 것을 좋아하고 고양이 두 마리와 살아요.',
    tags: ['글쓰기', '고양이', '카페'],
    cardColor: 'bg-pastel-cream',
  },
];

export function useSwipeCards() {
  const [profiles, setProfiles] = useState<Profile[]>(MOCK_PROFILES);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  const currentProfile = profiles[profiles.length - 1] ?? null;

  const swipe = (dir: 'left' | 'right') => {
    setDirection(dir);
    setTimeout(() => {
      setProfiles((prev) => prev.slice(0, -1));
      setDirection(null);
    }, 300);
  };

  const openDetail = (profile: Profile) => setSelectedProfile(profile);
  const closeDetail = () => setSelectedProfile(null);

  return {
    profiles,
    currentProfile,
    selectedProfile,
    direction,
    swipe,
    openDetail,
    closeDetail,
  };
}
