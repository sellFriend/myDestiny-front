import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationApi, queryKeys, type NotificationItem } from '@/lib/api';

/**
 * 헤더 알림 — 읽지 않은 알림 목록 조회(GET /api/notifications) + 읽음 처리
 * (PATCH /api/notifications/{id}/read). 로그인 상태에서만 주기적으로 폴링한다.
 */
export function useNotifications(enabled = true) {
  const queryClient = useQueryClient();

  const query = useQuery<NotificationItem[]>({
    queryKey: queryKeys.notifications,
    queryFn: notificationApi.list,
    enabled,
    refetchInterval: 30_000,
  });

  const markRead = useMutation({
    mutationFn: (id: string) => notificationApi.markRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications }),
  });

  const notifications = query.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return {
    notifications,
    unreadCount,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    markRead: markRead.mutate,
  };
}
