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
const KAKAO_SDK_URL = 'https://t1.kakaocdn.net/kakao_js_sdk/2.8.1/kakao.min.js';

interface KakaoShareLink {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoShareButton {
  link: KakaoShareLink;
  title: string;
}

interface KakaoShareFeedContent {
  description: string;
  link: KakaoShareLink;
  title: string;
}

interface KakaoShareFeedPayload {
  buttons: KakaoShareButton[];
  content: KakaoShareFeedContent;
  objectType: 'feed';
}

interface KakaoSdk {
  Share?: {
    sendDefault: (payload: KakaoShareFeedPayload) => void;
  };
  init: (appKey: string) => void;
  isInitialized: () => boolean;
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

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

async function loadKakaoSdk() {
  if (window.Kakao) {
    return window.Kakao;
  }

  return new Promise<KakaoSdk>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>('script[data-kakao-sdk="true"]');

    const handleLoad = () => {
      if (window.Kakao) {
        resolve(window.Kakao);
        return;
      }

      reject(new Error('Kakao SDK is unavailable.'));
    };

    const handleError = () => {
      reject(new Error('Failed to load Kakao SDK.'));
    };

    if (existingScript) {
      existingScript.addEventListener('load', handleLoad, { once: true });
      existingScript.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = KAKAO_SDK_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.dataset.kakaoSdk = 'true';
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });
    document.head.appendChild(script);
  });
}

const FriendsPage = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();
  const { friends, isLoading, isError, refetch, deleteFriend } = useFriends(isLoggedIn);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [inviteLink, setInviteLink] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const [isInviteSheetOpen, setIsInviteSheetOpen] = useState(false);
  const [isKakaoReady, setIsKakaoReady] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef<number | null>(null);

  const kakaoKey = import.meta.env.VITE_KAKAO_JAVASCRIPT_KEY;

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
        ? '초대 링크를 복사했어요. 친구에게 붙여넣어 보내주세요'
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

  const ensureKakaoReady = useCallback(async () => {
    if (!kakaoKey) {
      return null;
    }

    try {
      const Kakao = await loadKakaoSdk();

      if (!Kakao.isInitialized()) {
        Kakao.init(kakaoKey);
      }

      const initialized = Kakao.isInitialized();
      setIsKakaoReady(initialized);
      return initialized ? Kakao : null;
    } catch {
      setIsKakaoReady(false);
      return null;
    }
  }, [kakaoKey]);

  useEffect(() => {
    if (!isInviteSheetOpen || !kakaoKey) {
      return;
    }

    void ensureKakaoReady();
  }, [ensureKakaoReady, isInviteSheetOpen, kakaoKey]);

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

  const handleKakaoShare = useCallback(async () => {
    if (!inviteLink) {
      return;
    }

    const Kakao = await ensureKakaoReady();

    if (!Kakao?.Share) {
      await shareWithSystemSheet('카카오 공유 설정이 없어 링크를 복사했어요');
      return;
    }

    try {
      Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: INVITE_TITLE,
          description: INVITE_TEXT,
          link: {
            mobileWebUrl: inviteLink,
            webUrl: inviteLink,
          },
        },
        buttons: [
          {
            title: '친구 등록하기',
            link: {
              mobileWebUrl: inviteLink,
              webUrl: inviteLink,
            },
          },
        ],
      });
    } catch {
      await shareWithSystemSheet('카카오 공유를 열지 못해 링크를 복사했어요');
    }
  }, [ensureKakaoReady, inviteLink, shareWithSystemSheet]);

  const handleInstagramShare = useCallback(async () => {
    await shareWithSystemSheet('인스타그램 공유를 열지 못해 링크를 복사했어요');
  }, [shareWithSystemSheet]);

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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <AppHeader />

      <main className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
        {/* 페이지 타이틀 + 친구 추가 버튼 */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-black text-black">내 친구</h1>
          <button
            type="button"
            onClick={handleAddFriend}
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            친구 추가
          </button>
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
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-black text-black mb-2">등록된 친구가 없어요</p>
            <p className="text-sm text-black/40 mb-6 leading-relaxed">
              친구 추가 버튼을 눌러 링크를 생성하고<br />친구에게 공유해보세요
            </p>
            <button
              type="button"
              onClick={handleAddFriend}
              className="flex items-center gap-2 px-6 py-3 bg-black text-white text-sm font-semibold rounded-pill"
            >
              <UserPlus className="w-4 h-4" />
              친구 추가하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((friend, i) => (
              <motion.div
                key={friend.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: i * 0.08 }}
              >
                <FriendCard friend={friend} onClick={setSelectedFriend} />
              </motion.div>
            ))}
          </div>
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
          friend={selectedFriend}
          onClose={() => setSelectedFriend(null)}
          onDelete={handleDelete}
        />
      )}

      <FriendInviteSheet
        inviteLink={inviteLink}
        isCopied={isLinkCopied}
        isKakaoReady={isKakaoReady}
        isOpen={isInviteSheetOpen}
        onClose={() => setIsInviteSheetOpen(false)}
        onCopyLink={() => {
          void copyInviteLink();
        }}
        onInstagramShare={() => {
          void handleInstagramShare();
        }}
        onKakaoShare={() => {
          void handleKakaoShare();
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
