import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import connectDB from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    await connectDB();
    // Thêm deckName vào request
    const { prompt, topicType, deckName } = await req.json();

    const systemInstruction = `
      Bạn là chuyên gia tiếng Nhật. Yêu cầu: "${prompt}". Loại thẻ: "${topicType}".
      Trả về JSON Array. Cấu trúc bắt buộc:
      [{"type": "${topicType}", "question": "...", "answer": "...", "reading": "...", "hanviet": "...", "onyomi": "...", "kunyomi": "...", "example": "..."}]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemInstruction,
      config: { responseMimeType: "application/json" }
    });

    const flashcards = JSON.parse(response.text || "[]");
    
    // Gắn tên bộ thẻ vào từng thẻ trước khi lưu
    const cardsWithDeckName = flashcards.map((card: any) => ({
      ...card,
      deckName: deckName || "Thẻ chưa phân loại"
    }));

    const savedCards = await Flashcard.insertMany(cardsWithDeckName);
    return NextResponse.json({ success: true, data: savedCards });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}