import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MatchingStatus, matchingApi, queryKeys } from '@/lib/api';
import type { RequestTab } from '@/pages/requests/utils';

/**
 * 요청함 3개 목록을 관리한다.
 * - 받은 요청(received)은 헤더 배지를 위해 항상 조회한다.
 * - 보낸 요청/성사는 해당 탭이 활성일 때만 조회(불필요한 요청 절약). 캐시로 재방문은 즉시.
 */
export function useMatchings(activeTab: RequestTab, enabled: boolean) {
  const received = useQuery({
    queryKey: queryKeys.matchings.received,
    queryFn: matchingApi.received,
    enabled,
  });

  const sent = useQuery({
    queryKey: queryKeys.matchings.sent,
    queryFn: matchingApi.sent,
    enabled: enabled && activeTab === 'sent',
  });

  const matched = useQuery({
    queryKey: queryKeys.matchings.matched,
    queryFn: matchingApi.matched,
    enabled: enabled && activeTab === 'matched',
  });

  const pendingReceivedCount =
    received.data?.filter((m) => m.status === MatchingStatus.PENDING).length ?? 0;

  return { received, sent, matched, pendingReceivedCount };
}

/** 수락 / 거절 / 취소 — 성공 시 매칭 목록 전체 무효화 */
export function useMatchingActions() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['matchings'] });

  const accept = useMutation({ mutationFn: (id: string) => matchingApi.accept(id), onSuccess: invalidate });
  const reject = useMutation({ mutationFn: (id: string) => matchingApi.reject(id), onSuccess: invalidate });
  const cancel = useMutation({ mutationFn: (id: string) => matchingApi.cancel(id), onSuccess: invalidate });

  // 현재 변이 중인 매칭 id (해당 카드 버튼만 로딩/비활성화)
  const busyId =
    (accept.isPending && accept.variables) ||
    (reject.isPending && reject.variables) ||
    (cancel.isPending && cancel.variables) ||
    null;

  return {
    accept: accept.mutate,
    reject: reject.mutate,
    cancel: cancel.mutate,
    busyId,
  };
}
