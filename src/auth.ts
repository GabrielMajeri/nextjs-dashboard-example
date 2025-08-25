import { eq } from "drizzle-orm";
import { z } from "zod";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import bcrypt from "bcrypt";

import type { User } from "@/app/lib/definitions";

import { authConfig } from "./auth.config";

import { db } from "@/db";
import { users } from "@/db/schema";

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (!user) {
      throw "not found";
    }
    return user;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) {
            console.log("User not found");
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return user;
          } else {
            console.log("Invalid credentials");
          }
        }

        return null;
      },
    }),
  ],
});
