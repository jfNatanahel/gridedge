from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class BusType(str, Enum):
    SLACK = "SLACK"
    PV = "PV"
    PQ = "PQ"

class BusSchema(BaseModel):
    id: int = Field(..., description="Identificador único del nodo")
    name: str = Field(..., description="Nombre de la subestación o planta")
    type: BusType = Field(..., description="Tipo de nodo para el solver")
    V_pu: float = Field(..., alias="V_pu", description="Magnitud del voltaje inicial en por unidad (pu)")
    theta_deg: float = Field(..., alias="theta_deg", description="Ángulo de fase inicial en grados decimales")
    P_gen_MW: float = Field(0.0, alias="P_gen_MW", description="Potencia activa generada en Megavatios")
    Q_gen_MVAR: float = Field(0.0, alias="Q_gen_MVAR", description="Potencia reactiva generada en Megavarios")
    P_load_MW: float = Field(0.0, alias="P_load_MW", description="Potencia activa consumida por la carga")
    Q_load_MVAR: float = Field(0.0, alias="Q_load_MVAR", description="Potencia reactiva consumida por la carga")
    lat: Optional[float] = Field(None, description="Latitud geográfica")
    lon: Optional[float] = Field(None, description="Longitud geográfica")

class LineSchema(BaseModel):
    id: int = Field(..., description="Identificador único de la línea")
    from_bus: int = Field(..., description="ID del nodo de origen")
    to_bus: int = Field(..., description="ID del nodo de destino")
    R_pu: float = Field(..., description="Resistencia serie de la línea en pu")
    X_pu: float = Field(..., description="Reactancia serie de la línea en pu")
    B_pu: float = Field(0.0, description="Susceptancia shunt total de la línea en pu")
    capacity_MW: float = Field(..., description="Límite térmico máximo de transferencia en MW")

class NetworkCase(BaseModel):
    name: str = Field(..., description="Nombre del caso de estudio")
    base_mva: float = Field(100.0, description="Potencia base del sistema para conversión a pu")
    buses: List[BusSchema] = Field(..., description="Lista de todos los nodos de la red")
    lines: List[LineSchema] = Field(..., description="Lista de todas las líneas de transmisión")

class BusResult(BaseModel):
    id: int
    name: str
    V_pu: float = Field(..., alias="V_pu")
    theta_deg: float = Field(..., alias="theta_deg")
    status: str  # "normal" | "warning" | "critical"

class LineResult(BaseModel):
    id: int
    from_bus: int
    to_bus: int
    P_from_MW: float = Field(0.0, alias="P_from_MW")
    Q_from_MVAR: float = Field(0.0, alias="Q_from_MVAR")
    loading_pct: float = Field(0.0, description="Carga porcentual respecto a su capacidad térmica")
    status: str  # "normal" | "warning" | "overload"

class ConvergenceRow(BaseModel):
    iter: int
    max_error_pu: float

class SolveResult(BaseModel):
    converged: bool = Field(..., description="Indica si el método en C llegó a la convergencia")
    iterations: int = Field(..., description="Iteraciones ejecutadas por el solver")
    max_error_pu: float = Field(..., description="Error máximo final del desbalance de potencia")
    solve_time_us: float = Field(..., description="Tiempo de cómputo neto del motor numérico en microsegundos")
    buses: List[BusResult]
    lines: List[LineResult]
    convergence_table: List[ConvergenceRow]
