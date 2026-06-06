import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ProfileStatus,
  ProfileVisibility,
  acquaintanceApi,
  profileApi,
  queryKeys,
  type ProfileDetail,
} from '@/lib/api';
import type { Friend } from '@/pages/friends/components/FriendCard';

const CARD_COLORS = [
  'bg-pastel-lime',
  'bg-pastel-lilac',
  'bg-pastel-mint',
  'bg-pastel-coral',
  'bg-pastel-cream',
  'bg-pastel-pink',
] as const;

/** 콤마/슬래시로 구분된 취미 문자열을 태그 배열로 변환 */
function parseHobbies(hobby: string | null): string[] {
  if (!hobby) return [];
  return hobby
    .split(/[,/·]/)
    .map((h) => h.trim())
    .filter(Boolean);
}

function toFriend(profile: ProfileDetail, index: number): Friend {
  return {
    id: profile.id,
    name: profile.name,
    age: profile.age,
    isStudent: profile.isStudent,
    school: profile.schoolName ?? undefined,
    major: profile.major ?? undefined,
    occupation: profile.occupation ?? undefined,
    mbti: profile.mbti ?? '',
    intro: profile.introduction ?? '',
    hobbies: parseHobbies(profile.hobby),
    photo: profile.photoUrls[0] ?? undefined,
    cardColor: CARD_COLORS[index % CARD_COLORS.length],
    requestCount: 0, // 프로필별 받은 매칭 수 API가 없어 0으로 둔다.
    status: profile.status === ProfileStatus.PUBLISHED ? 'approved' : 'pending',
    isActive: profile.status !== ProfileStatus.SUSPENDED,
  };
}

/**
 * "내 친구" = 내 데이팅 프로필.
 * 목록(GET /api/profiles)은 필드가 적어, 각 항목 상세(GET /api/profiles/{id})를
 * 받아 카드에 필요한 전체 정보를 채운다.
 */
export function useFriends(enabled = true) {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.profiles.mine,
    queryFn: profileApi.listMine,
    enabled,
    refetchInterval: 60_000,
  });

  const ids = useMemo(() => listQuery.data?.map((p) => p.id) ?? [], [listQuery.data]);

  const detailQueries = useQueries({
    queries: ids.map((id) => ({
      queryKey: queryKeys.profiles.detail(id),
      queryFn: () => profileApi.get(id),
      enabled: enabled && listQuery.isSuccess,
    })),
  });

  const friends = useMemo(
    () =>
      detailQueries
        .map((q, index) => (q.data ? toFriend(q.data, index) : null))
        .filter((f): f is Friend => f !== null),
    [detailQueries],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.mine });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => profileApi.remove(id),
    onSuccess: invalidate,
  });
  // 비활성화 = 매칭 노출에서 잠시 빼기(비공개), 활성화 = 다시 공개
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => profileApi.setVisibility(id, ProfileVisibility.PRIVATE),
    onSuccess: invalidate,
  });
  const activateMutation = useMutation({
    mutationFn: (id: string) => profileApi.setVisibility(id, ProfileVisibility.PUBLIC),
    onSuccess: invalidate,
  });

  // 폼 승인/거절/수정요청은 지인(acquaintance) 엔드포인트로 처리한다.
  // (이 백엔드에서 승인 대기 프로필 id == 지인 id 이므로 friend.id 를 그대로 쓴다.)
  const approveMutation = useMutation({
    mutationFn: (id: string) => acquaintanceApi.approve(id),
    onSuccess: invalidate,
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => acquaintanceApi.reject(id),
    onSuccess: invalidate,
  });
  const requestEditMutation = useMutation({
    mutationFn: (id: string) => acquaintanceApi.requestEdit(id),
    onSuccess: invalidate,
  });

  const isDetailLoading =
    listQuery.isSuccess && ids.length > 0 && detailQueries.some((q) => q.isLoading);

  return {
    friends,
    isLoading: listQuery.isLoading || isDetailLoading,
    isError: listQuery.isError || detailQueries.some((q) => q.isError),
    refetch: listQuery.refetch,
    deleteFriend: deleteMutation.mutate,
    deactivateFriend: deactivateMutation.mutate,
    activateFriend: activateMutation.mutate,
    // 성공/실패에 따라 토스트·모달을 제어할 수 있도록 Promise 를 반환한다.
    approveFriend: approveMutation.mutateAsync,
    rejectFriend: rejectMutation.mutateAsync,
    requestEditFriend: requestEditMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
