import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Camera,
  Instagram,
  MessageCircle,
  X,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { FORM_KAKAO_AUTHED_KEY, useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  formApi,
  getKakaoProfileImage,
  hasAccessToken,
} from "@/lib/api";
import type { FormDraft, FormSubmitRequest } from "@/lib/api";
import {
  useRegisterForm,
  type RegisterFormData,
} from "@/pages/register/hooks/useRegisterForm";
import { CardPreview } from "@/pages/register/components/CardPreview";

// MBTI를 16지선다 대신 4개의 2지선다 축으로 분해 (Hick's Law)
const MBTI_AXES = [
  {
    title: "에너지 방향",
    options: [
      { value: "E", label: "외향", desc: "함께 있을 때 충전돼요" },
      { value: "I", label: "내향", desc: "혼자일 때 충전돼요" },
    ],
  },
  {
    title: "인식 방식",
    options: [
      { value: "N", label: "직관", desc: "가능성을 상상해요" },
      { value: "S", label: "감각", desc: "현실을 중시해요" },
    ],
  },
  {
    title: "판단 기준",
    options: [
      { value: "T", label: "사고", desc: "논리로 판단해요" },
      { value: "F", label: "감정", desc: "마음으로 공감해요" },
    ],
  },
  {
    title: "생활 방식",
    options: [
      { value: "J", label: "계획", desc: "계획적으로 움직여요" },
      { value: "P", label: "탐색", desc: "유연하게 움직여요" },
    ],
  },
] as const;

const HOBBY_OPTIONS = [
  "여행",
  "독서",
  "운동",
  "영화",
  "음악",
  "요리",
  "게임",
  "사진",
  "카페",
  "등산",
  "자전거",
  "수영",
  "요가",
  "SNS",
  "드라이브",
  "전시",
];

const STEP_LABELS = [
  "사진",
  "기본 정보",
  "소속",
  "MBTI",
  "소개",
  "연락처",
  "미리보기",
];

const stepVariants = {
  enter: (dir: number) => ({ x: dir * 40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -40, opacity: 0 }),
};

