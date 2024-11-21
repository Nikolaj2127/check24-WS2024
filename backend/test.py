from ortools.linear_solver import pywraplp
import pandas as pd
import sys
import json
import io
import numpy as np
import matplotlib.pyplot as plt
import tkinter as tk
from tkinter import ttk


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
packages = merged_data['streaming_package_id'].unique()

def main():
    # Assuming merged_data is already defined and contains the necessary data
    merged_data['starts_at'] = pd.to_datetime(merged_data['starts_at'])
    merged_data['month'] = merged_data['starts_at'].dt.month
    merged_data['year'] = merged_data['starts_at'].dt.year

    # Filter for rows with non-null 'monthly_price_cents'
    merged_data_monthly = merged_data.dropna(subset=['monthly_price_cents'])

    # Create the solver using CBC
    solver = pywraplp.Solver.CreateSolver('CBC')
    if not solver:
        return

    # Enable solver output
    solver.EnableOutput()

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
                yearly_subs[(year, month)][package] = None

    # Objective function
    objective = solver.Objective()
    for (year, month), packages_vars in monthly_subs.items():
        for package, var in packages_vars.items():
            price = merged_data_monthly.loc[merged_data_monthly['streaming_package_id'] == package, 'monthly_price_cents']
            if not price.empty:
                price_value = price.iloc[0] * 12
                objective.SetCoefficient(var, float(price_value))
            else:
                print(f"No price found for package {package} in merged_data_monthly")

    for (year, month), packages_vars in yearly_subs.items():
        for package, var in packages_vars.items():
            if var is not None:
                price = merged_data.loc[merged_data['streaming_package_id'] == package, 'monthly_price_yearly_subscription_in_cents']
                if not price.empty:
                    price_value = price.iloc[0] * 12
                    objective.SetCoefficient(var, float(price_value))
                else:
                    print(f"No price found for package {package} in merged_data")
    objective.SetMinimization()

    # Add costs for monthly and yearly subscriptions
    for year, month in all_months:
        for package in packages:
            package_data = merged_data[merged_data['streaming_package_id'] == package]
            if not package_data.empty:
                package_data = package_data.iloc[0]
                
                # Monthly subscription cost
                monthly_price = package_data['monthly_price_cents']
                if pd.notna(monthly_price):
                    objective.SetCoefficient(monthly_subs[(year, month)][package], float(monthly_price))
                
                # Yearly subscription cost
                yearly_price = package_data['monthly_price_yearly_subscription_in_cents'] * 12
                if pd.notna(yearly_price) and yearly_subs[(year, month)][package] is not None:
                    objective.SetCoefficient(yearly_subs[(year, month)][package], float(yearly_price))

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
            constraint.SetCoefficient(monthly_subs[(year, month)][game_package], 1)
            
            # Add yearly subscription options (check previous 11 months)
            for y, m in get_previous_months(year, month, 11):
                if (y, m) in yearly_subs and yearly_subs[(y, m)][game_package] is not None:
                    constraint.SetCoefficient(yearly_subs[(y, m)][game_package], 1)

    # Solve
    status = solver.Solve()

    solution = None
    if status == pywraplp.Solver.OPTIMAL:
        print("Optimal solution found.")
        # Extract solution
        solution = {
            'monthly_subscriptions': [],
            'yearly_subscriptions': [],
            'total_cost': solver.Objective().Value()
        }
        
        for year, month in all_months:
            for package in packages:
                package_id = int(package)
                if monthly_subs[(year, month)][package].solution_value() > 0.5:
                    solution['monthly_subscriptions'].append((year, month, package_id))
                if yearly_subs[(year, month)][package] is not None and yearly_subs[(year, month)][package].solution_value() > 0.5:
                    solution['yearly_subscriptions'].append((year, month, package_id))
        print(f"Solution: {solution}")

        # Prepare data for plotting
        plot_data = []
        for year, month, package_id in solution['monthly_subscriptions']:
            cost_data = merged_data_monthly.loc[merged_data_monthly['streaming_package_id'] == package_id, 'monthly_price_cents']
            if not cost_data.empty:
                cost = cost_data.iloc[0]
                plot_data.append((f"{year}-{month}", cost, f"Monthly {package_id}"))

        for year, month, package_id in solution['yearly_subscriptions']:
            cost_data = merged_data.loc[merged_data['streaming_package_id'] == package_id, 'monthly_price_yearly_subscription_in_cents']
            if not cost_data.empty:
                cost = cost_data.iloc[0] * 12
                plot_data.append((f"{year}-{month}", cost, f"Yearly {package_id}"))

        # Convert to DataFrame for plotting
        plot_df = pd.DataFrame(plot_data, columns=['Time', 'Cost', 'Package'])

        # Plot the monthly costs
        plt.figure(figsize=(10, 5))
        for package in plot_df['Package'].unique():
            package_data = plot_df[plot_df['Package'] == package]
            plt.plot(package_data['Time'], package_data['Cost'], marker='o', label=package)

        plt.xlabel('Time')
        plt.ylabel('Cost (Cents)')
        plt.title('Monthly Costs')
        plt.grid(True)

        # Annotate the plot with chosen packages
        for i, row in plot_df.iterrows():
            plt.annotate(row['Package'], (row['Time'], row['Cost']), textcoords="offset points", xytext=(0,10), ha='center')

        plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

        # Plot the cumulative cost over time
        plot_df['Cumulative Cost'] = plot_df['Cost'].cumsum()
        plt.figure(figsize=(10, 5))
        plt.plot(plot_df['Time'], plot_df['Cumulative Cost'], marker='o', linestyle='-', color='g', label='Cumulative Cost')
        plt.xlabel('Time')
        plt.ylabel('Cumulative Cost (Cents)')
        plt.title('Cumulative Costs Over Time')
        plt.grid(True)
        plt.legend(loc='upper left', bbox_to_anchor=(1, 1))
        plt.xticks(rotation=45)
        plt.tight_layout()
        plt.show()

        # Create a window to display the list of each month and the corresponding packages
        root = tk.Tk()
        root.title("Monthly Packages")

        # Create a Treeview widget
        tree = ttk.Treeview(root, columns=('Month', 'Packages'), show='headings')
        tree.heading('Month', text='Month')
        tree.heading('Packages', text='Packages')

        # Insert data into the Treeview
        for time, group in plot_df.groupby('Time'):
            packagestree = ', '.join(group['Package'])
            tree.insert('', 'end', values=(time, packagestree))

        # Add the Treeview to the window
        tree.pack(fill=tk.BOTH, expand=True)

        # Run the application
        root.mainloop()


    else:
        print("No optimal solution found.")

    return solution

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