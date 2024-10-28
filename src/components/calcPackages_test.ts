import { merge } from 'danfojs';
import { fetchData, bc_game, bc_streaming_offer, bc_streaming_package } from './fetchData';
import { lpSolver, mergedData } from './lpSolver';

export async function calcPackages_test() {
    const teams = ["Bayern München", "FC Barcelona"]
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


  // Filter out packages not available for monthly payment
  mergedData = mergedData.filter(row => row.live === 1)
  //mergedData = mergedData.filter(row => teams.includes(row.team_home) || teams.includes(row.team_away) )

  lpSolver(mergedData as mergedData[], 'yearly')
  
}
  