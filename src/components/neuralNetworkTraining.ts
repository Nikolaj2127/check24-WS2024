// neuralNetworkTraining.ts
import * as tf from '@tensorflow/tfjs';
// Import GPU backend
import '@tensorflow/tfjs-backend-webgl';
import { mergedData } from './mergeData';

// Add function to check and setup GPU
async function setupGPU() {
    // Check available backends
    console.log('Available backends:', tf.engine().registryFactory);
    
    try {
        // Try to set WebGL (GPU) backend
        await tf.setBackend('webgl');
        console.log('Successfully enabled GPU acceleration');
        console.log('Current backend:', tf.getBackend());
        
        // Log GPU info if available
        const gpuInfo = tf.getBackend() === 'webgl' ? (tf.backend() as any).getGPGPUContext() : null;
        if (gpuInfo) {
            console.log('GPU Device:', tf.env().get('WEBGL_VERSION'));
            console.log('GPU Memory:', tf.memory().numBytes, 'bytes');
        }
        
        return true;
    } catch (error) {
        console.warn('GPU acceleration not available:', error);
        console.log('Falling back to CPU');
        await tf.setBackend('cpu');
        return false;
    }
}

// Add interface for metadata
interface ModelMetadata {
    packages: number[];
    games: number[];
    maxPrice: number;
}

export async function trainAndSaveModel(data: mergedData[], subscriptionPayment: string, callbacks?: { onEpochEnd?: (epoch: number, logs: any) => void; }) {
    // Setup GPU first
    const isGPU = await setupGPU();
    console.log('Training on:', isGPU ? 'GPU' : 'CPU');

    // Configure GPU memory growth
    if (isGPU) {
        tf.env().set('WEBGL_FORCE_F16_TEXTURES', true); // Use FP16 for better performance
        tf.env().set('WEBGL_CPU_FORWARD', false); // Disable CPU fallback
    }

    console.log('Starting model training...');

    // Filter data with improved validation
    const validData = data.filter(item => {
        const price = subscriptionPayment === 'monthly' 
            ? item.monthly_price_cents 
            : item.monthly_price_yearly_subscription_in_cents;
        const hasValidPrice = typeof price === 'number' && price > 0;
        const hasValidGame = typeof item.game_id === 'number' || typeof item.game_id === 'string';
        const hasValidPackage = typeof item.streaming_package_id === 'number';
        return hasValidPrice && hasValidGame && hasValidPackage;
    });

    console.log(`Valid data entries: ${validData.length}/${data.length}`);

    // Get unique packages and games
    const packages = Array.from(new Set(validData.map(item => item.streaming_package_id)));
    const games = Array.from(new Set(validData.map(item => item.game_id)));

    // Create coverage map for validation
    const coverageMap = new Map<string, Set<number>>();
    games.forEach(game => {
        const gamePackages = validData
            .filter(item => item.game_id === game)
            .map(item => item.streaming_package_id);
        coverageMap.set(String(game), new Set(gamePackages));
    });

    // Create training matrices with coverage validation
    const gamePackageMatrix: number[][] = [];
    const priceMatrix: number[][] = [];
    const batchSize = 100;
    
    for (let i = 0; i < games.length; i += batchSize) {
        const batch = games.slice(i, i + batchSize);
        
        const batchMatrix = batch.map(game => {
            const coverage = coverageMap.get(String(game));
            return packages.map(pkg => coverage?.has(pkg) ? 1 : 0);
        });

        const batchPrices = batch.map(() => 
            packages.map(pkg => {
                const packageData = validData.find(item => 
                    item.streaming_package_id === pkg
                );
                return subscriptionPayment === 'monthly'
                    ? packageData?.monthly_price_cents || 0
                    : packageData?.monthly_price_yearly_subscription_in_cents || 0;
            })
        );

        gamePackageMatrix.push(...batchMatrix);
        priceMatrix.push(...batchPrices);
    }

    const maxPrice = Math.max(...priceMatrix.flat().filter(price => price > 0));

    // Create tensors with explicit cleanup
    const X = tf.tidy(() => tf.tensor2d(gamePackageMatrix, [gamePackageMatrix.length, packages.length]));
    const y = tf.tidy(() => tf.tensor2d(priceMatrix.map(row => row.map(price => price / maxPrice)), 
        [priceMatrix.length, packages.length]));

    // Simpler model architecture
    const model = tf.sequential({
        layers: [
            tf.layers.dense({
                inputShape: [packages.length],
                units: Math.min(64, packages.length * 2),
                activation: 'relu'
            }),
            tf.layers.dense({
                units: packages.length,
                activation: 'linear'
            })
        ]
    });

    model.compile({
        optimizer: tf.train.adam(0.001),
        loss: 'meanSquaredError',
        metrics: ['mse']
    });

    // Reduced callback frequency
    const epochLoggingInterval = 5;
    await model.fit(X, y, {
        epochs: 100,
        batchSize: Math.min(32, games.length),
        validationSplit: 0.2,
        shuffle: true,
        callbacks: {
            onBatchEnd: (batch, logs) => {
                const batchInfo = {
                    gameId: games[batch],
                    packages: packages.filter((_, i) => gamePackageMatrix[batch][i] === 1),
                    price: priceMatrix[batch].reduce((a, b) => a + b, 0)
                };
                if (logs) console.log('Batch Info:', batchInfo);
            },
            onEpochEnd: (epoch, logs) => {
                if (epoch % epochLoggingInterval === 0) {
                    console.log(`Epoch ${epoch + 1}/100`);
                    console.log(`Loss: ${logs?.loss?.toFixed(4)}`);
                    if (isGPU) {
                        console.log('GPU Memory:', tf.memory().numBytes, 'bytes');
                    }
                    if (callbacks?.onEpochEnd) {
                        callbacks.onEpochEnd(epoch, logs);
                    }
                }
            }
        }
    });

    // Clean up tensors
    tf.dispose([X, y]);
    
    // Save coverage map in metadata
    const metadata = {
        packages,
        games,
        maxPrice,
        coverage: Array.from(coverageMap.entries())
    };
    
    localStorage.setItem('package-predictor-metadata', JSON.stringify(metadata));

    return model;
}

export async function loadModel(): Promise<tf.LayersModel | null> {
    try {
        return await tf.loadLayersModel('indexeddb://package-predictor');
    } catch (error) {
        console.error('Failed to load model:', error);
        return null;
    }
}

// Store metadata needed for predictions
export async function saveModelMetadata(data: mergedData[]) {
    const metadata = {
        packages: Array.from(new Set(data.map(item => item.streaming_package_id))),
        games: Array.from(new Set(data.map(item => item.game_id)))
    };
    
    localStorage.setItem('package-predictor-metadata', JSON.stringify(metadata));
}

// Update getModelMetadata to include coverage info
export function getModelMetadata() {
    try {
        const metadata = localStorage.getItem('package-predictor-metadata');
        if (!metadata) return null;
        
        const parsed = JSON.parse(metadata);
        parsed.coverage = new Map(parsed.coverage);
        return parsed;
    } catch (error) {
        console.error('Failed to load model metadata:', error);
        return null;
    }
}