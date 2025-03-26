import mongoose from "mongoose";
const reviewSchema = mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, "User name is required"],
    },
    userImage: {
      type: String,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
    },

    comment: {
      type: String,
      required: [true, "Comment is required"],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
const movieSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    desc: {
      type: String,
      required: [true, "Description is required"],
    },
    titleImage: {
      type: String,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    language: {
      type: String,
      required: [true, "Language is required"],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    time: {
      type: Number,
      required: [true, "Time is required"],
    },
    video: {
      type: String,
      // required: [true, "Video is required"],
    },
    rate: {
      type: Number,
      required: [true, "Rate is required"],
      default: 0,
    },
    numberOfReviews: {
      type: Number,
      default: 0,
      required: [true, "Number of reviews is required"],
    },
    reviews: [],
    casts: [
      {
        name: { type: String, required: [true, "Cast name is required"] },
        image: { type: String, required: [true, "Cast image is required"] },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Movies", movieSchema);
export const Review = mongoose.model("Review", reviewSchema);
