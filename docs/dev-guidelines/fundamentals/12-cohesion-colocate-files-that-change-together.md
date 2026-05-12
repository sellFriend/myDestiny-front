> 종류별 폴더 분리보다 **함께 수정되는 파일끼리 가까이 두라**.

# 함께 수정되는 파일을 같은 디렉토리에 두기

## 왜 필요한가

컴포넌트/훅/유틸 종류별로만 나누면
특정 기능을 고칠 때 관련 파일을 찾기 어렵고,
삭제 시 찌꺼기 코드가 남기 쉽다.

## 프로젝트 규칙

- 공통 폴더(`components/`, `hooks/`, `utils/`)는 실제로 여러 페이지에서 재사용하는 것만
- 페이지 안에서만 바뀌는 코드는 해당 `pages/<name>/` 내부에 colocate한다
- 페이지 전용 컴포넌트, 훅, 유틸은 각각 `components/`, `hooks/`, `utils/` 서브 폴더로 분리한다

## 추천 구조

```txt
src/
  components/       # 여러 페이지 공통 컴포넌트
    ui/
  hooks/            # 여러 페이지 공통 훅
  utils/            # 여러 페이지 공통 유틸
  services/         # 서버 통신 함수
  pages/
    document-detail/
      index.tsx
      components/   # 이 페이지에서만 쓰는 컴포넌트
      hooks/        # 이 페이지에서만 쓰는 훅
      utils/        # 이 페이지에서만 쓰는 유틸
    document-list/
      index.tsx
      components/
      hooks/
```

### 판단 기준

문서 상세 페이지의 저장 기능을 바꿀 때

- API 함수 (`services/documents.ts`)
- 저장 hook (`pages/document-detail/hooks/useDocumentSave.ts`)
- 저장 버튼 UI (`pages/document-detail/components/SaveButton.tsx`)

이 함께 바뀐다면 가까이 둔다.
