# 카카오 프로필 사진 처리 흐름 (로그인 ~ 폼 사진 등록)

> 정리일: 2026-06-06
> 관련 코드: `OAuth2SuccessHandler`, `CustomOAuth2UserService`, `AcquaintanceService`, `FormDataRequest`

---

## 자주 하는 오해

> "카카오 로그인 후 모달에서 '카카오 프사 쓸래?' Yes를 누르면, 서버가 바로 카카오 프사를 응답으로 줘서 화면에 띄운다."

**실제 동작은 다릅니다.** 사진 URL을 받는 시점과 메커니즘이 분리되어 있습니다.

---

## 1. 카카오 프사 URL을 "받는" 시점은 폼 제출이 아니라 **로그인 직후**

`OAuth2SuccessHandler.java:43-58` — 카카오 로그인 성공 시 리다이렉트 URL에 쿼리 파라미터로 프사 URL을 붙여 내려줍니다.

```
http://localhost:3000/oauth2/callback?accessToken=...&refreshToken=...&profileImageUrl=<카카오프사URL>
```

이 `profileImageUrl`은 `CustomOAuth2UserService.java:40,53`에서 카카오 응답의 `profile.profile_image_url`을 User에 저장해 둔 값입니다.

> 모달에서 "이 사진 쓸래?" 미리보기를 띄울 수 있는 건 이 redirect 파라미터 덕분이며, 폼 제출 응답이 아닙니다.
> 로그인하자마자 이미 클라이언트 손에 들어와 있습니다.

---

## 2. "Yes" = `useKakaoPhoto=true`는 **폼 제출 때** 보내는 값

`useKakaoPhoto`는 로그인 모달의 즉답이 아니라 `FormDataRequest`의 필드입니다 (`FormDataRequest.java:6`).
나중에 폼을 `POST /form/{madamId}` 할 때 같이 실어 보냅니다.

서버는 그때 `AcquaintanceService.java:99-105`에서 **DB에 첫 사진(displayOrder=0)으로 저장만** 합니다.

```java
if (req.useKakaoPhoto() && friend.getKakaoProfileImageUrl() != null) {
    acquaintancePhotoRepository.save(AcquaintancePhoto.builder()
        .acquaintance(acquaintance)
        .imageUrl(friend.getKakaoProfileImageUrl())   // 로그인한 지인 본인의 카카오 프사
        .displayOrder(0)
        .build());
}
```

폼 제출 응답(`FormDataResponse`, `AcquaintanceService.java:109`)은 **`{ acquaintanceId, uploadToken, status }`만** 반환합니다.
**사진 URL은 응답에 포함되지 않습니다.**

---

## 3. 정리

| 질문 | 실제 |
|---|---|
| "Yes 누르면 서버가 바로 사진을 응답으로 주냐?" | **아니요.** 폼 제출 응답엔 사진 URL 없음. 서버는 DB에 displayOrder=0으로 저장만. |
| 그럼 모달 미리보기는 뭘로 띄우나? | **로그인 직후** redirect 쿼리파람 `profileImageUrl`로 이미 받은 값. |
| 등록된 사진을 다시 화면에 보려면? | `GET /form/{uploadToken}/photos` 또는 프로필 조회의 `photoUrls`로 별도 조회. |

---

## 4. 주의 — 누구의 사진인가

저장되는 사진은 **로그인한 지인 본인(`friend`)** 의 카카오 프사입니다 (`AcquaintanceService.java:75,99`).
폼 링크를 만든 마담(`madam`)의 사진이 아니라, 폼을 작성하는 당사자의 사진입니다.
