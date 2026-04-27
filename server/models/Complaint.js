import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    complaint_id: {
      type: Number,
      unique: true,
      index: true,
    },
    user_id: {
      type: String,
      required: true,
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
    status: {
      type: String,
      default: "pending",
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
    priority: {
      type: String,
      default: "medium",
      trim: true,
    },
    assigned_to: {
      type: String,
      default: "",
      trim: true,
    },
    resolved_at: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "complaints",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

export const Complaint =
  mongoose.models.Complaint || mongoose.model("Complaint", complaintSchema);
