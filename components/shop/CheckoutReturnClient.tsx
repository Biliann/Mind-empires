"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppFrame } from "@/components/ui/AppFrame";
import { LinkButton } from "@/components/ui/Button";
import { Eyebrow, Panel } from "@/components/ui/Panel";
import { getStripeCheckoutProduct } from "@/lib/stripe-products";
import { useProgress } from "@/lib/storage";
import type { BoosterId } from "@/types/game";

const fulfilledSessionsKey = "mind-empires-stripe-fulfilled-v1";

function getFulfilledSessions() {
  try {
    return JSON.parse(window.localStorage.getItem(fulfilledSessionsKey) ?? "[]") as string[];
  } catch {
    return [];
  }
}

function saveFulfilledSessions(sessionIds: string[]) {
  window.localStorage.setItem(fulfilledSessionsKey, JSON.stringify(sessionIds));
}

export function CheckoutReturnClient({
  productId,
  sessionId,
  status
}: {
  productId?: string;
  sessionId?: string;
  status: "success" | "cancel";
}) {
  const product = useMemo(
    () => (productId ? getStripeCheckoutProduct(productId) : undefined),
    [productId]
  );
  const { setProgress } = useProgress();
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    if (status !== "success" || !product || !sessionId) return;

    const fulfilled = getFulfilledSessions();
    if (fulfilled.includes(sessionId)) {
      setApplied(true);
      return;
    }

    setProgress((current) => {
      const nextInventory = { ...current.inventory };
      for (const [boosterId, count] of Object.entries(product.fulfillment.boosters ?? {})) {
        nextInventory[boosterId as BoosterId] += count ?? 0;
      }

      return {
        ...current,
        energy: current.energy + (product.fulfillment.energy ?? 0),
        inventory: nextInventory
      };
    });

    saveFulfilledSessions([...fulfilled, sessionId]);
    setApplied(true);
  }, [product, sessionId, setProgress, status]);

  return (
    <AppFrame>
      <Panel className="mx-auto w-full max-w-2xl">
        <Eyebrow>{status === "success" ? "Payment complete" : "Checkout canceled"}</Eyebrow>
        <h1 className="mt-2 text-4xl font-semibold text-bone">
          {status === "success" ? "Your pack is ready." : "No charge was made."}
        </h1>
        <p className="mt-4 text-sm leading-6 text-mist">
          {status === "success"
            ? `${product?.name ?? "Purchase"} has been applied to this browser's local game save.`
            : "You can return to the shop whenever you want to try again."}
        </p>
        {status === "success" && !applied ? (
          <p className="mt-4 rounded-md border border-black/10 bg-ink p-3 text-sm text-mist">
            Applying purchase...
          </p>
        ) : null}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <LinkButton href="/shop">Back to Shop</LinkButton>
          <LinkButton href="/map" tone="secondary">
            World Map
          </LinkButton>
        </div>
        <p className="mt-5 text-xs text-mist">
          Production fulfillment should be stored from the verified Stripe webhook.
          This MVP applies rewards locally because game progress is localStorage-only.
        </p>
        <Link href="/" className="mt-4 block text-sm text-mist hover:text-bone">
          Return home
        </Link>
      </Panel>
    </AppFrame>
  );
}
