import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { useSwipeCards, type Profile } from '@/pages/explore/hooks/useSwipeCards';
import { SwipeCardStack } from '@/pages/explore/components/SwipeCardStack';
import { DetailModal } from '@/pages/explore/components/DetailModal';
import { ContactRequestModal } from '@/pages/explore/components/ContactRequestModal';
import { LoginModal } from '@/components/LoginModal';
import { useAuth } from '@/contexts/AuthContext';

const ExplorePage = () => {
  const { isLoggedIn } = useAuth();
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
  } = useSwipeCards();

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
        </div>
      </main>

      {selectedProfile && (
        <DetailModal
          profile={selectedProfile}
          onClose={closeDetail}
          onContactRequest={handleContactRequest}
        />
      )}

      {requestProfile && (
        <ContactRequestModal
          profile={requestProfile}
          onClose={() => setRequestProfile(null)}
        />
      )}

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
