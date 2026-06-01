from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import CASES_PATH

from app.routers import cases, solve

import os

app = FastAPI(title="GridEdge Core API", 
              description="Motor predictivo de flujo de potencia AC",
              version="2.0.0")

# Configuración del middleware entre python y react
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],   
)

app.include_router(cases.router)
app.include_router(solve.router)

# Diagnóstico básico

@app.get("/api/health")
async def health_check():
    ''' Verificación del estado del servidor '''
    return {
        "status": "online",
        "engine": "FastAPI Core",
        "middleware_ready": True,
        "cases_directory_detected": os.path.exists(CASES_PATH)
    }