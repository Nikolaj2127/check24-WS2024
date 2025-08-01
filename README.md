# Check24 Project

The project is using a MIP Solver to find the best solution. It sends the data to the backend and filters it based on the criteria. In the solver, the variables and constraints are defined which are then used with the objective function to get the best package combination. The solver takes for all packages about 800 millisecondes.

## Installation
To install the project, follow these steps:

Clone the repository:
```sh
git clone https://github.com/yourusername/check24_project.git
```

# Frontend:

1. Navigate to the project directory:
```sh
cd check24_project
```
2. Install the dependencies:
```sh
npm install
```

# Backend:

1. Navigate to backend:
```sh
cd check24_project/backend
```
2. Install virtual python environment
```sh
python -m venv venv
```
3. Activate the virtual environment:
```sh
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
```
4. Install the required packages:
```sh
pip install -r requirements.txt
```

## Usage
To run the frontend, use the following command:
```sh
npm start
```
To run the backend, use the following command in the backend directory:
```sh
if virtual environment is not activated use
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
fist
```
```sh
python main.py
```


## Improvements

# General
1. Add more Images for all packages (and higher quality)
2. Add a comaprison with the month span function where when it is cheaper to buy monthly packages, a popup appears with the information
3. Add caching to save the latest games (Didnt have time for that)

# Algorithm
1. Fix the issue with Hihglights and Live games not being covered acurately (Something with the constraints is off but idk what)
2. Experiment with different solvers to gain a greater performance boost (consider payed ones: Gurobi, CPLEX) e.g COIN-OR, MIPCL (GLPK is too slow with large data, same with lp solve)

# Tournaments
1. Add Teams selection (like Tournament page)
2. Maybe allow multiple Tournaments/ Teams to be selected and structure the team selection like tabs

# Result
1. Specitfy timeframe in filtering
2. Fix bug where the site sometimes needs to be reloaded to show the price
3. Control the deselection of the filters through the checkboxes
4. Show 0 as total price when a free package is selected
