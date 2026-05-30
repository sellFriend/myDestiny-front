import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Types ───────────────────────────────────────────────────────────────────

export type LoadingVariant = 'dots' | 'spinner' | 'message';

export interface LoadingProps {
  /** 로딩 UI 스타일 */
  variant?: LoadingVariant;
  /**
   * 'message' variant 에서 순환할 문구 목록.
   * 생략하면 기본 문구를 사용합니다.
   */
  messages?: Array<{ text: string; emoji: string }>;
  /** 반투명 배경 오버레이 (fixed, 전체 화면) */
  overlay?: boolean;
  /** 컨테이너에 추가할 Tailwind 클래스 */
  className?: string;
}

// ─── Default messages ─────────────────────────────────────────────────────────

const DEFAULT_MESSAGES: Array<{ text: string; emoji: string }> = [
  { emoji: '💫', text: '운명의 상대를 찾고 있어요' },
  { emoji: '✨', text: '딱 맞는 인연을 고르고 있어요' },
  { emoji: '💌', text: '당신의 카드를 준비하고 있어요' },
  { emoji: '💕', text: '곧 만나게 될 거예요' },
];

// ─── Variants ─────────────────────────────────────────────────────────────────

function Dots() {
  return (
    <div className="flex gap-2.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2.5 h-2.5 rounded-full bg-black/25"
          animate={{ y: [0, -12, 0] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.18,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <motion.div
      className="w-9 h-9 rounded-full border-[3px] border-black/10 border-t-black/60"
      animate={{ rotate: 360 }}
      transition={{ duration: 0.9, repeat: Infinity, ease: 'linear' }}
    />
  );
}

function MessageCycle({ messages }: { messages: Array<{ text: string; emoji: string }> }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 1800);
    return () => clearInterval(timer);
  }, [messages.length]);

  const current = messages[index];

  return (
    <div className="flex flex-col items-center gap-10">
      <Dots />
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <p className="text-4xl mb-4">{current.emoji}</p>
          <p className="text-base font-bold text-black/65">{current.text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Loading({
  variant = 'message',
  messages = DEFAULT_MESSAGES,
  overlay = false,
  className = '',
}: LoadingProps) {
  const inner = (
    <div className={`flex items-center justify-center ${className}`}>
      {variant === 'dots' && <Dots />}
      {variant === 'spinner' && <Spinner />}
      {variant === 'message' && <MessageCycle messages={messages} />}
    </div>
  );

  if (overlay) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {inner}
      </motion.div>
    );
  }

  return inner;
}
