import mongoose from 'mongoose';

// TODO: define the Review schema per README.md section 1.

const reviewSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
    },
    rating:{
      type: Number,
      required:true,
      min:1,
      max:5,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be a Whole number between 1 and 5',
      },
    },
    
      comment: {
        type: String,
      },
      reviewedBy :{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
  

    
    // TODO
  },
  { timestamps: true }
);

// TODO: add the uniqueness constraint described in README.md section 1.
reviewSchema.index(
  {courseCode: 1 , reviewedBy: 1},
  {unique: true}
);
export const Review = mongoose.model('Review', reviewSchema);
