import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import type { NotificationItem } from '@/lib/api';
import { useNotifications } from '@/hooks/useNotifications';
import { AcquaintanceReviewModal } from '@/components/notifications/AcquaintanceReviewModal';
import {
  acquaintanceIdOf,
  isFormSubmitted,
  notificationMeta,
  timeAgo,
} from '@/components/notifications/notificationMeta';

interface NotificationBellProps {
  enabled: boolean;
}

export function NotificationBell({ enabled }: NotificationBellProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, markRead } = useNotifications(enabled);
  const [isOpen, setIsOpen] = useState(false);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 패널 바깥 클릭 / ESC 로 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    window.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isOpen]);

  if (!enabled) return null;

  const handleSelect = (notification: NotificationItem) => {
    if (!notification.isRead) {
      markRead(notification.id);
    }

    if (isFormSubmitted(notification)) {
      const acquaintanceId = acquaintanceIdOf(notification);
      if (acquaintanceId) {
        setReviewId(acquaintanceId);
        setIsOpen(false);
      }
      return;
    }

    setIsOpen(false);
    navigate(ROUTES.REQUESTS);
  };

  return (
    <>
      <div ref={containerRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-black transition-colors hover:bg-black/5"
          aria-label="알림"
          aria-expanded={isOpen}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[9px] font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="absolute right-0 top-full z-[90] mt-2 w-[20rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-block border border-black/10 bg-white shadow-2xl"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
                <span className="text-sm font-black text-black">알림</span>
                {unreadCount > 0 && (
                  <span className="text-[11px] font-semibold text-black/40">
                    읽지 않음 {unreadCount}
                  </span>
                )}
              </div>

              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex h-28 items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/20 border-t-black" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex h-28 flex-col items-center justify-center text-center">
                    <p className="text-sm font-semibold text-black/60">새로운 알림이 없어요</p>
                    <p className="mt-1 text-xs text-black/35">소식이 생기면 여기에 표시돼요</p>
                  </div>
                ) : (
                  <ul>
                    {notifications.map((notification) => {
                      const meta = notificationMeta(notification.type);
                      return (
                        <li key={notification.id}>
                          <button
                            type="button"
                            onClick={() => handleSelect(notification)}
                            className="flex w-full items-start gap-3 border-b border-black/5 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-black/[0.03]"
                          >
                            <span
                              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                                notification.isRead ? 'bg-transparent' : 'bg-black'
                              }`}
                              aria-hidden
                            />
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block text-sm ${
                                  notification.isRead ? 'font-medium text-black/55' : 'font-bold text-black'
                                }`}
                              >
                                {meta.title}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-black/40">
                                {meta.desc}
                              </span>
                            </span>
                            <span className="shrink-0 text-[11px] text-black/30">
                              {timeAgo(notification.createdAt)}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {reviewId && (
        <AcquaintanceReviewModal acquaintanceId={reviewId} onClose={() => setReviewId(null)} />
      )}
    </>
  );
}
