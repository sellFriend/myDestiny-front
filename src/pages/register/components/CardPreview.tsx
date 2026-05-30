import { type RegisterFormData } from '@/pages/register/hooks/useRegisterForm';

const CARD_COLORS = ['bg-pastel-lime', 'bg-pastel-lilac', 'bg-pastel-mint', 'bg-pastel-coral', 'bg-pastel-cream'];

interface CardPreviewProps {
  form: RegisterFormData;
}

export function CardPreview({ form }: CardPreviewProps) {
  const colorIndex = form.name.length % CARD_COLORS.length;
  const cardColor = CARD_COLORS[colorIndex] ?? 'bg-pastel-lime';

  const occupationLine = form.isStudent
    ? [form.school, form.major].filter(Boolean).join(' · ') || '학교 · 학과'
    : form.occupation || '직업';

  return (
    <div className={`${cardColor} rounded-block overflow-hidden w-full aspect-[3/4] flex flex-col`}>
      {/* Photo area */}
      <div className="flex-1 flex items-center justify-center bg-black/10">
        {form.photoPreview ? (
          <img src={form.photoPreview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl font-black text-black/20">
            {form.name ? form.name.charAt(0) : '?'}
          </span>
        )}
      </div>

      {/* Info area */}
      <div className="px-5 pt-4 pb-5 space-y-2">
        <div className="flex items-baseline gap-2">
          <h3 className="text-xl font-black text-black">{form.name || '이름'}</h3>
          {form.age && <span className="text-base font-bold text-black/50">{form.age}세</span>}
        </div>
        <p className="text-sm text-black/50 font-medium">{occupationLine}</p>
        <div className="flex flex-wrap gap-1.5">
          {form.mbti && (
            <span className="px-2.5 py-1 bg-black/15 text-black/70 text-xs font-bold rounded-pill">
              {form.mbti}
            </span>
          )}
          {form.hobbies.slice(0, 2).map((h) => (
            <span key={h} className="px-2.5 py-1 bg-black/10 text-black/60 text-xs rounded-pill">
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
