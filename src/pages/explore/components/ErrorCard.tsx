import { motion } from 'framer-motion';
import type { ErrorType } from '@/pages/explore/hooks/useSwipeCards';

interface ErrorCardProps {
  errorType: ErrorType;
  onRetry: () => void;
}

const ERROR_CONFIG = {
  timeout: {
    emoji: '⏱️',
    title: '연결이 오래 걸리고 있어요',
    desc: '네트워크 상태를 확인하고 다시 시도해 주세요',
  },
  network: {
    emoji: '📡',
    title: '인터넷 연결을 확인해 주세요',
    desc: '연결이 불안정하거나 끊겼어요',
  },
  server: {
    emoji: '🛠️',
    title: '서버에 일시적인 문제가 있어요',
    desc: '잠시 후 다시 시도해 주세요',
  },
} as const;

export function ErrorCard({ errorType, onRetry }: ErrorCardProps) {
  const config = ERROR_CONFIG[errorType];

  return (
    <motion.div
      className="flex flex-col items-center justify-center h-full text-center px-6 gap-5"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <p className="text-5xl">{config.emoji}</p>
      <div>
        <p className="text-xl font-black text-black">{config.title}</p>
        <p className="text-sm text-black/40 mt-2">{config.desc}</p>
      </div>
      <button
        onClick={onRetry}
        className="mt-2 px-7 py-2.5 bg-black text-white text-sm font-bold rounded-pill hover:bg-black/75 active:scale-95 transition-all"
      >
        다시 시도하기
      </button>
    </motion.div>
  );
}
