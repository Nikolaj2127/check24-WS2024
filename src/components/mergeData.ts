import { DateTime } from "danfojs/dist/danfojs-base/shared/types"
import { fetchData, bc_game, bc_streaming_offer, bc_streaming_package } from './dataFetching/fetchData';

export interface mergedData {
  game_id: number
  highlights: number
  live: number
  monthly_price_cents: number
  monthly_price_yearly_subscription_in_cents: number
  name: string
  starts_at: DateTime
  streaming_package_id: number
  team_away: string
  team_home: string
  tournament_name: string
}

export default async function mergeData() {
    // Load the CSV data
    const bcGame = await fetchData("bc_game") as bc_game[];
    const bcStreamingOffer = await fetchData("bc_streaming_offer") as bc_streaming_offer[];
    const bcStreamingPackage = await fetchData("bc_streaming_package") as bc_streaming_package[];

    // Rename 'id' column to 'streaming_package_id' in bcStreamingPackage
  bcStreamingPackage.forEach(row => {
    (row as any).streaming_package_id = row.id; // Use type assertion
    delete row.id;
  });

  // Merge datasets
  let mergedData = bcStreamingOffer.map(offer => {
    const game = bcGame.find(game => game.id === offer.game_id);
    const pkg = bcStreamingPackage.find(pkg => pkg.streaming_package_id === offer.streaming_package_id);
    const mergedRow = { ...game, ...offer, ...pkg }
    delete mergedRow.id
    return mergedRow;
  }).filter(row => row !== null) as any[];

  return mergedData
}