import { CheckoutReturnClient } from "@/components/shop/CheckoutReturnClient";

export default async function ShopSuccessPage({
  searchParams
}: {
  searchParams: Promise<{ session_id?: string; product?: string }>;
}) {
  const params = await searchParams;

  return (
    <CheckoutReturnClient
      status="success"
      productId={params.product}
      sessionId={params.session_id}
    />
  );
}
