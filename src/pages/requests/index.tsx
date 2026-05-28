import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { RequestCard, type Request } from '@/pages/requests/components/RequestCard';

const MOCK_REQUESTS: Request[] = [
  {
    id: 'r1',
    fromMadam: '이현아',
    fromFriend: { name: '강동현', age: 29, occupation: '건축가', mbti: 'INTP' },
    toFriend: { name: '정다은' },
    message: '책 좋아하는 사람이라 잘 맞을 것 같아서요!',
    cardColor: 'bg-pastel-lilac',
    status: 'pending',
  },
  {
    id: 'r2',
    fromMadam: '박준혁',
    fromFriend: { name: '김하늘', age: 27, occupation: '기획자', mbti: 'ENFP' },
    toFriend: { name: '오민수' },
    message: '활발하고 재미있는 친구인데 잘 어울릴 것 같아요.',
    cardColor: 'bg-pastel-cream',
    status: 'pending',
  },
  {
    id: 'r3',
    fromMadam: '송지아',
    fromFriend: { name: '윤상민', age: 31, occupation: '교사', mbti: 'ISFJ' },
    toFriend: { name: '정다은' },
    message: '',
    cardColor: 'bg-pastel-mint',
    status: 'accepted',
  },
];

const RequestsPage = () => {
  const [requests, setRequests] = useState<Request[]>(MOCK_REQUESTS);

  const pendingCount = requests.filter((r) => r.status === 'pending').length;

  const handleAccept = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'accepted' as const } : r))
    );
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r))
    );
  };

  const pending = requests.filter((r) => r.status === 'pending');
  const resolved = requests.filter((r) => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/5">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          madam
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-bold text-black">요청함</h1>
          {pendingCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </div>
        <div className="w-16" />
      </header>

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full space-y-8">
        {pending.length > 0 && (
          <section>
            <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-4">
              대기 중 · {pending.length}
            </p>
            <div className="space-y-4">
              {pending.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          </section>
        )}

        {resolved.length > 0 && (
          <section>
            <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-4">
              처리 완료 · {resolved.length}
            </p>
            <div className="space-y-4">
              {resolved.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          </section>
        )}

        {requests.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-bold text-black mb-2">요청이 없어요</p>
            <p className="text-sm text-black/40">새로운 요청이 오면 여기서 확인할 수 있어요</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default RequestsPage;
