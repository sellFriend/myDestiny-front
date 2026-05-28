import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useRegisterForm } from '@/pages/register/hooks/useRegisterForm';
import { CardPreview } from '@/pages/register/components/CardPreview';

const MBTI_OPTIONS = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
const INTEREST_OPTIONS = ['여행', '독서', '운동', '영화', '음악', '요리', '게임', '사진', '카페', '등산', '자전거', '수영', '요가', 'SNS', '드라이브', '전시'];

const STEP_LABELS = ['이름', '나이', '사진', '직업', 'MBTI', '관심사', '자기소개', '미리보기'];

const RegisterPage = () => {
  const { step, totalSteps, form, isCompleted, updateField, toggleInterest, goNext, goPrev, submit, reset } = useRegisterForm();

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl mb-6">🎉</div>
        <h2 className="text-3xl font-black text-black mb-3">등록 완료!</h2>
        <p className="text-black/50 mb-8">
          <strong>{form.name}</strong> 님의 카드가 탐색에 등록됐어요.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Link
            to={ROUTES.FRIENDS}
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded-pill text-center"
          >
            내 친구 목록 보기
          </Link>
          <button
            type="button"
            onClick={reset}
            className="w-full py-3 border border-black/10 text-black/60 text-sm font-semibold rounded-pill"
          >
            다른 친구 등록하기
          </button>
        </div>
      </div>
    );
  }

  const canProceed = (() => {
    if (step === 1) return form.name.trim().length > 0;
    if (step === 2) return form.age.trim().length > 0;
    if (step === 4) return form.occupation.trim().length > 0;
    if (step === 5) return form.mbti.length > 0;
    if (step === 6) return form.interests.length > 0;
    if (step === 7) return form.intro.trim().length > 0;
    return true;
  })();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/5">
        {step > 1 ? (
          <button type="button" onClick={goPrev} className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            이전
          </button>
        ) : (
          <Link to={ROUTES.HOME} className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" />
            madam
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
        <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-2">
          Step {step} — {STEP_LABELS[step - 1]}
        </p>

        {step === 1 && (
          <StepWrapper title="친구 이름이 뭔가요?">
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

        {step === 2 && (
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

        {step === 3 && (
          <StepWrapper title="대표 사진을 선택해주세요">
            <div className="w-32 h-32 rounded-block bg-pastel-cream border-2 border-dashed border-black/10 flex flex-col items-center justify-center cursor-pointer hover:bg-pastel-lime/50 transition-colors">
              <span className="text-3xl mb-2">📷</span>
              <span className="text-xs text-black/40">사진 선택</span>
            </div>
            <p className="text-sm text-black/30 mt-4">지금은 건너뛰어도 돼요</p>
          </StepWrapper>
        )}

        {step === 4 && (
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

        {step === 5 && (
          <StepWrapper title="MBTI가 뭔가요?">
            <div className="grid grid-cols-4 gap-2">
              {MBTI_OPTIONS.map((mbti) => (
                <button
                  key={mbti}
                  type="button"
                  onClick={() => updateField('mbti', mbti)}
                  className={`py-2 text-sm font-semibold rounded-xl border transition-all ${
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

        {step === 6 && (
          <StepWrapper title="어떤 걸 좋아하나요?">
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 text-sm font-medium rounded-pill border transition-all ${
                    form.interests.includes(interest)
                      ? 'bg-black text-white border-black'
                      : 'border-black/10 text-black/60 hover:border-black/30'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </StepWrapper>
        )}

        {step === 7 && (
          <StepWrapper title="한 줄 자기소개를 써주세요">
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

        {step === 8 && (
          <div className="flex-1 flex flex-col gap-6">
            <div>
              <h2 className="text-3xl font-black text-black mb-1">이렇게 등록할게요</h2>
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
              등록 완료
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

function StepWrapper({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col gap-6">
      <h2 className="text-3xl font-black text-black">{title}</h2>
      {children}
    </div>
  );
}

export default RegisterPage;
