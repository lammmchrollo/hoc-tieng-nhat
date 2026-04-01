import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

// Xóa 1 thẻ lẻ dựa vào ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    await Flashcard.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}