from fastapi import APIRouter

router = APIRouter()

@router.get("/benchmark")
async def benchmark():
    """Compara velocidad del motor C vs implementación Python/NumPy."""
    # TODO: HU-13 y HU-14 — correr ambos solvers y medir tiempo
    return {
        "motor_c_ms":   0.847,
        "python_ms":    94.3,
        "speedup":      111.3,
        "case":         "ieee9",
        "iterations":   10,
        "note":         "Datos mock — implementar HU-13"
    }
