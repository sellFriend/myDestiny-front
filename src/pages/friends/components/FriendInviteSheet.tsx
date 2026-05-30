import { type ReactNode, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy, MessageCircle, Share2, X } from 'lucide-react';

interface FriendInviteSheetProps {
  inviteLink: string;
  isKakaoReady: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCopyLink: () => void;
  onInstagramShare: () => void;
  onKakaoShare: () => void;
  onSmsShare: () => void;
  onSystemShare: () => void;
}

interface ActionButtonProps {
  caption: string;
  icon: ReactNode;
  onClick: () => void;
  title: string;
}

function ActionButton({ caption, icon, onClick, title }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-[1.6rem] border border-black/8 bg-white px-4 py-4 text-left shadow-[0_14px_28px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5 hover:border-black/15"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f5f1e8] text-black">
        {icon}
      </div>
      <p className="text-sm font-black text-black">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-black/45">{caption}</p>
    </button>
  );
}

export function FriendInviteSheet({
  inviteLink,
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
            className="absolute inset-0 bg-black/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="absolute inset-x-0 bottom-0 flex justify-center px-3 pb-3 pt-12">
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-[2rem] border border-black/8 bg-[#fffaf2] shadow-[0_-8px_30px_rgba(15,23,42,0.2)]"
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="px-5 pt-3">
                <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-black/10" />

                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] font-bold uppercase tracking-[0.24em] text-black/35">
                      Share Invite
                    </p>
                    <h3 className="mt-1 text-[1.45rem] font-black leading-tight text-black">
                      친구 초대 링크가 준비됐어요
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-black/55">
                      원하는 채널로 바로 보내거나 링크만 복사해서 공유할 수 있어요.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-2 text-black/40 transition-colors hover:bg-black/5 hover:text-black/60"
                    aria-label="닫기"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="mb-5 rounded-[1.6rem] bg-black px-4 py-4 text-white">
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.24em] text-white/55">
                    Invite Link
                  </p>
                  <p className="mt-2 break-all text-sm leading-relaxed text-white/82">
                    {inviteLink}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ActionButton
                    title="카카오톡"
                    caption={isKakaoReady ? '카카오톡으로 바로 보내기' : '설정 전이면 기본 공유로 안내'}
                    onClick={onKakaoShare}
                    icon={
                      <span className="flex h-full w-full items-center justify-center rounded-2xl bg-[#FEE500] text-base font-black text-black">
                        K
                      </span>
                    }
                  />

                  <ActionButton
                    title="문자 메시지"
                    caption="메시지 앱으로 링크 전달"
                    onClick={onSmsShare}
                    icon={<MessageCircle className="h-5 w-5" />}
                  />

                  <ActionButton
                    title="인스타 DM"
                    caption="기기 공유 시트에서 인스타그램 선택"
                    onClick={onInstagramShare}
                    icon={
                      <span className="flex h-full w-full items-center justify-center rounded-2xl bg-[#ffdfd6] text-base font-black text-[#8b2d20]">
                        IG
                      </span>
                    }
                  />

                  <ActionButton
                    title="링크 복사"
                    caption="직접 붙여넣어 공유하기"
                    onClick={onCopyLink}
                    icon={<Copy className="h-5 w-5" />}
                  />
                </div>

                <button
                  type="button"
                  onClick={onSystemShare}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-[1.4rem] bg-[#efe7d9] py-4 text-sm font-bold text-black transition-colors hover:bg-[#eadfcd]"
                >
                  <Share2 className="h-4 w-4" />
                  더보기
                </button>

                <p className="mb-6 mt-4 text-xs leading-relaxed text-black/42">
                  인스타그램 DM은 웹에서 직접 여는 공식 공유 API가 없어 기기 공유 시트를
                  통해 보내는 방식으로 연결됩니다.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
