export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

export async function GET() {
  try {
    await connectDB();
    const decks = await Flashcard.aggregate([
      { 
        $group: { 
          _id: { $ifNull: ["$deckName", "Thẻ chưa phân loại"] }, 
          type: { $first: "$type" }, 
          count: { $sum: 1 }, 
          createdAt: { $max: "$createdAt" } 
        } 
      },
      { $sort: { createdAt: -1 } }
    ]);
    return NextResponse.json({ success: true, data: decks });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const deckName = searchParams.get('deckName');
    
    if (!deckName || deckName === 'Thẻ chưa phân loại') {
      await Flashcard.deleteMany({ deckName: { $in: [null, undefined, 'Thẻ chưa phân loại', ''] } });
    } else {
      await Flashcard.deleteMany({ deckName });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}