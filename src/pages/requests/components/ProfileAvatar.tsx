import type { MatchingProfileRef } from '@/lib/api';

/** 이름을 항상 같은 파스텔로 매핑해 사람마다 고유한 시각 정체성을 준다. (recognition) */
const AVATAR_TINTS = [
  'bg-pastel-lime/55',
  'bg-pastel-lilac/55',
  'bg-pastel-mint/60',
  'bg-pastel-coral/45',
  'bg-pastel-cream/70',
  'bg-pastel-pink/55',
];

function avatarTint(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length];
}

interface ProfileAvatarProps {
  profile: MatchingProfileRef;
  /** 지름(px). 기본 44 */
  size?: number;
  className?: string;
}

/**
 * 프로필 대표 이미지. 사진(photoUrls[0])이 있으면 사진을, 없으면 이름 첫 글자 + 고정 파스텔로 폴백한다.
 * 요청함 리스트 카드와 상세에서 공통으로 쓰는 단일 시각 앵커.
 */
export function ProfileAvatar({ profile, size = 44, className = '' }: ProfileAvatarProps) {
  const dimension = { width: size, height: size };
  const photo = profile.photoUrls[0];

  if (photo) {
    return (
      <img
        src={photo}
        alt={profile.name}
        style={dimension}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      style={{ ...dimension, fontSize: size * 0.4 }}
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-black/70 ${avatarTint(
        profile.name,
      )} ${className}`}
    >
      {profile.name.charAt(0)}
    </span>
  );
}
