export type StripeProductId = "energy-pack" | "booster-pack";

export type StripeCheckoutProduct = {
  id: StripeProductId;
  name: string;
  description: string;
  unitAmount: number;
  currency: "usd";
  fulfillment: {
    energy?: number;
    boosters?: {
      "fog-breaker"?: number;
      "logic-hint"?: number;
      "memory-seal"?: number;
      "focus-token"?: number;
      "star-reveal"?: number;
    };
  };
};

export const stripeCheckoutProducts: Record<StripeProductId, StripeCheckoutProduct> = {
  "energy-pack": {
    id: "energy-pack",
    name: "Energy Pack",
    description: "Restore 10 battle energy for your academy.",
    unitAmount: 499,
    currency: "usd",
    fulfillment: {
      energy: 10
    }
  },
  "booster-pack": {
    id: "booster-pack",
    name: "Booster Pack",
    description: "A tactical bundle with one booster for every current Sudoku region.",
    unitAmount: 799,
    currency: "usd",
    fulfillment: {
      boosters: {
        "fog-breaker": 1,
        "logic-hint": 1,
        "memory-seal": 1,
        "focus-token": 1,
        "star-reveal": 1
      }
    }
  }
};

export function getStripeCheckoutProduct(productId: string) {
  return stripeCheckoutProducts[productId as StripeProductId];
}
