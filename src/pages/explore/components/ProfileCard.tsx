import { motion, type PanInfo } from 'framer-motion';
import { type Profile } from '@/pages/explore/hooks/useSwipeCards';

interface ProfileCardProps {
  profile: Profile;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (direction: 'left' | 'right') => void;
  onClick: () => void;
}

export function ProfileCard({ profile, isTop, stackIndex, onSwipe, onClick }: ProfileCardProps) {
  const stackStyle = {
    rotate: (2 - stackIndex) * 3,
    scale: 1 - stackIndex * 0.04,
    y: stackIndex * -8,
    zIndex: 10 - stackIndex,
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 80) {
      onSwipe(info.offset.x > 0 ? 'right' : 'left');
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 ${profile.cardColor} rounded-block shadow-lg cursor-pointer select-none`}
      style={{ zIndex: stackStyle.zIndex }}
      initial={{ rotate: stackStyle.rotate, scale: stackStyle.scale, y: stackStyle.y }}
      animate={{ rotate: stackStyle.rotate, scale: stackStyle.scale, y: stackStyle.y }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.03, rotate: 0 }}
      onClick={isTop ? onClick : undefined}
    >
      <div className="h-full flex flex-col p-6">
        <div className="flex-1 flex items-end">
          <div className="space-y-1">
            <p className="text-xs font-mono uppercase tracking-widest text-black/40">
              {profile.occupation} · {profile.mbti}
            </p>
            <h3 className="text-2xl font-black text-black">
              {profile.name}, {profile.age}
            </h3>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm text-black/60 leading-relaxed line-clamp-2">
            {profile.intro}
          </p>
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-black/10 text-black/60 text-xs font-medium rounded-pill"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
