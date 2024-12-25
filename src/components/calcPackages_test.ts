import mergeData from './mergeData';
import { fetchSolverResult } from './result/fetchSolverResult';

export async function calcPackages_test(teams: string[], comps: string[], subscriptionPayment: string) {
  let mergedData = await mergeData()

  // Filter out packages not available for monthly payment
  mergedData = mergedData.filter(row => row.live === 1)
  mergedData = mergedData.filter(row => teams.includes(row.team_home) || teams.includes(row.team_away))

  //return await tree(mergedData, subscriptionPayment)
  //return await lpSolver(mergedData as mergedData[], subscriptionPayment);
  return await fetchSolverResult(teams, comps, subscriptionPayment, false, false, [])
}
  