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
      className={`absolute inset-0 ${profile.cardColor} rounded-block shadow-xl overflow-hidden select-none ${isTop ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
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
      {/* Photo area */}
      <div className={`h-[68%] bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        <span className="text-8xl font-black text-white/60 select-none">
          {profile.name.charAt(0)}
        </span>
      </div>

      {/* Info area */}
      <div className="px-5 pt-3 pb-3 flex flex-col gap-1.5">
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-black text-black">{profile.name}</h3>
          <span className="text-sm font-bold text-black/50">{profile.age}세</span>
        </div>

        <p className="text-xs text-black/55 font-medium leading-snug">{occupationLine}</p>

        <div className="flex items-center flex-wrap gap-1">
          <span className="px-2 py-0.5 bg-black/15 text-black/70 text-xs font-bold rounded-pill">
            {profile.mbti}
          </span>
          {profile.hobbies.slice(0, 3).map((h) => (
            <span key={h} className="px-2 py-0.5 bg-black/10 text-black/60 text-xs rounded-pill">
              {h}
            </span>
          ))}
        </div>
      </div>

      {isTop && !isDismissed && (
        <p className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-black/30 font-medium">
          탭하여 상세 보기
        </p>
      )}
    </motion.div>
  );
}
