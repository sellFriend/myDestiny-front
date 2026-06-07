# 주선자 승인/거절 후 알림 갱신 — 프론트 구현 가이드

주선자(마담)가 매물 카드의 **승인/거절/수정요청**을 처리한 뒤, 알림 목록을 **다시 조회(refetch)** 하도록 구현하기 위한 가이드입니다.

> 모든 경로 prefix 는 `/destiny` 입니다. (예: `/destiny/api/notifications`)
> 이 프로젝트는 React Query 로 알림을 관리합니다. "재조회"는 곧 `queryClient.invalidateQueries({ queryKey: queryKeys.notifications })` 입니다.

---

## 1. 배경 — 무엇이 문제였나

- 주선자는 매물이 폼을 제출하면 `form_submitted` 알림을 받습니다.
- 이 알림으로 카드에 진입해 **승인/거절** 을 할 수 있습니다.
- 그런데 승인/거절 버튼을 눌러도 프론트가 **알림 목록을 새로 받아오지 않아서**, 이미 처리한 알림이 화면에 그대로 남았습니다.
- 사용자가 그 **남아있는 알림으로 다시 진입해 또 승인/거절** 을 시도할 수 있었고, 그 결과 이미 공개된 카드가 거절로 사라지는 문제가 있었습니다.

### 서버 측 변경 (이미 반영됨)

- 주선자가 카드를 **승인 / 거절 / 수정요청** 하면, 서버가 해당 카드의 `form_submitted` 알림을 **자동으로 읽음 처리**합니다.
- 따라서 처리 직후 `GET /destiny/api/notifications`(미읽음 목록)를 다시 호출하면, 그 알림은 **응답에서 빠집니다.**
- 또한 종결된 카드에 다시 거절을 시도하면 서버가 `409 Conflict`로 막습니다. (이중 안전장치)

> **프론트가 해야 할 일은 단 하나**: 승인/거절/수정요청 성공 후 **알림 쿼리를 무효화(invalidate)** 해서 화면을 갱신하는 것.

---

## 2. 관련 엔드포인트 / API 레이어

| 동작 | Method & Path | API 레이어 (`src/lib/api/endpoints.ts`) | 비고 |
|---|---|---|---|
| 미읽음 알림 목록 조회 | `GET /destiny/api/notifications` | `notificationApi.list` | 응답에 포함된 알림만 화면에 표시 |
| 알림 개별 읽음 처리 | `PATCH /destiny/api/notifications/{id}/read` | `notificationApi.markRead` | 사용자가 알림을 직접 닫을 때 |
| 카드 승인 | `POST /destiny/api/profiles/{id}/approve` | `acquaintanceApi.approve` | 성공 시 서버가 `form_submitted` 자동 읽음 |
| 카드 거절 | `POST /destiny/api/profiles/{id}/reject` | `acquaintanceApi.reject` | 성공 시 서버가 `form_submitted` 자동 읽음 |
| 카드 수정요청 | `POST /destiny/api/profiles/{id}/request-edit` | `acquaintanceApi.requestEdit` | 성공 시 서버가 `form_submitted` 자동 읽음 |

### 알림 응답 형태 (`GET /destiny/api/notifications` → `NotificationItem[]`)

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": "uuid",
      "type": "form_submitted",
      "matchingId": "프로필(카드) ID",
      "consentId": null,
      "isRead": false,
      "createdAt": "2026-06-07T12:00:00"
    }
  ]
}
```

> ⚠️ `form_submitted` 알림에서는 `matchingId` 필드가 **매칭 ID가 아니라 프로필(카드) ID** 를 담고 있습니다. 카드 상세로 이동할 때 이 값을 `profileId`로 사용하세요.

---

## 3. 구현 규칙

**승인 / 거절 / 수정요청 mutation 이 성공(2xx)하면, 반드시 `queryKeys.notifications` 를 무효화한다.**

`useNotifications`(`src/hooks/useNotifications.ts`)가 30초마다 폴링하지만, 그건 보조 장치일 뿐입니다. 사용자가 바로 다음 행동을 하기 때문에 **처리 직후 즉시 무효화**가 필요합니다.

처리 순서:

1. 승인/거절/수정요청 mutation 호출
2. `onSuccess` 진입
3. `queryClient.invalidateQueries({ queryKey: queryKeys.notifications })`
4. React Query 가 알림 목록을 재조회 → 처리한 `form_submitted` 알림이 빠진 최신 목록으로 화면 교체

이렇게 하면 방금 처리한 알림은 서버에서 이미 읽음 처리되어 목록에서 사라지므로, 동일 알림으로 재진입하는 경로가 차단됩니다.

### 예시 (`useAcquaintanceReview` 패턴 — 이미 반영됨)

`src/hooks/useAcquaintanceReview.ts` 는 승인/거절 성공 시 알림까지 무효화하고 있습니다.

```ts
const invalidate = () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications }); // ← 핵심
  queryClient.invalidateQueries({ queryKey: queryKeys.profiles.mine });
  if (id) queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(id) });
};

