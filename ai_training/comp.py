import pandas as pd

# Load the CSV data
bc_game = pd.read_csv('../public/data/bc_game.csv')
bc_streaming_offer = pd.read_csv('../public/data/bc_streaming_offer.csv')
bc_streaming_package = pd.read_csv('../public/data/bc_streaming_package.csv')

# Rename 'id' column to 'game_id' in bc_game
bc_game.rename(columns={'id': 'game_id'}, inplace=True)

# Merge datasets
merged_data = pd.merge(bc_game, bc_streaming_offer, on='game_id')
merged_data = pd.merge(merged_data, bc_streaming_package, left_on='streaming_package_id', right_on='id')

# Filter for live games only
merged_data = merged_data[merged_data['live'] == 1]

# Filter for Sport1 - Free-TV and MagentaTV - MegaSport
sport1_free_tv_games = merged_data[merged_data['name'] == 'Sport1 - Free-TV']
magenta_tv_mega_sport_games = merged_data[merged_data['name'] == 'MagentaTV - MegaSport']

# Find the common game
common_game = pd.merge(sport1_free_tv_games, magenta_tv_mega_sport_games, on='game_id')

# Display the common game
print("Common Game covered by both Sport1 - Free-TV and MagentaTV - MegaSport:")
print(common_game[['game_id', 'team_home_x', 'team_away_x']])

# Find games covered by Sport1 - Free-TV but not by MagentaTV - MegaSport
unique_sport1_games = sport1_free_tv_games[~sport1_free_tv_games['game_id'].isin(magenta_tv_mega_sport_games['game_id'])]

# Display the unique games
print("\nGames covered by Sport1 - Free-TV but not by MagentaTV - MegaSport:")
print(unique_sport1_games[['game_id', 'team_home', 'team_away']])