import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { type Profile } from '@/pages/explore/hooks/useSwipeCards';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/LoginModal';

interface DetailModalProps {
  profile: Profile;
  onClose: () => void;
  onContactRequest: (profile: Profile) => void;
}

const PHOTO_GRADIENTS: Record<string, string> = {
  'bg-pastel-lime': 'from-[#a8d900]/50 to-[#a8d900]/20',
  'bg-pastel-lilac': 'from-[#8b76e8]/50 to-[#8b76e8]/20',
  'bg-pastel-mint': 'from-[#5ed9a8]/50 to-[#5ed9a8]/20',
  'bg-pastel-coral': 'from-[#e05a4a]/50 to-[#e05a4a]/20',
  'bg-pastel-cream': 'from-[#e8c84a]/50 to-[#e8c84a]/20',
  'bg-pastel-pink': 'from-[#e87aab]/50 to-[#e87aab]/20',
};

export function DetailModal({ profile, onClose, onContactRequest }: DetailModalProps) {
  const { isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  const gradient = PHOTO_GRADIENTS[profile.cardColor] ?? 'from-black/20 to-black/5';

  const occupationLine = profile.isStudent
    ? `${profile.school} · ${profile.major}`
    : profile.occupation;

  const handleContactRequest = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    onContactRequest(profile);
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
        onClick={onClose}
      >
        <div
          className="w-full max-w-sm bg-white rounded-block overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Photo header */}
          <div className={`${profile.cardColor} relative flex-shrink-0`}>
            <button type="button" onClick={onClose} className="absolute top-4 right-4 z-10 p-1">
              <X className="w-5 h-5 text-black/50" />
            </button>

            <div className={`h-36 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-6xl font-black text-white/60">{profile.name.charAt(0)}</span>
            </div>

            <div className="px-6 pb-5 pt-4">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black text-black">{profile.name}</h2>
                <span className="text-base font-bold text-black/50">{profile.age}세</span>
              </div>
              <p className="text-sm text-black/50 mt-0.5 font-medium">{occupationLine}</p>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/30 mb-2">MBTI</p>
              <span className="px-3 py-1.5 bg-black text-white text-sm font-bold rounded-pill">
                {profile.mbti}
              </span>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/30 mb-2">취미</p>
              <div className="flex flex-wrap gap-2">
                {profile.hobbies.map((h) => (
                  <span
                    key={h}
                    className="px-3 py-1.5 bg-black/5 text-black/70 text-sm rounded-pill border border-black/10"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-black/30 mb-2">소개글</p>
              <p className="text-sm text-black/65 leading-relaxed">{profile.intro}</p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-6 py-5 border-t border-black/5 flex-shrink-0">
            <button
              type="button"
              onClick={handleContactRequest}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-all"
            >
              <Send className="w-4 h-4" />
              연락 요청 보내기
            </button>
          </div>
        </div>
      </div>

      {showLogin && (
        <LoginModal
          message="연락 요청을 보내려면 로그인이 필요해요."
          onClose={() => setShowLogin(false)}
        />
      )}
    </>
  );
}
