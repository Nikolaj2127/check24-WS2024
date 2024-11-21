from ortools.linear_solver import pywraplp
import pandas as pd
import sys
import json
import io

#input_data = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8').read()

#print("input Data: ", input_data)
#input_json = json.loads(input_data)

#print("input JSON: ", input_json)

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
#teams = input_json['teams']
teams = ['Bayern München', 'FC Barcelona']
#teams = ['Bayern München','Borussia Dortmund','Schalke 04','Hamburger SV','SG Dynamo Dresden','1860 München','Real Madrid','Liverpool FC','Paris Saint-Germain','Juventus Turin','Galatasaray SK','Ajax Amsterdam','FC Porto','FK Austria Wien','Al-Nassr FC','Inter Miami CF']

#payment = input_json['payment']
payment = ''

print(teams)

merged_data = merged_data[merged_data['team_home'].isin(teams) | merged_data['team_away'].isin(teams)]

# Filter for live games only
merged_data = merged_data[merged_data['live'] == 1]

def optimize_subscription_timing(merged_data):
    # Convert starts_at to datetime
    merged_data['starts_at'] = pd.to_datetime(merged_data['starts_at'])
    
    # Add month and year columns
    merged_data['month'] = merged_data['starts_at'].dt.month
    merged_data['year'] = merged_data['starts_at'].dt.year
    
    # Create solver
    solver = pywraplp.Solver.CreateSolver('SCIP')
    
    # Get all months in chronological order
    all_months = sorted(merged_data[['year', 'month']].drop_duplicates().values.tolist())
    packages = merged_data['streaming_package_id'].unique()
    
    # Create decision variables
    monthly_subs = {}
    yearly_subs = {}

    for year, month in all_months:
        monthly_subs[(year, month)] = {}
        yearly_subs[(year, month)] = {}
        for package in packages:
            # Monthly subscription variables
            monthly_subs[(year, month)][package] = solver.BoolVar(f'monthly_{year}_{month}_{package}')
            
            # Yearly subscription variables (create for all months but only set for the first month)
            if (year, month) == all_months[0]:
                yearly_subs[(year, month)][package] = solver.BoolVar(f'yearly_{year}_{month}_{package}')
            else:
                yearly_subs[(year, month)][package] = None  # Placeholder for other months
    
    # Objective: Minimize total cost
    objective = solver.Objective()
    
    # Add costs for monthly and yearly subscriptions
    for year, month in all_months:
        for package in packages:
            package_data = merged_data[merged_data['streaming_package_id'] == package].iloc[0]
            
            # Monthly subscription cost
            monthly_price = package_data['monthly_price_cents']
            if pd.notna(monthly_price):
                objective.SetCoefficient(monthly_subs[year][month][package], monthly_price)
            
            # Yearly subscription cost
            yearly_price = package_data['monthly_price_yearly_subscription_in_cents'] * 12
            if pd.notna(yearly_price) and yearly_subs[year][month][package] is not None:
                objective.SetCoefficient(yearly_subs[year][month][package], yearly_price)
    
    # Objective function
    objective = solver.Objective()
    for (year, month), packages_vars in monthly_subs.items():
        for package, var in packages_vars.items():
            price = merged_data.loc[merged_data['streaming_package_id'] == package, 'monthly_price_cents'].iloc[0]
            objective.SetCoefficient(var, price)

    for (year, month), packages_vars in yearly_subs.items():
        for package, var in packages_vars.items():
            price = merged_data.loc[merged_data['streaming_package_id'] == package, 'monthly_price_yearly_subscription_in_cents'].iloc[0] * 12
            objective.SetCoefficient(var, price)
    objective.SetMinimization()
    
    # Add constraints for game coverage
    for year, month in all_months:
        # Get games for this month
        month_games = merged_data[
            (merged_data['year'] == year) & 
            (merged_data['month'] == month)
        ]
        
        for _, game in month_games.iterrows():
            constraint = solver.Constraint(1, solver.infinity())
            
            # Game must be covered by either:
            # 1. A monthly subscription for this month
            # 2. A yearly subscription that started in the last 12 months
            game_package = game['streaming_package_id']
            
            # Add monthly subscription option
            constraint.SetCoefficient(monthly_subs[year][month][game_package], 1)
            
            # Add yearly subscription options (check previous 11 months)
            for y, m in get_previous_months(year, month, 11):
                if y in yearly_subs and m in yearly_subs[y]:
                    constraint.SetCoefficient(yearly_subs[y][m][game_package], 1)
    
    # Constraints: Each game must be covered
    for _, game in merged_data.iterrows():
        game_year = game['year']
        game_month = game['month']
        package = game['streaming_package_id']
        
        constraint = solver.Constraint(1, solver.infinity())
        
        # Monthly subscription covering the game
        if (game_year, game_month) in monthly_subs and package in monthly_subs[(game_year, game_month)]:
            constraint.SetCoefficient(monthly_subs[(game_year, game_month)][package], 1)
        
        # Yearly subscription covering the game (if active)
        for (start_year, start_month), packages_vars in yearly_subs.items():
            if package in packages_vars and packages_vars[package] is not None:
                # Check if the yearly subscription covers the game date
                start_date = pd.Timestamp(year=start_year, month=start_month, day=1)
                end_date = start_date + pd.DateOffset(years=1)
                game_date = pd.Timestamp(year=game_year, month=game_month, day=1)
                if start_date <= game_date < end_date:
                    constraint.SetCoefficient(yearly_subs[(start_year, start_month)][package], 1)
    
    # Solve
    status = solver.Solve()
    
    if status == pywraplp.Solver.OPTIMAL:
        # Extract solution
        solution = {
            'monthly_subscriptions': [],
            'yearly_subscriptions': [],
            'total_cost': solver.Objective().Value()
        }
        
        for year, month in all_months:
            for package in packages:
                if monthly_subs[year][month][package].solution_value() > 0.5:
                    solution['monthly_subscriptions'].append({
                        'package': package,
                        'year': year,
                        'month': month,
                    })
                if yearly_subs[year][month][package].solution_value() > 0.5:
                    solution['yearly_subscriptions'].append({
                        'package': package,
                        'year': year,
                        'month': month,
                    })
        
        return solution
    
    return None

def get_previous_months(year, month, count):
    """Helper function to get previous months"""
    months = []
    for i in range(count):
        month -= 1
        if month < 1:
            month = 12
            year -= 1
        months.append((year, month))
    return months

# Use the function
solution = optimize_subscription_timing(merged_data)

# Print results
if solution:
    print("\nOptimal Solution Found:")
    print("\nMonthly Subscriptions:")
    for sub in solution['monthly_subscriptions']:
        package_name = merged_data[merged_data['streaming_package_id'] == sub['package']]['name'].iloc[0]
        print(f"Package: {package_name} - Year: {sub['year']}, Month: {sub['month']}")
    
    print("\nYearly Subscriptions:")
    for sub in solution['yearly_subscriptions']:
        package_name = merged_data[merged_data['streaming_package_id'] == sub['package']]['name'].iloc[0]
        print(f"Package: {package_name} - Starting Year: {sub['year']}, Month: {sub['month']}")
    
    print(f"\nTotal Cost: {solution['total_cost']/100:.2f} €")