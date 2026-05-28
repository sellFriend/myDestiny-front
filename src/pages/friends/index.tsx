import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { FriendCard, type Friend } from '@/pages/friends/components/FriendCard';

const MOCK_FRIENDS: Friend[] = [
  {
    id: 'f1',
    name: '오민수',
    age: 28,
    occupation: '회계사',
    mbti: 'ISTJ',
    intro: '꼼꼼하고 성실한 사람. 주말엔 등산 즐겨요.',
    tags: ['등산', '요리', '자기계발'],
    cardColor: 'bg-pastel-lime',
    requestCount: 3,
  },
  {
    id: 'f2',
    name: '정다은',
    age: 25,
    occupation: '간호사',
    mbti: 'ESFJ',
    intro: '밝고 에너지 넘쳐요. 사람 만나는 걸 좋아합니다.',
    tags: ['여행', '카페', '친구만남'],
    cardColor: 'bg-pastel-pink',
    requestCount: 1,
  },
];

const FriendsPage = () => {
  const [friends, setFriends] = useState<Friend[]>(MOCK_FRIENDS);

  const handleEdit = (id: string) => {
    console.log('edit', id);
  };

  const handleDelete = (id: string) => {
    setFriends((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-black/5">
        <Link to={ROUTES.HOME} className="flex items-center gap-2 text-sm text-black/40 hover:text-black transition-colors">
          <ArrowLeft className="w-4 h-4" />
          madam
        </Link>
        <h1 className="text-sm font-bold text-black">내 친구</h1>
        <Link
          to={ROUTES.REGISTER}
          className="flex items-center gap-1 text-sm font-semibold text-black hover:text-black/60 transition-colors"
        >
          <Plus className="w-4 h-4" />
          등록
        </Link>
      </header>

      <main className="flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
        {friends.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-bold text-black mb-2">등록된 친구가 없어요</p>
            <p className="text-sm text-black/40 mb-6">첫 번째 친구를 등록해보세요</p>
            <Link
              to={ROUTES.REGISTER}
              className="px-6 py-3 bg-black text-white text-sm font-semibold rounded-pill"
            >
              친구 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {friends.map((friend) => (
              <FriendCard
                key={friend.id}
                friend={friend}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default FriendsPage;
