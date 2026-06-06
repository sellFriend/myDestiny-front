import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, MatchingStatus, matchingApi, queryKeys } from '@/lib/api';
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
    refetchInterval: 30_000,
  });

  const sent = useQuery({
    queryKey: queryKeys.matchings.sent,
    queryFn: matchingApi.sent,
    enabled: enabled && activeTab === 'sent',
    refetchInterval: 30_000,
  });

  const matched = useQuery({
    queryKey: queryKeys.matchings.matched,
    queryFn: matchingApi.matched,
    enabled: enabled && activeTab === 'matched',
    refetchInterval: 30_000,
  });

  const pendingReceivedCount =
    received.data?.filter((m) => m.status === MatchingStatus.PENDING).length ?? 0;

  return { received, sent, matched, pendingReceivedCount };
}

/** 수락 / 거절 / 취소 — 성공 시 매칭 목록 전체 무효화 */
export function useMatchingActions() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['matchings'] });

  /**
   * 동시성 에러(이미 처리됨 409 / 기한 만료 410)는 목록이 낡았다는 신호이므로,
   * 서버 message 를 안내하고 목록을 새로고침해 최신 상태로 맞춘다. (matching-frontend-guide §4.2)
   */
  const onError = (error: unknown) => {
    setFeedback(error instanceof ApiError ? error.message : '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.');
    invalidate();
  };

  const accept = useMutation({ mutationFn: (id: string) => matchingApi.accept(id), onSuccess: invalidate, onError });
  // 거절은 사유(선택)를 함께 보낸다. (matching-frontend-guide §4.3)
  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => matchingApi.reject(id, reason),
    onSuccess: invalidate,
    onError,
  });
  const cancel = useMutation({ mutationFn: (id: string) => matchingApi.cancel(id), onSuccess: invalidate, onError });

  // 현재 변이 중인 매칭 id (해당 카드 버튼만 로딩/비활성화)
  const busyId =
    (accept.isPending && accept.variables) ||
    (reject.isPending && reject.variables?.id) ||
    (cancel.isPending && cancel.variables) ||
    null;

  return {
    accept: accept.mutate,
    reject: reject.mutate,
    cancel: cancel.mutate,
    busyId,
    feedback,
    clearFeedback: () => setFeedback(null),
  };
}
