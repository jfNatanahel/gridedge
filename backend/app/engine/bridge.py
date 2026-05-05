from app.engine.loader import get_library
from app.engine import numpy_solver

def solve(case_dict: dict, tolerance: float = None, max_iter: int = None) -> dict:
    """Puente entre Python (FastAPI) y la librería C.

    Por el momento intenta cargar la librería C; si no está disponible
    delega a la implementación NumPy (pendiente) o lanza NotImplemented.
    """
    try:
        lib = get_library()
    except RuntimeError:
        # fallback a numpy_solver si está implementado
        try:
            return numpy_solver.solve_numpy(case_dict)
        except Exception:
            raise NotImplementedError("Bridge to C motor not implemented yet")

    # TODO: HU-10 / HU-11 — serializar case_dict a NetworkCase (ctypes)
    # y llamar a lib.gridedge_solve(...). Por ahora, no está implementado.
    raise NotImplementedError("Bridge to C motor not implemented yet")
