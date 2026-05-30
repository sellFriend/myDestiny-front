import { Trash2 } from 'lucide-react';

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
  cardColor: string;
  requestCount: number;
  status: 'pending' | 'approved';
}

interface FriendCardProps {
  friend: Friend;
  onDelete: (id: string) => void;
}

export function FriendCard({ friend, onDelete }: FriendCardProps) {
  const occupationLine = friend.isStudent
    ? `${friend.school} · ${friend.major}`
    : friend.occupation;

  return (
    <div className={`${friend.cardColor} rounded-block p-5 relative`}>
      {friend.requestCount > 0 && (
        <div className="absolute top-4 right-4 min-w-[20px] h-5 px-1.5 rounded-full bg-black flex items-center justify-center">
          <span className="text-white text-[10px] font-bold">{friend.requestCount}</span>
        </div>
      )}

      <div className="flex items-center gap-1 mb-3">
        <span
          className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
            friend.status === 'approved'
              ? 'bg-black text-white'
              : 'bg-black/10 text-black/50'
          }`}
        >
          {friend.status === 'approved' ? '등록됨' : '승인 대기'}
        </span>
      </div>

      <p className="text-xs font-mono text-black/40 mb-1">{occupationLine} · {friend.mbti}</p>
      <h3 className="text-xl font-black text-black mb-2">
        {friend.name}, {friend.age}
      </h3>
      <p className="text-sm text-black/60 leading-relaxed line-clamp-2 mb-3">{friend.intro}</p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {friend.hobbies.slice(0, 3).map((tag) => (
          <span key={tag} className="px-2.5 py-1 bg-black/10 text-black/60 text-xs rounded-pill">
            {tag}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onDelete(friend.id)}
        className="flex items-center gap-1.5 px-4 py-2 border border-black/10 text-black/50 text-xs font-medium rounded-pill hover:border-black/30 transition-colors"
      >
        <Trash2 className="w-3 h-3" />
        삭제
      </button>
    </div>
  );
}
