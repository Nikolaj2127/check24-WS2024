import pandas as pd
from pulp import LpProblem, LpMinimize, LpVariable, lpSum
import matplotlib.pyplot as plt

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
teams = ['Bayern München']
merged_data = merged_data[merged_data['team_home'].isin(teams) | merged_data['team_away'].isin(teams)]

# Filter for live games only
merged_data = merged_data[merged_data['live'] == 1]

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

    # Calculate total cost
    total_cost = sum(merged_data[merged_data['streaming_package_id'] == pkg][price_column].iloc[0] for pkg in final_packages)

    print("Chosen Packages:", final_packages)
    print("Removed Redundant Packages:", redundant_packages)

    return final_packages, total_cost

# Group games by month
merged_data['month'] = pd.to_datetime(merged_data['starts_at']).dt.to_period('M')
monthly_groups = merged_data.groupby('month')

total_cost_monthly = 0
all_chosen_packages_monthly = []
monthly_costs = []
monthly_chosen_packages = []

# Solve for each month separately
for month, group in monthly_groups:
    group = group.dropna(subset=['monthly_price_cents'])
    chosen_packages, cost = solve_optimization(group, 'monthly_price_cents')
    total_cost_monthly += cost
    all_chosen_packages_monthly.extend(chosen_packages)
    monthly_costs.append((month, cost))
    monthly_chosen_packages.append((month, chosen_packages))
    print(f'Chosen Packages for {month}:', chosen_packages)

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