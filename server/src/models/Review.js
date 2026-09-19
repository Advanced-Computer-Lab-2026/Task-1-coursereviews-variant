import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    courseCode: { 
      type: String, 
      required: true 
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5,
      // Ensures the number is a whole integer
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value'
      }
    },
    comment: { 
      type: String 
    },
    reviewedBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User' 
    }
  },
  { timestamps: true }
);

// Ensures one review per user per course
reviewSchema.index({ courseCode: 1, reviewedBy: 1 }, { unique: true });

export const Review = mongoose.model('Review', reviewSchema);