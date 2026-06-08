import { useMemo } from 'react';
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ProfileStatus,
  ProfileVisibility,
  acquaintanceApi,
  matchingApi,
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

function toFriend(profile: ProfileDetail, index: number, matchingId?: string): Friend {
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
    registrationStatus: profile.status,
    // 활성/비활성 토글은 visibility(PUBLIC/PRIVATE)를 바꾸므로 그 값을 그대로 반영한다.
    // 정지(SUSPENDED) 프로필도 비활성으로 본다.
    isActive: profile.status !== ProfileStatus.SUSPENDED && profile.visibility === ProfileVisibility.PUBLIC,
    // 성사 여부는 프로필 응답에 없어 성사 목록(GET /api/matchings/matched)에서 교차 판정한다.
    isMatched: Boolean(matchingId),
    matchingId,
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

  // 성사된 친구(내 프로필)를 가려내기 위해 성사 목록을 함께 조회한다.
  // 성사 목록은 MATCHED 만 내려오므로, 여기 들어온 내 프로필 = 성사된 친구다.
  const matchedQuery = useQuery({
    queryKey: queryKeys.matchings.matched,
    queryFn: matchingApi.matched,
    enabled,
    refetchInterval: 60_000,
  });

  // 내 프로필 id → 성사된 매칭 id. (cancel-match 호출과 카드 dim 표시에 쓴다.)
  const matchedByProfile = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of matchedQuery.data ?? []) {
      map.set(m.requesterProfile.id, m.id);
      map.set(m.targetProfile.id, m.id);
    }
    return map;
  }, [matchedQuery.data]);

  const friends = useMemo(
    () =>
      detailQueries
        .map((q, index) => (q.data ? toFriend(q.data, index, matchedByProfile.get(q.data.id)) : null))
        .filter((f): f is Friend => f !== null),
    [detailQueries, matchedByProfile],
  );

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.mine });

  // 승인/거절/수정요청은 카드 status 가 들어 있는 상세(detail) 캐시를 바꾸므로
  // 목록뿐 아니라 해당 프로필의 detail 쿼리도 함께 무효화해야 화면이 즉시 갱신된다.
  // 또한 서버가 처리 직후 form_submitted 알림을 읽음 처리하므로, 알림 목록도 무효화해
  // 헤더 알림이 즉시 정리되게 한다. (approval-notification-refresh-guide §3)
  const invalidateFriend = (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.mine });
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(id) });
  };

  // visibility 변경은 목록(GET /api/profiles)과 해당 프로필 상세 양쪽의 visibility 를
  // 바꾼다. 카드의 활성/비활성은 상세의 visibility 로 판정하므로, 목록뿐 아니라
  // 상세 쿼리도 함께 무효화해 두 호출이 다시 일어나도록 한다.
  const invalidateVisibility = (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.mine });
    queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(id) });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => profileApi.remove(id),
    onSuccess: invalidate,
  });
  // 비활성화 = 매칭 노출에서 잠시 빼기(비공개), 활성화 = 다시 공개
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => profileApi.setVisibility(id, ProfileVisibility.PRIVATE),
    onSuccess: (_data, id) => invalidateVisibility(id),
  });
  const activateMutation = useMutation({
    mutationFn: (id: string) => profileApi.setVisibility(id, ProfileVisibility.PUBLIC),
    onSuccess: (_data, id) => invalidateVisibility(id),
  });

  // 폼 승인/거절/수정요청은 지인(acquaintance) 엔드포인트로 처리한다.
  // (이 백엔드에서 승인 대기 프로필 id == 지인 id 이므로 friend.id 를 그대로 쓴다.)
  const approveMutation = useMutation({
    mutationFn: (id: string) => acquaintanceApi.approve(id),
    onSuccess: (_data, id) => invalidateFriend(id),
  });
  const rejectMutation = useMutation({
    mutationFn: (id: string) => acquaintanceApi.reject(id),
    onSuccess: (_data, id) => invalidateFriend(id),
  });
  const requestEditMutation = useMutation({
    mutationFn: (id: string) => acquaintanceApi.requestEdit(id),
    onSuccess: (_data, id) => invalidateFriend(id),
  });

  // 성사된 매칭 취소 — 성사 목록에서 빠지면서 친구 카드가 다시 활성으로 돌아온다.
  // 성사 목록·내 프로필·알림을 함께 무효화해 카드 상태와 헤더 알림이 즉시 정리되게 한다.
  const cancelMatchMutation = useMutation({
    mutationFn: (matchingId: string) => matchingApi.cancelMatch(matchingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.matchings.matched });
      queryClient.invalidateQueries({ queryKey: queryKeys.profiles.mine });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
    },
  });

  const isDetailLoading =
    listQuery.isSuccess && ids.length > 0 && detailQueries.some((q) => q.isLoading);

  return {
    friends,
    isLoading: listQuery.isLoading || isDetailLoading,
    isError: listQuery.isError || detailQueries.some((q) => q.isError),
    refetch: listQuery.refetch,
    deleteFriend: deleteMutation.mutate,
    // 성공/실패에 따라 토스트를 띄울 수 있도록 Promise 를 반환한다.
    deactivateFriend: deactivateMutation.mutateAsync,
    activateFriend: activateMutation.mutateAsync,
    // 성공/실패에 따라 토스트·모달을 제어할 수 있도록 Promise 를 반환한다.
    approveFriend: approveMutation.mutateAsync,
    rejectFriend: rejectMutation.mutateAsync,
    requestEditFriend: requestEditMutation.mutateAsync,
    cancelMatchFriend: cancelMatchMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
