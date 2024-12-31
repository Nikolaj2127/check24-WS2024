import { fetchData, bc_streaming_package } from "../dataFetching/fetchData";

// Interface for chosen packages
export interface chosenPackages {
  packageId?: number
  packageName: string
  packagePrice: number
  loading?: boolean
}

export interface Game {
    game_id: number
    name: string
    live: number
    highlights: number
  }

// Function to fetch solver result
export async function fetchSolverResult (teams: string[], tournaments: string[], subscriptionPayment: string, isLive: boolean, isHighlights: boolean, dates: any[]) {
    // Fetch available packages
    const packages = await fetchData('bc_streaming_package') as bc_streaming_package[]

    let objectiveValue: number = 0;
    let solverResultGames: any
    let chosenPackages: { packageId: number, packageName: string, packagePrice: number }[] = [];

    try {
        console.time('Fetching Time')
        // Start the request to the solver API
        const response = await fetch('http://localhost:4000/solve', {
            mode: 'cors', 
            method: 'POST',
            body: JSON.stringify({
                teams,
                tournaments,
                subType: subscriptionPayment,
                isLive,
                isHighlights,
                dates,
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        
        console.timeEnd('Fetching Time')
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const selectedPackages = data.selected_packages;
        objectiveValue = data.objective_value;
        solverResultGames = data.merged_data;

        // Use the solver response to map package IDs to package details
        selectedPackages.forEach((packageId: number) => {
            const pkg = packages.find(pkg => pkg.id === packageId);
            const packageName = pkg?.name || 'Unknown';
            const packagePrice = subscriptionPayment === 'yearly' 
                ? pkg?.monthly_price_yearly_subscription_in_cents || 0 
                : pkg?.monthly_price_cents || 0;
            chosenPackages.push({ packageId, packageName, packagePrice });
        });

    } catch (error) {
        // Log any errors that occur during the fetch process
        console.error('Failed to fetch:', error);
        chosenPackages = []
    }
    
    return { chosenPackages, objectiveValue, solverResultGames }
};