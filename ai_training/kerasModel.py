import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

# Make NumPy printouts easier to read.
np.set_printoptions(precision=3, suppress=True)

import tensorflow as tf

from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.layers import StringLookup

print(tf.__version__)

# Load the CSV data
bc_game = pd.read_csv('../public/data/bc_game.csv')
bc_streaming_offer = pd.read_csv('../public/data/bc_streaming_offer.csv')
bc_streaming_package = pd.read_csv('../public/data/bc_streaming_package.csv')

# Rename 'id' column to 'game_id' in bc_game
bc_game.rename(columns={'id': 'game_id'}, inplace=True)

# Merge datasets
merged_data = pd.merge(bc_game, bc_streaming_offer, on='game_id')
merged_data = pd.merge(merged_data, bc_streaming_package, left_on='streaming_package_id', right_on='id')

# Filter
merged_data = merged_data[merged_data['live'] == 1]
merged_data.drop('monthly_price_cents', inplace=True, axis=1)
merged_data.drop('name', inplace=True, axis=1)
merged_data.drop('starts_at', inplace=True, axis=1)
merged_data.drop('live', inplace=True, axis=1)
merged_data.drop('highlights', inplace=True, axis=1)
merged_data.drop('tournament_name', inplace=True, axis=1)
merged_data.drop('id', inplace=True, axis=1)

# Preprocess team_away and team_home columns using StringLookup
teams = pd.concat([merged_data['team_away'], merged_data['team_home']]).unique()
lookup_layer = StringLookup()
lookup_layer.adapt(teams)

merged_data['team_away'] = lookup_layer(merged_data['team_away'])
merged_data['team_home'] = lookup_layer(merged_data['team_home'])

dataset = merged_data.copy()
dataset.tail()

train_dataset = dataset.sample(frac=0.8, random_state=0)
test_dataset = dataset.drop(train_dataset.index)

sns.pairplot(train_dataset[['game_id', 'team_home', 'team_away', 'streaming_package_id', 'monthly_price_yearly_subscription_in_cents']], diag_kind='kde')

train_dataset.describe().transpose()

# Prepare features and labels
train_features = train_dataset.copy()
test_features = test_dataset.copy()

train_labels = train_features.pop('monthly_price_yearly_subscription_in_cents')
test_labels = test_features.pop('monthly_price_yearly_subscription_in_cents')

# Normalize the features
normalizer = layers.Normalization()
normalizer.adapt(np.array(train_features))

# Build the neural network model
model = keras.Sequential([
    normalizer,
    layers.Dense(64, activation='relu'),
    layers.Dense(64, activation='relu'),
    layers.Dense(1)
])

# Compile the model
model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
              loss='mean_absolute_error')

# Train the model
history = model.fit(
    train_features,
    train_labels,
    validation_split=0.2,
    epochs=100,
    verbose=0
)

# Evaluate the model
test_loss = model.evaluate(test_features, test_labels, verbose=0)
print('Test MAE:', test_loss)

# Make predictions
predictions = model.predict(test_features).flatten()

# Save the model
model.save('my_model.h5')