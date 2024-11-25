import React, { useState } from 'react';
import { trainAndSaveModel } from '../components/neuralNetworkTraining';
import mergeData from '../../src/components/mergeData';

interface TrainingBatchInfo {
    epoch: number;
    gameId: string;
    coveredPackages: number[];
    price: number;
    loss: number;
    mse: number;
}

const NNTraining: React.FC = () => {
    const [isTraining, setIsTraining] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentBatch, setCurrentBatch] = useState<TrainingBatchInfo | null>(null);
    const [status, setStatus] = useState<string>('');
    
    const startTraining = async () => {
        const mergedData = await mergeData();
        setIsTraining(true);
        setStatus('Starting training...');
        
        try {
            await trainAndSaveModel(mergedData, 'monthly', {
                onEpochEnd: (epoch: number, logs: any) => {
                    const totalEpochs = 100;
                    setProgress((epoch + 1) / totalEpochs * 100);

                    // Update training information
                    if (logs.batchInfo) {
                        setCurrentBatch({
                            epoch: epoch + 1,
                            gameId: logs.batchInfo.gameId,
                            coveredPackages: logs.batchInfo.packages,
                            price: logs.batchInfo.price,
                            loss: logs.loss,
                            mse: logs.mse || 0
                        });
                    }

                    setStatus(`Training epoch ${epoch + 1}/${totalEpochs}`);
                }
            });

            setStatus('Training completed successfully!');
        } catch (error) {
            setStatus(`Error during training: ${error}`);
        } finally {
            setIsTraining(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Neural Network Training</h2>
            
            <button
                className={`px-4 py-2 rounded ${
                    isTraining 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
                onClick={startTraining}
                disabled={isTraining}
            >
                {isTraining ? 'Training...' : 'Start Training'}
            </button>

            {isTraining && (
                <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    
                    {currentBatch && (
                        <div className="mt-4 space-y-2 p-4 bg-gray-100 rounded">
                            <h3 className="font-semibold">Current Training Batch</h3>
                            <p>Epoch: {currentBatch.epoch}/100</p>
                            <p>Game ID: {currentBatch.gameId}</p>
                            <p>Covered Packages: {currentBatch.coveredPackages.join(', ')}</p>
                            <p>Price: {(currentBatch.price / 100).toFixed(2)} €</p>
                            <p>Loss: {currentBatch.loss.toFixed(4)}</p>
                            <p>Mean Squared Error: {currentBatch.mse.toFixed(4)}</p>
                        </div>
                    )}
                </div>
            )}

            <p className={`mt-4 ${
                status.includes('Error') 
                    ? 'text-red-500' 
                    : status.includes('completed') 
                        ? 'text-green-500' 
                        : 'text-gray-600'
            }`}>
                {status}
            </p>
        </div>
    );
};

export default NNTraining;