import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { passwordResetNl } from "./emailTemplates";
import { layout } from "./emailHelpers";

const FROM = "Klaas Kroezen <info@llmsolution.nl>";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    Resend({
      from: FROM,
      apiKey: process.env.RESEND_API_KEY,
    }),
    Password({
      profile(params) {
        return {
          email: params.email as string,
          ...(params.name ? { name: params.name as string } : {}),
        };
      },
      reset: Resend({
        id: "password-reset",
        apiKey: process.env.RESEND_API_KEY,
        from: FROM,
        async sendVerificationRequest({ identifier: to, token }) {
          const content = passwordResetNl(token);
          const html = layout(content, {
            preheader: "Je reset code voor Klaas Kroezen",
            crossSell: "none",
            lang: "nl",
          });

          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: FROM,
              to,
              subject: "Wachtwoord resetten — Klaas Kroezen",
              html,
            }),
          });

          if (!res.ok) {
            throw new Error("Resend error: " + JSON.stringify(await res.json()));
          }
        },
      }),
    }),
  ],
});
