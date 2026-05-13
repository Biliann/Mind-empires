import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonTone = "primary" | "secondary" | "ghost" | "danger";

const tones: Record<ButtonTone, string> = {
  primary:
    "border-sumi bg-sumi text-white shadow-sm hover:border-gold hover:bg-gold disabled:border-steel/30 disabled:bg-steel/20 disabled:text-steel",
  secondary:
    "border-black/10 bg-washi text-bone shadow-sm hover:border-ember/30 hover:bg-sakura/40 disabled:text-steel",
  ghost:
    "border-transparent bg-transparent text-mist hover:bg-black/5 hover:text-bone disabled:text-steel",
  danger:
    "border-blood bg-blood text-white hover:bg-blood/90 disabled:border-steel/30 disabled:bg-steel/20 disabled:text-steel"
};

export function Button({
  children,
  tone = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  children: ReactNode;
}) {
  return (
    <button
      className={`min-h-11 rounded-md border px-4 py-2 text-sm font-semibold transition duration-200 active:scale-[0.99] ${tones[tone]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  children,
  tone = "primary",
  className = ""
}: {
  href: string;
  children: ReactNode;
  tone?: ButtonTone;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`flex min-h-11 items-center justify-center rounded-md border px-4 py-2 text-center text-sm font-semibold transition duration-200 active:scale-[0.99] ${tones[tone]} ${className}`}
    >
      {children}
    </Link>
  );
}
