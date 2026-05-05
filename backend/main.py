from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import solve, cases, benchmark

app = FastAPI(
    title="GridEdge API",
    description="Motor de análisis de flujo de potencia AC en tiempo real",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(solve.router,     prefix="/api", tags=["solve"])
app.include_router(cases.router,     prefix="/api", tags=["cases"])
app.include_router(benchmark.router, prefix="/api", tags=["benchmark"])


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.1.0"}
