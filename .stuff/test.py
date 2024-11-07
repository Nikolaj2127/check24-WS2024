import pandas as pd
from pulp import LpProblem, LpMinimize, LpVariable, lpSum

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
teams = ['Bayern München', 'Borussia Dortmund', 'Hamburger SV', '1860 München', 'Real Madrid', 'Liverpool FC', 'Ajax Amsterdam', 'FC Porto']
merged_data = merged_data[merged_data['team_home'].isin(teams) | merged_data['team_away'].isin(teams)]

# Filter for live games only
merged_data = merged_data[merged_data['live'] == 1]

# Filter for Bayern München games with live == 1
bayern_games = merged_data[
    ((merged_data['team_home'] == 'Bayern München') | (merged_data['team_away'] == 'Bayern München')) &
    (merged_data['live'] == 1)
]

def solve_optimization(merged_data, price_column):
    # Optimization: Select the best combination of packages to cover all games
    problem = LpProblem("Minimize_Cost", LpMinimize)

    # Define the decision variables
    package_vars = {pkg_id: LpVariable(f'Package_{pkg_id}', cat='Binary') for pkg_id in merged_data['streaming_package_id'].unique()}

    # Define the objective function (minimize total cost)
    problem += lpSum([package_vars[pkg_id] * merged_data[merged_data['streaming_package_id'] == pkg_id][price_column].iloc[0] for pkg_id in package_vars])

    # Define the constraints (cover all selected games)
    for game_id in merged_data['game_id'].unique():
        relevant_packages = merged_data[merged_data['game_id'] == game_id]['streaming_package_id']
        problem += lpSum([package_vars[pkg_id] for pkg_id in relevant_packages]) >= 1

    # Solve the optimization problem
    problem.solve()

    # Extract chosen packages
    chosen_packages = [pkg_id for pkg_id in package_vars if package_vars[pkg_id].varValue == 1]

    # Check for redundant packages
    redundant_packages = []
    for pkg_id in chosen_packages:
        # Temporarily remove the package
        temp_chosen_packages = [p for p in chosen_packages if p != pkg_id]
        
        # Check if all games are still covered
        all_covered = True
        for game_id in merged_data['game_id'].unique():
            relevant_packages = merged_data[merged_data['game_id'] == game_id]['streaming_package_id']
            if not any(pkg in temp_chosen_packages for pkg in relevant_packages):
                all_covered = False
                break
        
        if all_covered:
            redundant_packages.append(pkg_id)

    # Remove redundant packages from chosen packages
    final_packages = [pkg for pkg in chosen_packages if pkg not in redundant_packages]

    # Convert package IDs to standard Python integers
    final_packages = [int(pkg) for pkg in final_packages]

    # Calculate total cost
    total_cost = sum(merged_data[merged_data['streaming_package_id'] == pkg][price_column].iloc[0] for pkg in final_packages)

    print("Chosen Packages:", final_packages)
    print("Removed Redundant Packages:", redundant_packages)

    return final_packages, total_cost

# Solve for the lowest monthly price
merged_data_monthly = merged_data.dropna(subset=['monthly_price_cents'])
chosen_packages_monthly, total_cost_monthly = solve_optimization(merged_data_monthly, 'monthly_price_cents')

# Solve for the lowest yearly price without filtering out packages not available for monthly payment
chosen_packages_yearly, total_cost_yearly = solve_optimization(merged_data, 'monthly_price_yearly_subscription_in_cents')

# Print Packages and Prices
print('Chosen Packages for Lowest Monthly Price:', chosen_packages_monthly)
print('Total Monthly Cost:', total_cost_monthly)
print('Chosen Packages for Lowest Yearly Price:', chosen_packages_yearly)
print('Total Yearly Cost:', total_cost_yearly)