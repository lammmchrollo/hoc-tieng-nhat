'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [topicType, setTopicType] = useState('vocabulary');
  const [deckName, setDeckName] = useState('');
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  
  // Chuyển đổi chế độ
  const [isManual, setIsManual] = useState(false);
  // Dữ liệu thủ công nay là một mảng
  const [manualCards, setManualCards] = useState([{ question: '', answer: '', reading: '', hanviet: '' }]);

  const fetchDecks = async () => {
    const res = await fetch('/api/decks');
    const data = await res.json();
    if (data.success) setDecks(data.data);
  };

  useEffect(() => { fetchDecks(); }, []);

  // --- LOGIC TẠO BẰNG AI ---
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || !deckName) return alert('Nhập tên bộ thẻ và yêu cầu!');
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, topicType, deckName })
      });
      if (res.ok) { setPrompt(''); setDeckName(''); fetchDecks(); }
    } catch (err) { alert('Lỗi hệ thống!'); }
    setLoading(false);
  };

  // --- LOGIC TẠO THỦ CÔNG ---
  const handleManualCardChange = (index: number, field: string, value: string) => {
    const newCards = [...manualCards];
    newCards[index] = { ...newCards[index], [field]: value };
    setManualCards(newCards);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deckName) return alert('Vui lòng nhập Tên bộ thẻ!');
    // Lọc ra các dòng trống
    const validCards = manualCards.filter(c => c.question.trim() !== '' && c.answer.trim() !== '');
    if (validCards.length === 0) return alert('Vui lòng nhập ít nhất 1 từ vựng hợp lệ!');

    setLoading(true);
    try {
      const res = await fetch('/api/flashcards/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deckName, type: topicType, cards: validCards })
      });
      if (res.ok) {
        setManualCards([{ question: '', answer: '', reading: '', hanviet: '' }]);
        setDeckName('');
        fetchDecks();
      }
    } catch (err) { alert('Lỗi tạo thẻ!'); }
    setLoading(false);
  };

  const handleDeleteDeck = async (name: string) => {
    if (!confirm(`Xóa toàn bộ thẻ trong "${name}"?`)) return;
    await fetch(`/api/decks?deckName=${encodeURIComponent(name)}`, { method: 'DELETE' });
    fetchDecks();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-5">
        <h1 className="text-2xl font-black text-indigo-600 max-w-7xl mx-auto">Nihongo.AI</h1>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* FORM CHUNG */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-12 max-w-3xl mx-auto">
          <div className="flex gap-4 mb-6 border-b border-slate-100">
            <button onClick={() => setIsManual(false)} className={`pb-2 px-4 font-bold ${!isManual ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>✨ Tạo bằng AI</button>
            <button onClick={() => setIsManual(true)} className={`pb-2 px-4 font-bold ${isManual ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400'}`}>✍️ Tự viết thẻ</button>
          </div>

          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tên Bộ Thẻ</label>
              <input type="text" required placeholder="VD: Kanji N5 Bài 1" value={deckName} onChange={(e) => setDeckName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Chủ đề</label>
              <select value={topicType} onChange={(e) => setTopicType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20">
                <option value="vocabulary">Từ vựng</option>
                <option value="kanji">Kanji (Hán tự)</option>
              </select>
            </div>
          </div>

          {/* CHUYỂN ĐỔI FORM */}
          {!isManual ? (
            <form onSubmit={handleAIGenerate} className="flex flex-col gap-4">
              <textarea required rows={2} placeholder="Yêu cầu AI (VD: Tạo 5 chữ Kanji về thời tiết...)" value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none" />
              <button type="submit" disabled={loading} className="bg-indigo-600 text-white font-bold py-3.5 rounded-xl disabled:bg-slate-300">
                {loading ? 'Đang tạo...' : 'Tạo Bộ Thẻ AI'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
              {manualCards.map((card, index) => (
                <div key={index} className="flex items-center gap-2 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-400 w-6">{index + 1}.</span>
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    <input placeholder="Mặt trước *" required value={card.question} onChange={e => handleManualCardChange(index, 'question', e.target.value)} className="p-2 rounded border outline-none" />
                    <input placeholder="Mặt sau *" required value={card.answer} onChange={e => handleManualCardChange(index, 'answer', e.target.value)} className="p-2 rounded border outline-none" />
                    <input placeholder="Cách đọc" value={card.reading} onChange={e => handleManualCardChange(index, 'reading', e.target.value)} className="p-2 rounded border outline-none" />
                    <input placeholder="Hán Việt" value={card.hanviet} onChange={e => handleManualCardChange(index, 'hanviet', e.target.value)} className="p-2 rounded border outline-none" />
                  </div>
                  <button type="button" onClick={() => setManualCards(manualCards.filter((_, i) => i !== index))} className="text-red-400 hover:text-red-600 font-bold px-2">✕</button>
                </div>
              ))}
              <div className="flex justify-between mt-2">
                <button type="button" onClick={() => setManualCards([...manualCards, { question: '', answer: '', reading: '', hanviet: '' }])} className="text-indigo-600 font-bold hover:underline">
                  + Thêm dòng mới
                </button>
                <button type="submit" disabled={loading} className="bg-emerald-500 text-white px-8 py-2 font-bold rounded-xl disabled:bg-slate-300">
                  {loading ? 'Đang lưu...' : 'Lưu Bộ Thẻ'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* DANH SÁCH BỘ THẺ */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Thư viện của bạn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div key={deck._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group">
              <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded uppercase">{deck.type}</span>
              <h3 className="text-xl font-bold mt-4 mb-2 truncate">{deck._id}</h3>
              <p className="text-slate-500 text-sm mb-6">{deck.count} thẻ</p>
              
              <div className="flex gap-3">
                <Link href={`/deck/${encodeURIComponent(deck._id)}`} className="flex-1 text-center bg-indigo-600 text-white font-bold py-2 rounded-lg hover:bg-indigo-700">
                  Học ngay
                </Link>
                {/* NÚT EDIT MỚI */}
                <Link href={`/deck/${encodeURIComponent(deck._id)}/edit`} className="bg-slate-100 text-slate-600 font-bold py-2 px-4 rounded-lg hover:bg-slate-200">
                  Sửa
                </Link>
                <button onClick={() => handleDeleteDeck(deck._id)} className="bg-red-50 text-red-500 font-bold py-2 px-3 rounded-lg hover:bg-red-100">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}