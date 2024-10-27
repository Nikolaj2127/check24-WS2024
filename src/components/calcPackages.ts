import Papa from 'papaparse';
import solve, { LP } from "glpk.js";
import GLPK from "glpk.js"
import { fetchData, bc_game, bc_streaming_offer, bc_streaming_package } from './fetchData';

export async function calcPackages() {
  const glpk = await GLPK();
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
    return { ...game, ...offer, ...pkg };
  }).filter(row => row !== null) as any[]; // Filter out null values

  console.log('mergedData (before filtering): ', mergedData);

  // Filter out packages not available for monthly payment
  mergedData = mergedData.filter(row => row.monthly_price_cents !== null);

  console.log('mergedData (after filtering): ', mergedData);

  // Optimization: Select the best combination of packages to cover all games
  const packages = Array.from(mergedData.map(row => row.streaming_package_id));
  const games = Array.from(mergedData.map(row => row.game_id));

  console.log('packages: ', packages);
  console.log('games: ', games);

  // Define the objective function (minimize total cost)
  const costs: { [key: string]: number } = {};
  mergedData.forEach(row => {
    costs[row.streaming_package_id] = row.monthly_price_cents;
  });

  async function solveOptimizationProblem() {
    const lp: LP = {
      name: "Minimize_Cost",
      objective: {
        direction: glpk.GLP_MIN, // Use the constant from the library
        name: "cost",
        vars: packages.map(p => ({ name: `Package_${p}`, coef: costs[p] }))
      },
      subjectTo: []
    };

    // Define the constraints (cover all selected games)
    games.forEach((game: string) => {
      const relevantPackages = mergedData.filter(row => row.game_id === game).map(row => row.streaming_package_id);
      lp.subjectTo.push({
        name: `cover_game_${game}`,
        vars: relevantPackages.map((p: string) => ({ name: `Package_${p}`, coef: 1 })),
        bnds: { type: glpk.GLP_FX, lb: 1, ub: 1 } // Use the constant from the library
      });
    });

    // Solve the optimization problem
    const problem = await glpk.solve(lp);
    console.log('Problem:', problem);

    // Check if problem.result is defined and has vars property
    if (problem && problem.result && problem.result.vars) {
      // Extract chosen packages
      const chosenPackages = Object.keys(problem.result.vars)
        .filter(key => problem.result.vars[key] === 1) // Assuming value 1 means the package is chosen
        .map(key => key.replace('Package_', ''));

      console.log('Chosen Packages:', chosenPackages);

      // Calculate the total cost of the chosen packages
      const totalCost = chosenPackages.reduce((sum, pkg) => sum + costs[pkg], 0);

      console.log('Total Cost of Chosen Packages:', totalCost);
    }
  }

  // Call the async function
  solveOptimizationProblem();
}

calcPackages().catch(console.error);