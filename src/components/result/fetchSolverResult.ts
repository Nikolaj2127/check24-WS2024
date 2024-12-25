import { fetchData, bc_streaming_package } from "../dataFetching/fetchData";

export interface chosenPackages {
  packageId?: number
  packageName: string
  packagePrice: number
  loading?: boolean
}

export async function fetchSolverResult (teams: string[], comps: string[], subscriptionPayment: string, isLive: boolean, isHighlights: boolean, dates: any[]) {
    const packages = await fetchData('bc_streaming_package') as bc_streaming_package[]

    let objectiveValue: number = 0;
    let solverResultGames: any
    let chosenPackages: { packageId: number, packageName: string, packagePrice: number }[] = [];

    try {
        console.time('Fetching Time')
        const response = await fetch('http://localhost:4000/solve', {
            mode: 'cors', 
            method: 'POST',
            body: JSON.stringify({
                teams: teams,
                comps: comps,
                payment: subscriptionPayment,
                isLive: isLive,
                isHighlights: isHighlights,
                dates: dates,
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        
        console.timeEnd('Fetching Time')
        console.log(response)
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        console.log('data', data)

        const selectedPackages = data.selected_packages;
        objectiveValue = data.objective_value;
        solverResultGames = data.merged_data
        console.log('sRG', solverResultGames)

        selectedPackages.forEach((packageId: number) => {
            const packageName = packages.find(pkg => pkg.id === packageId)?.name || 'Unknown';
            let packagePrice = 0;
            if (subscriptionPayment === 'yearly') {
                packagePrice = packages.find(pkg => pkg.id === packageId)?.monthly_price_yearly_subscription_in_cents || 0;
            } else if (subscriptionPayment === 'monthly') {
                packagePrice = packages.find(pkg => pkg.id === packageId)?.monthly_price_cents || 0;
            }
            chosenPackages.push({ packageId, packageName, packagePrice });
        });

        console.log('Chosen packages:', chosenPackages);
         
    } catch (error) {
        console.error('Failed to fetch:', error);
        chosenPackages = []
    }
    
    return {chosenPackages: chosenPackages, objectiveValue: objectiveValue, solverResultGames: solverResultGames}
};