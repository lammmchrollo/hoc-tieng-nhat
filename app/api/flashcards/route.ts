import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Flashcard from '@/models/Flashcard';

// Next.js phiên bản mới yêu cầu params phải là một Promise
export async function DELETE(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Phải giải nén (await) params ra trước khi lấy id
    const { id } = await params;
    
    await Flashcard.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}