import * as tf from '@tensorflow/tfjs';

async function loadModel() {
    const model = await tf.loadLayersModel('/models/my_tfjs_model/model.json');
    return model;
}

export async function predictOptimalPackages() {
    /* const model = await loadModel();
    // Use the model for predictions
    const predictions = model.predict(inputTensor);
    // Process predictions
    // ... */
}