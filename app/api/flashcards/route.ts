import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const deckName = searchParams.get('deckName');
    
    let filter = {};
    if (deckName) {
      if (deckName === 'Thẻ chưa phân loại') {
        filter = { deckName: { $in: [null, undefined, 'Thẻ chưa phân loại', ''] } };
      } else {
        filter = { deckName };
      }
    }
    
    const cards = await Flashcard.find(filter).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: cards });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}