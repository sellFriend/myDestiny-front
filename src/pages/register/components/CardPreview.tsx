import { type RegisterFormData } from '@/pages/register/hooks/useRegisterForm';

const CARD_COLORS = ['bg-pastel-lime', 'bg-pastel-lilac', 'bg-pastel-mint', 'bg-pastel-coral', 'bg-pastel-cream'];

interface CardPreviewProps {
  form: RegisterFormData;
}

export function CardPreview({ form }: CardPreviewProps) {
  const colorIndex = form.name.length % CARD_COLORS.length;
  const cardColor = CARD_COLORS[colorIndex] ?? 'bg-pastel-lime';

  return (
    <div className={`${cardColor} rounded-block p-6 w-full aspect-[3/4] flex flex-col`}>
      <div className="flex-1 flex flex-col justify-end">
        <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-1">
          {form.occupation || '직업'} · {form.mbti || 'MBTI'}
        </p>
        <h3 className="text-2xl font-black text-black">
          {form.name || '이름'}{form.age ? `, ${form.age}` : ''}
        </h3>
      </div>
      <div className="mt-4">
        <p className="text-sm text-black/60 leading-relaxed line-clamp-3">
          {form.intro || '자기소개가 여기에 표시됩니다.'}
        </p>
        {form.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {form.interests.slice(0, 3).map((tag) => (
              <span key={tag} className="px-2.5 py-1 bg-black/10 text-black/60 text-xs rounded-pill">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
