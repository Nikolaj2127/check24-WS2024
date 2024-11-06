import * as tf from '@tensorflow/tfjs';
import { mergedData } from './mergeData';
import { loadModel, getModelMetadata } from './neuralNetworkTraining';

interface Game {
    game_id: number | string;
    [key: string]: any;
}

export async function predictOptimalPackages(
    selectedGames: Array<Game | string>, 
    data: mergedData[],
    subscriptionPayment: string
): Promise<Array<{ packageName: string, packageId: string, price: number }>> {
    // Enhanced input validation
    if (!selectedGames || !Array.isArray(selectedGames)) {
        console.error('Input received:', selectedGames);
        throw new Error('Selected games must be an array');
    }

    if (selectedGames.length === 0) {
        console.error('Empty games array received');
        throw new Error('Selected games array cannot be empty');
    }

    // Filter valid data with prices first
    const validData = data.filter(item => {
        const price = subscriptionPayment === 'monthly' 
            ? item.monthly_price_cents 
            : item.monthly_price_yearly_subscription_in_cents;
        return typeof price === 'number' && price > 0;
    });

    // Extract game IDs with validation
    const gameIds = selectedGames.map(game => {
        if (typeof game === 'object' && game !== null && 'game_id' in game) {
            return String(game.game_id);
        }
        return String(game);
    }).filter(id => id && id !== 'undefined' && id !== 'null');

    console.log('Processed game IDs:', gameIds);
    console.log('Valid data count:', validData.length);

    if (gameIds.length === 0) {
        console.error('Original games:', selectedGames);
        throw new Error('No valid game IDs could be extracted from selected games');
    }

    // Load and validate model
    const model = await loadModel();
    if (!model) throw new Error('No trained model found');

    const metadata = getModelMetadata();
    if (!metadata) throw new Error('No model metadata found');

    // Verify coverage before prediction
    const { coverage } = metadata;
    const uncoveredGames = gameIds.filter(game => 
        !coverage.has(game) || coverage.get(game).size === 0
    );

    if (uncoveredGames.length > 0) {
        console.error('Games without package coverage:', uncoveredGames);
        throw new Error(`No package coverage for games: ${uncoveredGames.join(', ')}`);
    }

    const { packages } = metadata;

    // Create input tensor with validation
    interface InputTensor {
        tensor: tf.Tensor2D;
    }

    const input: InputTensor['tensor'] = tf.tensor2d([
        packages.map((pkg: string): number => {
            return validData.some((item: mergedData): boolean => 
                gameIds.includes(String(item.game_id)) && 
                String(item.streaming_package_id) === pkg
            ) ? 1 : 0;
        })
    ]);

    try {
        const predictions = await model.predict(input) as tf.Tensor;
        const predArray = await predictions.array() as number[][];

        predictions.dispose();
        input.dispose();

        // Process predictions with price validation
        interface PackageProbability {
            id: string;
            probability: number;
        }

        interface PackageProbability {
            id: string;
            probability: number;
        }

        const packageProbabilities: PackageProbability[] = packages.map((pkg: string, i: number) => ({
            id: pkg,
            probability: Number.isFinite(predArray[0][i]) ? predArray[0][i] : 0
        })).filter((pkg: PackageProbability) => {
            const packageData = validData.find(item => String(item.streaming_package_id) === String(pkg.id));
            const price = subscriptionPayment === 'monthly'
                ? packageData?.monthly_price_cents
                : packageData?.monthly_price_yearly_subscription_in_cents;
            return typeof price === 'number' && price > 0;
        });

        // Sort by probability and add greedy fallback
        packageProbabilities.sort((a, b) => b.probability - a.probability);
        const selectedPackages = new Set<string>();
        const coveredGames = new Set<string>();

        // First pass: Use neural network predictions
        for (const { id } of packageProbabilities) {
            if (selectedPackages.has(id)) continue;

            const packageGames = validData
                .filter(item => String(item.streaming_package_id) === String(id))
                .map(item => item.game_id.toString());

            const coversNewGames = gameIds.some(game => 
                packageGames.includes(game) && !coveredGames.has(game)
            );

            if (coversNewGames) {
                selectedPackages.add(String(id));
                packageGames
                    .filter(game => gameIds.includes(game))
                    .forEach(game => coveredGames.add(game));
            }
        }

        // Second pass: Greedy fallback for uncovered games
        for (const game of gameIds) {
            if (!coveredGames.has(game)) {
                const availableForGame = validData
                    .filter(item => 
                        item.game_id.toString() === game && 
                        !selectedPackages.has(String(item.streaming_package_id))
                    )
                    .sort((a, b) => {
                        const priceA = subscriptionPayment === 'monthly' ? 
                            a.monthly_price_cents : 
                            a.monthly_price_yearly_subscription_in_cents;
                        const priceB = subscriptionPayment === 'monthly' ? 
                            b.monthly_price_cents : 
                            b.monthly_price_yearly_subscription_in_cents;
                        return (priceA || 0) - (priceB || 0);
                    });

                if (availableForGame.length > 0) {
                    selectedPackages.add(String(availableForGame[0].streaming_package_id));
                    coveredGames.add(game);
                }
            }
        }

        // Final coverage check
        if (!gameIds.every(game => coveredGames.has(game))) {
            throw new Error('Could not find package combination covering all selected games');
        }

        // Format results with price validation
        return Array.from(selectedPackages).map(id => {
            const pkg = validData.find(item => String(item.streaming_package_id) === String(id));
            if (!pkg) {
                console.error(`Package ${id} not found in valid data`);
                throw new Error(`Package ${id} not found in valid data`);
            }

            const price = subscriptionPayment === 'monthly'
                ? pkg.monthly_price_cents
                : pkg.monthly_price_yearly_subscription_in_cents;

            if (typeof price !== 'number' || !Number.isFinite(price) || price <= 0) {
                console.error(`Invalid price for package ${id}:`, price);
                throw new Error(`Invalid price for package ${id}`);
            }

            return {
                packageName: `Package ${id}`,
                packageId: id.toString(),
                price
            };
        });

    } catch (error) {
        console.error('Prediction error:', error);
        throw error;
    }
}