# 카카오 로그인 리다이렉트 트러블슈팅

> 로컬/배포 어디서 로그인하든 무조건 `localhost`로 튕기던 문제부터, 동적 복귀 적용 후 발생한 콜백 404까지 — 두 단계에 걸친 원인과 해결을 정리한 문서.

---

## 1단계 — 무조건 `localhost`로 리다이렉트되던 문제

### 증상 (Symptom)

- 로컬(`localhost:5173`)에서 로그인하든, 배포 웹(`https://my-destiny-front.vercel.app`)에서 로그인하든 **무조건 `localhost`로 리다이렉트**됨.
- 그래서 배포 웹에서 로그인하면 엉뚱하게 로컬 주소로 튕겨 로그인이 끝나지 않음.

### 원인 (Root Cause)

- 백엔드는 개발 서버 **하나**만 운영하는데, 프론트는 **로컬·배포 두 곳**에서 같은 백엔드를 바라봄.
- 로그인 성공 후 리다이렉트 목적지가 백엔드 환경변수 `FRONTEND_URL` **고정값 한 곳**(`http://localhost:3000` 기본값)으로만 향함.
- 목적지를 백엔드가 한 값으로 고정하는 한, **프론트만으로는 해결 불가**한 구조였음.

### 해결 (Solution)

두 주체로 나뉘어 진행:

**① 프론트 (적용 완료 — commit `428c61e`)**
- 로그인 시작 시 현재 origin을 `redirect_uri` 파라미터로 백엔드에 전달.

```ts
// src/contexts/AuthContext.tsx — loginWithKakao()
const redirectUri = `${window.location.origin}/oauth2/callback`;
const params = new URLSearchParams({ redirect_uri: redirectUri });
window.location.href = `${BASE_URL}/oauth2/authorization/kakao?${params.toString()}`;
```

```
GET /oauth2/authorization/kakao?redirect_uri=https://my-destiny-front.vercel.app/oauth2/callback
GET /oauth2/authorization/kakao?redirect_uri=http://localhost:5173/oauth2/callback
```

**② 백엔드 (요청 — `backend-login-redirect-request.md`)**
- 로그인 시작 시 받은 `redirect_uri`를 OAuth `state`(또는 세션)에 보관해 카카오 왕복 동안 유지.
- 성공 핸들러에서 `FRONTEND_URL` 대신 해당 `redirect_uri`로 리다이렉트.
- 🔒 **보안**: 허용 origin 화이트리스트(`http://localhost:5173`, `https://my-destiny-front.vercel.app`)만 통과 — open redirect(토큰 탈취) 방지.
- `redirect_uri` 없으면 기존 `FRONTEND_URL`로 폴백(하위 호환).
- CORS 허용 출처에 `https://my-destiny-front.vercel.app` 추가.

→ 결과: 로그인 시작한 곳으로 그대로 복귀하게 됨.

| 로그인 위치 | 복귀 위치 |
| --- | --- |
| `https://my-destiny-front.vercel.app` | 같은 vercel 주소 |
| `http://localhost:5173` | 같은 localhost |

---

## 2단계 — 동적 복귀 적용 후 발생한 콜백 404

### 증상 (Symptom)

- 백엔드 동적 복귀 적용 후, 배포 웹 로그인은 이제 **vercel 도메인으로 정상 복귀**함.
- 그러나 복귀 직후 아래 요청에서 **404 (Not Found)** 발생:

```
GET https://my-destiny-front.vercel.app/oauth2/callback?accessToken=...&refreshToken=...
→ 404 (Not Found)
```

- 로컬(`localhost:5173`)에서는 같은 흐름이 정상 동작.

### 원인 (Root Cause)

- 본 앱은 `createBrowserRouter`(HTML5 history 모드) 기반 SPA. `/oauth2/callback`은 **클라이언트 라우트**(실제 파일 아님).
- **localhost**: Vite dev server가 모든 경로를 `index.html`로 fallback → React Router가 라우트를 잡음 → 정상.
- **Vercel**: SPA fallback 설정(`vercel.json`)이 없어, `/oauth2/callback`을 **실제 정적 파일 경로로 해석** → 파일 없음 → **404**.
- 즉 1단계 동적 복귀는 정상 동작했고(주소는 vercel로 잘 돌아옴), Vercel이 그 경로를 라우트로 인식하지 못한 게 별개 원인이었음.

### 해결 (Solution)

프로젝트 루트에 `vercel.json` 추가 — 모든 경로를 `index.html`로 rewrite:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- `/oauth2/callback` 포함 모든 경로가 `index.html`로 서빙되고, React Router가 클라이언트 라우팅을 처리.
- 정적 자산(`/assets/*`)은 실제 파일이 우선 매칭되므로 영향 없음.

### 검증 (Verification)

- [ ] 배포 환경에서 카카오 로그인 → `/oauth2/callback` 404 없이 콜백 페이지 진입 (재배포 후 확인 필요)
- [x] localhost 로그인 정상 동작 유지
- ⚠️ 본 수정은 "콜백 경로 404"만 해결. 콜백 진입 **이후** 토큰 저장·인증 갱신·API 호출(특히 **CORS**)은 별개 점검 필요.

---

## 참고 (Reference)

- **관련 커밋**
  - `428c61e` [feat] 카카오 로그인 후 프론트 origin으로 동적 복귀 (1단계 프론트)
  - `1dc7b16` [fix] 카카오 로그인 콜백 404 해결을 위한 SPA fallback 추가 (2단계)
- **관련 PR**
  - #15 `fix/origin-login → dev`
  - #16 `dev → main`
- **관련 문서**
  - `backend-login.md` — 카카오 OAuth2 인증 흐름, JWT, CORS 명세
  - `backend-login-redirect-request.md` — `redirect_uri` 기반 동적 복귀 백엔드 요청서
- **핵심 코드**
  - `src/contexts/AuthContext.tsx` — `loginWithKakao()` (redirect_uri 전달)
  - `src/pages/oauth-callback/index.tsx` — 콜백 토큰 처리
  - `vercel.json` — SPA fallback
