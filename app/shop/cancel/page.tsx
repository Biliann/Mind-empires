import { CheckoutReturnClient } from "@/components/shop/CheckoutReturnClient";

export default async function ShopCancelPage({
  searchParams
}: {
  searchParams: Promise<{ product?: string }>;
}) {
  const params = await searchParams;

  return <CheckoutReturnClient status="cancel" productId={params.product} />;
}
