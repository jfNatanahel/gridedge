from fastapi import APIRouter, HTTPException
from app.schemas.network import NetworkCase
from app.config import CASES_PATH
import json, os

router = APIRouter()

@router.get("/cases")
async def list_cases():
    """Lista los casos de red disponibles."""
    cases = []
    for f in os.listdir(CASES_PATH):
        if f.endswith(".json"):
            cases.append({"name": f.replace(".json", ""), "file": f})
    return {"cases": cases}

@router.get("/case/{name}", response_model=NetworkCase)
async def get_case(name: str):
    """Devuelve los datos de un caso de red por nombre."""
    filepath = os.path.join(CASES_PATH, f"{name}.json")
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail=f"Caso '{name}' no encontrado")
    with open(filepath) as f:
        return NetworkCase(**json.load(f))
