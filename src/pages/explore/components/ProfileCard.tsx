import { useState, useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';
import { type Profile } from '@/pages/explore/hooks/useSwipeCards';

interface ProfileCardProps {
  profile: Profile;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (profileId: string) => void;
  onClick: () => void;
}

const PHOTO_GRADIENTS: Record<string, string> = {
  'bg-pastel-lime': 'from-[#a8d900]/60 to-[#a8d900]/30',
  'bg-pastel-lilac': 'from-[#8b76e8]/60 to-[#8b76e8]/30',
  'bg-pastel-mint': 'from-[#5ed9a8]/60 to-[#5ed9a8]/30',
  'bg-pastel-coral': 'from-[#e05a4a]/60 to-[#e05a4a]/30',
  'bg-pastel-cream': 'from-[#e8c84a]/60 to-[#e8c84a]/30',
  'bg-pastel-pink': 'from-[#e87aab]/60 to-[#e87aab]/30',
};

// 정보 영역에 깔리는 옅은 파스텔 틴트 (내 친구 카드와 동일한 톤)
const BODY_TINTS: Record<string, string> = {
  'bg-pastel-lime': 'bg-[#ceff6e]/20',
  'bg-pastel-lilac': 'bg-[#c5b8ff]/20',
  'bg-pastel-mint': 'bg-[#b8ffe5]/25',
  'bg-pastel-coral': 'bg-[#ff8b7b]/15',
  'bg-pastel-cream': 'bg-[#fff6d3]/35',
  'bg-pastel-pink': 'bg-[#ffb8d0]/20',
};

export function ProfileCard({ profile, isTop, stackIndex, onSwipe, onClick }: ProfileCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [dismissX, setDismissX] = useState(0);
  const dragOffsetRef = useRef(0);
  const hasCompletedSwipeRef = useRef(false);

  const rotate = stackIndex * 2.5;
  const scale = 1 - stackIndex * 0.04;
  const y = stackIndex * 14;
  const zIndex = 10 - stackIndex;

  const gradient = PHOTO_GRADIENTS[profile.cardColor] ?? 'from-black/20 to-black/5';
  const bodyTint = BODY_TINTS[profile.cardColor] ?? 'bg-black/[0.02]';

  const occupationLine = profile.isStudent
    ? `${profile.school} · ${profile.major}`
    : profile.occupation;

  const handleDragStart = () => {
    dragOffsetRef.current = 0;
  };

  const handleDrag = (_: unknown, info: PanInfo) => {
    dragOffsetRef.current = Math.abs(info.offset.x);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80) {
      setDismissX(info.offset.x > 0 ? 650 : -650);
      setIsDismissed(true);
    }
  };

  const handleAnimationComplete = () => {
    if (!isDismissed || hasCompletedSwipeRef.current) {
      return;
    }

    hasCompletedSwipeRef.current = true;
    onSwipe(profile.id);
  };

  const handleClick = () => {
    if (dragOffsetRef.current > 5) {
      dragOffsetRef.current = 0;
      return;
    }
    onClick();
  };

  return (
    <motion.div
      className={`absolute inset-0 flex flex-col bg-white rounded-block shadow-xl overflow-hidden select-none ${isTop ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
      style={{ zIndex }}
      initial={{ rotate, scale, y, x: 0 }}
      animate={
        isDismissed
          ? { x: dismissX, rotate: dismissX > 0 ? 20 : -20, opacity: 0 }
          : { rotate, scale, y, x: 0 }
      }
      transition={isDismissed ? { duration: 0.3, ease: 'easeOut' } : { type: 'spring', stiffness: 300, damping: 30 }}
      onAnimationComplete={handleAnimationComplete}
      drag={isTop && !isDismissed ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, rotate: 0, transition: { duration: 0 } }}
      onClick={isTop && !isDismissed ? handleClick : undefined}
    >
      {/* Photo area — 사진이 있으면 채우고, 없으면 이니셜로 폴백 */}
      <div className={`relative h-[66%] shrink-0 overflow-hidden bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {profile.photo ? (
          <img
            src={profile.photo}
            alt={profile.name}
            draggable={false}
            className="absolute inset-0 h-full w-full select-none object-cover [-webkit-user-drag:none]"
          />
        ) : (
          <span className="text-7xl font-black text-white/70 select-none">
            {profile.name.charAt(0)}
          </span>
        )}
      </div>

      {/* Info area — 직업·MBTI → 이름, 나이 → 취미. 수직 중앙 정렬로 여백 균형 */}
      <div className={`${bodyTint} flex flex-1 flex-col justify-center gap-2 px-5 py-4`}>
        <p className="text-[13px] font-medium uppercase tracking-wide text-black/45">
          {occupationLine} · {profile.mbti}
        </p>

        <h3 className="text-[28px] font-black leading-tight text-black">
          {profile.name}, {profile.age}
        </h3>

        {profile.hobbies.length > 0 && (
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
            {profile.hobbies.slice(0, 3).map((h) => (
              <span
                key={h}
                className="rounded-pill bg-black/[0.06] px-3 py-1 text-[13px] font-medium text-black/55"
              >
                {h}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
