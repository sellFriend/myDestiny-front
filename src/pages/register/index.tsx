import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, Camera } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useRegisterForm } from '@/pages/register/hooks/useRegisterForm';
import { CardPreview } from '@/pages/register/components/CardPreview';

const MBTI_OPTIONS = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const HOBBY_OPTIONS = [
  '여행', '독서', '운동', '영화', '음악', '요리',
  '게임', '사진', '카페', '등산', '자전거', '수영',
  '요가', 'SNS', '드라이브', '전시',
];

const STEP_LABELS = ['사진', '이름', '나이', '학생 여부', '학교/직업', 'MBTI', '취미', '소개글', '연락처', '미리보기'];

const RegisterPage = () => {
  const { step, totalSteps, form, isCompleted, updateField, toggleHobby, goNext, goPrev, submit } =
    useRegisterForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-6">⏳</div>
        <h2 className="text-3xl font-black text-black mb-3">제출 완료!</h2>
        <p className="text-black/50 leading-relaxed mb-8">
          마담의 승인을 기다리고 있어요.<br />승인되면 탐색 화면에 카드가 등록돼요.
        </p>
        <Link
          to={ROUTES.HOME}
          className="px-6 py-3 border border-black/10 text-black/60 text-sm font-semibold rounded-pill"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const canProceed = (() => {
    switch (step) {
      case 1: return true; // photo optional for now
      case 2: return form.name.trim().length > 0;
      case 3: return form.age.trim().length > 0 && Number(form.age) >= 19;
      case 4: return form.isStudent !== null;
      case 5:
        return form.isStudent
          ? form.school.trim().length > 0 && form.major.trim().length > 0
          : form.occupation.trim().length > 0;
      case 6: return form.mbti.length > 0;
      case 7: return form.hobbies.length > 0;
      case 8: return form.intro.trim().length > 0;
      case 9: return form.contact.trim().length > 0;
      default: return true;
    }
  })();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    updateField('photoPreview', url);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-black/5">
        {step > 1 ? (
          <button
            type="button"
            onClick={goPrev}
            className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            이전
          </button>
        ) : (
          <Link
            to={ROUTES.HOME}
            className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            My Destiny
          </Link>
        )}

        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${
                i + 1 <= step ? 'bg-black w-4' : 'bg-black/10 w-2'
              }`}
            />
          ))}
        </div>

        <span className="text-xs text-black/40 font-mono">{step}/{totalSteps}</span>
      </header>

      <main className="flex-1 flex flex-col px-6 py-10 max-w-lg mx-auto w-full">
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
                <img src={form.photoPreview} alt="photo" className="w-full h-full object-cover" />
              ) : (
                <>
                  <Camera className="w-8 h-8 text-black/30 mb-2" />
                  <span className="text-xs text-black/40">사진 선택</span>
                </>
              )}
            </div>
            <p className="text-sm text-black/30">사진은 1장만 업로드할 수 있어요</p>
          </StepWrapper>
        )}

        {/* Step 2: Name */}
        {step === 2 && (
          <StepWrapper title="이름이 뭔가요?">
            <input
              type="text"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
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
              onChange={(e) => updateField('age', e.target.value)}
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
                { label: '네, 학생이에요', value: true },
                { label: '아니요', value: false },
              ].map(({ label, value }) => (
                <button
                  key={String(value)}
                  type="button"
                  onClick={() => updateField('isStudent', value)}
                  className={`flex-1 py-5 rounded-block text-sm font-semibold border-2 transition-all ${
                    form.isStudent === value
                      ? 'bg-black text-white border-black'
                      : 'border-black/10 text-black/60 hover:border-black/30'
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
                    onChange={(e) => updateField('school', e.target.value)}
                    placeholder="학교명 (예: 숭실대학교)"
                    className="w-full border-b-2 border-black/10 focus:border-black text-xl font-bold py-3 outline-none bg-transparent text-black placeholder:text-black/20 transition-colors"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={form.major}
                    onChange={(e) => updateField('major', e.target.value)}
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
                  onChange={(e) => updateField('occupation', e.target.value)}
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
          <StepWrapper title="MBTI가 뭔가요?">
            <div className="grid grid-cols-4 gap-2">
              {MBTI_OPTIONS.map((mbti) => (
                <button
                  key={mbti}
                  type="button"
                  onClick={() => updateField('mbti', mbti)}
                  className={`py-2.5 text-sm font-semibold rounded-xl border transition-all ${
                    form.mbti === mbti
                      ? 'bg-black text-white border-black'
                      : 'border-black/10 text-black/60 hover:border-black/30'
                  }`}
                >
                  {mbti}
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {/* Step 7: Hobbies */}
        {step === 7 && (
          <StepWrapper title="어떤 걸 좋아하나요?">
            <div className="flex flex-wrap gap-2">
              {HOBBY_OPTIONS.map((hobby) => (
                <button
                  key={hobby}
                  type="button"
                  onClick={() => toggleHobby(hobby)}
                  className={`px-4 py-2 text-sm font-medium rounded-pill border transition-all ${
                    form.hobbies.includes(hobby)
                      ? 'bg-black text-white border-black'
                      : 'border-black/10 text-black/60 hover:border-black/30'
                  }`}
                >
                  {hobby}
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {/* Step 8: Intro */}
        {step === 8 && (
          <StepWrapper title="간단한 소개글을 써주세요">
            <textarea
              value={form.intro}
              onChange={(e) => updateField('intro', e.target.value)}
              placeholder="예: 여행과 사진을 좋아하는 자유로운 영혼이에요."
              rows={4}
              className="w-full border-b-2 border-black/10 focus:border-black text-lg py-3 outline-none bg-transparent text-black placeholder:text-black/20 transition-colors resize-none leading-relaxed"
              autoFocus
            />
          </StepWrapper>
        )}

        {/* Step 9: Contact */}
        {step === 9 && (
          <StepWrapper title="연락처를 알려주세요">
            <p className="text-sm text-black/40 -mt-2">인스타그램 ID 또는 전화번호를 입력해주세요</p>
            <input
              type="text"
              value={form.contact}
              onChange={(e) => updateField('contact', e.target.value)}
              placeholder="예: @username 또는 010-0000-0000"
              className="w-full border-b-2 border-black/10 focus:border-black text-xl font-bold py-3 outline-none bg-transparent text-black placeholder:text-black/20 transition-colors"
              autoFocus
            />
            <p className="text-xs text-black/30 mt-1">
              연락처는 마담이 연락 요청을 승인했을 때만 상대방에게 공개돼요.
            </p>
          </StepWrapper>
        )}

        {/* Step 10: Preview */}
        {step === 10 && (
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-black text-black mb-1">이렇게 등록될 거예요</h2>
              <p className="text-sm text-black/40">카드 미리보기예요. 수정하려면 이전으로 돌아가세요.</p>
            </div>
            <div className="max-w-xs mx-auto w-full">
              <CardPreview form={form} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-8">
          {step < totalSteps ? (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 disabled:opacity-30 transition-all"
            >
              다음
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              className="w-full flex items-center justify-center gap-2 py-4 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-all"
            >
              <Check className="w-4 h-4" />
              제출하기
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

function StepWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col gap-5">
      <h2 className="text-3xl font-black text-black">{title}</h2>
      {children}
    </div>
  );
}

export default RegisterPage;
