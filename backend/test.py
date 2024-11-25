from ortools.linear_solver import pywraplp
import pandas as pd
import sys
import json
import io
import numpy as np
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import ttk
from collections import defaultdict


# Load the CSV data
bc_game = pd.read_csv('../public/data/bc_mock_game.csv')
bc_streaming_offer = pd.read_csv('../public/data/bc_mock_offer.csv')
bc_streaming_package = pd.read_csv('../public/data/bc_streaming_package.csv')

# Rename 'id' column to 'game_id' in bc_game
bc_game.rename(columns={'id': 'game_id'}, inplace=True)

# Merge datasets
merged_data = pd.merge(bc_game, bc_streaming_offer, on='game_id')
merged_data = pd.merge(merged_data, bc_streaming_package, left_on='streaming_package_id', right_on='id')

# Filter for specific teams
#teams = input_json['teams']
teams = ['Bayern München']
#teams = ['Bayern München','Borussia Dortmund','Schalke 04','Hamburger SV','SG Dynamo Dresden','1860 München','Real Madrid','Liverpool FC','Paris Saint-Germain','Juventus Turin','Galatasaray SK','Ajax Amsterdam','FC Porto','FK Austria Wien','Al-Nassr FC','Inter Miami CF']

#payment = input_json['payment']

# Filter for live games only
merged_data = merged_data[merged_data['live'] == 1]

merged_data = merged_data[merged_data['team_home'].isin(teams) | merged_data['team_away'].isin(teams)]

# Convert starts_at to datetime
merged_data['starts_at'] = pd.to_datetime(merged_data['starts_at'])

# Add month and year columns
merged_data['month'] = merged_data['starts_at'].dt.month
merged_data['year'] = merged_data['starts_at'].dt.year

merged_data_monthly = merged_data.dropna(subset=['monthly_price_cents'])

# Get all months in chronological order
all_months = sorted(merged_data[['year', 'month']].drop_duplicates().values.tolist())


