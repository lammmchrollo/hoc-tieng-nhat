'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [topicType, setTopicType] = useState('kanji');
  const [deckName, setDeckName] = useState('');
  const [loading, setLoading] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);

  const fetchDecks = async () => {
    const res = await fetch('/api/decks');
    const data = await res.json();
    if (data.success) setDecks(data.data);
  };

  useEffect(() => { fetchDecks(); }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt || !deckName) return alert('Vui lòng nhập Tên bộ thẻ và Yêu cầu!');
    
    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, topicType, deckName })
      });
      const data = await res.json();
      if (data.success) {
        setPrompt('');
        setDeckName('');
        fetchDecks(); // Cập nhật lại danh sách bộ thẻ
      } else alert('Lỗi: ' + data.error);
    } catch (err) { alert('Lỗi hệ thống!'); }
    setLoading(false);
  };

  const handleDeleteDeck = async (name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa toàn bộ thẻ trong bộ "${name}" không?`)) return;
    await fetch(`/api/decks?deckName=${encodeURIComponent(name)}`, { method: 'DELETE' });
    fetchDecks();
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      <header className="bg-white border-b border-slate-200 px-6 py-5">
        <h1 className="text-2xl font-black text-indigo-600 max-w-7xl mx-auto">Nihongo.AI</h1>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* FORM TẠO BỘ THẺ */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-12 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold mb-6 text-slate-800">Tạo bộ bài mới</h2>
          <form onSubmit={handleGenerate} className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Tên Bộ Thẻ</label>
                <input type="text" required placeholder="VD: Kanji N5 Bài 1" value={deckName} onChange={(e) => setDeckName(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Chủ đề</label>
                <select value={topicType} onChange={(e) => setTopicType(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20">
                  <option value="alphabet">Bảng chữ cái</option>
                  <option value="vocabulary">Từ vựng</option>
                  <option value="kanji">Kanji (Hán tự)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Yêu cầu AI (Prompt)</label>
              <textarea required rows={2} placeholder="VD: Tạo 5 chữ Kanji về thời tiết..." value={prompt} onChange={(e) => setPrompt(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" />
            </div>
            <button type="submit" disabled={loading} className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-6 rounded-xl transition-all disabled:bg-slate-300">
              {loading ? 'Đang tạo...' : 'Tạo Bộ Thẻ AI'}
            </button>
          </form>
        </div>

        {/* HIỂN THỊ CÁC BỘ THẺ */}
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Thư viện của bạn</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {decks.map((deck) => (
            <div key={deck._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition relative group">
              <span className="text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded uppercase">{deck.type}</span>
              <h3 className="text-xl font-bold mt-4 mb-2 truncate">{deck._id}</h3>
              <p className="text-slate-500 text-sm mb-6">{deck.count} thẻ</p>
              
              <div className="flex justify-between items-center">
                <Link href={`/deck/${encodeURIComponent(deck._id)}`} className="text-indigo-600 font-semibold hover:text-indigo-800">
                  Vào học ngay →
                </Link>
                <button onClick={() => handleDeleteDeck(deck._id)} className="text-red-400 hover:text-red-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Xóa bộ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}