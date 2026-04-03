'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- COMPONENT THẺ LẬT LẺ ---
function FlashcardItem({ card, onDelete, forceFlip }: { card: any, onDelete: any, forceFlip: boolean | null }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Lắng nghe lệnh lật/úp từ thanh công cụ cha
  useEffect(() => {
    if (forceFlip !== null) {
      setIsFlipped(forceFlip);
    }
  }, [forceFlip]);

  return (
    <div className="relative group">
      <button 
        onClick={(e) => { 
          e.stopPropagation(); 
          onDelete(card._id); 
        }}
        className="absolute -top-3 -right-3 z-10 bg-red-100 text-red-500 hover:bg-red-600 hover:text-white rounded-full w-8 h-8 flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition shadow-sm"
      >
        ✕
      </button>

      <div className="relative w-80 h-[26rem] cursor-pointer perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* MẶT TRƯỚC */}
          <div className="absolute inset-0 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 backface-hidden">
            <h2 className="text-7xl font-bold text-slate-800 mb-4 text-center">{card.question}</h2>
            {card.hanviet && <p className="text-xl font-medium text-slate-400 tracking-widest text-center">[{card.hanviet}]</p>}
          </div>

          {/* MẶT SAU */}
          <div className="absolute inset-0 bg-slate-900 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180">
            <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">{card.answer}</h2>
            <div className="w-full space-y-4 text-center">
              {card.reading && <p className="text-xl font-light text-slate-200">{card.reading}</p>}
              {(card.onyomi || card.kunyomi) && (
                <div className="bg-slate-800/50 rounded-xl p-4 w-full">
                  {card.onyomi && <div className="flex justify-between mb-2"><span className="text-xs text-slate-400">ON</span><span className="text-amber-300">{card.onyomi}</span></div>}
                  {card.kunyomi && <div className="flex justify-between"><span className="text-xs text-slate-400">KUN</span><span className="text-sky-300">{card.kunyomi}</span></div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- TRANG CHI TIẾT BỘ THẺ ---
export default function DeckPage() {
  const params = useParams();
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [forceFlip, setForceFlip] = useState<boolean | null>(null);

  const decodedName = decodeURIComponent((params?.deckName as string) || 'Thẻ chưa phân loại');

  const fetchCards = async () => {
    try {
      const res = await fetch(`/api/flashcards?deckName=${encodeURIComponent(decodedName)}`);
      const data = await res.json();
      if (data.success) setCards(data.data);
    } catch (error) {
      console.error("Lỗi fetch thẻ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (params?.deckName) fetchCards();
  }, [params?.deckName]);

  // HÀM ĐIỀU KHIỂN
  const shuffleCards = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setForceFlip(null); // Reset trạng thái lật để tránh bị khóa thẻ
  };

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Xóa thẻ này?")) return;
    await fetch(`/api/flashcards/${id}`, { method: 'DELETE' });
    setCards(cards.filter(card => card._id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-indigo-600 font-semibold mb-6 inline-block hover:underline">
          ← Quay lại Thư viện
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">{decodedName}</h1>
            <p className="text-slate-500">Tổng cộng: {cards.length} thẻ</p>
          </div>

          {/* THANH CÔNG CỤ ĐIỀU KHIỂN */}
          <div className="flex flex-wrap gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
            <button onClick={shuffleCards} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all">🔀 Đảo vị trí</button>
            <button onClick={() => setForceFlip(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-bold text-sm transition-all">📖 Lật hết</button>
            <button onClick={() => setForceFlip(false)} className="px-4 py-2 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-bold text-sm transition-all">📕 Úp hết</button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-20"><p>Đang tải bộ thẻ...</p></div>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center">
            {cards.length > 0 ? (
              cards.map((card) => (
                <FlashcardItem 
                  key={card._id} 
                  card={card} 
                  onDelete={handleDeleteCard} 
                  forceFlip={forceFlip}
                />
              ))
            ) : (
              <div className="text-center py-20 bg-white w-full rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-400">Bộ thẻ này trống. Hãy quay lại trang chủ để thêm thẻ nhé!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}