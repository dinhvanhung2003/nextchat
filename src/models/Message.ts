import mongoose, { Schema, models, model } from "mongoose";

const MessageSchema = new Schema(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: ["TEXT", "IMAGE"], default: "TEXT" },
    text: { type: String, default: "" },
    imageUrl: { type: String, default: "" },
    seenBy: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // ✅ Reply message
    replyTo: { type: Schema.Types.ObjectId, ref: "Message", default: null },
  },
  { timestamps: true }
);

export const Message = models.Message || model("Message", MessageSchema);
