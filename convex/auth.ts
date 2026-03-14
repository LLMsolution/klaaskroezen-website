import Google from "@auth/core/providers/google";
import Apple from "@auth/core/providers/apple";
import Resend from "@auth/core/providers/resend";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google,
    Apple({
      profile(appleInfo) {
        return {
          id: appleInfo.sub,
          email: appleInfo.email,
          // Apple only shares name on first login
          name: appleInfo.user
            ? `${appleInfo.user.name.firstName} ${appleInfo.user.name.lastName}`
            : undefined,
        };
      },
    }),
    Resend({
      from: "Klaas Kroezen <noreply@klaaskroezen.com>",
    }),
    Password({
      profile(params) {
        return {
          email: params.email as string,
          ...(params.name ? { name: params.name as string } : {}),
        };
      },
    }),
  ],
});
