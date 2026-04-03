import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { deckName, type, cards } = await req.json();

    // Gắn tên bộ thẻ và loại thẻ cho từng từ vựng trong mảng
    const cardsToSave = cards.map((card: any) => ({
      ...card,
      deckName: deckName || 'Thẻ chưa phân loại',
      type: type || 'vocabulary'
    }));

    const savedCards = await Flashcard.insertMany(cardsToSave);
    return NextResponse.json({ success: true, data: savedCards });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}