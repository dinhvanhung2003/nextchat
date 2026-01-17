import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        phone: { label: "Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const phone = (credentials?.phone || "").trim();
        const password = credentials?.password || "";

        await dbConnect();

        // tìm user
        const u: any = await User.findOne({ phone }).lean();
        if (!u) return null;

        // check pass (tuỳ bạn lưu field gì: passwordHash hay passwordHashs)
        const hash = u.passwordHash || u.passwordHashs;
        if (!hash) return null;

        const ok = await bcrypt.compare(password, hash);
        if (!ok) return null;

        // ✅ TRẢ VỀ USER CÓ id
        return {
          id: String(u._id),
          name: u.name,
          phone: u.phone,
          image: u.avatarUrl || u.image || "",
        } as any;
      },
    }),
  ],

  callbacks: {
    // ✅ lưu id vào token
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.phone = (user as any).phone;
        token.picture = (user as any).image;
      }
      return token;
    },

    // ✅ đẩy id ra session
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).phone = token.phone;
        session.user.image = (token.picture as any) || session.user.image;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
