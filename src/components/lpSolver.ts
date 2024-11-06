import { DateTime } from "danfojs/dist/danfojs-base/shared/types"
import GLPK from "glpk.js"


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

interface solverData {
    game_id: number
    monthly_price_cents?: number
    monthly_price_yearly_subscription_in_cents?: number
    streaming_package_id: number
    price?: number
}

export async function lpSolver(data: mergedData[], subscriptionPayment: string) {
    const glpk = await GLPK();
    const solverData = data.map(({ highlights, live, name, starts_at, team_away, team_home, tournament_name, ...rest }) => rest) as solverData[];


    // Filter data based on the subscription payment method
    let monthlysolverData: solverData[];
    if(subscriptionPayment === 'monthly') {
        monthlysolverData = solverData.filter(row => row.monthly_price_cents !== null);
        monthlysolverData = monthlysolverData.map(row => {
            row.price = row.monthly_price_cents;
            delete row.monthly_price_yearly_subscription_in_cents
            return row;
        });
    } else if (subscriptionPayment === 'yearly') {
        monthlysolverData = solverData;
        monthlysolverData = monthlysolverData.map(row => {
            row.price = row.monthly_price_yearly_subscription_in_cents;
            delete row.monthly_price_cents
            return row;
        });
    } else {
        throw new Error ("Enter valid Subscription payment method")
    }

    const packagePrices = Array.from(new Set(monthlysolverData.map(({ streaming_package_id, price }) => 
        JSON.stringify({ streaming_package_id, price })
    ))).map(item => JSON.parse(item)).map(({ streaming_package_id, price }) => ({
        name: streaming_package_id,
        coef: price
    }));

    // Extract unique game and streaming package IDs
    const uniqueGameIds = Array.from(new Set(monthlysolverData.map(item => item.game_id)));
    const uniqueStreamingPackageIds = Array.from(new Set(solverData.map(item => item.streaming_package_id)));

    // Define contstraints for the LP problem
    const constraints = uniqueGameIds.map(game_id => {
        const vars = uniqueStreamingPackageIds.map(streaming_package_id => {
            const coef = monthlysolverData.some(item => item.game_id === game_id && item.streaming_package_id === streaming_package_id) ? 1 : 0;
            return { name: `${streaming_package_id}`, coef };
        });
        return {
            name: `game_${game_id}`,
            vars,
            bnds: { type: glpk.GLP_FX, lb: 1, ub: 1 }
        };
    });

    const options = {
        msglev: glpk.GLP_MSG_ALL,
        presol: true,
        tm_lim: 100000,
        it_lim: 1,
        cb: {
            call: (res: any) => console.log(res),
            each: 1
        }
    };

    // Solve the LP problem
    const res = await glpk.solve({
        name: 'LP',
        objective: {
            direction: glpk.GLP_MIN,
            name: 'obj',
            vars: packagePrices
        },
        subjectTo: constraints
    }, options);

    

    console.log('res', res)

    // Print the chosen packages
    const chosenPackages = Object.keys(res.result.vars)
    .filter(key => res.result.vars[key] === 1)
    .map(key => {
        const packageId = key.replace('Package_', '');
        const packageName = data.find(pkg => pkg.streaming_package_id === parseInt(packageId))?.name || 'Unknown';
        const price = solverData.find(p => p.streaming_package_id === parseInt(packageId))?.price || 0;
        return { packageName, packageId, price };
    });

    // Use the z value from the result as the total price
    const totalPrice = res.result.z;

    console.log('Chosen Packages:', chosenPackages.map(pkg => `${pkg.packageName} (${pkg.packageId}), ${pkg.price}`));
    console.log('Total Price:', totalPrice);
    console.timeEnd('lpSolver')

    return chosenPackages
}