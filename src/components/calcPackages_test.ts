import { mergedData } from './mergeData';
import { greedyAlgorithm } from './greedyAlgorithm';
import { lpSolver } from './lpSolver';
import { tree } from './tree';
import { predictOptimalPackages } from './neuralNetwork';
import mergeData from './mergeData';

export async function calcPackages_test(teams: string[], subscriptionPayment: string) {

  let mergedData = await mergeData()

  // Filter out packages not available for monthly payment
  mergedData = mergedData.filter(row => row.live === 1)
  mergedData = mergedData.filter(row => teams.includes(row.team_home) || teams.includes(row.team_away) )

  //greedyAlgorithm(mergedData as mergedData[], 'yearly')
  //return await tree(mergedData, subscriptionPayment)
  //return await lpSolver(mergedData as mergedData[], subscriptionPayment);
  
  // Define selectedGames based on some criteria
  const selectedGames = mergedData.filter(row => teams.includes(row.team_home) || teams.includes(row.team_away));

  const predictions = await predictOptimalPackages(selectedGames, mergedData, subscriptionPayment);
  return predictions;
}
  