import { ThumbsDown, ThumbsUp, Info } from 'lucide-react';
import { type Profile } from '@/pages/explore/hooks/useSwipeCards';
import { ProfileCard } from '@/pages/explore/components/ProfileCard';

interface SwipeCardStackProps {
  profiles: Profile[];
  onSwipe: (direction: 'left' | 'right') => void;
  onOpenDetail: (profile: Profile) => void;
}

export function SwipeCardStack({ profiles, onSwipe, onOpenDetail }: SwipeCardStackProps) {
  const visibleProfiles = profiles.slice(-3).reverse();
  const topProfile = profiles[profiles.length - 1];

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <p className="text-4xl mb-4">✨</p>
        <p className="text-lg font-bold text-black">모든 카드를 확인했어요</p>
        <p className="text-sm text-black/40 mt-2">새로운 소개가 등록되면 알려드릴게요</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full h-full">
      <div className="relative w-72 h-[420px]">
        {visibleProfiles.map((profile, i) => {
          const isTop = profile.id === topProfile?.id;
          return (
            <ProfileCard
              key={profile.id}
              profile={profile}
              isTop={isTop}
              stackIndex={visibleProfiles.length - 1 - i}
              onSwipe={onSwipe}
              onClick={() => onOpenDetail(profile)}
            />
          );
        })}
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={() => onSwipe('left')}
          className="w-14 h-14 rounded-full border-2 border-black/10 flex items-center justify-center hover:border-black/30 hover:bg-black/5 transition-all"
          aria-label="패스"
        >
          <ThumbsDown className="w-5 h-5 text-black/40" />
        </button>

        <button
          type="button"
          onClick={() => topProfile && onOpenDetail(topProfile)}
          className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center hover:border-black/20 hover:bg-black/5 transition-all"
          aria-label="상세 보기"
        >
          <Info className="w-4 h-4 text-black/30" />
        </button>

        <button
          type="button"
          onClick={() => onSwipe('right')}
          className="w-14 h-14 rounded-full bg-black flex items-center justify-center hover:bg-black/80 transition-all"
          aria-label="관심"
        >
          <ThumbsUp className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
