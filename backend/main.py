import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from solver import solver_function
from typing import List

app = FastAPI()

origins = ["http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class SolveResponse(BaseModel):
    selected_packages: List[float]
    objective_value: float
    merged_data: List[dict]
    error: str

class SolveRequest(BaseModel):
    payment: str
    isLive: bool
    isHighlights: bool
    teams: List[str]
    comps: List[str]

class Data(BaseModel):
    bc_game: List[dict]
    bc_streaming_offer: List[dict]
    bc_streaming_package: List[dict]

@app.post("/solve", response_model=SolveResponse)
def solve(input_json: SolveRequest):
    result = solver_function(input_json.dict())
    return result

@app.get("/getData", response_model=Data)
def get_data():
    bc_game = pd.read_csv('./data/bc_game.csv').to_dict(orient='records')
    bc_streaming_offer = pd.read_csv('./data/bc_streaming_offer.csv').to_dict(orient='records')
    bc_streaming_package = pd.read_csv('./data/bc_streaming_package.csv').to_dict(orient='records')
    return {
        'bc_game': bc_game,
        'bc_streaming_offer': bc_streaming_offer,
        'bc_streaming_package': bc_streaming_package
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4000)