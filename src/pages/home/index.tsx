import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { HeroSection } from '@/pages/home/components/HeroSection';
import { HowItWorksSection } from '@/pages/home/components/HowItWorksSection';
import { CardUXSection } from '@/pages/home/components/CardUXSection';
import { TrustSection } from '@/pages/home/components/TrustSection';
import { CTASection } from '@/pages/home/components/CTASection';

const NAV_LINKS = [
  { label: '탐색', to: ROUTES.EXPLORE },
  { label: '내 친구', to: ROUTES.FRIENDS },
  { label: '요청함', to: ROUTES.REQUESTS },
] as const;

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm border-b border-black/5">
        <Link to={ROUTES.HOME} className="text-base font-black tracking-tight text-black">
          madam
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map(({ label, to }) => (
            <Link key={to} to={to} className="text-sm text-black/60 hover:text-black transition-colors">
              {label}
            </Link>
          ))}
        </nav>
        <Link
          to={ROUTES.REGISTER}
          className="px-5 py-2 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-colors"
        >
          친구 등록
        </Link>
      </header>

      <main className="pt-16">
        <HeroSection />
        <HowItWorksSection />
        <CardUXSection />
        <TrustSection />
        <CTASection />
      </main>

      <footer className="px-6 py-8 border-t border-black/10 bg-white">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-black/40">
          <span className="font-black tracking-tight">madam</span>
          <span>© 2026 Madam. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
