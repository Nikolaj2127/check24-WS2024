import pandas as pd
from pulp import LpProblem, LpMinimize, LpVariable, lpSum
import matplotlib.pyplot as plt

# Load the CSV data
bc_game = pd.read_csv('../public/data/bc_game.csv')
bc_streaming_offer = pd.read_csv('../public/data/bc_streaming_offer.csv')
bc_streaming_package = pd.read_csv('../public/data/bc_streaming_package.csv')

# Rename 'id' column to 'game_id' in bc_game
bc_game.rename(columns={'id': 'game_id'}, inplace=True)

# Add 'month' column to bc_game based on 'date' column
bc_game['month'] = pd.to_datetime(bc_game['date']).dt.month

# Merge datasets
merged_data = pd.merge(bc_game, bc_streaming_offer, on='game_id')
merged_data = pd.merge(merged_data, bc_streaming_package, left_on='streaming_package_id', right_on='id')

# Filter for specific teams
teams = ['Bayern München']
merged_data = merged_data[merged_data['team_home'].isin(teams) | merged_data['team_away'].isin(teams)]

# Filter for live games only
merged_data = merged_data[merged_data['live'] == 1]

def solve_optimization(merged_data, price_column):
    # Optimization: Select the best combination of packages to cover all games
    packages = merged_data['streaming_package_id'].unique()
    games = merged_data['game_id'].unique()

    # Define the problem
    prob = LpProblem("MinimizeCost", LpMinimize)

    # Define variables
    package_vars = LpVariable.dicts("Package", packages, 0, 1, cat='Binary')

    # Objective function: Minimize the total cost
    prob += lpSum([merged_data[merged_data['streaming_package_id'] == pkg][price_column].iloc[0] * package_vars[pkg] for pkg in packages])

    # Constraints: Each game must be covered by at least one package
    for game in games:
        prob += lpSum([package_vars[pkg] for pkg in packages if game in merged_data[merged_data['streaming_package_id'] == pkg]['game_id'].values]) >= 1

    # Solve the problem
    prob.solve()

    # Get the chosen packages and total cost
    chosen_packages = [pkg for pkg in packages if package_vars[pkg].varValue == 1]
    total_cost = sum([merged_data[merged_data['streaming_package_id'] == pkg][price_column].iloc[0] for pkg in chosen_packages])

    return chosen_packages, total_cost

# Solve for the lowest monthly price
merged_data_monthly = merged_data.dropna(subset=['monthly_price_cents'])
chosen_packages_monthly, total_cost_monthly = solve_optimization(merged_data_monthly, 'monthly_price_cents')
print('Chosen Packages for Lowest Monthly Price:', chosen_packages_monthly)
print('Total Monthly Cost:', total_cost_monthly)

# Solve for the lowest yearly price without filtering out packages not available for monthly payment
chosen_packages_yearly, total_cost_yearly = solve_optimization(merged_data, 'monthly_price_yearly_subscription_in_cents')
print('Chosen Packages for Lowest Yearly Price:', chosen_packages_yearly)
print('Total Yearly Cost:', total_cost_yearly)

# Combine monthly and yearly options
all_chosen_packages = set(chosen_packages_monthly + chosen_packages_yearly)
monthly_costs = []
monthly_chosen_packages = []

for month in range(1, 13):
    month_data = merged_data[merged_data['game_id'].isin(bc_game[bc_game['month'] == month]['game_id'])]
    chosen_packages, total_cost = solve_optimization(month_data, 'monthly_price_cents')
    monthly_costs.append((month, total_cost))
    monthly_chosen_packages.append((month, chosen_packages))

# Convert Period objects to strings for plotting
months, costs = zip(*monthly_costs)
months = [str(month) for month in months]

# Plot the monthly costs
plt.figure(figsize=(10, 5))
plt.plot(months, costs, marker='o', linestyle='-', color='b', label='Monthly Cost')
plt.xlabel('Month')
plt.ylabel('Cost (Cents)')
plt.title('Monthly Costs')
plt.grid(True)

# Annotate the plot with chosen packages
for i, (month, chosen_packages) in enumerate(monthly_chosen_packages):
    plt.annotate(', '.join(map(str, chosen_packages)), (months[i], costs[i]), textcoords="offset points", xytext=(0,10), ha='center')

# Add legend with package prices and total cost
package_prices = {pkg_id: merged_data[merged_data['streaming_package_id'] == pkg_id]['monthly_price_cents'].iloc[0] for pkg_id in all_chosen_packages}
legend_text = '\n'.join([f'Package {pkg_id}: {price} cents' for pkg_id, price in package_prices.items()])
legend_text += f'\nTotal Monthly Cost: {total_cost_monthly} cents'
plt.legend([legend_text], loc='upper left', bbox_to_anchor=(1, 1))

plt.show()

# Plot the cumulative cost over time
cumulative_costs = [sum(costs[:i+1]) for i in range(len(costs))]
plt.figure(figsize=(10, 5))
plt.plot(months, cumulative_costs, marker='o', linestyle='-', color='g', label='Cumulative Cost')
plt.xlabel('Month')
plt.ylabel('Cumulative Cost (Cents)')
plt.title('Cumulative Costs Over Time')
plt.grid(True)
plt.show()# Add legend with package prices and total cost
package_prices = {pkg_id: merged_data[merged_data['streaming_package_id'] == pkg_id]['monthly_price_cents'].iloc[0] for pkg_id in all_chosen_packages_monthly}
legend_text = '\n'.join([f'Package {pkg_id}: {price} cents' for pkg_id, price in package_prices.items()])
legend_text += f'\nTotal Monthly Cost: {total_cost_monthly} cents'
plt.legend([legend_text], loc='upper left', bbox_to_anchor=(1, 1))

plt.show()

# Plot the cumulative cost over time
cumulative_costs = [sum(costs[:i+1]) for i in range(len(costs))]
plt.figure(figsize=(10, 5))
plt.plot(months, cumulative_costs, marker='o', linestyle='-', color='g', label='Cumulative Cost')
plt.xlabel('Month')
plt.ylabel('Cumulative Cost (Cents)')
plt.title('Cumulative Costs Over Time')
plt.grid(True)
plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
plt.show()

print('Chosen Packages for Lowest Monthly Price:', all_chosen_packages_monthly)
print('Total Monthly Cost:', total_cost_monthly)

# Solve for the lowest yearly price without filtering out packages not available for monthly payment
chosen_packages_yearly, total_cost_yearly = solve_optimization(merged_data, 'monthly_price_yearly_subscription_in_cents')
print('Chosen Packages for Lowest Yearly Price:', chosen_packages_yearly)
print('Total Yearly Cost:', total_cost_yearly)