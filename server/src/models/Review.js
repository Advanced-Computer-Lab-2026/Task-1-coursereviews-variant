import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true },
    rating: { type: Number, required: true, integer: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
  },
  { timestamps: true }
);

reviewSchema.index({ courseCode: 1, reviewedBy: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
