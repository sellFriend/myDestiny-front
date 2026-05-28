import { Check, X } from 'lucide-react';

export interface Request {
  id: string;
  fromMadam: string;
  fromFriend: { name: string; age: number; occupation: string; mbti: string };
  toFriend: { name: string };
  message: string;
  cardColor: string;
  status: 'pending' | 'accepted' | 'rejected';
}

interface RequestCardProps {
  request: Request;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
}

export function RequestCard({ request, onAccept, onReject }: RequestCardProps) {
  const isPending = request.status === 'pending';

  return (
    <div className={`${request.cardColor} rounded-block p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-1">
            → {request.toFriend.name}에게 온 요청
          </p>
          <h3 className="text-lg font-black text-black">
            {request.fromFriend.name}, {request.fromFriend.age}
          </h3>
          <p className="text-xs text-black/40 mt-0.5">
            {request.fromFriend.occupation} · {request.fromFriend.mbti}
          </p>
        </div>
        {!isPending && (
          <span className={`text-xs font-semibold px-3 py-1 rounded-pill ${
            request.status === 'accepted'
              ? 'bg-black text-white'
              : 'bg-black/10 text-black/40'
          }`}>
            {request.status === 'accepted' ? '수락됨' : '거절됨'}
          </span>
        )}
      </div>

      {request.message && (
        <p className="text-sm text-black/60 bg-black/5 rounded-xl px-4 py-3 mb-4 leading-relaxed">
          "{request.message}"
        </p>
      )}

      <p className="text-xs text-black/40 mb-4">
        마담 <strong className="text-black/60">{request.fromMadam}</strong> 님이 소개 요청을 보냈어요
      </p>

      {isPending && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAccept(request.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-all"
          >
            <Check className="w-4 h-4" />
            수락
          </button>
          <button
            type="button"
            onClick={() => onReject(request.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-black/10 text-black/60 text-sm font-semibold rounded-pill hover:border-black/30 transition-all"
          >
            <X className="w-4 h-4" />
            거절
          </button>
        </div>
      )}
    </div>
  );
}
