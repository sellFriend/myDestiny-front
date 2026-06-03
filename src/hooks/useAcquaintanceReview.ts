import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { acquaintanceApi, queryKeys, type AcquaintanceDetail } from '@/lib/api';

/**
 * 폼 승인/거절 (마담) — 지인이 폼 제출 완료(verification_pending) 후
 * 마담이 상세를 확인하고 승인(POST /api/acquaintances/{id}/approve) 또는
 * 거절(POST /api/acquaintances/{id}/reject)한다.
 */
export function useAcquaintanceReview(id: string | null, onSettled?: () => void) {
  const queryClient = useQueryClient();

  const detail = useQuery<AcquaintanceDetail>({
    queryKey: queryKeys.acquaintances.detail(id ?? ''),
    queryFn: () => acquaintanceApi.get(id as string),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.mine });
    if (id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.acquaintances.detail(id) });
    }
  };

  const approve = useMutation({
    mutationFn: () => acquaintanceApi.approve(id as string),
    onSuccess: () => {
      invalidate();
      onSettled?.();
    },
  });

  const reject = useMutation({
    mutationFn: () => acquaintanceApi.reject(id as string),
    onSuccess: () => {
      invalidate();
      onSettled?.();
    },
  });

  return {
    detail: detail.data,
    isLoading: detail.isLoading,
    isError: detail.isError,
    approve: approve.mutate,
    reject: reject.mutate,
    isApproving: approve.isPending,
    isRejecting: reject.isPending,
    isBusy: approve.isPending || reject.isPending,
  };
}
