import { BattleClient } from "@/components/sudoku/BattleClient";

export default async function BattlePage({
  params
}: {
  params: Promise<{ regionId: string }>;
}) {
  const { regionId } = await params;
  return <BattleClient regionId={regionId} />;
}
