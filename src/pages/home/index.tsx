import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { AppHeader } from '@/components/AppHeader';
import { LoginModal } from '@/components/LoginModal';
import { HeroSection } from '@/pages/home/components/HeroSection';
import { HowItWorksSection } from '@/pages/home/components/HowItWorksSection';
import { CardUXSection } from '@/pages/home/components/CardUXSection';
import { TrustSection } from '@/pages/home/components/TrustSection';
import { CTASection } from '@/pages/home/components/CTASection';

const HomePage = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const goToFriendsAndAdd = () => {
    navigate(ROUTES.FRIENDS, { state: { triggerAddFriend: true } });
  };

  const handleRegisterFriend = () => {
    if (isLoggedIn) {
      goToFriendsAndAdd();
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader variant="landing" />

      <main className="pt-16">
        <HeroSection onRegisterFriend={handleRegisterFriend} />
        <HowItWorksSection />
        <CardUXSection />
        <TrustSection />
        <CTASection onRegisterFriend={handleRegisterFriend} />
      </main>

      <footer className="px-6 py-8 border-t border-black/10 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-3 text-sm text-black/40 sm:flex-row sm:justify-between">
          <span className="font-black tracking-tight">내인연 (My Destiny)</span>
          <div className="flex items-center gap-4">
            <Link to={ROUTES.PRIVACY} className="hover:text-black/70 transition-colors">
              개인정보처리방침
            </Link>
            <Link to={ROUTES.TERMS} className="hover:text-black/70 transition-colors">
              이용약관
            </Link>
            <span>© 2026 SellFriend. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {showLoginModal && (
        <LoginModal
          message="친구를 등록하려면 로그인이 필요해요."
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
};

export default HomePage;
