import pandas as pd
import numpy as np
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.preprocessing import OneHotEncoder

# Load data
packages = pd.read_csv('/c:/VSCode/check24-WS2024/public/data/bc_streaming_package.csv')
offers = pd.read_csv('/c:/VSCode/check24-WS2024/public/data/bc_streaming_offer.csv')
games = pd.read_csv('/c:/VSCode/check24-WS2024/public/data/bc_game.csv')

# Preprocess data
# Merge datasets (example, adjust as needed)
data = pd.merge(packages, offers, on='common_column')
data = pd.merge(data, games, on='common_column')

# Handle missing values
data.fillna(method='ffill', inplace=True)

# Feature engineering
# Example: Create dummy features
data['feature1'] = data['column1'] + data['column2']
data['feature2'] = data['column3'] * data['column4']

# Encode categorical variables
encoder = OneHotEncoder()
categorical_features = encoder.fit_transform(data[['categorical_column']]).toarray()

# Combine encoded features with the rest of the data
data = data.drop(['categorical_column'], axis=1)
data = np.hstack((data.values, categorical_features))

# Split features and labels
X = data[:, :-1]  # Features
y = data[:, -1]   # Labels

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Define neural network model
model = tf.keras.models.Sequential([
    tf.keras.layers.Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    tf.keras.layers.Dense(32, activation='relu'),
    tf.keras.layers.Dense(1, activation='sigmoid')
])

# Compile model
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# Train model
model.fit(X_train, y_train, epochs=10, batch_size=32, validation_data=(X_test, y_test))

# Evaluate model
loss, accuracy = model.evaluate(X_test, y_test)
print(f'Test accuracy: {accuracy}')