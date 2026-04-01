'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- COMPONENT THẺ LẬT ---
function FlashcardItem({ card, onDelete }: { card: any, onDelete: (id: string) => void }) {
  const [isFlipped, setIsFlipped] = useState(false);
  
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
          
          <div className="absolute inset-0 bg-white border border-slate-100 rounded-3xl shadow-sm flex flex-col items-center justify-center p-8 backface-hidden">
            <h2 className="text-7xl font-bold text-slate-800 mb-4 text-center">{card.question}</h2>
            {card.hanviet && <p className="text-xl font-medium text-slate-400 tracking-widest text-center">[{card.hanviet}]</p>}
          </div>

          <div className="absolute inset-0 bg-slate-900 text-white rounded-3xl shadow-xl flex flex-col items-center justify-center p-8 backface-hidden rotate-y-180">
            <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">{card.answer}</h2>
            <div className="w-full space-y-4 text-center">
              {card.reading && !card.onyomi && !card.kunyomi && <p className="text-xl font-light text-slate-200">{card.reading}</p>}
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

// --- TRANG HIỂN THỊ DANH SÁCH THẺ TRONG BỘ ---
export default function DeckPage() {
  const params = useParams();
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Chống lỗi: Đợi Next.js lấy được tên bộ thẻ từ URL rồi mới chạy
    if (!params?.deckName) return;
    
    const decodedName = decodeURIComponent(params.deckName as string);
    
    const fetchCards = async () => {
      try {
        const res = await fetch(`/api/flashcards?deckName=${encodeURIComponent(decodedName)}`);
        const data = await res.json();
        if (data.success) {
          setCards(data.data);
        }
      } catch (error) {
        console.error("Lỗi fetch thẻ:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCards();
  }, [params?.deckName]);

  // Hiển thị trạng thái chờ nếu URL chưa sẵn sàng
  if (!params?.deckName) {
    return <main className="min-h-screen bg-slate-50 flex justify-center items-center"><p className="text-slate-500 font-medium text-xl">Đang tải bộ thẻ...</p></main>;
  }

  const decodedName = decodeURIComponent(params.deckName as string);

  const handleDeleteCard = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thẻ này?")) return;
    await fetch(`/api/flashcards/${id}`, { method: 'DELETE' });
    // Lọc bỏ thẻ đã xóa khỏi màn hình ngay lập tức cho mượt
    setCards(cards.filter(card => card._id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="text-indigo-600 font-semibold mb-6 inline-block hover:underline hover:text-indigo-800 transition-colors">
          ← Quay lại Thư viện
        </Link>
        
        <div className="flex justify-between items-end mb-8 border-b border-slate-200 pb-4">
          <div>
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">Bộ thẻ đang học</span>
            <h1 className="text-3xl font-black text-slate-800 mt-1">{decodedName}</h1>
          </div>
          <div className="text-sm font-medium text-slate-500 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
            Tổng cộng: {cards.length} thẻ
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-20"><p className="text-lg text-slate-500">Đang tìm thẻ của bạn...</p></div>
        ) : (
          <div className="flex flex-wrap gap-8 justify-center">
            {cards.map((card) => (
              <FlashcardItem key={card._id} card={card} onDelete={handleDeleteCard} />
            ))}
            
            {cards.length === 0 && (
              <div className="text-center py-20 bg-white w-full rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xl text-slate-400 font-medium">Bộ thẻ này hiện chưa có từ vựng nào.</p>
                <Link href="/" className="mt-4 inline-block text-indigo-600 font-semibold hover:underline">Về trang chủ để tạo thẻ bằng AI</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}