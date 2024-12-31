from ortools.linear_solver import pywraplp

def solver_function(input_json, merged_data):

    # Get input data from JSON object
    subType = input_json['subType']
    isLive = input_json['isLive']
    isHighlights = input_json['isHighlights']
    teams = input_json['teams']
    tournaments = input_json['tournaments']
    dates = input_json['dates']

    # Filter merged_data based on the subsctiption type
    if subType == 'monthly':
        merged_data = merged_data.dropna(subset=['monthly_price_cents'])
    elif subType == 'yearly':
        print('payment: yearly')
    else:
        print('No payment selection') 

    # Filter for specific teams
    if teams:
        merged_data = merged_data[merged_data['team_home'].isin(teams) | merged_data['team_away'].isin(teams)]

    # Filter out specific tournaments
    if tournaments:
        merged_data = merged_data[merged_data['tournament_name'].isin(tournaments)]

    # Filter for live games and/or highlights
    isLiveAndHighlights = False

    if isLive and isHighlights:
        isLiveAndHighlights = True
    elif isLive and not isHighlights:
        merged_data = merged_data[merged_data['live'] == 1] # Drop all lines in merged_data that do not cover live
    elif isHighlights and not isLive:
        merged_data = merged_data[merged_data['highlights'] == 1] # Drop all lines in merged_data that do not cover highlights

    # Filter games within the date frame
    if dates:
        start_date = dates[0]
        end_date = dates[1]
        if start_date and end_date:
            merged_data = merged_data[(merged_data['starts_at'] >= start_date) & (merged_data['starts_at'] <= end_date)]

    # Give free packages the price of 1 cent because else the solver cant choose them
    merged_data_filtered = merged_data # The data name is changes as merged_data_filtered is used in the solver and merged_data is reurned to the frontend to keep the prices
    merged_data_filtered.loc[merged_data_filtered['monthly_price_cents'] == 0, 'monthly_price_cents'] = 1
    merged_data_filtered.loc[merged_data_filtered['monthly_price_yearly_subscription_in_cents'] == 0, 'monthly_price_yearly_subscription_in_cents'] = 1

    # Create the mip solver with the SCIP backend.
    solver = pywraplp.Solver.CreateSolver("SCIP")
    if not solver:
        return

    solver.EnableOutput()  # Enable detailed logging

    # Set infinity for cleaner code later
    infinity = solver.infinity()

    # Define the decision variables
    package_vars = {}
    for pkg_id in merged_data_filtered['streaming_package_id'].unique(): # Find each unique streaming package
        package_vars[pkg_id] = solver.IntVar(0, infinity, str(pkg_id)) # Create an array variables containing each package with the lower bound 0 and upper bound infinity

    print("Number of variables =", solver.NumVariables())

    # Define the constraints
    if isLiveAndHighlights:
        for game_id in merged_data_filtered['game_id'].unique(): # Get each unique game
            # Constraint for live coverage
            live_packages = merged_data_filtered[(merged_data_filtered['game_id'] == game_id) & (merged_data_filtered['live'] == 1)]['streaming_package_id'] # Get all packages that cover the game live
            live_ct = solver.Constraint(1, infinity, f'live_ct_{game_id}') # Create a set of constraints for the game
            for pkg_id in live_packages:
                live_ct.SetCoefficient(package_vars[pkg_id], 1) # Add each package (Variable) as coefficient with a weight of 1 (At least one package has to be chosen for that game)
        
            # Constraint for highlights coverage (works the same as the constraints for live coverage just with all packages that cover highlights)
            highlights_packages = merged_data_filtered[(merged_data_filtered['game_id'] == game_id) & (merged_data_filtered['highlights'] == 1)]['streaming_package_id']
            highlights_ct = solver.Constraint(1, infinity, f'highlights_ct_{game_id}')
            for pkg_id in highlights_packages:
                highlights_ct.SetCoefficient(package_vars[pkg_id], 1)
    else:
        # Constraints if live and hightlights are not regarded (already filtered) (works the same as the other constraints just no additional filtering for coverage)
        for game_id in merged_data_filtered['game_id'].unique():
            relevant_packages = merged_data_filtered[merged_data_filtered['game_id'] == game_id]['streaming_package_id']
            constraint = solver.Constraint(1, infinity, f'constraint_{game_id}')
            for pkg_id in relevant_packages:
                constraint.SetCoefficient(package_vars[pkg_id], 1)


    print("Number of constraints =", solver.NumConstraints())

    # Define the objective Function
    objective = solver.Objective()

    for pkg_id in package_vars:
        if subType == 'yearly':
            price = merged_data_filtered[merged_data_filtered['streaming_package_id'] == pkg_id]['monthly_price_yearly_subscription_in_cents'].iloc[0] # Get yearly price of the package
        elif subType == 'monthly':
            price = merged_data_filtered[merged_data_filtered['streaming_package_id'] == pkg_id]['monthly_price_cents'].iloc[0] # Get monthly price of the package
        objective.SetCoefficient(package_vars[pkg_id], int(price)) # Set the objective function to the sum of each package variable [0, 1] * package price

    objective.SetMinimization() # Set problem to Minimization problem

    print(f"Solving with {solver.SolverVersion()}")

    status = solver.Solve() # Run the solver

    computed_result = {}

    if status == pywraplp.Solver.OPTIMAL:
        print("Solution:")
        print("Objective value =", solver.Objective().Value())
        computed_result['objective_value'] = solver.Objective().Value() # Add the objective value to the computed_result object

        # Get the chosen packages
        selected_packages = []
        for pkg_id in package_vars:
            if package_vars[pkg_id].solution_value() == 1:
                selected_packages.append(int(pkg_id)) # Get the variables that have a value of 1 (package is in best combination)
        print(selected_packages)
        computed_result['selected_packages'] = selected_packages # Add the best combination of packages to the computed_result object
        
        merged_data_list = merged_data.to_dict(orient='records') # Convert merged_data to a list of dictionaries
        computed_result['merged_data'] = merged_data_list # Add the merged_data to the computed_result object
        
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