from ortools.linear_solver import pywraplp
import pandas as pd
import sys
import json
import io

""" input_data = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8').read()

print("input Data: ", input_data)
input_json = json.loads(input_data)

print("input JSON: ", input_json) """

def solver_function(input_json, bc_game, bc_streaming_offer, bc_streaming_package):

    # Get input data
    payment = input_json['payment']
    isLive = input_json['isLive']
    isHighlights = input_json['isHighlights']
    teams = input_json['teams']
    comps = input_json['comps']

    # Rename 'id' column to 'game_id' in bc_game
    bc_game.rename(columns={'id': 'game_id'}, inplace=True)

    # Merge datasets
    merged_data = pd.merge(bc_game, bc_streaming_offer, on='game_id')
    merged_data = pd.merge(merged_data, bc_streaming_package, left_on='streaming_package_id', right_on='id')



    if payment == 'monthly':
        merged_data = merged_data.dropna(subset=['monthly_price_cents'])
    elif payment == 'yearly':
        print('payment: yearly')
    else:
        print('No payment selection') 

    # Filter for specific teams
    if teams:
        merged_data = merged_data[merged_data['team_home'].isin(teams) | merged_data['team_away'].isin(teams)]

    # Filter out specific competitions
    if comps:
        merged_data = merged_data[merged_data['tournament_name'].isin(comps)]

    # Filter for live games or highlights
    if isLive and isHighlights:
        merged_data = merged_data[(merged_data['highlights'] == 1) & (merged_data['live'] == 1)]

    if isLive and not isHighlights:
        merged_data = merged_data[merged_data['live'] == 1]

    if isHighlights and not isLive:
        merged_data = merged_data[merged_data['highlights'] == 1]

    # Create the mip solver with the SCIP backend.
    solver = pywraplp.Solver.CreateSolver("SCIP")
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

    computed_result = {}

    if status == pywraplp.Solver.OPTIMAL:
        print("Solution:")
        print("Objective value =", solver.Objective().Value())
        computed_result['objective_value'] = solver.Objective().Value()
        selected_packages = []
        for pkg_id in package_vars:
            if package_vars[pkg_id].solution_value() == 1:
                print(pkg_id, package_vars[pkg_id].solution_value())
                selected_packages.append(int(pkg_id))
        computed_result['selected_packages'] = selected_packages
        
        # Convert merged_data to a list of dictionaries
        merged_data_list = merged_data.to_dict(orient='records')
        computed_result['merged_data'] = merged_data_list
        print('mergedData', merged_data_list)
        
        computed_result['error'] = ""
    else:
        print("The problem does not have an optimal solution.")
        computed_result['objective_value'] = None
        computed_result['selected_packages'] = []
        computed_result['merged_data'] = []
        computed_result['error'] = "The problem does not have an optimal solution."

    print("\nAdvanced usage:")
    print(f"Problem solved in {solver.wall_time():d} milliseconds")
    print(f"Problem solved in {solver.iterations():d} iterations")
    print(f"Problem solved in {solver.nodes():d} branch-and-bound nodes")

    return computed_result