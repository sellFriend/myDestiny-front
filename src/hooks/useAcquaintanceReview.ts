import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { acquaintanceApi, profileApi, queryKeys, type ProfileDetail } from '@/lib/api';

/**
 * 폼 승인/거절 (주선자) — 친구가 폼 제출 완료(PENDING_APPROVAL) 후
 * 주선자가 상세를 확인하고 승인(POST /api/profiles/{id}/approve) 또는
 * 거절(POST /api/profiles/{id}/reject)한다.
 * 통합 후 상세는 GET /api/profiles/{id} → ProfileDetail 로 일원화됐다.
 */
export function useAcquaintanceReview(id: string | null, onSettled?: () => void) {
  const queryClient = useQueryClient();

  const detail = useQuery<ProfileDetail>({
    queryKey: queryKeys.profiles.detail(id ?? ''),
    queryFn: () => profileApi.get(id as string),
    enabled: Boolean(id),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.mine });
    if (id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(id) });
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
