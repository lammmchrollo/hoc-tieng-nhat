import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcard extends Document {
  type: string;
  deckName: string; // <-- TRƯỜNG MỚI THÊM
  question: string;
  answer: string;
  reading?: string;
  onyomi?: string;
  kunyomi?: string;
  hanviet?: string;
  example?: string;
}

const FlashcardSchema = new Schema<IFlashcard>({
  type: { type: String, required: true }, // Dùng làm Chủ đề (Kanji/Từ vựng...)
  deckName: { type: String, default: 'Thẻ chưa phân loại' }, // <-- TRƯỜNG MỚI THÊM
  question: { type: String, required: true },
  answer: { type: String, required: true },
  reading: { type: String },
  onyomi: { type: String },
  kunyomi: { type: String },
  hanviet: { type: String },
  example: { type: String },
}, { timestamps: true });

export default mongoose.models.Flashcard || mongoose.model<IFlashcard>('Flashcard', FlashcardSchema);