from fastapi import APIRouter, HTTPException
from app.config import CASES_PATH
from app.schemas.network import NetworkCase
from pydantic import BaseModel
from pathlib import Path
import json
import os

# Cambiamos el prefijo a vacío para poder manejar el singular y el plural de forma limpia
router = APIRouter(
    tags=["Casos de Red"]
)

# Creamos el molde rápido que espera TanStack para el selector de tarjetas
class CaseSummary(BaseModel):
    name: str
    description: str

@router.get("/api/cases", response_model=list[CaseSummary])
async def list_cases():
    """
    Lista los escenarios del disco y los adapta con el formato que espera el Frontend.
    """
    try:
        if not os.path.exists(CASES_PATH):
            return []
        
        files = [f.replace(".json", "") for f in os.listdir(CASES_PATH) if f.endswith(".json")]
        
        # En lugar de strings, devolvemos el objeto estructurado que pide TanStack
        summaries = []
        for case in sorted(files):
            summaries.append({
                "name": case,
                "description": f"Caso estándar {case.upper()} cargado desde el almacenamiento de hardware local."
            })
        return summaries
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al escanear los casos: {str(e)}")

# Cambiamos la ruta a /api/case/{case_name} (en singular) para cumplir el contrato del front
@router.get("/api/case/{case_name}")
async def get_case(case_name: str):
    # Construimos la ruta dinámica al archivo .json en tu disco
    file_path = Path(CASES_PATH) / f"{case_name}.json"
    
    if not file_path.exists():
        raise HTTPException(
            status_code=404, 
            detail=f"El escenario '{case_name}' no existe en el almacenamiento local."
        )
    
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            data = json.load(file)
            
        # Validamos los datos crudos contra tu Pydantic para asegurar consistencia eléctrica
        validated_case = NetworkCase(**data)
        
        # Mapeamos dinámicamente CUALQUIER red al formato de React Flow
        return {
            "name": validated_case.name,
            "description": getattr(validated_case, "description", f"Sistema Eléctrico {case_name.upper()} Activo"),
            "buses": [
                {
                    "id": b.id,
                    "name": b.name,
                    "type": b.type.title() if b.type else "Pq", # "SLACK" -> "Slack"
                    "voltage_pu": b.V_pu if b.V_pu is not None else 1.0,
                    "angle_deg": b.theta_deg if b.theta_deg is not None else 0.0,
                    # Si la potencia es positiva va a generación (p_mw), si es negativa va a carga
                    "p_mw": b.P_gen_MW if b.P_gen_MW > 0 else -b.P_load_MW,
                    "q_mvar": b.Q_gen_MVAR if b.Q_gen_MVAR > 0 else -b.Q_load_MVAR,
                    "lat": getattr(b, "lat", 0.0),
                    "lon": getattr(b, "lon", 0.0)
                } for b in validated_case.buses
            ],
            "lines": [
                {
                    "id": l.id,
                    "from": l.from_bus,
                    "to": l.to_bus,
                    "R_pu": l.R_pu,
                    "X_pu": l.X_pu,
                    "B_pu": l.B_pu,
                    "capacity_MW": l.capacity_MW
                } for l in validated_case.lines
            ]
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail=f"El archivo '{case_name}.json' está corrupto o mal formado.")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Error de validación eléctrica al procesar '{case_name}': {str(e)}")