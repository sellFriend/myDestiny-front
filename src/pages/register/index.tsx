import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Camera,
  Instagram,
  MessageCircle,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useRegisterForm } from "@/pages/register/hooks/useRegisterForm";
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

const RegisterPage = () => {
  const {
    step,
    totalSteps,
    form,
    isCompleted,
    updateField,
    toggleHobby,
    goNext,
    goPrev,
    submit,
  } = useRegisterForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirm, setShowConfirm] = useState(false);
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
            마담의 승인을 기다리고 있어요.
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
      case 2: // 기본 정보: 이름 → 나이
        return [
          form.name.trim().length > 0,
          form.age.trim().length > 0 && Number(form.age) >= 19,
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateField("photoPreview", url);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-black/5">
        <Link
          to={ROUTES.HOME}
          className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          madam
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
                  accept="image/*"
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
                {form.photoPreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="self-start text-sm font-semibold text-black/55 underline underline-offset-4 transition-colors hover:text-black"
                  >
                    다시 올리기
                  </button>
                ) : (
                  <p className="text-sm text-black/30">
                    사진은 1장만 업로드할 수 있어요
                  </p>
                )}
              </StepWrapper>
            )}

            {/* Step 2: 기본 정보 — "다음"을 누르면 이름 위로 나이가 쌓여 등장 */}
            {step === 2 && (
              <StepWrapper title="기본 정보를 알려주세요">
                <div className="flex flex-col gap-6">
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

      {showConfirm && (
        <ConfirmSubmitModal
          form={form}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            submit();
          }}
        />
      )}
    </div>
  );
};

/** 제출 전 입력한 모든 정보를 요약해 보여주고 최종 확인을 받는 모달 */
function ConfirmSubmitModal({
  form,
  onCancel,
  onConfirm,
}: {
  form: ReturnType<typeof useRegisterForm>["form"];
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
              제출하면 마담의 승인 전까지 수정할 수 없어요.
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

          <div className="flex items-center gap-3 px-6 py-5">
            <button
              type="button"
              onClick={onCancel}
              className="shrink-0 rounded-pill border border-black/15 px-6 py-3.5 text-sm font-semibold text-black/55 transition-colors hover:border-black/35 hover:text-black"
            >
              다시 볼게요
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex flex-1 items-center justify-center rounded-pill bg-black py-3.5 text-sm font-semibold text-white transition-all hover:bg-black/80"
            >
              제출하기
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
            className="absolute right-4 top-[calc(env(safe-area-inset-top,0px)+1rem)] z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
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
