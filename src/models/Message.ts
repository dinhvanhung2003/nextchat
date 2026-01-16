import { Schema, model, models, Types } from "mongoose";

const MessageSchema = new Schema(
  {
    conversationId: { type: Types.ObjectId, ref: "Conversation", required: true },
    senderId: { type: Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["TEXT", "IMAGE"], default: "TEXT" },
    text: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    seenBy: [{ type: Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

MessageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = models.Message || model("Message", MessageSchema);
