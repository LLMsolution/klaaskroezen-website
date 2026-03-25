import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";

const FROM = "Klaas Kroezen <info@llmsolution.nl>";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    Resend({
      from: FROM,
      apiKey: process.env.RESEND_API_KEY,
    }),
  ],
});
