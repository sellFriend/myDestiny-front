# 카카오 로그인 리다이렉트 — 프론트 동적 복귀 지원 요청

## 배경 / 문제

- 백엔드는 개발 서버 **하나**만 운영하고, 프론트는 **로컬(`localhost:5173`)과 배포(`https://my-destiny-front.vercel.app`) 두 곳**에서 같은 백엔드를 바라봄.
- 현재 로그인 성공 후 리다이렉트가 `FRONTEND_URL` 환경변수 **고정값 한 곳**으로만 감 (`backend-login.md` 107, 202행).
- 그래서 둘 중 한 곳에서 로그인하면 다른 곳으로 튕김. **백엔드가 목적지를 한 값으로 고정하는 한, 프론트만으로는 해결 불가.**

## 요청 (핵심)

로그인 성공 후 리다이렉트 기준을 **프론트가 넘긴 `redirect_uri`** 로 변경해주세요.

프론트는 이미 자기 origin을 넘기도록 반영 완료했습니다:

```
GET /oauth2/authorization/kakao?redirect_uri=https://my-destiny-front.vercel.app/oauth2/callback
GET /oauth2/authorization/kakao?redirect_uri=http://localhost:5173/oauth2/callback
```

## 구현 항목

1. **`redirect_uri` 파라미터 보관**
   로그인 시작 시 받은 `redirect_uri`를 OAuth `state`(또는 세션/쿠키)에 저장해 카카오 왕복 동안 유지.
   *(Spring Security면 `OAuth2AuthorizationRequestResolver`로 `state`에 인코딩 → 성공 핸들러에서 디코딩하는 패턴)*

2. **성공 핸들러에서 해당 값으로 리다이렉트**

   ```
   {redirect_uri}?accessToken=...&refreshToken=...&profileImageUrl=...
   ```

3. **하위 호환**
   `redirect_uri`가 없으면 기존처럼 `FRONTEND_URL` 사용.

4. **🔒 보안 — 화이트리스트 검증 (필수)**
   허용된 origin만 통과시키고, 그 외에는 거부 또는 기본값으로 폴백.
   임의 origin을 그대로 받으면 **토큰 탈취(open redirect)** 취약점이 됩니다.
   허용 목록:
   - `http://localhost:5173`
   - `https://my-destiny-front.vercel.app`

5. **CORS 허용 출처 추가**
   현재 `localhost:3000`, `localhost:5173`만 있음 (`backend-login.md` 210행).
   → `https://my-destiny-front.vercel.app` 추가.

## 참고

- 카카오 개발자 콘솔의 Redirect URI는 **백엔드 콜백 주소 하나만**(`{baseUrl}/login/oauth2/code/kakao`) 등록하면 됩니다. 프론트 도메인은 등록 불필요.
- 프론트 콜백 경로는 `/oauth2/callback`로 고정. 토큰은 위 쿼리 파라미터로 그대로 받으면 됩니다.

## 동작 결과 (수정 후)

| 로그인 위치                            | 복귀 위치                |
| -------------------------------------- | ------------------------ |
| `https://my-destiny-front.vercel.app`  | 같은 vercel 주소로 복귀  |
| `http://localhost:5173`                | 같은 localhost로 복귀    |
