import { type RegisterFormData } from '@/pages/register/hooks/useRegisterForm';

// '내 친구' 페이지의 FriendCard와 동일한 팔레트/구조를 사용한다.
const CARD_COLORS = [
  'bg-pastel-lime',
  'bg-pastel-lilac',
  'bg-pastel-mint',
  'bg-pastel-coral',
  'bg-pastel-cream',
  'bg-pastel-pink',
];

const PHOTO_GRADIENTS: Record<string, string> = {
  'bg-pastel-lime': 'from-[#a8d900]/60 to-[#a8d900]/30',
  'bg-pastel-lilac': 'from-[#8b76e8]/60 to-[#8b76e8]/30',
  'bg-pastel-mint': 'from-[#5ed9a8]/60 to-[#5ed9a8]/30',
  'bg-pastel-coral': 'from-[#e05a4a]/60 to-[#e05a4a]/30',
  'bg-pastel-cream': 'from-[#e8c84a]/60 to-[#e8c84a]/30',
  'bg-pastel-pink': 'from-[#e87aab]/60 to-[#e87aab]/30',
};

// 정보 영역에 깔리는 옅은 파스텔 틴트 (FriendCard와 동일)
const BODY_TINTS: Record<string, string> = {
  'bg-pastel-lime': 'bg-[#ceff6e]/20',
  'bg-pastel-lilac': 'bg-[#c5b8ff]/20',
  'bg-pastel-mint': 'bg-[#b8ffe5]/25',
  'bg-pastel-coral': 'bg-[#ff8b7b]/15',
  'bg-pastel-cream': 'bg-[#fff6d3]/35',
  'bg-pastel-pink': 'bg-[#ffb8d0]/20',
};

interface CardPreviewProps {
  form: RegisterFormData;
}

export function CardPreview({ form }: CardPreviewProps) {
  const colorIndex = (form.name?.length ?? 0) % CARD_COLORS.length;
  const cardColor = CARD_COLORS[colorIndex] ?? 'bg-pastel-lime';
  const gradient = PHOTO_GRADIENTS[cardColor] ?? 'from-black/20 to-black/5';
  const bodyTint = BODY_TINTS[cardColor] ?? 'bg-black/[0.02]';

  const displayName = form.name || '이름';
  const occupationLine = form.isStudent
    ? [form.school, form.major].filter(Boolean).join(' · ') || '학교 · 학과'
    : form.occupation || '직업';

  return (
    <div className="relative overflow-hidden rounded-block border border-black/10 bg-white">
      {/* Photo area */}
      <div className={`relative flex h-80 items-center justify-center bg-gradient-to-br ${gradient}`}>
        {form.photoPreview ? (
          <img
            src={form.photoPreview}
            alt={displayName}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <span className="text-8xl font-black text-white/60 select-none">
            {displayName.charAt(0)}
          </span>
        )}
      </div>

      {/* Info area */}
      <div className={`${bodyTint} px-6 pt-4 pb-5`}>
        <p className="mb-1.5 font-mono text-xs uppercase tracking-wide text-black/40">
          {occupationLine}
          {form.mbti && ` · ${form.mbti}`}
        </p>
        <h3 className="mb-2.5 text-2xl font-black text-black">
          {displayName}
          {form.age && `, ${form.age}`}
        </h3>
        {form.intro && (
          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-black/60">{form.intro}</p>
        )}
        {form.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {form.hobbies.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-pill bg-black/10 px-2.5 py-1 text-xs text-black/60">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
