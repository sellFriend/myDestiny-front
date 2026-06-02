import { type ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Copy,
  Instagram,
  MessageCircle,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface FriendInviteSheetProps {
  inviteLink: string;
  isCopied: boolean;
  isKakaoReady: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  onInstagramShare: () => void;
  onKakaoShare: () => void;
  onSmsShare: () => void;
  onSystemShare: () => void;
}

interface ChannelButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

/** Toss 공유 시트 스타일: 큰 원형 아이콘 + 라벨, 충분한 탭 영역(Fitts) */
function ChannelButton({ icon, label, onClick }: ChannelButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-1 flex-col items-center gap-2 rounded-2xl py-2 transition-colors active:bg-black/[0.04]"
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
  isKakaoReady,
  isOpen,
  onClose,
  onCopyLink,
  onInstagramShare,
  onKakaoShare,
  onSmsShare,
  onSystemShare,
}: FriendInviteSheetProps) {
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
              onClick={(event) => event.stopPropagation()}
            >
              {/* 그래버 */}
              <div className="flex justify-center pt-3">
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
                    className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black/30 transition-colors hover:bg-black/5 hover:text-black/60"
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

                {/* 공유 채널 — 가장 많이 쓰는 카카오톡을 앞에 배치(Serial Position) */}
                <div className="mt-5 flex items-stretch gap-1">
                  <ChannelButton
                    label="카카오톡"
                    onClick={onKakaoShare}
                    icon={
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-[#FEE500]">
                        <MessageCircle className="h-6 w-6 fill-black text-black" />
                      </span>
                    }
                  />
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
                    label="인스타 DM"
                    onClick={onInstagramShare}
                    icon={
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-[#feda75] via-[#d62976] to-[#4f5bd5]">
                        <Instagram className="h-6 w-6 text-white" />
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

                {!isKakaoReady && (
                  <p className="mt-4 text-center text-xs text-black/35">
                    카카오톡 공유가 안 되면 링크를 복사해 보내주세요.
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
