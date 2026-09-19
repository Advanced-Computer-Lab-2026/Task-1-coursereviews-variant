import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value',
      },
    },
    comment: {
      type: String,
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

reviewSchema.index(
  { courseCode: 1, reviewedBy: 1 },
  { unique: true, partialFilterExpression: { reviewedBy: { $exists: true } } }
);

export const Review = mongoose.model('Review', reviewSchema);