import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { type Profile } from '@/pages/explore/hooks/useSwipeCards';

const MY_FRIENDS = [
  { id: 'f1', name: '오민수, 28 · 회계사' },
  { id: 'f2', name: '정다은, 25 · 간호사' },
];

interface ContactRequestModalProps {
  profile: Profile;
  onClose: () => void;
}

export function ContactRequestModal({ profile, onClose }: ContactRequestModalProps) {
  const [selectedFriendId, setSelectedFriendId] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSend = () => {
    if (!selectedFriendId) return;
    setIsSent(true);
  };

  if (isSent) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
        <div
          className="w-full max-w-sm bg-white rounded-block p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-4xl mb-4">🎉</div>
          <p className="font-bold text-lg text-black mb-2">요청을 보냈어요!</p>
          <p className="text-sm text-black/50 mb-6">
            상대 마담이 승인하면 연락처가 공유돼요.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 bg-black text-white text-sm font-semibold rounded-pill"
          >
            확인
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm bg-white rounded-block overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${profile.cardColor} p-6`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-1">
                {profile.occupation} · {profile.mbti}
              </p>
              <h3 className="text-xl font-black text-black">
                {profile.name}, {profile.age}
              </h3>
            </div>
            <button type="button" onClick={onClose} className="p-1">
              <X className="w-5 h-5 text-black/40" />
            </button>
          </div>
          <p className="text-sm text-black/60 mt-3 leading-relaxed">{profile.intro}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {profile.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-black/10 text-black/60 text-xs rounded-pill">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-black/40 uppercase tracking-widest mb-2">
              소개할 내 친구
            </label>
            <select
              value={selectedFriendId}
              onChange={(e) => setSelectedFriendId(e.target.value)}
              className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm text-black bg-white focus:outline-none focus:border-black/30"
            >
              <option value="">친구를 선택하세요</option>
              {MY_FRIENDS.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-black/40 uppercase tracking-widest mb-2">
              한 마디 메시지 (선택)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="간단한 소개 메시지를 남겨보세요"
              rows={2}
              className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm text-black bg-white focus:outline-none focus:border-black/30 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleSend}
            disabled={!selectedFriendId}
            className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 disabled:opacity-30 transition-all"
          >
            <Send className="w-4 h-4" />
            연결 요청 보내기
          </button>
        </div>
      </div>
    </div>
  );
}
