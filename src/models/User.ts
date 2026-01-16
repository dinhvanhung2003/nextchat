import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true }, // login kiểu Zalo
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

export const User = models.User || model("User", UserSchema);
