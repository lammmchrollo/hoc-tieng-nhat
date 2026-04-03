'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function EditDeckPage() {
  const params = useParams();
  const decodedName = decodeURIComponent((params?.deckName as string) || '');
  const [cards, setCards] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchCards = async () => {
    const res = await fetch(`/api/flashcards?deckName=${encodeURIComponent(decodedName)}`);
    const data = await res.json();
    if (data.success) setCards(data.data);
  };

  useEffect(() => { if (decodedName) fetchCards(); }, [decodedName]);

  // Cập nhật thẻ
  const handleUpdate = async (id: string, updatedData: any) => {
    setLoadingId(id);
    await fetch(`/api/flashcards/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    setLoadingId(null);
    alert('Đã lưu!');
  };

  // Xóa thẻ
  const handleDelete = async (id: string) => {
    if (!confirm("Xóa thẻ này khỏi bộ?")) return;
    await fetch(`/api/flashcards/${id}`, { method: 'DELETE' });
    setCards(cards.filter(c => c._id !== id));
  };

  // Thêm thẻ mới trực tiếp vào bộ
  const handleAddNewCard = async () => {
    const newCard = { question: 'Từ mới', answer: 'Nghĩa', deckName: decodedName, type: 'vocabulary' };
    const res = await fetch('/api/flashcards/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deckName: decodedName, cards: [newCard] })
    });
    const data = await res.json();
    if (data.success) fetchCards(); // Reload lại danh sách để lấy thẻ vừa tạo
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-indigo-600 font-semibold mb-6 inline-block">← Về thư viện</Link>
        <h1 className="text-3xl font-black mb-8">Chỉnh sửa bộ: {decodedName}</h1>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {cards.map((card, index) => (
            <div key={card._id} className="flex flex-col md:flex-row gap-4 p-4 border-b border-slate-100 items-center">
              <span className="font-bold text-slate-400 w-8">{index + 1}.</span>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 flex-1 w-full">
                <input value={card.question} onChange={e => { const newCards = [...cards]; newCards[index].question = e.target.value; setCards(newCards); }} className="p-2 border rounded outline-none" placeholder="Mặt trước" />
                <input value={card.answer} onChange={e => { const newCards = [...cards]; newCards[index].answer = e.target.value; setCards(newCards); }} className="p-2 border rounded outline-none" placeholder="Mặt sau" />
                <input value={card.reading || ''} onChange={e => { const newCards = [...cards]; newCards[index].reading = e.target.value; setCards(newCards); }} className="p-2 border rounded outline-none" placeholder="Cách đọc" />
                <input value={card.hanviet || ''} onChange={e => { const newCards = [...cards]; newCards[index].hanviet = e.target.value; setCards(newCards); }} className="p-2 border rounded outline-none" placeholder="Hán Việt" />
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleUpdate(card._id, card)} disabled={loadingId === card._id} className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded font-bold hover:bg-indigo-200 disabled:opacity-50">
                  {loadingId === card._id ? '...' : 'Lưu'}
                </button>
                <button onClick={() => handleDelete(card._id)} className="bg-red-50 text-red-500 px-3 py-2 rounded font-bold hover:bg-red-100">✕</button>
              </div>
            </div>
          ))}
          
          <div className="p-4 bg-slate-50">
            <button onClick={handleAddNewCard} className="w-full py-3 border-2 border-dashed border-indigo-300 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors">
              + Thêm một từ mới vào bộ này
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}