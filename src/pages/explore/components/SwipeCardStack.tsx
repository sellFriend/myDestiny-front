import { type Profile } from "@/pages/explore/hooks/useSwipeCards";
import { ProfileCard } from "@/pages/explore/components/ProfileCard";
import { TutorialCard } from "@/pages/explore/components/TutorialCard";

// Keep only the next profile visible under the top card so the previewed
// card always matches the card that becomes active after a swipe.
const MAX_VISIBLE_PROFILES = 2;

interface SwipeCardStackProps {
  profiles: Profile[];
  showTutorial: boolean;
  onSwipeProfile: (profileId: string) => void;
  onSwipeTutorial: () => void;
  onOpenDetail: (profile: Profile) => void;
}

export function SwipeCardStack({
  profiles,
  showTutorial,
  onSwipeProfile,
  onSwipeTutorial,
  onOpenDetail,
}: SwipeCardStackProps) {
  const isEmpty = !showTutorial && profiles.length === 0;

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6">
        <p className="text-5xl mb-5">✨</p>
        <p className="text-xl font-black text-black">모든 카드를 확인했어요</p>
        <p className="text-sm text-black/40 mt-2">
          새로운 소개가 등록되면 알려드릴게요
        </p>
      </div>
    );
  }

  const visibleProfiles = profiles.slice(0, MAX_VISIBLE_PROFILES).reverse();

  return (
    <div className="relative w-full h-full">
      {visibleProfiles.map((profile, i) => {
        const stackIndex = visibleProfiles.length - 1 - i;
        const isTop = stackIndex === 0;

        return (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isTop={isTop}
            stackIndex={stackIndex}
            onSwipe={onSwipeProfile}
            onClick={() => onOpenDetail(profile)}
          />
        );
      })}

      {showTutorial && <TutorialCard onSwipe={onSwipeTutorial} />}
    </div>
  );
}
