import { Trash2, X } from 'lucide-react';
import { type Friend } from '@/pages/friends/components/FriendCard';

interface FriendDetailModalProps {
  friend: Friend;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const PHOTO_GRADIENTS: Record<string, string> = {
  'bg-pastel-lime': 'from-[#a8d900]/50 to-[#a8d900]/20',
  'bg-pastel-lilac': 'from-[#8b76e8]/50 to-[#8b76e8]/20',
  'bg-pastel-mint': 'from-[#5ed9a8]/50 to-[#5ed9a8]/20',
  'bg-pastel-coral': 'from-[#e05a4a]/50 to-[#e05a4a]/20',
  'bg-pastel-cream': 'from-[#e8c84a]/50 to-[#e8c84a]/20',
  'bg-pastel-pink': 'from-[#e87aab]/50 to-[#e87aab]/20',
};

export function FriendDetailModal({ friend, onClose, onDelete }: FriendDetailModalProps) {
  const gradient = PHOTO_GRADIENTS[friend.cardColor] ?? 'from-black/20 to-black/5';

  const occupationLine = friend.isStudent
    ? `${friend.school} · ${friend.major}`
    : friend.occupation;

  const handleDelete = () => {
    onDelete(friend.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-block overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Photo header */}
        <div className={`${friend.cardColor} relative flex-shrink-0`}>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-black/60 transition-colors hover:bg-white"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>

          <div className={`relative h-56 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            {friend.photo ? (
              <img
                src={friend.photo}
                alt={friend.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="text-7xl font-black text-white/60 select-none">
                {friend.name.charAt(0)}
              </span>
            )}

            <span
              className={`absolute top-4 left-4 text-[10px] font-semibold px-2.5 py-1 rounded-pill ${
                friend.status === 'approved'
                  ? 'bg-black text-white'
                  : 'bg-white/85 text-black/60'
              }`}
            >
              {friend.status === 'approved' ? '등록됨' : '승인 대기'}
            </span>
          </div>

          <div className="px-6 pb-5 pt-4">
            <div className="flex items-baseline gap-2">
              <h2 className="text-2xl font-black text-black">{friend.name}</h2>
              <span className="text-base font-bold text-black/50">{friend.age}세</span>
            </div>
            <p className="text-sm text-black/50 mt-0.5 font-medium">{occupationLine}</p>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/30 mb-2">MBTI</p>
            <span className="px-3 py-1.5 bg-black text-white text-sm font-bold rounded-pill">
              {friend.mbti}
            </span>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/30 mb-2">취미</p>
            <div className="flex flex-wrap gap-2">
              {friend.hobbies.map((h) => (
                <span
                  key={h}
                  className="px-3 py-1.5 bg-black/5 text-black/70 text-sm rounded-pill border border-black/10"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-black/30 mb-2">소개글</p>
            <p className="text-sm text-black/65 leading-relaxed">{friend.intro}</p>
          </div>
        </div>

        {/* CTA */}
        <div className="px-6 py-5 border-t border-black/5 flex-shrink-0">
          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-3.5 border border-black/15 text-black/60 text-sm font-semibold rounded-pill hover:border-black/40 hover:text-black transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            친구 삭제
          </button>
        </div>
      </div>
    </div>
  );
}
