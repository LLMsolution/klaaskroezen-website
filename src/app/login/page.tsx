import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Inloggen",
  description: "Log in op je Klaas Kroezen account.",
};

export default function LoginPage() {
  return (
    <section className="min-h-[calc(100vh-200px)] flex items-center justify-center py-16 px-7">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-10">
          <h1 className="font-display text-[clamp(28px,3.4vw,40px)] font-black leading-[0.97] tracking-[-0.03em]">
            Welkom terug.
          </h1>
          <p className="text-[15px] text-ink/60 leading-[1.8] mt-3">
            Log in om je trainingen en materialen te bekijken.
          </p>
        </div>
        <LoginForm />
      </div>
    </section>
  );
}