def main():
    # Get unique packages and create game-package mapping
    packages = merged_data['streaming_package_id'].unique()
    yearly_only_packages = merged_data_monthly['streaming_package_id'].unique()

    print(yearly_only_packages)
    games_by_package = {}
    for package in packages:
        games_by_package[package] = merged_data[
            merged_data['streaming_package_id'] == package
        ]['game_id'].unique()

    # Create solver
    solver = pywraplp.Solver.CreateSolver('CBC')

    # Initialize monthly subscriptions
    monthly_subs = {
        (year, month): {
            package: solver.IntVar(0, 1, f'monthly_{year}_{month}_{package}')
            if package not in yearly_only_packages
            else solver.IntVar(0, 0, f'monthly_{year}_{month}_{package}')  # Force to 0
            for package in packages
        }
        for year, month in all_months
    }
    
    # Initialize yearly subscriptions - modified
    unique_years = set(year for year, _ in all_months)
    yearly_subs = {
        (year, 1): {
            package: solver.IntVar(0, 1, f'yearly_{year}_{package}')
            if year in unique_years else None
            for package in packages
        }
        for year in range(min(unique_years), max(unique_years) + 1)
    }

    # Add debug prints to check data
    print("Unique packages:", merged_data['streaming_package_id'].unique())
    print("Years range:", merged_data['year'].unique())
    print("Months range:", merged_data['month'].unique())

    # First, create a coverage map to track which packages are valid for each month
    coverage_map = {}
    for year, month in all_months:
        coverage_map[(year, month)] = set()
        for package in packages:
            monthly_data = merged_data[
                (merged_data['streaming_package_id'] == package) &
                (merged_data['year'] == year) &
                (merged_data['month'] == month)
            ]
            if len(monthly_data) > 0:
                coverage_map[(year, month)].add(package)

    # Modify the objective function to only consider valid packages
    objective = solver.Objective()
    for year, month in all_months:
        valid_packages = coverage_map[(year, month)]
        for package in valid_packages:  # Only iterate over valid packages
            monthly_data = merged_data[
                (merged_data['streaming_package_id'] == package) &
                (merged_data['year'] == year) &
                (merged_data['month'] == month)
            ]
            
            monthly_price = monthly_data['monthly_price_cents'].iloc[0]
            objective.SetCoefficient(monthly_subs[(year, month)][package], monthly_price)
            
            # Handle yearly subscriptions only for valid packages
            if month == 1 and yearly_subs[(year, month)][package] is not None:
                yearly_data = merged_data[
                    (merged_data['streaming_package_id'] == package) &
                    (merged_data['year'] == year)
                ]
                yearly_price = yearly_data['monthly_price_yearly_subscription_in_cents'].iloc[0]
                objective.SetCoefficient(yearly_subs[(year, month)][package], float(yearly_price))

    objective.SetMinimization()

    # Add yearly-only package constraints
    for year in unique_years:
        for package in yearly_only_packages:
            if (year, 1) in monthly_subs:  # Add safety check
                solver.Add(monthly_subs[(year, 1)][package] == 0)

    # Constraints for game coverage
    for year, month in all_months:
        required_games = merged_data[
            (merged_data['year'] == year) &
            (merged_data['month'] == month)
        ]['game_id'].unique()
        
        for game in required_games:
            valid_packages = merged_data[
                merged_data['game_id'] == game
            ]['streaming_package_id'].unique()
            
            constraint = solver.Constraint(1, 1)
            for package in valid_packages:
                constraint.SetCoefficient(monthly_subs[(year, month)][package], 1)
                # Add safety check for yearly subscriptions
                if (year, 1) in yearly_subs and yearly_subs[(year, 1)][package] is not None:
                    constraint.SetCoefficient(yearly_subs[(year, 1)][package], 1)

    # Solve
    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:
        solution = {
            'monthly_subscriptions': [],
            'yearly_subscriptions': [],
            'total_cost': solver.Objective().Value()
        }

        for year, month in all_months:
            for package in packages:
                if monthly_subs[(year, month)][package].solution_value() > 0.5:
                    solution['monthly_subscriptions'].append((year, month, int(package)))
                if month == 1 and yearly_subs[(year, month)][package] is not None:
                    if yearly_subs[(year, month)][package].solution_value() > 0.5:
                        solution['yearly_subscriptions'].append((year, int(package)))
            print(f"Solution: {solution}")
        
            display_subscription_plan(solution)

        return solution
    else:
        print("No optimal solution found.")
        return None
    
def display_subscription_plan(solution):
    # Create main window
    root = tk.Tk()
    root.title("Subscription Recommendations")
    root.geometry("600x400")

    # Create treeview for displaying data
    tree = ttk.Treeview(root)
    tree["columns"] = ("Year", "Month", "Package", "Type")
    tree.heading("Year", text="Year")
    tree.heading("Month", text="Month")
    tree.heading("Package", text="Package")
    tree.heading("Type", text="Subscription Type")

    # Format and insert data
    all_subs = []
    for year, month, package in solution['monthly_subscriptions']:
        all_subs.append((year, month, package, "Monthly"))
    
    for year, package in solution['yearly_subscriptions']:
        all_subs.append((year, 1, package, "Yearly"))

    # Sort by year and month
    all_subs.sort(key=lambda x: (x[0], x[1]))

    # Insert into treeview
    for i, (year, month, package, sub_type) in enumerate(all_subs):
        tree.insert("", i, values=(year, month, f"Package {package}", sub_type))

    # Add total cost at the bottom
    total_cost = solution['total_cost']
    cost_label = tk.Label(root, text=f"Total Cost: ${total_cost:.2f}")
    
    # Pack elements
    tree.pack(padx=10, pady=10, fill='both', expand=True)
    cost_label.pack(pady=5)
    
    root.mainloop()

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

if __name__ == "__main__":
    main()