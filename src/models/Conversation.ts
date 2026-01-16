import { Schema, model, models, Types } from "mongoose";

const ConversationSchema = new Schema(
  {
    type: { type: String, enum: ["DM", "GROUP"], default: "DM" },
    members: [{ type: Types.ObjectId, ref: "User", required: true }],
    title: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Conversation =
  models.Conversation || model("Conversation", ConversationSchema);
