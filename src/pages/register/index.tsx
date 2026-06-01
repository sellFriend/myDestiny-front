import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Camera,
  Instagram,
  MessageCircle,
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
  "이름",
  "나이",
  "학생 여부",
  "학교/직업",
  "MBTI",
  "취미",
  "소개글",
  "전화번호",
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

  const handleNext = () => { setDirection(1); goNext(); };
  const handlePrev = () => { setDirection(-1); goPrev(); };

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

  const canProceed = (() => {
    switch (step) {
      case 1:
        return true; // photo optional for now
      case 2:
        return form.name.trim().length > 0;
      case 3:
        return form.age.trim().length > 0 && Number(form.age) >= 19;
      case 4:
        return form.isStudent !== null;
      case 5:
        return form.isStudent
          ? form.school.trim().length > 0 && form.major.trim().length > 0
          : form.occupation.trim().length > 0;
      case 6:
        return form.mbti.length > 0;
      case 7:
        return form.hobbies.length > 0;
      case 8:
        return form.intro.trim().length > 0;
      case 9:
        return isValidPhone(form.phoneNumber); // 전화번호 필수 (비공개)
      case 10:
        // 공개 연락처: 인스타/카카오 중 하나 이상 필수
        return (
          (form.instagramId ?? "").trim().length > 0 ||
          (form.kakaoId ?? "").trim().length > 0
        );
      default:
        return true;
    }
  })();

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

      <main className="flex-1 flex flex-col px-6 py-10 max-w-lg mx-auto w-full">
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
                  className="w-40 h-40 rounded-block overflow-hidden border-2 border-dashed border-black/15 flex flex-col items-center justify-center cursor-pointer hover:border-black/30 transition-colors bg-black/3"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {form.photoPreview ? (
                    <img
                      src={form.photoPreview}
                      alt="photo"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-black/30 mb-2" />
                      <span className="text-xs text-black/40">사진 선택</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-black/30">
                  사진은 1장만 업로드할 수 있어요
                </p>
              </StepWrapper>
            )}

            {/* Step 2: Name */}
            {step === 2 && (
              <StepWrapper title="이름이 뭔가요?">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="예: 김지우"
                  className="w-full border-b-2 border-black/10 focus:border-black text-2xl font-bold py-3 outline-none bg-transparent text-black placeholder:text-black/20 transition-colors"
                  autoFocus
                />
              </StepWrapper>
            )}

            {/* Step 3: Age */}
            {step === 3 && (
              <StepWrapper title="나이가 어떻게 되나요?">
                <input
                  type="number"
                  value={form.age}
                  onChange={(e) => updateField("age", e.target.value)}
                  placeholder="예: 27"
                  min={19}
                  max={45}
                  className="w-full border-b-2 border-black/10 focus:border-black text-2xl font-bold py-3 outline-none bg-transparent text-black placeholder:text-black/20 transition-colors"
                  autoFocus
                />
              </StepWrapper>
            )}

            {/* Step 4: Student Y/N */}
            {step === 4 && (
              <StepWrapper title="현재 학생인가요?">
                <div className="flex gap-4">
                  {[
                    { label: "네, 학생이에요", value: true },
                    { label: "아니요", value: false },
                  ].map(({ label, value }) => (
                    <button
                      key={String(value)}
                      type="button"
                      onClick={() => updateField("isStudent", value)}
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
              </StepWrapper>
            )}

            {/* Step 5: School/Major or Occupation */}
            {step === 5 && (
              <>
                {form.isStudent ? (
                  <StepWrapper title="학교와 학과를 알려주세요">
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={form.school}
                        onChange={(e) => updateField("school", e.target.value)}
                        placeholder="학교명 (예: 숭실대학교)"
                        className="w-full border-b-2 border-black/10 focus:border-black text-xl font-bold py-3 outline-none bg-transparent text-black placeholder:text-black/20 transition-colors"
                        autoFocus
                      />
                      <input
                        type="text"
                        value={form.major}
                        onChange={(e) => updateField("major", e.target.value)}
                        placeholder="학과명 (예: 컴퓨터학부)"
                        className="w-full border-b-2 border-black/10 focus:border-black text-xl font-bold py-3 outline-none bg-transparent text-black placeholder:text-black/20 transition-colors"
                      />
                    </div>
                  </StepWrapper>
                ) : (
                  <StepWrapper title="어떤 일을 하고 있나요?">
                    <input
                      type="text"
                      value={form.occupation}
                      onChange={(e) => updateField("occupation", e.target.value)}
                      placeholder="예: 디자이너"
                      className="w-full border-b-2 border-black/10 focus:border-black text-2xl font-bold py-3 outline-none bg-transparent text-black placeholder:text-black/20 transition-colors"
                      autoFocus
                    />
                  </StepWrapper>
                )}
              </>
            )}

            {/* Step 6: MBTI */}
            {step === 6 && (
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

            {/* Step 7: Hobbies */}
            {step === 7 && (
              <StepWrapper title="어떤 걸 좋아하나요?">
                <div className="-mt-2 flex items-center justify-between">
                  <p className="text-sm text-black/40">여러 개 골라도 좋아요.</p>
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
                          if (e.key === "Enter") submitCustomHobby();
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

            {/* Step 8: Intro */}
            {step === 8 && (
              <StepWrapper title="간단한 소개글을 써주세요">
                <p className="-mt-2 text-sm text-black/40">
                  어떤 사람인지 한두 문장으로 편하게 적어주세요.
                </p>
                <div className="rounded-block border border-black/10 bg-black/[0.015] px-5 py-4 transition-colors focus-within:border-black/40">
                  <textarea
                    value={form.intro}
                    onChange={(e) => updateField("intro", e.target.value)}
                    placeholder="예: 여행과 사진을 좋아하는 자유로운 영혼이에요."
                    rows={5}
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
              </StepWrapper>
            )}

            {/* Step 9: Phone (필수 · 비공개) */}
            {step === 9 && (
              <StepWrapper title="전화번호를 입력해주세요">
                <p className="-mt-2 text-sm leading-relaxed text-black/40">
                  전화번호는 중복 가입을 막기 위해서만 써요. 다른 사람에게는 절대
                  공개되지 않아요.
                </p>
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
                  className="w-full border-b-2 border-black/10 focus:border-black text-2xl font-bold py-3 outline-none bg-transparent text-black placeholder:text-black/20 transition-colors"
                  autoFocus
                />
              </StepWrapper>
            )}

            {/* Step 10: Public contact (인스타/카카오 중 하나는 필수) */}
            {step === 10 && (
              <StepWrapper title="어떻게 연락하면 될까요?">
                <p className="-mt-2 text-sm leading-relaxed text-black/40">
                  매칭이 성사되면 상대에게{" "}
                  <strong className="font-semibold text-black/60">
                    공개되는 연락처
                  </strong>
                  예요.
                  <br />둘 중 하나만 입력해도 충분해요.
                </p>

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
                        updateField("kakaoId", e.target.value.replace(/\s/g, ""))
                      }
                      placeholder="카카오톡 ID"
                      className="w-full bg-transparent text-lg font-bold text-black outline-none placeholder:text-black/20"
                    />
                    {(form.kakaoId ?? "").trim() && (
                      <Check className="h-4 w-4 shrink-0 text-black" />
                    )}
                  </div>
                </div>
              </StepWrapper>
            )}

            {/* Step 11: Preview */}
            {step === 11 && (
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
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 py-6 sm:items-center"
      onClick={onCancel}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-block bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6 pb-4">
          <h3 className="text-2xl font-black text-black">이대로 제출할까요?</h3>
          <p className="mt-1 text-sm text-black/40">
            제출하면 마담의 승인 전까지 수정할 수 없어요.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto border-y border-black/[0.06] px-6 py-4">
          <dl className="space-y-3">
            {form.photoPreview && (
              <div className="flex items-center gap-3 pb-1">
                <img
                  src={form.photoPreview}
                  alt={form.name}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <span className="text-sm text-black/40">대표 사진</span>
              </div>
            )}
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

export default RegisterPage;
