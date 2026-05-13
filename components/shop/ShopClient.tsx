"use client";

import { useState } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { Button } from "@/components/ui/Button";
import { SakuraIcon, SudokuIcon, ToriiIcon } from "@/components/ui/GameIcons";
import { Eyebrow, Panel } from "@/components/ui/Panel";
import { stripeCheckoutProducts, type StripeProductId } from "@/lib/stripe-products";
import { useProgress } from "@/lib/storage";
import { visualAssets } from "@/lib/visual-assets";

export function ShopClient() {
  const { ready } = useProgress();
  const [checkoutLoading, setCheckoutLoading] = useState<StripeProductId | null>(null);
  const [checkoutError, setCheckoutError] = useState("");

  async function startCheckout(productId: StripeProductId) {
    setCheckoutError("");
    setCheckoutLoading(productId);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ productId })
      });
      const payload = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Checkout could not be started.");
      }

      window.location.href = payload.url;
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Checkout could not be started.");
      setCheckoutLoading(null);
    }
  }

  if (!ready) {
    return (
      <AppFrame>
        <Panel>
          <Eyebrow>Loading</Eyebrow>
          <h1 className="mt-2 text-2xl font-semibold text-bone">Preparing shop inventory...</h1>
        </Panel>
      </AppFrame>
    );
  }

  return (
    <AppFrame>
      <header className="grid gap-4 overflow-hidden rounded-lg border border-black/10 bg-white shadow-insetGlow md:grid-cols-[1fr_320px]">
        <div className="p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-sakura text-ember">
              <SakuraIcon className="h-6 w-6" />
            </span>
            <Eyebrow>Shop</Eyebrow>
          </div>
          <h1 className="mt-4 text-4xl font-semibold text-bone">Academy Quartermaster</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-mist">
            Choose a campaign resource pack and continue through secure hosted checkout.
          </p>
        </div>
        <img
          src={visualAssets.himejiSakura}
          alt="Cherry blossoms in Japan"
          className="image-soft h-52 w-full object-cover md:h-full"
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
          {Object.values(stripeCheckoutProducts).map((product) => (
            <Panel key={product.id} className="relative overflow-hidden">
              <div className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-full bg-sakura text-ember">
                {product.id === "energy-pack" ? (
                  <ToriiIcon className="h-7 w-7" />
                ) : (
                  <SudokuIcon className="h-7 w-7" />
                )}
              </div>
              <h2 className="pr-16 text-xl font-semibold text-bone">{product.name}</h2>
              <p className="mt-2 min-h-12 text-sm text-mist">{product.description}</p>
              <p className="mt-4 text-2xl font-semibold text-bone">
                ${(product.unitAmount / 100).toFixed(2)}
              </p>
              <Button
                className="mt-4 w-full"
                disabled={checkoutLoading !== null}
                onClick={() => startCheckout(product.id)}
              >
                {checkoutLoading === product.id ? "Opening Checkout..." : "Buy"}
              </Button>
            </Panel>
          ))}
          {checkoutError ? (
            <div className="rounded-md border border-blood/20 bg-blood/10 p-4 text-sm text-blood sm:col-span-2">
              {checkoutError}
            </div>
          ) : null}
      </section>
    </AppFrame>
  );
}
