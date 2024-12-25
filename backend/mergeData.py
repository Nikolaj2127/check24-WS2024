import pandas as pd

def mergeData (bc_game, bc_streaming_offer, bc_streaming_package):
        # Rename 'id' column to 'game_id' in bc_game
    bc_game.rename(columns={'id': 'game_id'}, inplace=True)

    # Merge datasets
    merged_data = pd.merge(bc_game, bc_streaming_offer, on='game_id')
    merged_data = pd.merge(merged_data, bc_streaming_package, left_on='streaming_package_id', right_on='id')

    return merged_data