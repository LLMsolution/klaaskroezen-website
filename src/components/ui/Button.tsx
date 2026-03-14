import Link from "next/link";
import { ArrowIcon } from "./ArrowIcon";

type ButtonVariant = "copper" | "ghost" | "paper" | "ink";
type ButtonSize = "default" | "large";

const variantClasses: Record<ButtonVariant, string> = {
  copper:
    "bg-copper text-paper border-copper hover:bg-copper-light hover:border-copper-light focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2",
  ghost:
    "bg-transparent text-ink border-rule hover:border-ink/35 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
  paper:
    "bg-transparent text-paper/60 border-paper/16 hover:border-paper/50 hover:text-paper focus-visible:ring-2 focus-visible:ring-paper focus-visible:ring-offset-2 focus-visible:ring-offset-ink",
  ink:
    "bg-ink text-paper border-ink hover:bg-copper hover:border-copper focus-visible:ring-2 focus-visible:ring-copper focus-visible:ring-offset-2",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "px-[22px] py-[13px] text-[11.5px]",
  large: "px-8 py-4 text-[12.5px]",
};

function buttonClassName(variant: ButtonVariant, size: ButtonSize) {
  return [
    "group inline-flex items-center justify-center gap-[7px]",
    "font-body font-medium tracking-[0.09em] uppercase",
    "rounded-[2px] border transition-all duration-200 whitespace-nowrap",
    "outline-none",
    sizeClasses[size],
    variantClasses[variant],
  ].join(" ");
}

export function ButtonLink({
  href,
  variant = "copper",
  size = "default",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClassName(variant, size)}>
      {children}
    </Link>
  );
}

export function ButtonExternal({
  href,
  variant = "copper",
  size = "default",
  children,
}: {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={buttonClassName(variant, size)}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

export function ButtonArrow({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <ArrowIcon />
    </>
  );
}
