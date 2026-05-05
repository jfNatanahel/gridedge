from pydantic import BaseModel
from enum import Enum

class PerturbType(str, Enum):
    GENERATION_DROP = "generation_drop"
    LINE_TRIP       = "line_trip"
    LOAD_CHANGE     = "load_change"

class PerturbRequest(BaseModel):
    case_name:    str
    perturb_type: PerturbType
    target_id:    int    # id del bus o línea afectado
    factor:       float  # 0.0 a 1.0 (0 = apagado total, 1 = sin cambio)
