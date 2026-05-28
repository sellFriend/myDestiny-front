import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useSwipeCards } from '@/pages/explore/hooks/useSwipeCards';
import { SwipeCardStack } from '@/pages/explore/components/SwipeCardStack';
import { ContactRequestModal } from '@/pages/explore/components/ContactRequestModal';

const ExplorePage = () => {
  const { profiles, selectedProfile, swipe, openDetail, closeDetail } = useSwipeCards();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/5">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          madam
        </Link>
        <h1 className="text-sm font-bold text-black">탐색</h1>
        <div className="w-16" />
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm h-[560px] flex flex-col">
          <SwipeCardStack
            profiles={profiles}
            onSwipe={swipe}
            onOpenDetail={openDetail}
          />
        </div>
      </main>

      {selectedProfile && (
        <ContactRequestModal profile={selectedProfile} onClose={closeDetail} />
      )}
    </div>
  );
};

export default ExplorePage;
