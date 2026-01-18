import mongoose, { Schema } from "mongoose";

const PushTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true, required: true },
    token: { type: String, unique: true, required: true },
    platform: { type: String, enum: ["ios", "android", "web"], default: "web" },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const PushToken = mongoose.models.PushToken || mongoose.model("PushToken", PushTokenSchema);
