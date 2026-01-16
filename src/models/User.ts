import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    image: { type: String, default: "" }, // ✅ avatar url
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
