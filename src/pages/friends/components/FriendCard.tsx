import { Pencil, Trash2 } from 'lucide-react';

export interface Friend {
  id: string;
  name: string;
  age: number;
  occupation: string;
  mbti: string;
  intro: string;
  tags: string[];
  cardColor: string;
  requestCount: number;
}

interface FriendCardProps {
  friend: Friend;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FriendCard({ friend, onEdit, onDelete }: FriendCardProps) {
  return (
    <div className={`${friend.cardColor} rounded-block p-6 relative`}>
      {friend.requestCount > 0 && (
        <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-black flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">{friend.requestCount}</span>
        </div>
      )}

      <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-1">
        {friend.occupation} · {friend.mbti}
      </p>
      <h3 className="text-xl font-black text-black mb-2">
        {friend.name}, {friend.age}
      </h3>
      <p className="text-sm text-black/60 leading-relaxed line-clamp-2 mb-3">
        {friend.intro}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {friend.tags.map((tag) => (
          <span key={tag} className="px-3 py-1 bg-black/10 text-black/60 text-xs rounded-pill">
            {tag}
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onEdit(friend.id)}
          className="flex items-center gap-1.5 px-4 py-2 border border-black/10 text-black/60 text-xs font-medium rounded-pill hover:border-black/30 transition-colors"
        >
          <Pencil className="w-3 h-3" />
          수정
        </button>
        <button
          type="button"
          onClick={() => onDelete(friend.id)}
          className="flex items-center gap-1.5 px-4 py-2 border border-black/10 text-black/60 text-xs font-medium rounded-pill hover:border-black/30 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
          삭제
        </button>
      </div>
    </div>
  );
}
