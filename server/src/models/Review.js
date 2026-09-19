import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    courseCode: {type: String, required: true},
    rating: {type: Number, required: true},
    commment: {type: String, required: false},
    reviewedBy: {type: String, required: false}
  },
  { timestamps: true }
);

reviewSchema.index({courseCode: 1, reviewedBy: 1}, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
