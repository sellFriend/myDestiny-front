export interface Friend {
  id: string;
  name: string;
  age: number;
  isStudent: boolean;
  school?: string;
  major?: string;
  occupation?: string;
  mbti: string;
  intro: string;
  hobbies: string[];
  photo?: string;
  cardColor: string;
  requestCount: number;
  status: 'pending' | 'approved';
  /** 등록된 친구가 매칭 요청을 잠시 받지 않도록 비활성화한 상태. (status === 'approved' 일 때만 의미 있음) */
  isActive: boolean;
}

interface FriendCardProps {
  friend: Friend;
  onClick: (friend: Friend) => void;
}

const PHOTO_GRADIENTS: Record<string, string> = {
  'bg-pastel-lime': 'from-[#a8d900]/60 to-[#a8d900]/30',
  'bg-pastel-lilac': 'from-[#8b76e8]/60 to-[#8b76e8]/30',
  'bg-pastel-mint': 'from-[#5ed9a8]/60 to-[#5ed9a8]/30',
  'bg-pastel-coral': 'from-[#e05a4a]/60 to-[#e05a4a]/30',
  'bg-pastel-cream': 'from-[#e8c84a]/60 to-[#e8c84a]/30',
  'bg-pastel-pink': 'from-[#e87aab]/60 to-[#e87aab]/30',
};

// 정보 영역에 깔리는 옅은 파스텔 틴트 (친구별 색 정체성을 포인트로만 유지)
const BODY_TINTS: Record<string, string> = {
  'bg-pastel-lime': 'bg-[#ceff6e]/20',
  'bg-pastel-lilac': 'bg-[#c5b8ff]/20',
  'bg-pastel-mint': 'bg-[#b8ffe5]/25',
  'bg-pastel-coral': 'bg-[#ff8b7b]/15',
  'bg-pastel-cream': 'bg-[#fff6d3]/35',
  'bg-pastel-pink': 'bg-[#ffb8d0]/20',
};

export function FriendCard({ friend, onClick }: FriendCardProps) {
  const gradient = PHOTO_GRADIENTS[friend.cardColor] ?? 'from-black/20 to-black/5';
  const bodyTint = BODY_TINTS[friend.cardColor] ?? 'bg-black/[0.02]';

  const occupationLine = friend.isStudent
    ? `${friend.school} · ${friend.major}`
    : friend.occupation;

  const isDeactivated = friend.status === 'approved' && !friend.isActive;
  const statusBadge =
    friend.status === 'pending'
      ? { label: '승인 대기', className: 'bg-white/85 text-black/60' }
      : isDeactivated
        ? { label: '비활성', className: 'bg-black/55 text-white backdrop-blur-sm' }
        : { label: '등록됨', className: 'bg-black text-white' };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(friend)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick(friend);
        }
      }}
      className="bg-white border border-black/10 rounded-block overflow-hidden relative cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:border-black/20"
    >
      {/* Photo area */}
      <div className={`relative h-60 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
        {friend.photo ? (
          <img
            src={friend.photo}
            alt={friend.name}
            className={`absolute inset-0 h-full w-full object-cover ${
              isDeactivated ? 'grayscale' : ''
            }`}
          />
        ) : (
          <span className="text-8xl font-black text-white/60 select-none">
            {friend.name.charAt(0)}
          </span>
        )}

        {/* 비활성 친구는 사진을 흐리게 덮어 '쉬는 중'임을 시각적으로 구분 */}
        {isDeactivated && <div className="absolute inset-0 bg-white/45" />}

        <span
          className={`absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-pill ${statusBadge.className}`}
        >
          {statusBadge.label}
        </span>

        {friend.requestCount > 0 && (
          <div className="absolute top-3 right-3 min-w-[20px] h-5 px-1.5 rounded-full bg-black flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">{friend.requestCount}</span>
          </div>
        )}
      </div>

      {/* Info area */}
      <div className={`${bodyTint} px-5 pt-3 pb-4`}>
        <p className="text-xs font-mono uppercase tracking-wide text-black/40 mb-1">
          {occupationLine} · {friend.mbti}
        </p>
        <h3 className="text-xl font-black text-black mb-2">
          {friend.name}, {friend.age}
        </h3>
        <p className="text-sm text-black/60 leading-relaxed line-clamp-2 mb-3">{friend.intro}</p>

        <div className="flex flex-wrap gap-1.5">
          {friend.hobbies.slice(0, 3).map((tag) => (
            <span key={tag} className="px-2.5 py-1 bg-black/10 text-black/60 text-xs rounded-pill">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