/** 숫자만 받아 휴대폰 형식(010-1234-5678)으로 표시용 변환 */
function formatPhone(digits: string): string {
  const d = (digits ?? "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

/** 휴대폰 번호 유효성: 01로 시작하는 10~11자리 숫자 */
function isValidPhone(digits: string): boolean {
  return /^01\d{8,9}$/.test(digits);
}

/** 콤마/슬래시로 구분된 취미 문자열을 태그 배열로 변환 (prefill 복원용) */
function parseHobbiesString(hobbies: string | null): string[] {
  if (!hobbies) return [];
  return hobbies
    .split(/[,/·]/)
    .map((h) => h.trim())
    .filter(Boolean);
}

// 사진 업로드 제약 (form-photo-guide.md)
const PHOTO_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const PHOTO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PHOTO_MAX_BYTES = 10 * 1024 * 1024; // 10MB

/** 폼 입력값을 폼 제출 요청 body 로 변환한다. (주선자 코드/토큰은 path·헤더로 분리) */
function toFormSubmitRequest(form: RegisterFormData): FormSubmitRequest {
  const job = form.isStudent
    ? [form.school, form.major].filter(Boolean).join(" ")
    : form.occupation;

  return {
    // 카카오 프사 사용 여부는 모달에서 받은 명시적 선택값을 그대로 보낸다. (kakao-photo-flow.md 2장)
    useKakaoPhoto: form.useKakaoPhoto,
    name: form.name.trim(),
    age: Number(form.age),
    // 서버는 대문자 enum 을 받는다. (male → MALE)
    gender: form.gender ? (form.gender === "male" ? "MALE" : "FEMALE") : null,
    job: job.trim() || null,
    intro: form.intro.trim() || null,
    mbti: form.mbti || null,
    hobbies: form.hobbies.length > 0 ? form.hobbies.join(", ") : null,
    phoneNumber: form.phoneNumber,
    kakaoId: form.kakaoId.trim() || null,
    instagramId: form.instagramId.trim() || null,
  };
}

const RegisterPage = () => {
  const {
    step,
    totalSteps,
    form,
    isCompleted,
    updateField,
    applyDraft,
    toggleHobby,
    goNext,
    goPrev,
    submit,
  } = useRegisterForm();
  // 숏링크(`/form/:madamId`)로 들어온 경우의 주선자 식별 코드. 제출 시 path variable 로 쓴다.
  const { madamId } = useParams<{ madamId: string }>();
  const { isLoggedIn, isLoading: isAuthLoading, loginWithKakao } = useAuth();
  // 이 폼에 대해 이번 세션에서 카카오 인증을 마쳤는지. (옵션 B: 토큰 유무와 무관하게 강제)
  const formAuthed =
    !madamId ||
    sessionStorage.getItem(FORM_KAKAO_AUTHED_KEY) === `${ROUTES.FORM}/${madamId}`;
  // 숏링크 유효성: GET /form/{madamId} 로 확인. (null=확인 중, true/false=결과)
  const [linkValid, setLinkValid] = useState<boolean | null>(madamId ? null : true);
  // 폼 진입 차단 사유(400): 본인 폼·주선자 등록 불가·이미 다른 주선자 등록 등의 안내 메시지. (cross-role-block-guide.md)
  const [linkErrorMessage, setLinkErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [photoError, setPhotoError] = useState("");
  // 카카오 로그인 직후 받은 본인 프사 URL. 폼 사진 모달 미리보기에 쓴다. (kakao-photo-flow.md)
  const kakaoPhotoUrl = getKakaoProfileImage();
  // 카카오 프사 사용 여부를 모달에서 선택했는지. (true면 모달을 다시 띄우지 않음)
  const [kakaoChoiceMade, setKakaoChoiceMade] = useState(false);
  // 폼 텍스트 제출 성공 시 받는 사진 업로드용 토큰. 사진 단계만 재시도할 때 중복 제출을 막는다.
  const uploadTokenRef = useRef<string | null>(null);
  // 서버 prefill(draft)을 받아 기존 작성분을 불러온 수정 모드인지. (안내 배너 노출용)
  const [isEditMode, setIsEditMode] = useState(false);
  // prefill 은 한 번만 적용한다. (링크 검증 effect 재실행 시 사용자가 수정한 값을 덮어쓰지 않도록)
  const prefillAppliedRef = useRef(false);
  const [direction, setDirection] = useState(1);
  const [customHobbies, setCustomHobbies] = useState<string[]>([]);
  const [showCustomHobbyInput, setShowCustomHobbyInput] = useState(false);
  const [customHobbyInput, setCustomHobbyInput] = useState("");
  // 한 스텝 안에서 "다음" 버튼으로 위에 쌓여 노출된 입력 단계 (0 = 첫 입력만 노출)
  const [revealStage, setRevealStage] = useState(0);

  const submitCustomHobby = () => {
    const trimmed = customHobbyInput.trim();
    setCustomHobbyInput("");
    setShowCustomHobbyInput(false);
    if (!trimmed) return;
    // 이미 존재하는 태그면 추가하지 않고 선택만
    if ([...HOBBY_OPTIONS, ...customHobbies].includes(trimmed)) {
      if (!form.hobbies.includes(trimmed)) toggleHobby(trimmed);
      return;
    }
    setCustomHobbies((prev) => [...prev, trimmed]);
    toggleHobby(trimmed);
  };

  // MBTI 4개 축의 현재 선택값 (E/I, N/S, T/F, J/P). 4개가 모두 채워지면 form.mbti 완성.
  const [mbtiAxes, setMbtiAxes] = useState<(string | null)[]>(() => {
    const preset = form.mbti.length === 4 ? form.mbti.split("") : [];
    return [
      preset[0] ?? null,
      preset[1] ?? null,
      preset[2] ?? null,
      preset[3] ?? null,
    ];
  });

  const selectMbtiAxis = (index: number, value: string) => {
    const next = [...mbtiAxes];
    next[index] = value;
    setMbtiAxes(next);
    updateField("mbti", next.every(Boolean) ? next.join("") : "");
  };

  // 옵션 B: 폼 진입 시 토큰 유무와 무관하게 카카오 로그인을 강제한다.
  // (이미 이번 세션에서 이 폼을 인증했으면 재로그인하지 않아 무한 루프를 막는다.)
  useEffect(() => {
    if (!madamId || formAuthed) return;
    loginWithKakao(`${ROUTES.FORM}/${madamId}`);
  }, [madamId, formAuthed, loginWithKakao]);

  // 서버 prefill(draft)로 폼을 미리 채운다. (수정 요청을 받은 친구가 폼에 재진입한 경우)
  const applyPrefill = (draft: FormDraft) => {
    if (prefillAppliedRef.current) return;
    prefillAppliedRef.current = true;

    const hobbies = parseHobbiesString(draft.hobbies);
    const phone = (draft.phoneNumber ?? "").replace(/\D/g, "").slice(0, 11);
    const mbti = draft.mbti && draft.mbti.length === 4 ? draft.mbti : "";

    applyDraft({
      name: draft.name ?? "",
      age: draft.age != null ? String(draft.age) : "",
      gender:
        draft.gender === "male" ? "male" : draft.gender === "female" ? "female" : null,
      // 서버 draft 는 직업을 단일 문자열(job)로만 주므로 비학생/직업으로 복원한다.
      isStudent: false,
      occupation: draft.job ?? "",
      mbti,
      hobbies,
      intro: draft.intro ?? "",
      phoneNumber: phone,
      kakaoId: draft.kakaoId ?? "",
      instagramId: draft.instagramId ?? "",
      // 기존에 올린 사진을 미리보기로 보여준다. (useKakaoPhoto 는 prefill 대상 아님)
      photoPreview: draft.photoUrls?.[0] ?? "",
      photoFile: null,
      useKakaoPhoto: false,
    });

    if (mbti) setMbtiAxes(mbti.split(""));
    // 기본 취미 목록에 없는 항목은 커스텀 칩으로 노출한다.
    setCustomHobbies(hobbies.filter((h) => !HOBBY_OPTIONS.includes(h)));
    // prefill 사진이 있으니 카카오 프사 모달을 다시 띄우지 않는다.
    setKakaoChoiceMade(true);
    setIsEditMode(true);
  };

  // 카카오 인증을 마친 뒤에만 숏링크 유효성을 확인하고, prefill(draft)이 있으면 폼을 채운다.
  // (GET /form/{madamId} — Authorization 이 있으면 기존 작성분을 함께 내려준다.)
  useEffect(() => {
    if (!madamId || !formAuthed || !isLoggedIn) return;
    let alive = true;
    formApi.getForm(madamId).then(
      ({ draft }) => {
        if (!alive) return;
        setLinkValid(true);
        if (draft) applyPrefill(draft);
      },
      (error) => {
        if (!alive) return;
        setLinkValid(false);
        // 400 은 역할 충돌 등 명시적 사유가 있어 그 메시지를 그대로 보여준다. (404 등은 일반 안내)
        if (error instanceof ApiError && error.status === 400 && error.message) {
          setLinkErrorMessage(error.message);
        }
      },
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [madamId, formAuthed, isLoggedIn]);

  // 숏링크로 진입한 폼은 (카카오 로그인 강제 → 링크 확인) 순으로 게이트를 통과해야 작성할 수 있다.
  if (madamId) {
    // ① 아직 이 폼을 카카오 인증하지 않음 → 로그인 화면으로 자동 이동 중
    if (!formAuthed) {
      return (
        <CenteredNotice
          title="카카오 로그인이 필요해요"
          description={
            <>
              본인 인증을 위해 카카오 로그인 화면으로 이동하고 있어요.
              <br />
              자동으로 넘어가지 않으면 아래 버튼을 눌러 주세요.
            </>
          }
          action={
            <button
              type="button"
              onClick={() => loginWithKakao(`${ROUTES.FORM}/${madamId}`)}
              className="flex items-center justify-center gap-2 rounded-pill bg-[#FEE500] px-6 py-3.5 text-sm font-semibold text-[#191600] transition-[filter] hover:brightness-95"
            >
              카카오로 로그인하고 작성하기
            </button>
          }
        />
      );
    }

    // ② 로그인 세션 동기화 중 → 스피너
    if (isAuthLoading || !isLoggedIn) {
      return <CenteredSpinner />;
    }

    // ③ 링크 유효성 확인 중 → 스피너
    if (linkValid === null) {
      return <CenteredSpinner />;
    }

    // ④ 잘못된/만료된 숏링크 또는 역할 충돌(400) → 안내 화면
    if (linkValid === false) {
      // 400 차단 사유가 있으면 서버 메시지를 그대로 노출하고, 그 외엔 만료/오류 안내를 보여준다.
      if (linkErrorMessage) {
        return <CenteredNotice title="폼에 들어갈 수 없어요" description={linkErrorMessage} />;
      }
      return (
        <CenteredNotice
          title="유효하지 않은 링크예요"
          description={
            <>
              링크가 만료됐거나 잘못됐어요.
              <br />
              주선자에게 링크를 다시 받아 주세요.
            </>
          }
        />
      );
    }
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          className="w-20 h-20 rounded-full bg-pastel-lime flex items-center justify-center mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <Check className="w-10 h-10 text-black" strokeWidth={3} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
        >
          <h2 className="text-3xl font-black text-black mb-3">제출 완료!</h2>
          <p className="text-black/50 leading-relaxed mb-8">
            주선자의 승인을 기다리고 있어요.
            <br />
            승인되면 탐색 화면에 카드가 등록돼요.
          </p>
          <Link
            to={ROUTES.HOME}
            className="px-6 py-3 border border-black/10 text-black/60 text-sm font-semibold rounded-pill"
          >
            홈으로 돌아가기
          </Link>
        </motion.div>
      </div>
    );
  }

  const phoneValid = isValidPhone(form.phoneNumber);

  // 각 스텝의 하위 입력 단계별 유효성 (배열 길이 = 그 스텝의 단계 수, [i]=i번째 단계 입력이 완료됐는지)
  const stageValidators = (s: number): boolean[] => {
    switch (s) {
      case 2: // 기본 정보: 이름 → 나이 → 성별
        return [
          form.name.trim().length > 0,
          form.age.trim().length > 0 && Number(form.age) >= 19,
          form.gender !== null,
        ];
      case 3: // 소속: 학생 여부 → 학교·학과 / 직업
        if (form.isStudent === null) return [false];
        return form.isStudent
          ? [true, form.school.trim().length > 0, form.major.trim().length > 0]
          : [true, form.occupation.trim().length > 0];
      case 5: // 소개: 취미 → 한 줄 소개
        return [form.hobbies.length > 0, form.intro.trim().length > 0];
      case 6: // 연락처: 전화번호 → 공개 연락처
        return [
          phoneValid,
          (form.instagramId ?? "").trim().length > 0 ||
            (form.kakaoId ?? "").trim().length > 0,
        ];
      default: // 1 사진 · 4 MBTI · 7 미리보기 등 단일 입력
        return [s === 4 ? form.mbti.length > 0 : true];
    }
  };

  // 스텝 진입 시 노출 단계: 이미 채워진 앞 단계는 펼친 채로 시작(되돌아왔을 때 대비)
  const initialRevealStage = (s: number): number => {
    const v = stageValidators(s);
    let i = 0;
    while (i < v.length - 1 && v[i]) i++;
    return i;
  };

  const validators = stageValidators(step);
  const lastStageIndex = validators.length - 1;
  const currentStage = Math.min(revealStage, lastStageIndex);
  const isLastStage = revealStage >= lastStageIndex;
  // 노출된 모든 단계(0..현재)가 유효해야 다음 단계/스텝으로 진행 가능
  const canProceed = validators.slice(0, currentStage + 1).every(Boolean);

  const handleNext = () => {
    if (!canProceed) return;
    if (isLastStage) {
      setDirection(1);
      setRevealStage(initialRevealStage(step + 1));
      goNext();
    } else {
      // 같은 스텝 안에서 다음 입력을 위에 쌓아 노출 (자동 포커스는 등장한 input의 autoFocus가 처리)
      setRevealStage((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setDirection(-1);
    setRevealStage(initialRevealStage(step - 1));
    goPrev();
  };

  // 입력란에서 Enter → "다음"(마지막 스텝이면 제출 확인). textarea 줄바꿈·한글 조합 확정·
  // 커스텀 취미 입력(자체 Enter 처리)은 제외한다.
  const handleEnterKey = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    if (e.nativeEvent.isComposing) return; // 한글 등 IME 조합 중 Enter는 무시
    if (!(e.target instanceof HTMLInputElement)) return; // input 포커스일 때만
    e.preventDefault();
    if (step < totalSteps) {
      if (canProceed) handleNext();
    } else {
      setShowConfirm(true);
    }
  };

  // 폼 제출: madamId 는 path, B 의 accessToken 은 Authorization 헤더, 입력값은 body 로 전달. (폼_인증.pdf 2장)
  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!madamId) {
      setSubmitError("유효하지 않은 폼 링크예요. 주선자에게 링크를 다시 받아 주세요.");
      return;
    }
    if (!hasAccessToken()) {
      setSubmitError("로그인 후 제출할 수 있어요. 카카오 로그인을 먼저 진행해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      // ① 폼 텍스트 제출 → uploadToken 확보. 사진만 재시도하는 경우 중복 제출하지 않는다.
      if (!uploadTokenRef.current) {
        const { uploadToken } = await formApi.submit(madamId, toFormSubmitRequest(form));
        uploadTokenRef.current = uploadToken;
      }

      // ② 카카오 프사를 쓰지 않고 직접 올린 사진이 있으면 별도 단계로 업로드한다.
      //    (useKakaoPhoto=true면 서버가 카카오 프사를 displayOrder=0 으로 자동 등록)
      if (!form.useKakaoPhoto && form.photoFile) {
        await formApi.uploadPhoto(uploadTokenRef.current, form.photoFile);
      }

      setShowConfirm(false);
      submit();
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "제출에 실패했어요. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택도 onChange 가 동작하도록 초기화
    if (!file) return;

    if (!PHOTO_ALLOWED_TYPES.includes(file.type)) {
      setPhotoError("JPG·PNG·WEBP·GIF 이미지만 올릴 수 있어요.");
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setPhotoError("사진 용량은 10MB 이하만 가능해요.");
      return;
    }

    setPhotoError("");
    updateField("photoPreview", URL.createObjectURL(file));
    updateField("photoFile", file);
    // 직접 업로드를 선택하면 카카오 프사 사용은 해제한다.
    updateField("useKakaoPhoto", false);
    setKakaoChoiceMade(true);
  };

  // 카카오 프사 모달: "이 사진으로 할게요"
  const handleUseKakaoPhoto = () => {
    if (kakaoPhotoUrl) {
      updateField("photoPreview", kakaoPhotoUrl);
    }
    updateField("photoFile", null);
    updateField("useKakaoPhoto", true);
    setKakaoChoiceMade(true);
  };

  // 카카오 프사 모달: "직접 올릴게요"
  const handleSkipKakaoPhoto = () => {
    updateField("useKakaoPhoto", false);
    setKakaoChoiceMade(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-black/5">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          My Destiny
        </Link>

        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i + 1 <= step ? "bg-black w-4" : "bg-black/10 w-2"
              }`}
            />
          ))}
        </div>

        <span className="text-xs text-black/40 font-mono">
          {step}/{totalSteps}
        </span>
      </header>

      <main
        className="flex-1 flex flex-col px-6 py-10 max-w-lg mx-auto w-full"
        onKeyDown={handleEnterKey}
      >
        {/* 수정 모드: 주선자의 수정 요청으로 폼에 재진입해 기존 작성분을 불러온 상태 */}
        {isEditMode && (
          <div className="mb-6 rounded-block bg-pastel-lime/40 px-4 py-3 text-sm font-medium leading-relaxed text-black/70">
            이전에 작성한 내용을 불러왔어요. 수정해서 다시 제출하면 주선자에게 전달돼요.
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            className="flex-1 flex flex-col"
            custom={direction}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <p className="text-xs font-mono uppercase tracking-widest text-black/30 mb-2">
              Step {step} — {STEP_LABELS[step - 1]}
            </p>

            {/* Step 1: Photo */}
            {step === 1 && (
              <StepWrapper title="대표 사진을 올려주세요">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={PHOTO_ACCEPT}
                  className="hidden"
                  onChange={handlePhotoChange}
                />
                <div
                  className="group relative w-full aspect-[4/3] rounded-block overflow-hidden border-2 border-dashed border-black/15 flex flex-col items-center justify-center cursor-pointer hover:border-black/30 transition-colors bg-black/3"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.photoPreview ? (
                    <>
                      <img
                        src={form.photoPreview}
                        alt="photo"
                        className="w-full h-full object-cover"
                      />
                      {/* 사진 위에 호버 시 다시 올리기 안내 오버레이 */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/45 group-hover:opacity-100">
                        <Camera className="h-8 w-8" />
                        <span className="text-sm font-semibold">
                          다른 사진으로 바꾸기
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <Camera className="w-10 h-10 text-black/30 mb-3" />
                      <span className="text-sm text-black/40">사진 선택</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {form.photoPreview ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-sm font-semibold text-black/55 underline underline-offset-4 transition-colors hover:text-black"
                    >
                      다시 올리기
                    </button>
                  ) : (
                    <p className="text-sm text-black/30">사진은 1장만 올릴 수 있어요</p>
                  )}
                  {/* 카카오 프사가 있고 지금 그걸 쓰고 있지 않으면 전환 버튼을 보여준다. */}
                  {kakaoPhotoUrl && !form.useKakaoPhoto && (
                    <button
                      type="button"
                      onClick={handleUseKakaoPhoto}
                      className="text-sm font-semibold text-black/55 underline underline-offset-4 transition-colors hover:text-black"
                    >
                      카카오 프로필 사진 쓰기
                    </button>
                  )}
                </div>
                {form.useKakaoPhoto && (
                  <p className="text-sm font-medium text-black/45">
                    카카오 프로필 사진을 대표 사진으로 사용해요
                  </p>
                )}
                {photoError && (
                  <p className="text-sm font-medium text-red-600">{photoError}</p>
                )}
              </StepWrapper>
            )}

            {/* Step 2: 기본 정보 — "다음"을 누르면 이름 위로 나이 → 성별이 순서대로 쌓여 등장 */}
            {step === 2 && (
              <StepWrapper title="기본 정보를 알려주세요">
                <div className="flex flex-col gap-6">
                  <StackReveal
                    show={revealStage >= 2}
                    fieldKey="gender"
                    label="성별"
                    border={false}
                  >
                    <div className="flex gap-4">
                      {(
                        [
                          { label: "여성", value: "female" },
                          { label: "남성", value: "male" },
                        ] as const
                      ).map(({ label, value }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => updateField("gender", value)}
                          className={`flex-1 py-5 rounded-block text-sm font-semibold border-2 transition-all ${
                            form.gender === value
                              ? "bg-black text-white border-black"
                              : "border-black/10 text-black/60 hover:border-black/30"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </StackReveal>
                  <StackReveal
                    show={revealStage >= 1}
                    fieldKey="age"
                    label="나이"
                  >
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => updateField("age", e.target.value)}
                      placeholder="예: 27"
                      min={19}
                      max={45}
                      className="w-full bg-transparent py-2 text-2xl font-bold text-black outline-none placeholder:text-black/20"
                      autoFocus
                    />
                  </StackReveal>
                  <Field label="이름">
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      placeholder="예: 김민후"
                      className="w-full bg-transparent py-2 text-2xl font-bold text-black outline-none placeholder:text-black/20"
                      autoFocus={revealStage === 0}
                    />
                  </Field>
                </div>
              </StepWrapper>
            )}

            {/* Step 3: 소속 — 토글 선택 시 위로 학교/직업이 등장, 학교 입력 후 "다음"으로 학과가 쌓임 */}
            {step === 3 && (
              <StepWrapper title="소속을 알려주세요">
                <div className="flex flex-col gap-6">
                  {/* 학과 (학생일 때, 맨 위) */}
                  {form.isStudent === true && (
                    <StackReveal
                      show={revealStage >= 2}
                      fieldKey="major"
                      label="학과"
                    >
                      <input
                        type="text"
                        value={form.major}
                        onChange={(e) => updateField("major", e.target.value)}
                        placeholder="예: 디지털미디어학과"
                        className="w-full bg-transparent py-2 text-xl font-bold text-black outline-none placeholder:text-black/20"
                        autoFocus
                      />
                    </StackReveal>
                  )}

                  {/* 학교 / 직업 (토글 위) */}
                  <AnimatePresence mode="wait" initial={false}>
                    {revealStage >= 1 && form.isStudent === true && (
                      <motion.div
                        key="school"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <Field label="학교">
                          <input
                            type="text"
                            value={form.school}
                            onChange={(e) =>
                              updateField("school", e.target.value)
                            }
                            placeholder="예: 숭실대학교"
                            className="w-full bg-transparent py-2 text-xl font-bold text-black outline-none placeholder:text-black/20"
                            autoFocus
                          />
                        </Field>
                      </motion.div>
                    )}
                    {revealStage >= 1 && form.isStudent === false && (
                      <motion.div
                        key="work"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        <Field label="직업">
                          <input
                            type="text"
                            value={form.occupation}
                            onChange={(e) =>
                              updateField("occupation", e.target.value)
                            }
                            placeholder="예: 디자이너"
                            className="w-full bg-transparent py-2 text-2xl font-bold text-black outline-none placeholder:text-black/20"
                            autoFocus
                          />
                        </Field>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 학생 여부 토글 (맨 아래). 선택하면 곧바로 1단계 노출 */}
                  <div>
                    <p className="mb-2 text-xs font-semibold text-black/45">
                      현재 학생인가요?
                    </p>
                    <div className="flex gap-4">
                      {[
                        { label: "네, 학생이에요", value: true },
                        { label: "아니요", value: false },
                      ].map(({ label, value }) => (
                        <button
                          key={String(value)}
                          type="button"
                          onClick={() => {
                            updateField("isStudent", value);
                            setRevealStage(1);
                          }}
                          className={`flex-1 py-5 rounded-block text-sm font-semibold border-2 transition-all ${
                            form.isStudent === value
                              ? "bg-black text-white border-black"
                              : "border-black/10 text-black/60 hover:border-black/30"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </StepWrapper>
            )}

            {/* Step 4: MBTI */}
            {step === 4 && (
              <StepWrapper title="MBTI가 어떻게 되나요?">
                <p className="-mt-2 text-sm text-black/40">
                  4가지만 고르면 완성돼요. 잘 몰라도 느낌대로 골라보세요.
                </p>

                {/* 실시간으로 조립되는 결과 */}
                <div className="flex items-center justify-center gap-2">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black transition-colors ${
                        mbtiAxes[i]
                          ? "bg-black text-white"
                          : "bg-black/5 text-black/20"
                      }`}
                    >
                      {mbtiAxes[i] ?? "·"}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  {MBTI_AXES.map((axis, index) => (
                    <div key={axis.title}>
                      <p className="mb-2 text-xs font-semibold text-black/45">
                        {axis.title}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {axis.options.map((opt) => {
                          const selected = mbtiAxes[index] === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => selectMbtiAxis(index, opt.value)}
                              className={`flex flex-col items-center gap-0.5 rounded-xl border px-3 py-3 transition-all ${
                                selected
                                  ? "border-black bg-black text-white"
                                  : "border-black/10 text-black/60 hover:border-black/30"
                              }`}
                            >
                              <span className="text-sm font-bold">
                                {opt.value} · {opt.label}
                              </span>
                              <span
                                className={`text-[11px] leading-tight ${selected ? "text-white/70" : "text-black/35"}`}
                              >
                                {opt.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </StepWrapper>
            )}

            {/* Step 5: 소개 — 취미 선택 후 "다음"을 누르면 취미 위로 한 줄 소개가 등장 */}
            {step === 5 && (
              <StepWrapper title="나를 소개해주세요">
                {/* 한 줄 소개 (취미 위, revealStage>=1) */}
                <StackReveal
                  show={revealStage >= 1}
                  fieldKey="intro"
                  label="한 줄 소개"
                  hint="어떤 사람인지 한두 문장으로 편하게 적어주세요."
                  border={false}
                >
                  <div className="rounded-block border border-black/10 bg-black/[0.015] px-5 py-4 transition-colors focus-within:border-black/40">
                    <textarea
                      value={form.intro}
                      onChange={(e) => updateField("intro", e.target.value)}
                      placeholder="예: 여행과 사진을 좋아하는 자유로운 영혼이에요."
                      rows={4}
                      maxLength={300}
                      className="w-full resize-none bg-transparent text-lg leading-relaxed text-black outline-none placeholder:text-black/25"
                      autoFocus
                    />
                    <div className="mt-2 flex items-center justify-end border-t border-black/[0.06] pt-2.5">
                      <span className="font-mono text-xs tracking-wide text-black/35">
                        {form.intro.length}
                        <span className="text-black/20"> / 300</span>
                      </span>
                    </div>
                  </div>
                </StackReveal>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-black/40">
                    좋아하는 걸 골라주세요. 여러 개도 좋아요.
                  </p>
                  <span className="font-mono text-xs text-black/35">
                    {form.hobbies.length > 0 ? (
                      <span className="font-semibold text-black">
                        {form.hobbies.length}개 선택됨
                      </span>
                    ) : (
                      "최소 1개"
                    )}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {HOBBY_OPTIONS.map((hobby) => (
                    <button
                      key={hobby}
                      type="button"
                      onClick={() => toggleHobby(hobby)}
                      className={`cursor-pointer px-5 py-3 text-sm font-medium rounded-pill border transition-all ${
                        form.hobbies.includes(hobby)
                          ? "bg-black text-white border-black"
                          : "border-black/10 text-black/60 hover:border-black/30"
                      }`}
                    >
                      {hobby}
                    </button>
                  ))}
                  {customHobbies.map((hobby) => (
                    <button
                      key={`custom-${hobby}`}
                      type="button"
                      onClick={() => toggleHobby(hobby)}
                      className={`cursor-pointer px-5 py-3 text-sm font-medium rounded-pill border transition-all ${
                        form.hobbies.includes(hobby)
                          ? "bg-black text-white border-black"
                          : "border-black/10 text-black/60 hover:border-black/30"
                      }`}
                    >
                      {hobby}
                    </button>
                  ))}
                  {showCustomHobbyInput ? (
                    <div className="flex items-center rounded-pill border border-black/30 focus-within:border-black transition-colors">
                      <input
                        type="text"
                        autoFocus
                        value={customHobbyInput}
                        onChange={(e) => setCustomHobbyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            // 취미 추가만 하고 스텝 이동은 막는다 (main의 Enter 핸들러로 전파 방지)
                            e.stopPropagation();
                            if (!e.nativeEvent.isComposing) submitCustomHobby();
                          }
                          if (e.key === "Escape") {
                            setCustomHobbyInput("");
                            setShowCustomHobbyInput(false);
                          }
                        }}
                        placeholder="직접 입력"
                        className="pl-4 pr-1 py-3 text-sm font-medium outline-none bg-transparent w-24"
                      />
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={submitCustomHobby}
                        className="cursor-pointer pr-4 pl-2 py-3 text-sm font-semibold text-black/50 hover:text-black transition-colors"
                      >
                        추가
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCustomHobbyInput(true)}
                      className="cursor-pointer px-5 py-3 text-sm font-medium rounded-pill border border-dashed border-black/20 text-black/40 hover:border-black/40 hover:text-black/60 transition-all"
                    >
                      기타 +
                    </button>
                  )}
                </div>
              </StepWrapper>
            )}

            {/* Step 6: 연락처 — 전화번호 입력 후 "다음"을 누르면 위로 공개 연락처가 등장 */}
            {step === 6 && (
              <StepWrapper title="어떻게 연락하면 될까요?">
                <div className="flex flex-col gap-6">
                  {/* 공개 연락처 (전화번호 위, revealStage>=1) */}
                  <StackReveal
                    show={revealStage >= 1}
                    fieldKey="contact"
                    label="공개 연락처"
                    hint="매칭이 성사되면 상대에게 공개돼요. 둘 중 하나만 입력해도 충분해요."
                    border={false}
                  >
                    <div className="space-y-1">
                      {/* 인스타그램 */}
                      <div className="flex items-center gap-3 border-b-2 border-black/10 py-3 transition-colors focus-within:border-black">
                        <Instagram className="h-5 w-5 shrink-0 text-black/40" />
                        <input
                          type="text"
                          value={form.instagramId ?? ""}
                          onChange={(e) =>
                            updateField(
                              "instagramId",
                              e.target.value.replace(/\s/g, ""),
                            )
                          }
                          placeholder="인스타그램 ID"
                          className="w-full bg-transparent text-lg font-bold text-black outline-none placeholder:text-black/20"
                          autoFocus
                        />
                        {(form.instagramId ?? "").trim() && (
                          <Check className="h-4 w-4 shrink-0 text-black" />
                        )}
                      </div>

                      {/* 카카오톡 */}
                      <div className="flex items-center gap-3 border-b-2 border-black/10 py-3 transition-colors focus-within:border-black">
                        <MessageCircle className="h-5 w-5 shrink-0 text-black/40" />
                        <input
                          type="text"
                          value={form.kakaoId ?? ""}
                          onChange={(e) =>
                            updateField(
                              "kakaoId",
                              e.target.value.replace(/\s/g, ""),
                            )
                          }
                          placeholder="카카오톡 ID"
                          className="w-full bg-transparent text-lg font-bold text-black outline-none placeholder:text-black/20"
                        />
                        {(form.kakaoId ?? "").trim() && (
                          <Check className="h-4 w-4 shrink-0 text-black" />
                        )}
                      </div>
                    </div>
                  </StackReveal>

                  {/* 전화번호 (맨 아래) */}
                  <div>
                    <Field label="전화번호 (비공개)">
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={formatPhone(form.phoneNumber)}
                        onChange={(e) =>
                          updateField(
                            "phoneNumber",
                            e.target.value.replace(/\D/g, "").slice(0, 11),
                          )
                        }
                        placeholder="010-0000-0000"
                        className="w-full bg-transparent py-2 text-2xl font-bold text-black outline-none placeholder:text-black/20"
                        autoFocus={revealStage === 0}
                      />
                    </Field>
                    <p className="mt-2 text-xs leading-relaxed text-black/35">
                      전화번호는 중복 가입을 막기 위해서만 써요. 다른 사람에게는
                      절대 공개되지 않아요.
                    </p>
                  </div>
                </div>
              </StepWrapper>
            )}

            {/* Step 7: Preview */}
            {step === 7 && (
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <h2 className="text-3xl font-black text-black mb-1">
                    이렇게 등록될 거예요
                  </h2>
                  <p className="text-sm text-black/40">
                    카드 미리보기예요. 수정하려면 이전으로 돌아가세요.
                  </p>
                </div>
                <div className="max-w-sm mx-auto w-full">
                  <CardPreview form={form} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto flex items-center gap-3 pt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="shrink-0 rounded-pill border border-black/15 px-5 py-4 text-sm font-semibold text-black/55 transition-colors hover:border-black/35 hover:text-black"
            >
              이전
            </button>
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className="flex flex-1 items-center justify-center py-4 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 disabled:opacity-30 transition-all"
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="flex flex-1 items-center justify-center py-4 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-all"
            >
              제출하기
            </button>
          )}
        </div>
      </main>

      {/* 사진 스텝에서 카카오 프사 사용 여부를 한 번 물어본다. (kakao-photo-flow.md) */}
      {step === 1 && kakaoPhotoUrl && !kakaoChoiceMade && (
        <KakaoPhotoModal
          photoUrl={kakaoPhotoUrl}
          onUse={handleUseKakaoPhoto}
          onSkip={handleSkipKakaoPhoto}
        />
      )}

      {showConfirm && (
        <ConfirmSubmitModal
          form={form}
          isSubmitting={isSubmitting}
          errorMessage={submitError}
          onCancel={() => {
            if (isSubmitting) return;
            setSubmitError("");
            setShowConfirm(false);
          }}
          onConfirm={() => {
            void handleSubmit();
          }}
        />
      )}
    </div>
  );
};

/** 카카오 로그인으로 받은 본인 프사를 폼 첫 사진으로 쓸지 묻는 모달 */
function KakaoPhotoModal({
  photoUrl,
  onUse,
  onSkip,
}: {
  photoUrl: string;
  onUse: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
      <div className="w-full max-w-sm overflow-hidden rounded-block bg-white shadow-2xl">
        <div className="px-6 pt-6 pb-4 text-center">
          <h3 className="text-xl font-black text-black">
            카카오 프로필 사진을 쓸까요?
          </h3>
          <p className="mt-1.5 text-sm text-black/45 leading-relaxed">
            카카오에 등록된 내 사진을
            <br />
            대표 사진으로 바로 사용할 수 있어요.
          </p>
        </div>

        <div className="flex justify-center px-6 pb-5">
          <img
            src={photoUrl}
            alt="카카오 프로필 사진 미리보기"
            className="h-32 w-32 rounded-full object-cover ring-1 ring-black/5"
          />
        </div>

        <div className="flex items-center gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 rounded-pill border border-black/15 py-3.5 text-sm font-semibold text-black/55 transition-colors hover:border-black/35 hover:text-black"
          >
            직접 올릴게요
          </button>
          <button
            type="button"
            onClick={onUse}
            className="flex-1 rounded-pill bg-black py-3.5 text-sm font-semibold text-white transition-colors hover:bg-black/80"
          >
            이 사진으로 할게요
          </button>
        </div>
      </div>
    </div>
  );
}

/** 제출 전 입력한 모든 정보를 요약해 보여주고 최종 확인을 받는 모달 */
function ConfirmSubmitModal({
  form,
  isSubmitting,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  form: ReturnType<typeof useRegisterForm>["form"];
  isSubmitting: boolean;
  errorMessage: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [isImageOpen, setIsImageOpen] = useState(false);

  const occupationLine = form.isStudent
    ? [form.school, form.major].filter(Boolean).join(" · ")
    : form.occupation;

  const rows: { label: string; value: string }[] = [
    { label: "이름", value: form.name },
    { label: "나이", value: form.age ? `${form.age}세` : "" },
    {
      label: "성별",
      value: form.gender === "female" ? "여성" : form.gender === "male" ? "남성" : "",
    },
    { label: form.isStudent ? "학교 · 학과" : "직업", value: occupationLine },
    { label: "MBTI", value: form.mbti },
    { label: "취미", value: form.hobbies.join(", ") },
    { label: "소개글", value: form.intro },
    { label: "전화번호 (비공개)", value: formatPhone(form.phoneNumber) },
    { label: "인스타그램", value: form.instagramId },
    { label: "카카오톡", value: form.kakaoId },
  ].filter((row) => row.value.trim().length > 0);

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6"
        onClick={onCancel}
      >
        <div
          className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-block bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 pt-6 pb-4">
            <h3 className="text-2xl font-black text-black">
              이대로 제출할까요?
            </h3>
            <p className="mt-1 text-sm text-black/40">
              제출하면 주선자의 승인 전까지 수정할 수 없어요.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto border-y border-black/[0.06]">
            {/* 대표 사진 배너 — 탭하면 크게 볼 수 있어요 */}
            {form.photoPreview && (
              <button
                type="button"
                onClick={() => setIsImageOpen(true)}
                className="group relative block w-full cursor-zoom-in"
                aria-label="사진 크게 보기"
              >
                <img
                  src={form.photoPreview}
                  alt={form.name}
                  className="aspect-[4/3] w-full object-cover"
                />
                <span className="absolute bottom-3 right-3 rounded-pill bg-black/45 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-black/60">
                  탭하면 크게 보기
                </span>
              </button>
            )}

            <dl className="space-y-3 px-6 py-4">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex flex-col gap-0.5 sm:flex-row sm:gap-4"
                >
                  <dt className="shrink-0 text-xs font-semibold text-black/40 sm:w-28 sm:pt-0.5">
                    {row.label}
                  </dt>
                  <dd className="text-sm font-medium leading-relaxed text-black">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="px-6 pt-4">
            {errorMessage && (
              <p className="rounded-block bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 px-6 py-5">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="shrink-0 rounded-pill border border-black/15 px-6 py-3.5 text-sm font-semibold text-black/55 transition-colors hover:border-black/35 hover:text-black disabled:opacity-40"
            >
              다시 볼게요
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center rounded-pill bg-black py-3.5 text-sm font-semibold text-white transition-all hover:bg-black/80 disabled:opacity-50"
            >
              {isSubmitting ? "제출 중…" : "제출하기"}
            </button>
          </div>
        </div>
      </div>

      {/* 사진 라이트박스 (내 친구 상세와 동일 패턴) */}
      {isImageOpen && form.photoPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setIsImageOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImageOpen(false)}
            className="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={form.photoPreview}
            alt={form.name}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

/** 폼 진입 전 상태(링크 확인 중)를 보여주는 전체 화면 스피너 */
function CenteredSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 rounded-full border-2 border-black/20 border-t-black animate-spin" />
    </div>
  );
}

/** 폼 진입 전 안내(잘못된 링크 / 로그인 필요)를 보여주는 전체 화면 */
function CenteredNotice({
  title,
  description,
  action,
}: {
  title: string;
  description: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <h2 className="text-2xl font-black text-black mb-3">{title}</h2>
      <p className="text-black/50 leading-relaxed mb-8">{description}</p>
      {action ?? (
        <Link
          to={ROUTES.HOME}
          className="px-6 py-3 border border-black/10 text-black/60 text-sm font-semibold rounded-pill"
        >
          홈으로 돌아가기
        </Link>
      )}
    </div>
  );
}

function StepWrapper({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 flex flex-col gap-5">
      <h2 className="text-3xl font-black text-black">{title}</h2>
      {children}
    </div>
  );
}

/** 라벨 + 밑줄 입력 래퍼. 한 단계 안에 여러 입력을 쌓을 때 각 항목을 구분한다. */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-black/45">
        {label}
      </label>
      <div className="border-b-2 border-black/10 transition-colors focus-within:border-black">
        {children}
      </div>
    </div>
  );
}

/**
 * "다음" 버튼을 누르면 기존 입력 위로 슬라이드되어 등장하는 스태킹 필드 (토스식 역순 노출).
 * 내부 input/textarea에 autoFocus를 주면 등장과 동시에 커서가 이동한다.
 * border=false면 밑줄 래퍼 없이 children을 그대로 감싼다(textarea·아이콘 입력 등).
 */
function StackReveal({
  show,
  fieldKey,
  label,
  hint,
  border = true,
  children,
}: {
  show: boolean;
  fieldKey: string;
  label: string;
  hint?: string;
  border?: boolean;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.div
          key={fieldKey}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <label className="mb-1 block text-xs font-semibold text-black/45">
            {label}
          </label>
          {hint && (
            <p className="mb-2 text-xs leading-relaxed text-black/35">{hint}</p>
          )}
          {border ? (
            <div className="border-b-2 border-black/10 transition-colors focus-within:border-black">
              {children}
            </div>
          ) : (
            children
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default RegisterPage;
