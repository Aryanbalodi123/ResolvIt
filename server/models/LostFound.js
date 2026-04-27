import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema(
  {
    lost_id: {
      type: Number,
      unique: true,
      index: true,
    },
    user_id: {
      type: String,
      default: "",
      index: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    date_lost: {
      type: Date,
      default: Date.now,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    lostimage: {
      type: String,
      default: "",
      trim: true,
    },
    location: {
      type: String,
      default: "",
      trim: true,
    },
    category: {
      type: String,
      default: "",
      trim: true,
    },
    reward: {
      type: String,
      default: "",
      trim: true,
    },
    distinguishing_features: {
      type: String,
      default: "",
      trim: true,
    },
    contact_details: {
      type: String,
      default: "",
      trim: true,
    },
    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },
  },
  {
    collection: "lost_found",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const LostFound =
  mongoose.models.LostFound || mongoose.model("LostFound", lostFoundSchema);
