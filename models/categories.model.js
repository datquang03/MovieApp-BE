import mongoose from "mongoose";

export const categorySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Categories", categorySchema);
