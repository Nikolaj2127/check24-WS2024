import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from solver import solver_function
from mergeData import mergeData
from typing import List

app = FastAPI()

origins = ["http://localhost:3000"] # Define allowed orighins for CORS

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Parse the csv data
bc_game = pd.read_csv('./data/bc_game.csv')
bc_streaming_offer = pd.read_csv('./data/bc_streaming_offer.csv')
bc_streaming_package = pd.read_csv('./data/bc_streaming_package.csv')

# Merge the csv data
merged_data = mergeData(bc_game, bc_streaming_offer, bc_streaming_package)

class SolveResponse(BaseModel):
    selected_packages: List[float]
    objective_value: float | None
    merged_data: List[dict]
    error: str

class SolveRequest(BaseModel):
    subType: str
    isLive: bool
    isHighlights: bool
    teams: List[str]
    tournaments: List[str]
    dates: List[str]

class Data(BaseModel):
    bc_game: List[dict]
    bc_streaming_offer: List[dict]
    bc_streaming_package: List[dict]
    merged_data: List[dict]

# Accepts the filters and sends the best package combination, objective function, and filtered merged_data
@app.post("/solve", response_model=SolveResponse)
def solve(input_json: SolveRequest):
    result = solver_function(input_json.dict(), merged_data)
    return result

# Sends the csv data
@app.get("/getData", response_model=Data)
def get_data():
    return {
        'bc_game': bc_game.to_dict(orient='records'),
        'bc_streaming_offer': bc_streaming_offer.to_dict(orient='records'),
        'bc_streaming_package': bc_streaming_package.to_dict(orient='records'),
        'merged_data': merged_data.to_dict(orient='records')
    }

# Port and host
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4000)