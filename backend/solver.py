from ortools.linear_solver import pywraplp
import pandas as pd
import sys
import json
import io

input_data = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8').read()

print("input Data: ", input_data)
input_json = json.loads(input_data)

print("input JSON: ", input_json)

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
teams = input_json['teams']
#teams = ['Bayern München','Borussia Dortmund','Schalke 04','Hamburger SV','SG Dynamo Dresden','1860 München','Real Madrid','Liverpool FC','Paris Saint-Germain','Juventus Turin','Galatasaray SK','Ajax Amsterdam','FC Porto','FK Austria Wien','Al-Nassr FC','Inter Miami CF']

payment = input_json['payment']

if payment == 'monthly':
    merged_data = merged_data.dropna(subset=['monthly_price_cents'])
elif payment == 'yearly':
    print('payment: yearly')
else:
    print('No payment selection') 

print(teams)
#teams = ['Bayern München', 'FC Barcelona']
merged_data = merged_data[merged_data['team_home'].isin(teams) | merged_data['team_away'].isin(teams)]

# Filter for live games only
merged_data = merged_data[merged_data['live'] == 1]

def main():
    # Create the mip solver with the CP-SAT backend.
    solver = pywraplp.Solver.CreateSolver("SAT")
    if not solver:
        return

    infinity = solver.infinity()
    # Define the decision variables
    package_vars = {}
    for pkg_id in merged_data['streaming_package_id'].unique():
        package_vars[pkg_id] = solver.IntVar(0, infinity, str(pkg_id))

    print("Number of variables =", solver.NumVariables())
    
    # Define the constraints (cover all selected games)
    for game_id in merged_data['game_id'].unique():
        relevant_packages = merged_data[merged_data['game_id'] == game_id]['streaming_package_id']
        solver.Add(solver.Sum([package_vars[pkg_id] for pkg_id in relevant_packages]) >= 1)
    
    print("Number of constraints =", solver.NumConstraints())

    # Objective Function
    if payment == 'yearly':
        solver.Minimize(solver.Sum([package_vars[pkg_id] * merged_data[merged_data['streaming_package_id'] == pkg_id]['monthly_price_yearly_subscription_in_cents'].iloc[0] for pkg_id in package_vars]))
    elif payment == 'monthly':
        solver.Minimize(solver.Sum([package_vars[pkg_id] * merged_data[merged_data['streaming_package_id'] == pkg_id]['monthly_price_cents'].iloc[0] for pkg_id in package_vars]))

    print(f"Solving with {solver.SolverVersion()}")
    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:
        print("Solution:")
        print("Objective value =", solver.Objective().Value())
        for pkg_id in package_vars:
            if package_vars[pkg_id].solution_value() == 1:
                print(pkg_id, package_vars[pkg_id].solution_value())
    else:
        print("The problem does not have an optimal solution.")

    print("\nAdvanced usage:")
    print(f"Problem solved in {solver.wall_time():d} milliseconds")
    print(f"Problem solved in {solver.iterations():d} iterations")
    print(f"Problem solved in {solver.nodes():d} branch-and-bound nodes")


if __name__ == "__main__":
    main()