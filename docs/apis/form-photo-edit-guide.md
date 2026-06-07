# 폼 사진 수정 가이드 (프론트엔드)

> 관련 문서: [form-photo-guide.md](./form-photo-guide.md) (업로드 전체 흐름·명세)
> 모든 경로 prefix 는 `/destiny` 입니다. (예: `/destiny/form/{uploadToken}/photos`)

## 증상

사진을 수정하려고 할 때 400 에러가 발생한다.

```
POST https://fixlog.art/destiny/form/{uploadToken}/photos
400 Bad Request
{ "success": false, "message": "사진은 최대 1장까지 등록할 수 있습니다.", "data": null }
```

> ⚠️ 한도 메시지의 숫자는 서버 정책(폼 종류·시점)에 따라 다를 수 있다. 핵심은 **"이미 한도에 찬 상태에서 추가(POST)를 보내 막혔다"** 는 점이다.

## 원인

사진 API 는 **추가**와 **교체(수정)** 가 서로 다른 엔드포인트로 나뉘어 있다.

| 동작 | 메서드 | 경로 | API 레이어 | 비고 |
|------|--------|------|-----------|------|
| 목록 조회 | `GET` | `/form/{uploadToken}/photos` | `formApi.listPhotos` | `id` 확인용 |
| 신규 등록 | `POST` | `/form/{uploadToken}/photos` | `formApi.uploadPhoto` | 장수 한도 체크 |
| 수정/교체 | `PUT` | `/form/{uploadToken}/photos/{photoId}` | `formApi.replacePhoto` | 한도 체크 없음, 기존 파일 삭제 후 대체 |

이미 사진이 한도까지 등록된 상태에서 **수정**을 `POST`(추가)로 보내면, 추가 엔드포인트가 장수 한도에 걸려 400 을 반환한다.

즉, 수정은 `POST`가 아니라 **`PUT /photos/{photoId}`** 로 호출해야 한다.

## 해결 방법

이 프로젝트에는 이미 세 동작이 `formApi`(`src/lib/api/endpoints.ts`)로 래핑돼 있다. raw `fetch` 대신 이걸 쓰면 인증(`Authorization`)·`Content-Type`·응답 unwrap 이 자동 처리된다.

```ts
import { formApi, type FormPhoto } from '@/lib/api';

async function saveFormPhoto(uploadToken: string, file: File): Promise<FormPhoto> {
  // 1) 현재 등록된 사진 조회 → 교체 대상 id 확보
  const photos = await formApi.listPhotos(uploadToken);
  // photos => [{ id, url, displayOrder }, ...]   ← displayOrder 오름차순

  if (photos.length > 0) {
    // 2-a) 이미 사진이 있으면 → 교체 (PUT). 기존 파일은 서버가 자동 삭제
    return formApi.replacePhoto(uploadToken, photos[0].id, file);
  }
  // 2-b) 사진이 없으면 → 신규 등록 (POST)
  return formApi.uploadPhoto(uploadToken, file);
}
```

> `FormPhoto` 모델(`src/lib/api/models.ts`)은 **`{ id, url, displayOrder }`** 다. 응답에 `photoId`·`imageUrl` 같은 필드는 없으니, 교체 대상은 반드시 **`photo.id`** 로 지정한다.

### raw fetch 로 직접 호출해야 한다면

```js
const token = uploadToken; // 예: "9c0a7e34627d43e78f5c6d924cd197a1"

const list = await fetch(`/destiny/form/${token}/photos`, {
  method: "GET",
  headers: { Authorization: `Bearer ${accessToken}` },
}).then((r) => r.json());
// list.data => [{ id, url, displayOrder }, ...]

const form = new FormData();
form.append("file", file); // input[type=file] 의 File 객체

if (list.data.length > 0) {
  const photoId = list.data[0].id; // ← photoId 가 아니라 id
  await fetch(`/destiny/form/${token}/photos/${photoId}`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
} else {
  await fetch(`/destiny/form/${token}/photos`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form,
  });
}
```

## 주의사항

- 요청 본문은 `multipart/form-data`, 파일 파라미터 이름은 반드시 **`file`** (`@RequestParam("file")`).
- raw `FormData` 사용 시 `Content-Type` 헤더를 직접 설정하지 말 것 (브라우저가 boundary 포함해 자동 설정). `formApi`를 쓰면 axios 가 알아서 처리한다.
- 교체 대상 식별자는 `GET /photos` 응답 각 항목의 **`id`** 다. (`photoId` 라는 필드는 없다.)
- `/form/**` 은 client 의 `PUBLIC_PATHS` 라 인터셉터가 `Authorization` 을 생략한다. 그래서 `formApi`의 사진 메서드는 `accessToken` 을 헤더에 직접 넣는다 — raw `fetch` 로 호출할 때도 `Authorization` 헤더를 빠뜨리지 말 것.