const approve = useMutation({
  mutationFn: () => acquaintanceApi.approve(id as string),
  onSuccess: () => { invalidate(); onSettled?.(); },
});
```

### 친구 페이지 경로 (반영됨)

친구 카드에서 승인/거절/수정요청(`approveMutation`/`rejectMutation`/`requestEditMutation`)을 하면 `src/pages/friends/hooks/useFriends.ts` 의 `invalidateFriend` 를 탑니다. 이 함수도 알림 쿼리를 무효화하므로, 헤더 알림이 폴링을 기다리지 않고 즉시 정리됩니다.

```ts
const invalidateFriend = (id: string) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications }); // ← 알림 즉시 갱신
  queryClient.invalidateQueries({ queryKey: queryKeys.profiles.mine });
  queryClient.invalidateQueries({ queryKey: queryKeys.profiles.detail(id) });
};
```

### (선택) 즉시 반응을 위한 옵티미스틱 처리

네트워크 왕복 동안 알림이 잠깐 남아 보이는 게 어색하면, 성공 직후 캐시에서 해당 알림을 먼저 제거하고 → 무효화로 정합성을 맞추세요.

```ts
async function onApproveSuccess(profileId: string) {
  // 1) 옵티미스틱: 같은 profileId(=matchingId)의 form_submitted 알림 즉시 제거
  queryClient.setQueryData<NotificationItem[]>(queryKeys.notifications, (prev) =>
    (prev ?? []).filter(
      (n) => !(n.type === 'form_submitted' && n.matchingId === profileId),
    ),
  );
  // 2) 서버 기준으로 재조회
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
}
```

---

## 4. 예외 처리 — 이미 종결되거나 매칭에 묶인 카드

| HTTP | 동작 | message(예) | 프론트 안내 |
|---|---|---|---|
| `409` | 승인 | `PENDING_APPROVAL 상태에서만 승인할 수 있습니다.` | "이미 처리된 카드입니다" 안내 후 알림 무효화 |
| `409` | 거절 | `승인 대기 상태에서만 거절할 수 있습니다.` | "이미 처리된 카드입니다" 안내 후 알림 무효화 |
| `409` | 수정요청 | 매칭에 묶여 있음(받은/보낸 PENDING·진행/성사) | 서버 `message` 를 그대로 토스트, 링크 공유 중단 |

- `409`를 받았을 때도 **알림 쿼리를 무효화**하면, 종결된 카드의 잔여 알림이 정리되어 화면이 정상화됩니다.
- 수정요청은 카드 상태별로 동작이 다릅니다(`src/pages/friends/index.tsx` 참고): `REJECTED`는 불가, `DRAFT`는 이미 편집 가능이라 `request-edit` 생략 후 링크만 재공유, `PENDING_APPROVAL/PUBLISHED`만 실제 `request-edit` 호출. `409`(`ApiError.status === 409`)면 서버 메시지를 그대로 노출합니다.

---

## 5. 체크리스트

- [ ] 승인 성공 후 `queryKeys.notifications` 무효화로 목록 갱신
- [ ] 거절 성공 후 `queryKeys.notifications` 무효화로 목록 갱신
- [ ] 수정요청 성공 후 `queryKeys.notifications` 무효화로 목록 갱신
- [x] `useFriends.invalidateFriend` 에 `queryKeys.notifications` 무효화 포함 (반영됨)
- [ ] (선택) 성공 직후 `setQueryData` 옵티미스틱 제거로 깜빡임 방지
- [ ] `409`(이미 처리됨/매칭에 묶임) 응답 시에도 안내 + 알림 무효화
- [ ] 알림 → 카드 진입 시 `form_submitted`의 `matchingId`를 `profileId`로 사용
