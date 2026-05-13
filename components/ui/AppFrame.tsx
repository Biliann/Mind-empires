import Link from "next/link";
import type { ReactNode } from "react";

export function AppFrame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen px-2.5 py-4 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 sm:gap-5">
        <nav className="sticky top-2 sm:top-4 z-20 flex items-center justify-between rounded-lg border border-black/10 bg-white/90 px-2.5 sm:px-3 py-2 shadow-insetGlow backdrop-blur-xl gap-2.5">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-xl font-semibold text-bone transition hover:text-ember flex-shrink-0">
            <span className="grid h-7 sm:h-8 w-7 sm:w-8 place-items-center rounded-full bg-sakura text-ember text-sm">九</span>
            <span className="hidden sm:inline">Mind Empires</span>
          </Link>
          <div className="flex flex-wrap gap-0.5 sm:gap-1 text-xs sm:text-sm text-mist justify-end">
            <Link className="rounded-md px-2 sm:px-2.5 py-2 transition hover:bg-black/5 hover:text-bone min-h-9 flex items-center" href="/map">
              Map
            </Link>
            <Link className="rounded-md px-2 sm:px-2.5 py-2 transition hover:bg-black/5 hover:text-bone min-h-9 flex items-center" href="/academy">
              Academy
            </Link>
            <Link className="rounded-md px-2 sm:px-2.5 py-2 transition hover:bg-black/5 hover:text-bone min-h-9 flex items-center" href="/shop">
              Shop
            </Link>
          </div>
        </nav>
        {children}
      </div>
    </main>
  );
}
