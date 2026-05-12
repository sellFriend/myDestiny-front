# 프론트엔드 프로젝트 구조 가이드

> 이 문서는 프론트엔드 프로젝트 폴더 구조를 정리한 문서이다.  
> 목적은 **폴더 이름을 예쁘게 나누는 것**이 아니라,  
> **변경 범위가 예측 가능하고**, **함께 바뀌는 코드가 함께 있도록** 구조를 설계하는 것이다.

---

# 1. 핵심 철학

이 구조는 아래 기준을 우선한다.

1. **함께 수정되는 파일은 가깝게 둔다.**
2. **페이지 전용 코드는 해당 페이지 폴더 안에만 둔다.**
3. **여러 페이지에서 실제로 재사용될 때만 공통 폴더로 올린다.**
4. 공통화는 무조건 좋은 것이 아니다.  
   **같이 바뀌지 않을 가능성이 높다면 중복을 허용한다.**

---

# 2. 최상위 구조

```txt
src/
  components/
  hooks/
  utils/
  styles/
  providers/
  router/
  services/
  store/
  types/
  constants/
  pages/
```

---

# 3. 각 디렉토리의 역할

## 3.1 `components/`

여러 페이지에서 공통으로 사용하는 UI 컴포넌트를 둔다.

- `components/ui/` — shadcn/ui 기반 기본 컴포넌트 (`Button`, `Input`, `Dialog` 등)
- 특정 페이지 전용 컴포넌트는 여기에 두지 않는다.

---

## 3.2 `hooks/`

여러 페이지에서 공통으로 사용하는 커스텀 훅을 둔다.

예:
- `useDebounce`
- `useDisclosure`
- `useLocalStorage`

특정 페이지에서만 쓰는 훅은 해당 `pages/<page-name>/hooks/` 안에 둔다.

---

## 3.3 `utils/`

공통 유틸리티 함수를 둔다.

예:
- `cn` (clsx + tailwind-merge)
- `formatDate`
- `downloadFile`

---

## 3.4 `styles/`

전역 스타일 파일을 둔다.

- `globals.css` — Tailwind 기반 CSS 변수, 전역 스타일

---

## 3.5 `providers/`

앱 전역 Provider를 둔다.

예:
- `QueryProvider.tsx` — React Query 설정
- `ThemeProvider.tsx` — 테마 설정

---

## 3.6 `router/`

라우터 설정을 둔다.

- `index.tsx` — `createBrowserRouter`로 라우트 목록 관리

---

## 3.7 `services/`

서버와 통신하는 순수 API 함수를 둔다.

예:
- `auth.ts`
- `documents.ts`

중요:
- 여기서는 토스트를 띄우지 않는다.
- 상태를 변경하지 않는다.
- 서버 요청 자체만 담당한다.

---

## 3.8 `store/`

전역 클라이언트 상태 관리를 둔다 (Zustand 기반).

예:
- `useAuthStore.ts`
- `useThemeStore.ts`

서버 상태는 React Query로 관리하고, 이곳에는 순수 클라이언트 상태만 둔다.

---

## 3.9 `types/`

여러 곳에서 공통으로 사용하는 TypeScript 타입을 둔다.

예:
- `common.ts`
- `api.ts`

특정 페이지 전용 타입은 해당 페이지 폴더 내에 정의한다.

---

## 3.10 `constants/`

공통 상수를 둔다.

예:
- `routes.ts`
- `queryKeys.ts`

---

## 3.11 `pages/`

실제 URL에 대응되는 페이지 컴포넌트를 둔다.

각 페이지는 다음 구조를 따른다:

```txt
pages/
  <page-name>/
    index.tsx          # 페이지 진입점 (라우터가 참조)
    components/        # 이 페이지에서만 쓰는 컴포넌트
    hooks/             # 이 페이지에서만 쓰는 커스텀 훅
    utils/             # 이 페이지에서만 쓰는 유틸리티
```

