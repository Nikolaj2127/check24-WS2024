import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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


@app.post("/solve", response_model=SolveResponse)
def solve(input_json: SolveRequest):
    result = solver_function(input_json.dict())
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4000)