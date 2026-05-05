import ctypes, os
from app.config import MOTOR_LIB_PATH

_lib = None

def get_library():
    """Carga libgridedge.so una sola vez (singleton)."""
    global _lib
    if _lib is None:
        if not os.path.exists(MOTOR_LIB_PATH):
            raise RuntimeError(
                f"Motor C no encontrado en {MOTOR_LIB_PATH}. "
                f"Ejecutá 'make' en la carpeta motor-c/"
            )
        _lib = ctypes.CDLL(MOTOR_LIB_PATH)
        _define_signatures(_lib)
    return _lib

def _define_signatures(lib):
    """Define los tipos de argumentos y retorno de cada función C."""
    # TODO: HU-10 — completar cuando network.h esté definido
    # lib.gridedge_solve.argtypes = [...]
    # lib.gridedge_solve.restype  = ctypes.c_int
    pass