---

# 4. 전체 디렉토리 구조 예시

```txt
src/
  components/
    ui/
      Button.tsx
      Input.tsx
      Dialog.tsx

  hooks/
    useDebounce.ts
    useDisclosure.ts

  utils/
    index.ts           # cn, formatDate 등

  styles/
    globals.css

  providers/
    QueryProvider.tsx

  router/
    index.tsx

  services/
    auth.ts
    documents.ts

  store/
    useAuthStore.ts

  types/
    common.ts

  constants/
    routes.ts
    queryKeys.ts

  pages/
    home/
      index.tsx

    login/
      index.tsx
      components/
        LoginForm.tsx
      hooks/
        useLoginForm.ts

    document-detail/
      index.tsx
      components/
        DocumentHeader.tsx
        DocumentEditor.tsx
      hooks/
        useDocumentDetail.ts
      utils/
        formatContent.ts
```

---

# 5. 코드 위치 판단 기준

새 파일을 만들기 전 아래 질문으로 위치를 결정한다.

## 5.1 이건 여러 페이지에서 실제로 쓰이는가?

- **예** → `components/`, `hooks/`, `utils/`, `services/` 등 공통 폴더
- **아니오** → 해당 `pages/<page-name>/` 내부

## 5.2 이건 서버 통신 함수인가?

- **예** → `services/`
- **아니오** → 데이터 변환이면 `utils/` 또는 페이지의 `utils/`

## 5.3 이건 UI 컴포넌트인가?

- 여러 페이지 공통 → `components/ui/`
- 특정 페이지 전용 → `pages/<page-name>/components/`

---

# 6. 자주 발생하는 실수

## 6.1 금지: 모든 것을 공통 폴더에 넣기

```txt
# 나쁜 예 — 페이지 전용 컴포넌트가 공통 폴더에 있음
src/components/DocumentEditor.tsx   ← 한 페이지에서만 쓰임
src/hooks/useDocumentSave.ts        ← 한 페이지에서만 쓰임
```

```txt
# 좋은 예
src/pages/document-detail/components/DocumentEditor.tsx
src/pages/document-detail/hooks/useDocumentSave.ts
```

## 6.2 금지: page에 모든 로직을 몰아넣기

```tsx
// 나쁜 예 — index.tsx 안에 query, mutation, validation, layout 혼재
export default function DocumentDetailPage() {
  const [title, setTitle] = useState('');
  const { data } = useQuery(...);
  const mutation = useMutation(...);
  const handleSave = () => { ... };
  const validate = () => { ... };
  return <div>...</div>;
}
```

```tsx
// 좋은 예 — hook으로 로직 분리
import { useDocumentDetail } from './hooks/useDocumentDetail';

export default function DocumentDetailPage() {
  const { document, handleSave, isLoading } = useDocumentDetail();
  return <div>...</div>;
}
```

## 6.3 조심: 너무 이른 공통화

두 페이지에서 비슷해 보인다고 무조건 공통 컴포넌트로 올리지 않는다.  
요구사항이 조금씩 달라질 가능성이 높다면 처음엔 각 페이지 폴더에 따로 두는 것이 낫다.

---

# 7. 최종 규칙 요약

| 질문 | 위치 |
|------|------|
| 여러 페이지에서 쓰이는 UI | `components/ui/` |
| 여러 페이지에서 쓰이는 훅 | `hooks/` |
| 여러 페이지에서 쓰이는 유틸 | `utils/` |
| 서버 통신 함수 | `services/` |
| 전역 클라이언트 상태 | `store/` |
| 페이지 전용 컴포넌트 | `pages/<name>/components/` |
| 페이지 전용 훅 | `pages/<name>/hooks/` |
| 페이지 전용 유틸 | `pages/<name>/utils/` |
| 실제 URL 화면 | `pages/<name>/index.tsx` |
