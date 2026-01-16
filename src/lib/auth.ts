import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "./db";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const phone = credentials?.phone?.trim();
        const password = credentials?.password || "";
        if (!phone || !password) return null;

        await dbConnect();
        const user = await User.findOne({ phone }).lean();
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: String(user._id),
          name: user.name,
          phone: user.phone,
          avatarUrl: user.avatarUrl || "",
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as any).id;
        token.avatarUrl = (user as any).avatarUrl;
        token.phone = (user as any).phone;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.uid;
      (session.user as any).avatarUrl = token.avatarUrl;
      (session.user as any).phone = token.phone;
      return session;
    },
  },
  pages: { signIn: "/login" },
};
