import { mergedData } from "./lpSolver";

interface PackageData {
    price: number;
    gameIds: number[];
    currentPackageId: number
    packageIds: number[]
}

interface SolverResult {
    packageName: string;
    packageId: string;
    price: number;
}

export function tree(data: mergedData[], subscriptionPayment: string) {
    // Step 1: Create a map to group game IDs by package ID
    const packageMap = new Map<number, { price: number, gameIds: number[], currentPackageId: number, packageIds: number[] }>();

    // Step 2: Iterate over the data to populate the map
    if(subscriptionPayment === 'monthly') {

        data = data.filter(row => row.monthly_price_cents !== null);
        data.forEach(item => {
            const packageId = item.streaming_package_id;
            if (!packageMap.has(packageId)) {
                packageMap.set(packageId, { price: item.monthly_price_cents, gameIds: [], currentPackageId: item.streaming_package_id, packageIds: [] });
            }
            packageMap.get(packageId)?.gameIds.push(item.game_id);
        });

    } else if (subscriptionPayment === 'yearly') {

        console.log('poopenfarten')
        
        data.forEach(item => {
            const packageId = item.streaming_package_id;
            if (!packageMap.has(packageId)) {
                packageMap.set(packageId, { price: item.monthly_price_yearly_subscription_in_cents, gameIds: [], currentPackageId: item.streaming_package_id, packageIds: [] });
            }
            packageMap.get(packageId)?.gameIds.push(item.game_id);
        });
    } else {
        throw new Error ("Enter valid Subscription payment method")
    }

    // Step 3: Transform the map into an array of package data
    const treeData: PackageData[] = Array.from(packageMap.values());

    //console.log(treeData);

    class TreeNode<T extends PackageData> {
        value: T;
        children: TreeNode<T>[];

        constructor(value: T) {
            this.value = value;
            this.children = [];
        }

        addChild(child: TreeNode<T>): void {
            this.children.push(child);
        }

        // Merge package data
        mergePackageData(newPackage: PackageData): PackageData {
            const newPrice = this.value.price + newPackage.price;
            const newPackageIds = [...this.value.packageIds, newPackage.currentPackageId];
            const newGameIds = Array.from(new Set([...this.value.gameIds, ...newPackage.gameIds]));
            return { 
                price: newPrice, 
                gameIds: newGameIds, 
                currentPackageId: newPackage.currentPackageId, 
                packageIds: newPackageIds 
            };
        }

        // Depth-First Traversal
        traverseDFS(callback: (node: TreeNode<T>) => void): void {
            callback(this);
            this.children.forEach(child => child.traverseDFS(callback));
        }

        // Check if node is a leaf
        isLeaf(uniqueGameIds: number[]): boolean {
            return this.value.gameIds.length === uniqueGameIds.length;
        }
    }

    // Memoization map to store already computed states
    const memo = new Map<string, boolean>();

    // Variable to track the most optimal solution
    let optimalSolution: PackageData | null = null;

    // Recursive function to build the tree
    function buildTree(node: TreeNode<PackageData>, remainingPackages: PackageData[], uniqueGameIds: number[]): void {
        remainingPackages.forEach(pkg => {
            const newNode = new TreeNode<PackageData>(node.mergePackageData(pkg));
            const stateKey = JSON.stringify(newNode.value.gameIds.sort());

            // Check memoization map to avoid redundant calculations
            if (memo.has(stateKey)) {
                return;
            }

            memo.set(stateKey, true);
            node.addChild(newNode);

            if (newNode.isLeaf(uniqueGameIds)) {
                // Update the optimal solution if this leaf node is more optimal
                if (!optimalSolution || newNode.value.price < optimalSolution.price) {
                    optimalSolution = newNode.value;
                }
            } else {
                buildTree(newNode, remainingPackages.filter(p => p !== pkg), uniqueGameIds);
            }
        });
    }

    // Example usage:
    const uniqueGameIds = Array.from(new Set(data.map(item => item.game_id)));
    const root = new TreeNode<PackageData>({ price: 0, gameIds: [], currentPackageId: 0, packageIds: [] });
    buildTree(root, treeData, uniqueGameIds);

    console.log(optimalSolution)

    if (optimalSolution) {
        return (optimalSolution as PackageData).packageIds.map(id => {
            const pkg = data.find(pkg => pkg.streaming_package_id === id);
            let price
            if(subscriptionPayment === 'monthly') {
                price = pkg?.monthly_price_cents
            } else if (subscriptionPayment === 'yearly') {
                price = pkg?.monthly_price_yearly_subscription_in_cents
            }
            console.log(price)
            return {
                packageName: `Package ${id}`,
                packageId: id.toString(),
                price: price
            };
        });
    }

    return [];
}