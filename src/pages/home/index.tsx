import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-black/40">
          <span className="font-black tracking-tight">madam</span>
          <span>© 2026 Madam. All rights reserved.</span>
        </div>
      </footer>

      {showLoginModal && (
        <LoginModal
          message="친구를 등록하려면 로그인이 필요해요."
          onClose={() => setShowLoginModal(false)}
          onSuccess={goToFriendsAndAdd}
        />
      )}
    </div>
  );
};

export default HomePage;
