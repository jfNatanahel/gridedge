from fastapi import APIRouter, HTTPException
from app.schemas.network import NetworkCase, SolveResult
from app.schemas.perturb import PerturbRequest

router = APIRouter()

@router.post("/solve", response_model=SolveResult)
async def solve(case: NetworkCase):
    """Resuelve el flujo de potencia AC para un caso de red dado."""
    # TODO: HU-11 — llamar a engine/bridge.py con ctypes
    # Por ahora devuelve datos mock para que el frontend pueda trabajar
    return _mock_result(case)

@router.post("/perturb", response_model=SolveResult)
async def perturb(req: PerturbRequest):
    """Aplica una perturbación y re-resuelve el flujo de potencia."""
    # TODO: HU-12 — aplicar perturbación y llamar al motor
    raise HTTPException(status_code=501, detail="Pendiente HU-12")

def _mock_result(case: NetworkCase) -> SolveResult:
    """Datos mock para desarrollo del frontend mientras el motor no está listo."""
    from app.schemas.network import BusResult, LineResult, ConvergenceRow
    buses = [
        BusResult(id=b.id, name=b.name, V_pu=1.02, theta_deg=0.0, status="normal")
        for b in case.buses
    ]
    lines = [
        LineResult(id=l.id, from_bus=l.from_bus, to_bus=l.to_bus,
                   P_from_MW=50.0, Q_from_MVAR=10.0,
                   loading_pct=40.0, status="normal")
        for l in case.lines
    ]
    return SolveResult(
        converged=True, iterations=4, max_error_pu=0.0000003,
        solve_time_us=847.0, buses=buses, lines=lines,
        convergence_table=[
            ConvergenceRow(iter=1, max_error_pu=0.452),
            ConvergenceRow(iter=2, max_error_pu=0.031),
            ConvergenceRow(iter=3, max_error_pu=0.000082),
            ConvergenceRow(iter=4, max_error_pu=0.0000003),
        ]
    )
