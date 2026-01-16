import { Schema, model, models, Types } from "mongoose";

const FriendshipSchema = new Schema(
  {
    requesterId: { type: Types.ObjectId, ref: "User", required: true },
    addresseeId: { type: Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
  },
  { timestamps: true }
);

FriendshipSchema.index({ requesterId: 1, addresseeId: 1 }, { unique: true });

export const Friendship = models.Friendship || model("Friendship", FriendshipSchema);
