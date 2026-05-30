import { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, type PanInfo } from 'framer-motion';
import { Hand, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialCardProps {
  onSwipe: () => void;
}

export function TutorialCard({ onSwipe }: TutorialCardProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [dismissX, setDismissX] = useState(0);
  const [isDragEnabled, setIsDragEnabled] = useState(true);
  const controls = useAnimation();
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (isDismissed) {
      controls.start({
        x: dismissX,
        rotate: dismissX > 0 ? 20 : -20,
        opacity: 0,
        transition: { duration: 0.3, ease: 'easeOut' },
      });
      return;
    }

    const runHint = async () => {
      if (isDraggingRef.current) return;

      // 힌트 중 drag 비활성화 → dragConstraints 스프링 충돌 방지
      setIsDragEnabled(false);
      try {
        // 오른쪽에서 왼쪽으로 밀기
        await controls.start({
          x: -72,
          rotate: -5,
          transition: { duration: 0.38, ease: [0.25, 1, 0.5, 1] },
        });
        // 스프링 느낌으로 제자리 복귀
        await controls.start({
          x: 0,
          rotate: 0,
          transition: { type: 'spring', stiffness: 280, damping: 22 },
        });
      } catch {
        controls.set({ x: 0, rotate: 0 });
      } finally {
        setIsDragEnabled(true);
      }
    };

    const initialTimer = setTimeout(runHint, 900);
    const interval = setInterval(runHint, 3000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isDismissed, dismissX, controls]);

  const handleDragStart = () => {
    isDraggingRef.current = true;
    controls.stop();
    controls.set({ x: 0, rotate: 0 });
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    isDraggingRef.current = false;
    if (Math.abs(info.offset.x) > 80) {
      const dx = info.offset.x > 0 ? 650 : -650;
      setDismissX(dx);
      setIsDismissed(true);
    }
  };

  return (
    <motion.div
      className="absolute inset-0 bg-pastel-navy rounded-block shadow-xl overflow-hidden select-none cursor-grab active:cursor-grabbing"
      style={{ zIndex: 20 }}
      animate={controls}
      onAnimationComplete={() => { if (isDismissed) onSwipe(); }}
      drag={!isDismissed && isDragEnabled ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02, rotate: 0, transition: { duration: 0 } }}
    >
      <div className="h-full flex flex-col items-center justify-center px-8 text-center gap-8">
        <div className="flex items-center gap-5">
          <ChevronLeft className="w-5 h-5 text-white/25" />
          <Hand className="w-14 h-14 text-white/80" strokeWidth={1.5} />
          <ChevronRight className="w-5 h-5 text-white/25" />
        </div>

        <div className="space-y-3">
          <p className="text-[1.55rem] font-black text-white leading-snug">
            새로운 인연을 찾으려면<br />카드를 스와이프하세요!
          </p>
          <p className="text-sm text-white/45 leading-relaxed">
            카드를 좌우로 밀면 다음 카드로 넘어가요.<br />카드를 탭하면 상세 정보를 볼 수 있어요.
          </p>
        </div>

        <motion.p
          className="text-xs text-white/70 tracking-wide"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          스와이프해서 시작하기
        </motion.p>
      </div>
    </motion.div>
  );
}
