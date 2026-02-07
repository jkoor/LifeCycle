import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { twoFactor } from "better-auth/plugins"
import { passkey } from "@better-auth/passkey"
import { prisma } from "@/lib/prisma"
import { nextCookies } from "better-auth/next-js"

export const auth = betterAuth({
  appName: "Lifecycle",
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  plugins: [
    nextCookies(), // Make sure to include this for Next.js
    twoFactor({
      issuer: "Lifecycle",
      skipVerificationOnEnable: false,
    }),
    passkey(),
  ],
})
