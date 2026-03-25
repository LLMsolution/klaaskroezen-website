import Google from "@auth/core/providers/google";
import Resend from "@auth/core/providers/resend";
import { convexAuth } from "@convex-dev/auth/server";
import { layout } from "./emailHelpers";

const FROM = "Klaas Kroezen <info@llmsolution.nl>";

const magicLinkContent = {
  nl: {
    subject: "Inloggen bij Klaas Kroezen",
    heading: "Inloggen",
    text: "Klik op de onderstaande knop om in te loggen bij je Klaas Kroezen account. Deze link is 15 minuten geldig.",
    button: "Inloggen",
    ignore: "Als je dit niet hebt aangevraagd, kun je deze e-mail veilig negeren.",
  },
  en: {
    subject: "Sign in to Klaas Kroezen",
    heading: "Sign in",
    text: "Click the button below to sign in to your Klaas Kroezen account. This link is valid for 15 minutes.",
    button: "Sign in",
    ignore: "If you did not request this, you can safely ignore this email.",
  },
  de: {
    subject: "Anmelden bei Klaas Kroezen",
    heading: "Anmelden",
    text: "Klicken Sie auf die Schaltfläche unten, um sich bei Ihrem Klaas Kroezen Konto anzumelden. Dieser Link ist 15 Minuten gültig.",
    button: "Anmelden",
    ignore: "Wenn Sie dies nicht angefordert haben, können Sie diese E-Mail ignorieren.",
  },
};

function magicLinkHtml(url: string, lang: "nl" | "en" | "de" = "nl"): string {
  const t = magicLinkContent[lang];
  const body = `
    <h1 style="margin: 0 0 16px; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 900; line-height: 1.1; color: #0E0C0A;">
      ${t.heading}
    </h1>
    <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.75; color: #444;">
      ${t.text}
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
      <tr>
        <td style="background-color: #B5622A; border-radius: 2px;">
          <a href="${url}" style="display: inline-block; padding: 14px 28px; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #ffffff; text-decoration: none;">
            ${t.button}
          </a>
        </td>
      </tr>
    </table>
    <p style="margin: 24px 0 0; font-size: 13px; line-height: 1.75; color: #999;">
      ${t.ignore}
    </p>
  `;
  return layout(body, { preheader: t.subject, crossSell: "none", lang: lang === "de" ? "nl" : lang });
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    Resend({
      id: "resend",
      apiKey: process.env.RESEND_API_KEY,
      from: FROM,
      async sendVerificationRequest({ identifier: to, url, provider }) {
        // Detect language from URL params or default to NL
        const urlObj = new URL(url);
        const lang = (urlObj.searchParams.get("lang") as "nl" | "en" | "de") || "nl";
        const t = magicLinkContent[lang];

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM,
            to,
            subject: t.subject,
            html: magicLinkHtml(url, lang),
          }),
        });

        if (!res.ok) {
          throw new Error("Resend error: " + JSON.stringify(await res.json()));
        }
      },
    }),
  ],
});
