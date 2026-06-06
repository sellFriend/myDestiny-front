import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import type { MatchingResponse } from '@/lib/api';
import { matchingSides } from '@/pages/requests/utils';

/** 거절 사유 최대 길이 (matching-frontend-guide §4.3) */
const REASON_MAX = 200;

interface RejectReasonDialogProps {
  matching: MatchingResponse;
  busy?: boolean;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

/**
 * 받은 요청을 거절할 때 사유(선택)를 입력받는 확인 다이얼로그.
 * 사유는 보낸 쪽(요청자)에게 rejectReason 으로 그대로 전달된다. (matching-frontend-guide §4.3)
 * 빈 값이면 사유 없이 거절(서버에 reason 미전송).
 */
export function RejectReasonDialog({ matching, busy = false, onConfirm, onClose }: RejectReasonDialogProps) {
  const [reason, setReason] = useState('');
  // 받은 요청 관점에서 상대(요청자)가 counterpart
  const { counterpart } = matchingSides(matching, 'received');

  const handleConfirm = () => {
    const trimmed = reason.trim();
    onConfirm(trimmed ? trimmed : undefined);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/45 p-4 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm overflow-hidden rounded-block bg-white"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="px-6 pb-2 pt-6">
          <h3 className="text-lg font-black text-black">
            {counterpart.name}님의 제안을 거절할까요?
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-black/45">
            거절하면 다시 되돌릴 수 없어요. 사유를 남기면 상대 주선자에게 그대로 전달돼요.
          </p>
        </div>

        <div className="px-6 py-4">
          <label className="mb-2 block text-[11px] font-semibold uppercase tracking-widest text-black/35">
            거절 사유 (선택)
          </label>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value.slice(0, REASON_MAX))}
            placeholder="예) 조건이 잘 맞지 않는 것 같아요"
            rows={3}
            autoFocus
            className="w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black focus:border-black/30 focus:outline-none"
          />
          <p className="mt-1.5 text-right text-[11px] text-black/30">
            {reason.length}/{REASON_MAX}
          </p>
        </div>

        <div className="flex gap-2 px-6 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-1">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="flex-1 rounded-pill bg-black/[0.05] py-3.5 text-sm font-semibold text-black/55 transition-colors hover:bg-black/[0.09] hover:text-black/80 disabled:pointer-events-none disabled:opacity-40"
          >
            돌아가기
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleConfirm}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-pill bg-pastel-coral py-3.5 text-sm font-bold text-black transition-all hover:brightness-95 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            거절하기
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
