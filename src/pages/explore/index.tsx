import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { AppHeader } from "@/components/AppHeader";
import {
  useSwipeCards,
  type Profile,
} from "@/pages/explore/hooks/useSwipeCards";
import { SwipeCardStack } from "@/pages/explore/components/SwipeCardStack";
import { DetailModal } from "@/pages/explore/components/DetailModal";
import { ContactRequestModal } from "@/pages/explore/components/ContactRequestModal";
import { LoginModal } from "@/components/LoginModal";
import { useAuth } from "@/contexts/AuthContext";

const ExplorePage = () => {
  const { isLoggedIn, loginWithKakao } = useAuth();
  const {
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
    refetch,
  } = useSwipeCards(isLoggedIn);

  const [requestProfile, setRequestProfile] = useState<Profile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleCardClick = (profile: Profile) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    openDetail(profile);
  };

  const handleContactRequest = (profile: Profile) => {
    closeDetail();
    setRequestProfile(profile);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-4">
        <div className="relative w-full max-w-[400px] h-[70vh] min-h-[480px] max-h-[660px]">
          {!isLoggedIn ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <p className="text-5xl mb-5">💞</p>
              <p className="text-xl font-black text-black">
                로그인하고 둘러보세요
              </p>
              <p className="text-sm text-black/40 mt-2 mb-6">
                추천 카드는 로그인 후 확인할 수 있어요
              </p>
              <button
                type="button"
                onClick={loginWithKakao}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-pill text-sm font-semibold text-[#191600] bg-[#FEE500] hover:brightness-95 transition-[filter]"
              >
                카카오로 시작하기
              </button>
            </div>
          ) : (
            <SwipeCardStack
              profiles={profiles}
              hasMore={hasMore}
              status={status}
              errorType={errorType}
              showTutorial={showTutorial}
              onSwipeProfile={swipeProfile}
              onSwipeTutorial={swipeTutorial}
              onOpenDetail={handleCardClick}
              onRetry={refetch}
            />
          )}
        </div>
      </main>

      <AnimatePresence>
        {selectedProfile && (
          <DetailModal
            profile={selectedProfile}
            onClose={closeDetail}
            onContactRequest={handleContactRequest}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {requestProfile && (
          <ContactRequestModal
            profile={requestProfile}
            onClose={() => setRequestProfile(null)}
          />
        )}
      </AnimatePresence>

      {showLoginModal && (
        <LoginModal
          message="카드 상세 보기와 연락 요청은 로그인 후 이용할 수 있어요."
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default ExplorePage;
