# 인증 (Authentication)

## Base URL

```
http://localhost:8888/destiny
```

---

## 개요

카카오 OAuth2로 최초 로그인하고, 이후 API 요청은 JWT(Access Token)로 인증합니다.

```
프론트엔드
  │
  ├─→ GET /oauth2/authorization/kakao        ← 로그인 시작
  │        │
  │        └─→ 카카오 인증 서버
  │                 │
  │                 └─→ GET /login/oauth2/code/kakao  ← 카카오 콜백
  │                          │
  │                          ├─ DB에서 사용자 조회 or 신규 생성
  │                          ├─ Access Token 발급 (24시간)
  │                          ├─ Refresh Token 발급 (14일) → DB 저장
  │                          └─→ 302 redirect
  │
  └─← {FRONTEND_URL}/oauth2/callback?accessToken=...&refreshToken=...&profileImageUrl=...
```

---

## 엔드포인트

### 1. 카카오 로그인 시작

```
GET /oauth2/authorization/kakao
```

인증 불필요. Spring Security가 카카오 인증 페이지로 리다이렉트합니다.

---

### 2. 토큰 갱신

```
POST /api/auth/refresh
```

**인증**: 불필요

**요청 헤더**

| 헤더              | 필수 | 설명                             |
| ----------------- | ---- | -------------------------------- |
| `X-Refresh-Token` | Y    | 로그인 시 발급받은 Refresh Token |

**응답 200**

```json
{
  "status": 200,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9..."
  }
}
```

**오류 응답**

| 상태 | 메시지                             | 원인                                        |
| ---- | ---------------------------------- | ------------------------------------------- |
| 401  | 유효하지 않은 리프레시 토큰입니다. | 서명 검증 실패 또는 JWT 만료                |
| 401  | 만료된 리프레시 토큰입니다.        | DB에 저장된 토큰과 불일치 또는 서버 측 만료 |
| 404  | 사용자를 찾을 수 없습니다.         | 탈퇴된 사용자                               |

---

### 3. 로그아웃

```
POST /api/auth/logout
```

**인증**: Access Token 필요 (`Authorization: Bearer {accessToken}`)

**응답 200**

```json
{
  "status": 200,
  "data": null
}
```

DB에 저장된 Refresh Token을 삭제합니다. 이후 토큰 갱신 불가.

---

## 로그인 성공 후 리다이렉트

로그인 성공 시 아래 URL로 302 리다이렉트합니다.

```
{FRONTEND_URL}/oauth2/callback?accessToken=...&refreshToken=...&profileImageUrl=...
```

- `FRONTEND_URL` 기본값: `http://localhost:3000`
- `profileImageUrl`은 카카오 프로필 이미지가 없으면 포함되지 않음

---

## JWT 토큰

### 공통 구조

| 클레임 | 내용                  |
| ------ | --------------------- |
| `sub`  | 사용자 ID (내부 UUID) |
| `iat`  | 발급 시각             |
| `exp`  | 만료 시각             |

서명 알고리즘: HMAC-SHA256 (`app.jwt.secret`)

### Access Token

- 유효기간: **24시간** (`app.jwt.access-token-expiry=86400000`)
- 저장 위치: 클라이언트 (서버 미저장)
- 사용: `Authorization: Bearer {accessToken}` 헤더

### Refresh Token

- 유효기간: **14일** (`app.jwt.refresh-token-expiry=1209600000`)
- 저장 위치: 클라이언트 + DB (`users.refresh_token`, `users.refresh_token_expires_at`)
- 사용: `POST /api/auth/refresh` 의 `X-Refresh-Token` 헤더
- 갱신 시 새 Access Token만 발급 (Refresh Token은 유지)
- 로그아웃 시 DB에서 삭제 → 이후 갱신 불가

---

## API 요청 인증

`/api/**`, `/form/**` 경로는 JWT 필터(`JwtAuthenticationFilter`)가 동작합니다.

```
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...
```

**인증 불필요 경로** (permitAll):

| 경로                      | 메서드 |
| ------------------------- | ------ |
| `GET /form/**`            | GET    |
| `/api/auth/refresh`       | POST   |
| `GET /api/invitations/**` | GET    |

인증 실패 시 응답:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "로그인이 필요합니다."
}
```

---

## 카카오 OAuth2 설정

| 항목               | 값                                        |
| ------------------ | ----------------------------------------- |
| Authorization URI  | `https://kauth.kakao.com/oauth/authorize` |
| Token URI          | `https://kauth.kakao.com/oauth/token`     |
| User Info URI      | `https://kapi.kakao.com/v2/user/me`       |
| Scope              | `profile_nickname`                        |
| Redirect URI       | `{baseUrl}/login/oauth2/code/kakao`       |
| Client Auth Method | `client_secret_post`                      |

환경변수: `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`

---

## 사용자 생성/업데이트 로직

카카오 콜백 시 `CustomOAuth2UserService`가 아래를 처리합니다.

- **기존 사용자** (kakaoId 일치): `lastLoginAt` 갱신, 프로필 이미지 업데이트
- **신규 사용자**: kakaoId, email, nickname, 프로필 이미지로 DB 저장

---

## 환경변수

| 변수                  | 기본값                  | 설명                          |
| --------------------- | ----------------------- | ----------------------------- |
| `KAKAO_CLIENT_ID`     | `your-client-id`        | 카카오 앱 REST API 키         |
| `KAKAO_CLIENT_SECRET` | `your-client-secret`    | 카카오 앱 시크릿 키           |
| `JWT_SECRET`          | (개발용 기본값)         | JWT 서명 키 (32자 이상 필수)  |
| `FRONTEND_URL`        | `http://localhost:3000` | 로그인 후 리다이렉트 기준 URL |

> 운영 환경에서는 반드시 `JWT_SECRET`을 안전한 랜덤 값으로 교체해야 합니다.

---

## CORS

허용 출처: `http://localhost:3000`, `http://localhost:5173` (또는 `FRONTEND_URL`)

모든 HTTP 메서드, 모든 헤더, Credentials 허용.
