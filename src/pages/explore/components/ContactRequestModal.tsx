import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Check } from 'lucide-react';
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

  const occupationLine = profile.isStudent
    ? `${profile.school} · ${profile.major}`
    : profile.occupation;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-sm bg-white rounded-block overflow-hidden"
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
      >
        <AnimatePresence mode="wait">
          {isSent ? (
            <motion.div
              key="success"
              className="p-8 text-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <motion.div
                className="w-16 h-16 rounded-full bg-pastel-lime flex items-center justify-center mx-auto mb-5"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.05 }}
              >
                <Check className="w-8 h-8 text-black" strokeWidth={3} />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3, ease: 'easeOut' }}
              >
                <p className="font-black text-lg text-black mb-2">요청을 보냈어요!</p>
                <p className="text-sm text-black/50 mb-6 leading-relaxed">
                  상대 마담이 승인하면<br />서로의 연락처가 공유돼요.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 transition-colors"
                >
                  확인
                </button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
            >
              <div className={`${profile.cardColor} p-5`}>
                <p className="text-xs font-mono uppercase tracking-widest text-black/40 mb-1">
                  {occupationLine} · {profile.mbti}
                </p>
                <h3 className="text-xl font-black text-black">
                  {profile.name}, {profile.age}
                </h3>
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
                  onClick={() => { if (selectedFriendId) setIsSent(true); }}
                  disabled={!selectedFriendId}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-black text-white text-sm font-semibold rounded-pill hover:bg-black/80 disabled:opacity-30 transition-all"
                >
                  <Send className="w-4 h-4" />
                  연결 요청 보내기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
