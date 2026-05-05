from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class BusType(str, Enum):
    SLACK = "SLACK"
    PV    = "PV"
    PQ    = "PQ"

class BusInput(BaseModel):
    id:           int
    name:         str
    type:         BusType
    V_pu:         float = 1.0
    theta_deg:    float = 0.0
    P_gen_MW:     float = 0.0
    Q_gen_MVAR:   float = 0.0
    P_load_MW:    float = 0.0
    Q_load_MVAR:  float = 0.0
    lat:          float = 0.0
    lon:          float = 0.0

class LineInput(BaseModel):
    id:           int
    from_bus:     int
    to_bus:       int
    R_pu:         float
    X_pu:         float
    B_pu:         float = 0.0
    capacity_MW:  float = 100.0

class NetworkCase(BaseModel):
    name:     str
    base_mva: float = 100.0
    buses:    List[BusInput]
    lines:    List[LineInput]

class ConvergenceRow(BaseModel):
    iter:         int
    max_error_pu: float

class BusResult(BaseModel):
    id:        int
    name:      str
    V_pu:      float
    theta_deg: float
    status:    str  # "normal" | "warning" | "critical"

class LineResult(BaseModel):
    id:          int
    from_bus:    int
    to_bus:      int
    P_from_MW:   float
    Q_from_MVAR: float
    loading_pct: float
    status:      str  # "normal" | "warning" | "overload"

class SolveResult(BaseModel):
    converged:          bool
    iterations:         int
    max_error_pu:       float
    solve_time_us:      float
    buses:              List[BusResult]
    lines:              List[LineResult]
    convergence_table:  List[ConvergenceRow]
