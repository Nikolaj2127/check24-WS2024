import { fetchData, bc_streaming_package } from "./fetchData";

export async function fetchBackendData () {
    const packages = await fetchData('bc_streaming_package') as bc_streaming_package[]
    console.log(packages)
    let numVariables = 0;
    let numConstraints = 0;
    let solverInfo = '';
    let objectiveValue = 0;
    let chosenPackages: { packageId: number, packageName: string, price: number }[] = [];
    let packageName: string
    let price: number

    try {
        const response = await fetch('http://localhost:4000/solve', {mode: 'cors'});
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const lines = data.res.split('\r\n');
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
                price = packages.find(pkg => pkg.id === packageId)?.monthly_price_yearly_subscription_in_cents || 0;
                packageName = packages.find(pkg => pkg.id === packageId)?.name || 'Unknown';
                chosenPackages.push({packageId, packageName, price});
              }
            }
          }
        return chosenPackages;
    } catch (error) {
        console.error('Failed to fetch:', error);
        return []
    }
};