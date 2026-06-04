import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/contexts/AuthContext';
import { FriendCard, type Friend } from '@/pages/friends/components/FriendCard';
import { FriendCardSkeleton } from '@/pages/friends/components/FriendCardSkeleton';
import { FriendDetailModal } from '@/pages/friends/components/FriendDetailModal';
import { FriendInviteSheet } from '@/pages/friends/components/FriendInviteSheet';
import { useFriends } from '@/pages/friends/hooks/useFriends';

const INVITE_TITLE = '마담 친구 초대';
const INVITE_TEXT = '링크를 눌러 내 친구로 연결해줘요.';

type FriendTab = 'registered' | 'pending';
const FRIEND_TABS: { key: FriendTab; label: string }[] = [
  { key: 'registered', label: '등록된 친구' },
  { key: 'pending', label: '승인 대기' },
];

function createInviteToken() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  }

  return Math.random().toString(36).slice(2, 14);
}

function createInviteLink() {
  const token = createInviteToken();
  return `${window.location.origin}${ROUTES.REGISTER}?token=${token}`;
}

function createSmsUrl(inviteLink: string) {
  const body = encodeURIComponent(`${INVITE_TITLE}\n${INVITE_TEXT}\n${inviteLink}`);
  const separator = /iPad|iPhone|iPod/i.test(navigator.userAgent) ? '&' : '?';
  return `sms:${separator}body=${body}`;
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** 앱(모바일) 화면이면 true. AppHeader와 동일하게 md(768px) 경계를 사용한다. */
function isAppViewport() {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
}


const FriendsPage = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const {
    friends,
    isLoading,
    isError,
    refetch,
    deleteFriend,
    deactivateFriend,
    activateFriend,
    approveFriend,
    rejectFriend,
  } = useFriends(isLoggedIn);
  const [tab, setTab] = useState<FriendTab>('registered');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string, duration = 3500) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }

    setToast(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToast('');
      toastTimerRef.current = null;
    }, duration);
  }, []);

  const handleAddFriend = useCallback(async () => {
    const link = createInviteLink();
    setInviteLink(link);

    // 웹/앱 모두 클립보드에 먼저 복사한다.
    const copied = await writeClipboard(link);
    setIsLinkCopied(copied);

    if (isAppViewport()) {
      // 앱: 화면 가로를 꽉 채우는 바텀 시트로 공유 채널을 보여준다.
      setIsInviteSheetOpen(true);
      return;
    }

    // 웹: 시트 없이 토스트로만 복사 완료를 알린다.
    showToast(
      copied
        ? '초대 링크를 복사했어요. 친구에게 공유해 보세요.'
        : `링크를 직접 복사해 주세요: ${link}`,
      copied ? 3500 : 5000,
    );
  }, [showToast]);

  useEffect(() => {
    if (location.state?.triggerAddFriend) {
      window.history.replaceState({}, '');
      handleAddFriend();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const copyInviteLink = useCallback(async (message = '초대 링크를 복사했어요') => {
    if (!inviteLink) {
      return;
    }

    const copied = await writeClipboard(inviteLink);
    setIsLinkCopied(copied);

    if (copied) {
      showToast(message);
    } else {
      showToast(`링크를 직접 복사해 주세요: ${inviteLink}`, 5000);
    }
  }, [inviteLink, showToast]);

  const shareWithSystemSheet = useCallback(async (fallbackMessage?: string) => {
    if (!inviteLink) {
      return;
    }

    const shareData = {
      title: INVITE_TITLE,
      text: INVITE_TEXT,
      url: inviteLink,
    };

    if (typeof navigator.share !== 'function') {
      await copyInviteLink(fallbackMessage ?? '기기 공유를 지원하지 않아 링크를 복사했어요');
      return;
    }

    if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
      await copyInviteLink(fallbackMessage ?? '이 기기에서는 공유할 수 없어 링크를 복사했어요');
      return;
    }

    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      await copyInviteLink(fallbackMessage ?? '공유 창을 열지 못해 링크를 복사했어요');
    }
  }, [copyInviteLink, inviteLink]);

  const handleSmsShare = useCallback(async () => {
    if (!inviteLink) {
      return;
    }

    if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      await copyInviteLink('데스크톱에서는 링크를 복사했어요. 메시지 앱에 붙여 넣어 주세요.');
      return;
    }

    window.location.href = createSmsUrl(inviteLink);
  }, [copyInviteLink, inviteLink]);

  const handleDelete = (id: string) => {
    deleteFriend(id);
  };

  // 폼 재수정 요청: 새 숏링크를 만들어 클립보드에 복사하고, 앱/웹 모두 토스트로만 알린다.
  const handleRequestReform = useCallback(
    async (friend: Friend) => {
      const link = createInviteLink();
      const copied = await writeClipboard(link);
      showToast(
        copied
          ? `${friend.name}님께 보낼 수정 링크를 복사했어요. 붙여넣어 보내 주세요.`
          : `링크를 직접 복사해 주세요: ${link}`,
        copied ? 3500 : 5000,
      );
      return copied;
    },
    [showToast],
  );

  const registeredFriends = friends.filter((f) => f.status === 'approved');
  const pendingFriends = friends.filter((f) => f.status === 'pending');
  const visibleFriends = tab === 'registered' ? registeredFriends : pendingFriends;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        {/* 페이지 타이틀 + 친구 추가 버튼 (친구가 있을 때만 노출) */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-black">내 친구</h1>
          {friends.length > 0 && (
            <button
              type="button"
              onClick={handleAddFriend}
              className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              친구 추가
            </button>
          )}
        </div>

        {!isLoggedIn ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-black text-black mb-2">로그인이 필요해요</p>
            <p className="text-sm text-black/40 leading-relaxed">
              내 친구를 관리하려면 먼저 로그인해 주세요
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <FriendCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-black text-black mb-2">불러오지 못했어요</p>
            <p className="text-sm text-black/40 mb-5">잠시 후 다시 시도해 주세요</p>
            <button
              type="button"
              onClick={() => refetch()}
              className="px-5 py-2.5 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 sm:h-64 text-center">
            <p className="text-lg font-black text-black mb-2">등록된 친구가 없어요</p>
            <p className="text-sm text-black/40 mb-6 leading-relaxed">
              친구 추가 버튼을 눌러 링크를 생성하고<br />친구에게 공유해보세요
            </p>
            <button
              type="button"
              onClick={handleAddFriend}
              className="mt-6 sm:mt-0 flex items-center gap-2 px-8 py-4 text-base sm:px-6 sm:py-3 sm:text-sm bg-black text-white font-semibold rounded-pill"
            >
              <UserPlus className="w-5 h-5 sm:w-4 sm:h-4" />
              친구 추가하기
            </button>
          </div>
        ) : (
          <>
            {/* 모바일: 상단 탭 */}
            <div
              role="tablist"
              aria-label="내 친구 탭"
              className="mb-5 flex gap-2 overflow-x-auto md:hidden"
            >
              {FRIEND_TABS.map(({ key, label }) => {
                const isActive = tab === key;
                const count = key === 'pending' ? pendingFriends.length : 0;
                return (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    onClick={() => setTab(key)}
                    className={`flex shrink-0 items-center gap-1.5 rounded-pill px-4 py-2 text-sm font-semibold transition-colors ${
                      isActive ? 'bg-black text-white' : 'bg-black/5 text-black/50 hover:text-black'
                    }`}
                  >
                    {label}
                    {count > 0 && (
                      <span
                        className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                          isActive ? 'bg-white text-black' : 'bg-black text-white'
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="md:flex md:gap-8">
              {/* 웹: 좌측 사이드바 */}
              <aside className="hidden w-52 shrink-0 md:block">
                <nav role="tablist" aria-label="내 친구 메뉴" className="flex flex-col gap-1">
                  {FRIEND_TABS.map(({ key, label }) => {
                    const isActive = tab === key;
                    const count = key === 'pending' ? pendingFriends.length : 0;
                    return (
                      <button
                        key={key}
                        role="tab"
                        aria-selected={isActive}
                        type="button"
                        onClick={() => setTab(key)}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                          isActive ? 'bg-black text-white' : 'text-black/50 hover:bg-black/5 hover:text-black'
                        }`}
                      >
                        {label}
                        {count > 0 && (
                          <span
                            className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                              isActive ? 'bg-white text-black' : 'bg-black text-white'
                            }`}
                          >
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </aside>

              {/* 콘텐츠 */}
              <section className="min-w-0 flex-1" role="tabpanel">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                  >
                    {visibleFriends.length === 0 ? (
                      <div className="flex h-56 flex-col items-center justify-center text-center">
                        <p className="mb-2 text-base font-black text-black">
                          {tab === 'registered'
                            ? '등록된 친구가 없어요'
                            : '승인 대기 중인 친구가 없어요'}
                        </p>
                        <p className="max-w-xs text-sm leading-relaxed text-black/40">
                          {tab === 'registered'
                            ? '친구가 폼을 작성하면 승인 대기 탭에서 확인하고 등록할 수 있어요.'
                            : '친구가 폼 작성을 마치면 여기에서 등록을 승인할 수 있어요.'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {visibleFriends.map((friend, i) => (
                          <motion.div
                            key={friend.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.06 }}
                          >
                            <FriendCard friend={friend} onClick={setSelectedFriend} />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </section>
            </div>
          </>
        )}
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 bg-black text-white text-sm font-medium rounded-xl shadow-lg max-w-xs text-center leading-relaxed"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {selectedFriend && (
        <FriendDetailModal
          key={selectedFriend.id}
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onDelete={handleDelete}
          onApprove={approveFriend}
          onReject={rejectFriend}
          onDeactivate={deactivateFriend}
          onActivate={activateFriend}
          onRequestReform={handleRequestReform}
        />
      )}

      <FriendInviteSheet
        inviteLink={inviteLink}
        isCopied={isLinkCopied}
        isOpen={isInviteSheetOpen}
        onClose={() => setIsInviteSheetOpen(false)}
        onCopyLink={() => {
          void copyInviteLink();
        }}
        onSmsShare={() => {
          void handleSmsShare();
        }}
        onSystemShare={() => {
          void shareWithSystemSheet();
        }}
      />
    </div>
  );
};

export default FriendsPage;
