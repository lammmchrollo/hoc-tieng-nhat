// Thêm hàm này vào dưới hàm DELETE trong app/api/flashcards/[id]/route.ts
export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const updateData = await req.json();
    
    // Cập nhật thẻ và trả về data mới nhất
    const updatedCard = await Flashcard.findByIdAndUpdate(id, updateData, { new: true });
    return NextResponse.json({ success: true, data: updatedCard });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}