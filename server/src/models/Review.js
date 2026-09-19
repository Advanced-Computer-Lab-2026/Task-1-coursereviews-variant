import mongoose from 'mongoose';
import { User } from './User';

// TODO: define the Review schema per README.md section 1.

const reviewSchema = new mongoose.Schema(
  {
    // TODO
    courseCode: {type : String, required: true},
    rating: {type: Number, required: true, min: 1, max: 5},
    comment: {type: String},
    reviewedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
  },
  { timestamps: true }
);

// TODO: add the uniqueness constraint described in README.md section 1.
reviewSchema.index({ courseCode: 1, reviewedBy: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);
