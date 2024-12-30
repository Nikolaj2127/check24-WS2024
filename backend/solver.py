from ortools.linear_solver import pywraplp

def solver_function(input_json, merged_data):

    # Get input data
    payment = input_json['payment']
    isLive = input_json['isLive']
    isHighlights = input_json['isHighlights']
    teams = input_json['teams']
    comps = input_json['comps']
    dates = input_json['dates']
    print(payment)
    print(teams)
    print(comps)
    print(isLive)
    print(isHighlights)
    print(dates)

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

    isLiveAndHighlights = False

    # Filter for live games or highlights
    if isLive and isHighlights:
        isLiveAndHighlights = True
    elif isLive and not isHighlights:
        merged_data = merged_data[merged_data['live'] == 1]
    elif isHighlights and not isLive:
        merged_data = merged_data[merged_data['highlights'] == 1]
    else:
        merged_data = merged_data

    # Filter games within the date frame
    if dates:
        start_date = dates[0]
        end_date = dates[1]
        if start_date and end_date:
            merged_data = merged_data[(merged_data['starts_at'] >= start_date) & (merged_data['starts_at'] <= end_date)]

    # Give free packages a value of 1 cent because else the solver cant choose them
    merged_data_filtered = merged_data
    merged_data_filtered.loc[merged_data_filtered['monthly_price_cents'] == 0, 'monthly_price_cents'] = 1
    merged_data_filtered.loc[merged_data_filtered['monthly_price_yearly_subscription_in_cents'] == 0, 'monthly_price_yearly_subscription_in_cents'] = 1

    # Create the mip solver with the SCIP backend.
    solver = pywraplp.Solver.CreateSolver("SCIP")
    if not solver:
        return

    solver.EnableOutput()  # Enable detailed logging

    infinity = solver.infinity()
    # Define the decision variables
    package_vars = {}
    for pkg_id in merged_data_filtered['streaming_package_id'].unique():
        package_vars[pkg_id] = solver.IntVar(0, infinity, str(pkg_id))

    print("Number of variables =", solver.NumVariables())
    
    if not isLiveAndHighlights:
        # Define the constraints (cover all selected games)
        for game_id in merged_data_filtered['game_id'].unique():
            relevant_packages = merged_data_filtered[merged_data_filtered['game_id'] == game_id]['streaming_package_id']
            ct = solver.Constraint(1, infinity, f'ct_{game_id}')
            for pkg_id in relevant_packages:
                ct.SetCoefficient(package_vars[pkg_id], 1)
    else:
        for game_id in merged_data_filtered['game_id'].unique():
            # Constraint for live coverage
            live_packages = merged_data_filtered[(merged_data_filtered['game_id'] == game_id) & 
                                                (merged_data_filtered['live'] == 1)]['streaming_package_id']
            live_ct = solver.Constraint(1, infinity, f'live_ct_{game_id}')
            for pkg_id in live_packages:
                live_ct.SetCoefficient(package_vars[pkg_id], 1)
        
            # Constraint for highlights coverage
            highlights_packages = merged_data_filtered[(merged_data_filtered['game_id'] == game_id) & 
                                                    (merged_data_filtered['highlights'] == 1)]['streaming_package_id']
            highlights_ct = solver.Constraint(1, infinity, f'highlights_ct_{game_id}')
            for pkg_id in highlights_packages:
                highlights_ct.SetCoefficient(package_vars[pkg_id], 1)


    print("Number of constraints =", solver.NumConstraints())

    # Objective Function
    if payment == 'yearly':
        solver.Minimize(solver.Sum([package_vars[pkg_id] * merged_data_filtered[merged_data_filtered['streaming_package_id'] == pkg_id]['monthly_price_yearly_subscription_in_cents'].iloc[0] for pkg_id in package_vars]))
        
    elif payment == 'monthly':
        solver.Minimize(solver.Sum([package_vars[pkg_id] * merged_data_filtered[merged_data_filtered['streaming_package_id'] == pkg_id]['monthly_price_cents'].iloc[0] for pkg_id in package_vars]))

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
                selected_packages.append(int(pkg_id))
        print(selected_packages)
        computed_result['selected_packages'] = selected_packages
        
        # Convert merged_data to a list of dictionaries
        merged_data_list = merged_data.to_dict(orient='records')
        computed_result['merged_data'] = merged_data_list
        
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