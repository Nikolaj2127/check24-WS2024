import { fetchData, bc_streaming_package, bc_game, bc_streaming_offer } from "../dataFetching/fetchData";

export interface chosenPackages {
  packageId?: number
  packageName: string
  packagePrice: number
  loading?: boolean
}

export async function fetchBackendData (teams: string[], comps: string[], subscriptionPayment: string, isLive: boolean, isHighlights: boolean) {
    const packages = await fetchData('bc_streaming_package') as bc_streaming_package[]
    const games = await fetchData('bc_game') as bc_game[]
    const offers = await fetchData('bc_streaming_offer') as bc_streaming_offer[]

    let numVariables = 0;
    let numConstraints = 0;
    let solverInfo = '';
    let objectiveValue: number = 0;
    let chosenPackages: { packageId: number, packageName: string, packagePrice: number }[] = [];
    let packageName: string
    let packagePrice: number
    let mergedData: any

    

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
                isHighlights: isHighlights
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

        console.log(data)

        const selectedPackages = data.selected_packages;
        mergedData = data.merged_data;
        console.log('mergedData: ', mergedData)
        objectiveValue = data.objective_value;
        console.log('Selected packages:', selectedPackages);

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

        /* const lines = data.res.split('\r\n');


        console.log(lines)
        
        for (const line of lines) {
            if (line.startsWith('Number of variables =')) {
              numVariables = parseInt(line.split('=')[1].trim());
            } else if (line.startsWith('Number of constraints =')) {
              numConstraints = parseInt(line.split('=')[1].trim());
            } else if (line.startsWith('Solving with')) {
              solverInfo = line.replace('Solving with', '').trim();
            } else if (line.startsWith('Objective value =')) {
              objectiveValue = parseFloat(line.split('=')[1].trim());
            } else if (/^\d+ \d+\.\d+$/.test(line)) {
              const [packageId, value] = line.split(' ').map(Number);
              if (value === 1.0) {
                if (subscriptionPayment === 'yearly') {
                  packagePrice = packages.find(pkg => pkg.id === packageId)?.monthly_price_yearly_subscription_in_cents || 0;
                } else if (subscriptionPayment === 'monthly') {
                  packagePrice = packages.find(pkg => pkg.id === packageId)?.monthly_price_cents || 0;
                } else {
                  throw Error
                }
                packageName = packages.find(pkg => pkg.id === packageId)?.name || 'Unknown';
                chosenPackages.push({packageId, packageName, packagePrice});
              }
            }
          }  */
         
    } catch (error) {
        console.error('Failed to fetch:', error);
        chosenPackages = []
    }
    
    return {chosenPackages: chosenPackages, objectiveValue: objectiveValue, mergedData: mergedData || []}
};