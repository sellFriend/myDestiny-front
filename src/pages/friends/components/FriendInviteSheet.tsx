import { type ReactNode, useEffect } from 'react';
import { AnimatePresence, motion, useDragControls } from 'framer-motion';
import {
  Check,
  Copy,
  MessageCircle,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface FriendInviteSheetProps {
  inviteLink: string;
  isCopied: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  onSmsShare: () => void;
  onSystemShare: () => void;
}

interface ChannelButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

/** 시트를 닫히게 하는 드래그 임계값 — 충분히 끌어내렸거나(거리) 빠르게 튕겼을 때(속도) */
const DRAG_CLOSE_DISTANCE = 120;
const DRAG_CLOSE_VELOCITY = 600;

/** Toss 공유 시트 스타일: 큰 원형 아이콘 + 라벨, 충분한 탭 영역(Fitts) */
function ChannelButton({ icon, label, onClick }: ChannelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-24 flex-none flex-col items-center gap-2 rounded-2xl py-2 transition-colors active:bg-black/[0.04]"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-full">
        {icon}
      </span>
      <span className="text-xs font-medium text-black/70">{label}</span>
    </button>
  );
}

export function FriendInviteSheet({
  inviteLink,
  isCopied,
  isOpen,
  onClose,
  onCopyLink,
  onSmsShare,
  onSystemShare,
}: FriendInviteSheetProps) {
  const dragControls = useDragControls();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]" onClick={onClose}>
          <motion.div
            className="absolute inset-0 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 모바일(앱): 화면 가로 꽉 채움 / sm 이상: 가운데 정렬된 카드 */}
          <div className="absolute inset-x-0 bottom-0 flex justify-center sm:px-3 sm:pb-3">
            <motion.div
              className="w-full overflow-hidden rounded-t-[1.75rem] bg-white sm:max-w-md sm:rounded-[1.75rem] sm:shadow-[0_-8px_40px_rgba(0,0,0,0.12)]"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              drag="y"
              dragControls={dragControls}
              dragListener={false}
              dragConstraints={{ top: 0 }}
              dragElastic={{ top: 0, bottom: 0 }}
              dragSnapToOrigin
              onDragEnd={(_, info) => {
                if (
                  info.offset.y > DRAG_CLOSE_DISTANCE ||
                  info.velocity.y > DRAG_CLOSE_VELOCITY
                ) {
                  onClose();
                }
              }}
              onClick={(event) => event.stopPropagation()}
            >
              {/* 그래버 — 끌어서 시트를 닫을 수 있는 드래그 핸들 */}
              <div
                className="flex cursor-grab touch-none justify-center pb-1 pt-3 active:cursor-grabbing"
                onPointerDown={(event) => dragControls.start(event)}
              >
                <div className="h-1 w-9 rounded-full bg-black/15" />
              </div>

              <div className="px-5 pb-[calc(env(safe-area-inset-bottom,0px)+1.25rem)] pt-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[1.4rem] font-bold leading-snug tracking-tight text-black">
                      친구를 초대해 볼까요?
                    </h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-black/50">
                      링크를 받은 친구가 등록하면
                      <br />
                      바로 내 친구로 연결돼요.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-black/30 transition-colors hover:bg-black/5 hover:text-black/60"
                    aria-label="닫기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* 링크 복사 칩 (Toss 스타일: 가벼운 회색 박스, 한 번에 복사) */}
                <button
                  type="button"
                  onClick={onCopyLink}
                  className="mt-5 flex w-full items-center gap-3 rounded-2xl bg-black/[0.04] px-4 py-3.5 text-left transition-colors active:bg-black/[0.07]"
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-black/60">
                    {inviteLink}
                  </span>
                  <span
                    className={`flex shrink-0 items-center gap-1 text-sm font-semibold ${
                      isCopied ? 'text-black/40' : 'text-black'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="h-4 w-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        복사
                      </>
                    )}
                  </span>
                </button>

                {/* 공유 채널 — 메시지·더보기 */}
                <div className="mt-5 flex justify-center gap-4">
                  <ChannelButton
                    label="메시지"
                    onClick={onSmsShare}
                    icon={
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-black/[0.06]">
                        <MessageCircle className="h-6 w-6 text-black/70" />
                      </span>
                    }
                  />
                  <ChannelButton
                    label="더보기"
                    onClick={onSystemShare}
                    icon={
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-black/[0.06]">
                        <MoreHorizontal className="h-6 w-6 text-black/70" />
                      </span>
                    }
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
