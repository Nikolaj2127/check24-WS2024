import pandas as pd

def check_coverage(teams, packages):
    # Load the CSV data
    bc_game = pd.read_csv('../public/data/bc_game.csv')
    bc_streaming_offer = pd.read_csv('../public/data/bc_streaming_offer.csv')
    bc_streaming_package = pd.read_csv('../public/data/bc_streaming_package.csv')

    # Rename 'id' column to 'game_id' in bc_game
    bc_game.rename(columns={'id': 'game_id'}, inplace=True)

    # Merge datasets
    merged_data = pd.merge(bc_game, bc_streaming_offer, on='game_id')
    merged_data = pd.merge(merged_data, bc_streaming_package, left_on='streaming_package_id', right_on='id')

    # Filter for specific teams
    # Get all unique teams from the bc_game dataset
    all_teams = pd.concat([bc_game['team_home'], bc_game['team_away']]).unique()
    #merged_data = merged_data[merged_data['team_home'].isin(teams) | merged_data['team_away'].isin(teams)]

    # Filter for live games only
    # merged_data = merged_data[merged_data['live'] == 1]

    # Filter for specified streaming packages
    merged_data = merged_data[merged_data['name'].isin(packages)]

    # Check if all games are covered
    all_games = bc_game[bc_game['team_home'].isin(teams) | bc_game['team_away'].isin(teams)]
    all_games = pd.merge(all_games, bc_streaming_offer[bc_streaming_offer['live'] == 1], on='game_id')

    covered_games = merged_data['game_id'].unique()
    all_game_ids = all_games['game_id'].unique()

    uncovered_games = [game_id for game_id in all_game_ids if game_id not in covered_games]

    if not uncovered_games:
        print("All games played by the specified teams are covered by the specified packages.")
    else:
        print("The following games are not covered by the specified packages:")
        print(uncovered_games)

# Example usage
#teams = ['Bayern München','Borussia Dortmund','Schalke 04','Hamburger SV','SG Dynamo Dresden','1860 München','Real Madrid','Liverpool FC','Paris Saint-Germain','Juventus Turin','Galatasaray SK','Ajax Amsterdam','FC Porto','FK Austria Wien','Al-Nassr FC','Inter Miami CF']
teams = ['Bayern München', 'FC Barcelona']
#packages = ['MagentaTV - MegaSport', 'Sky - Sport', 'Digiturk - Fußball + Family', 'Apple - MLS Season Pass', 'Sportdigital - Premium', 'Amazon - Prime Video', 'SportWorld - Samsung Sport Paket']
#packages = ['MagentaTV - MegaSport', 'Sky - Sport', 'Digiturk - Fußball + Family', 'Apple - MLS Season Pass', 'RTL+ - Premium', 'Amazon - Prime Video', 'DAZN - Unlimited']
#packages = ['MagentaTV - MegaSport', 'Digiturk - Fußball + Family', 'Apple - MLS Season Pass', 'RTL+ - Premium', 'Amazon - Prime Video']
packages = ['MagentaTV - MegaSport']

# Call the function with all teams
check_coverage(teams, packages)