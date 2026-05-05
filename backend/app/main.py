import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import glob
import json
from pydantic import BaseModel
from typing import List, Optional

# Ensure backend directory is in path so we can import gridedge_wrapper
ROOT = os.path.abspath(os.path.dirname(__file__) + '/..')
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

from gridedge_wrapper import solve_case


class BusModel(BaseModel):
    id: int
    name: Optional[str] = ''
    type: Optional[str] = 'PQ'
    V_pu: Optional[float] = 1.0
    theta_rad: Optional[float] = 0.0
    P_gen_pu: Optional[float] = 0.0
    Q_gen_pu: Optional[float] = 0.0
    P_load_pu: Optional[float] = 0.0
    Q_load_pu: Optional[float] = 0.0
    lat: Optional[float] = 0.0
    lon: Optional[float] = 0.0


class LineModel(BaseModel):
    id: int
    from_bus: int
    to_bus: int
    R_pu: Optional[float] = 0.0
    X_pu: Optional[float] = 0.0
    B_pu: Optional[float] = 0.0
    capacity_pu: Optional[float] = 0.0


class CaseModel(BaseModel):
    name: Optional[str] = 'case'
    base_mva: Optional[float] = 100.0
    buses: List[BusModel] = []
    lines: List[LineModel] = []


app = FastAPI(title='GridEdge Backend')

# CORS: permitir peticiones desde el frontend de desarrollo
allowed_origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/')
def index():
    return {'service': 'GridEdge backend', 'status': 'ok'}


@app.post('/solve')
@app.post('/api/solve')
def solve(case: CaseModel, tolerance: float = 1e-6, max_iter: int = 50):
    case_dict = case.dict()
    res = solve_case(case_dict, tolerance=tolerance, max_iter=max_iter)
    return res


@app.get('/api/cases')
def list_cases():
    cases_dir = os.path.abspath(os.path.join(ROOT, '..', 'motor-c', 'cases'))
    if not os.path.isdir(cases_dir):
        return []
    entries = []
    for fp in sorted(glob.glob(os.path.join(cases_dir, '*.json'))):
        name = os.path.splitext(os.path.basename(fp))[0]
        desc = ''
        try:
            with open(fp, 'r') as fh:
                data = json.load(fh)
                desc = data.get('description', '')
        except Exception:
            desc = ''
        entries.append({'name': name, 'description': desc})
    return entries


@app.get('/api/case/{name}')
def get_case(name: str):
    case_file = os.path.abspath(os.path.join(ROOT, '..', 'motor-c', 'cases', f'{name}.json'))
    if not os.path.exists(case_file):
        raise HTTPException(status_code=404, detail='case not found')
    with open(case_file, 'r') as fh:
        return json.load(fh)
