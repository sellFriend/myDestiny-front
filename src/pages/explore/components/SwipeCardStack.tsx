import { type Profile, type FetchStatus, type ErrorType } from "@/pages/explore/hooks/useSwipeCards";
import { ProfileCard } from "@/pages/explore/components/ProfileCard";
import { TutorialCard } from "@/pages/explore/components/TutorialCard";
import { LoadingCard } from "@/pages/explore/components/LoadingCard";
import { ErrorCard } from "@/pages/explore/components/ErrorCard";

// Keep only the next profile visible under the top card so the previewed
// card always matches the card that becomes active after a swipe.
const MAX_VISIBLE_PROFILES = 2;

interface SwipeCardStackProps {
  profiles: Profile[];
  hasMore: boolean;
  status: FetchStatus;
  errorType: ErrorType | null;
  showTutorial: boolean;
  onSwipeProfile: (profileId: string) => void;
  onSwipeTutorial: () => void;
  onOpenDetail: (profile: Profile) => void;
  onRetry: () => void;
}

export function SwipeCardStack({
  profiles,
  hasMore,
  status,
  errorType,
  showTutorial,
  onSwipeProfile,
  onSwipeTutorial,
  onOpenDetail,
  onRetry,
}: SwipeCardStackProps) {
  if (status === "loading") {
    return <LoadingCard />;
  }

  if (status === "error" && errorType) {
    return <ErrorCard errorType={errorType} onRetry={onRetry} />;
  }

  // API 가 빈 배열을 반환해 더 볼 카드가 없는 경우
  if (!showTutorial && !hasMore && profiles.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-8 text-center">
        <p className="text-lg font-bold text-black">추천을 모두 둘러봤어요</p>
        <p className="mt-2 text-sm leading-relaxed text-black/40">
          새로운 인연이 등록되면
          <br />
          다시 보여드릴게요
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
