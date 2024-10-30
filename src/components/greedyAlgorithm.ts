import { mergedData } from './lpSolver';

export async function greedyAlgorithm(mergedData: mergedData[], subscriptionPayment: string) {
    const greedyData = mergedData.map(({ highlights, live, name, starts_at, team_away, team_home, tournament_name, ...rest }) => rest)

    let monthlyGreedyData
    if(subscriptionPayment === 'monthly') {
        monthlyGreedyData = greedyData.filter(row => row.monthly_price_cents !== null);

        // Greedy Algorithm: Select the cheapest packages to cover all games
        const packages = Array.from(new Set(monthlyGreedyData.map(row => row.streaming_package_id)));
        const games = Array.from(new Set(monthlyGreedyData.map(row => row.game_id)));

        // Sort packages by cost
        const packageCosts: { [key: string]: number } = {};
        monthlyGreedyData.forEach(row => {
            packageCosts[row.streaming_package_id] = row.monthly_price_cents;
        });

        packages.sort((a, b) => packageCosts[a] - packageCosts[b]);

        const selectedPackages: string[] = [];
        const coveredGames: Set<string> = new Set();

        for (const pkg of packages) {
            if (coveredGames.size === games.length) break;

            const pkgGames = mergedData.filter(row => row.streaming_package_id === pkg).map(row => row.game_id);
            const newGames = pkgGames.filter(game => !coveredGames.has(game.toString()));

            if (newGames.length > 0) {
                selectedPackages.push(pkg.toString());
                newGames.forEach(game => coveredGames.add(game.toString()));
            }
        }

        console.log('Selected Packages:', selectedPackages);

        // Calculate the total cost of the selected packages
        const totalCost = selectedPackages.reduce((sum, pkg) => sum + packageCosts[pkg], 0);

        console.log('Total Cost of Selected Packages:', totalCost);
    } else if (subscriptionPayment === 'yearly') {

        console.log('filtered', greedyData.filter(row => row.streaming_package_id === 2))
        // Greedy Algorithm: Select the cheapest packages to cover all games
        const packages = Array.from(new Set(mergedData.map(row => row.streaming_package_id)));
        const games = Array.from(new Set(mergedData.map(row => row.game_id)));

        console.log(packages)
        console.log(games)

        // Sort packages by cost
        const packageCosts: { [key: string]: number } = {};
        mergedData.forEach(row => {
            packageCosts[row.streaming_package_id] = row.monthly_price_yearly_subscription_in_cents;
        });

        packages.sort((a, b) => packageCosts[a] - packageCosts[b]);

        const selectedPackages: string[] = [];
        const coveredGames: Set<string> = new Set();

        for (const pkg of packages) {
            if (coveredGames.size === games.length) break;

            const pkgGames = mergedData.filter(row => row.streaming_package_id === pkg).map(row => row.game_id);
            const newGames = pkgGames.filter(game => !coveredGames.has(game.toString()));

            if (newGames.length > 0) {
                selectedPackages.push(pkg.toString());
                newGames.forEach(game => coveredGames.add(game.toString()));
            }
        }

        console.log('Selected Packages:', selectedPackages);

        // Calculate the total cost of the selected packages
        const totalCost = selectedPackages.reduce((sum, pkg) => sum + packageCosts[pkg], 0);

        console.log('Total Cost of Selected Packages:', totalCost);
    } else {
        throw new Error ("Enter valid Subscription payment method")
    }

    
}