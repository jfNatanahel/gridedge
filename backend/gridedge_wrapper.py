import os
import json
import platform
import glob
import ctypes
from ctypes import CDLL, Structure, c_int, c_double, c_char, POINTER, byref

# Constants must match motor-c/src/network.h
MAX_BUSES = 50
MAX_LINES = 100
CONV_SIZE = 50


class Bus(Structure):
    _fields_ = [
        ("id", c_int),
        ("name", c_char * 64),
        ("type", c_int),
        ("V_pu", c_double),
        ("theta_rad", c_double),
        ("P_gen_pu", c_double),
        ("Q_gen_pu", c_double),
        ("P_load_pu", c_double),
        ("Q_load_pu", c_double),
        ("lat", c_double),
        ("lon", c_double),
    ]


class Line(Structure):
    _fields_ = [
        ("id", c_int),
        ("from_bus", c_int),
        ("to_bus", c_int),
        ("R_pu", c_double),
        ("X_pu", c_double),
        ("B_pu", c_double),
        ("capacity_pu", c_double),
        ("P_from_pu", c_double),
        ("Q_from_pu", c_double),
        ("P_to_pu", c_double),
        ("Q_to_pu", c_double),
        ("loading_pct", c_double),
    ]


class NetworkCase(Structure):
    _fields_ = [
        ("name", c_char * 128),
        ("base_mva", c_double),
        ("n_buses", c_int),
        ("n_lines", c_int),
        ("buses", Bus * MAX_BUSES),
        ("lines", Line * MAX_LINES),
    ]


class SolveResult(Structure):
    _fields_ = [
        ("converged", c_int),
        ("iterations", c_int),
        ("max_error_pu", c_double),
        ("solve_time_us", c_double),
        ("n_buses", c_int),
        ("V_pu", c_double * MAX_BUSES),
        ("theta_rad", c_double * MAX_BUSES),
        ("conv_iters", c_int * CONV_SIZE),
        ("conv_errors", c_double * CONV_SIZE),
    ]


def _default_lib_path():
    # default relative to backend/ -> ../motor-c/build/<platform-specific lib>
    here = os.path.dirname(__file__)
    build_dir = os.path.normpath(os.path.join(here, '..', 'motor-c', 'build'))
    system = platform.system()
    # common candidate names per platform
    if system == 'Windows':
        candidates = ['gridedge.dll', 'libgridedge.dll']
    elif system == 'Darwin':
        candidates = ['libgridedge.dylib', 'libgridedge.so']
    else:
        candidates = ['libgridedge.so', 'libgridedge.dylib']
    for name in candidates:
        p = os.path.join(build_dir, name)
        if os.path.exists(p):
            return p
    # fallback to first candidate (may not exist)
    return os.path.join(build_dir, candidates[0])


LIB_PATH = os.environ.get('MOTOR_LIB_PATH', _default_lib_path())
_lib = None


def load_lib(path: str = None):
    global _lib
    if _lib is not None:
        return _lib
    if path is None:
        path = LIB_PATH
    # if the provided path doesn't exist, try to auto-discover common names
    if not os.path.exists(path):
        build_dir = os.path.dirname(path)
        candidates = [
            os.path.join(build_dir, 'libgridedge.so'),
            os.path.join(build_dir, 'libgridedge.dylib'),
            os.path.join(build_dir, 'gridedge.dll'),
            os.path.join(build_dir, 'libgridedge.dll'),
        ]
        found = None
        for p in candidates:
            if os.path.exists(p):
                found = p
                break
        if found is None:
            # try a glob as last resort
            matches = glob.glob(os.path.join(build_dir, '*gridedge*'))
            if matches:
                found = matches[0]
        if found is None:
            raise OSError(f"libgridedge not found at {path}. Build motor-c first (make)")
        path = found

    # choose loader per-platform (Windows may want WinDLL)
    system = platform.system()
    if system == 'Windows' and hasattr(ctypes, 'WinDLL'):
        loader = ctypes.WinDLL
    else:
        loader = CDLL

    _lib = loader(path)
    _lib.gridedge_solve.argtypes = [POINTER(NetworkCase), POINTER(SolveResult), c_double, c_int]
    _lib.gridedge_solve.restype = c_int
    return _lib


def dict_to_networkcase(d: dict) -> NetworkCase:
    nc = NetworkCase()
    name = d.get('name', '')
    nb = name.encode('utf-8')[:127]
    nc.name = nb + b'\0' * (128 - len(nb))
    nc.base_mva = float(d.get('base_mva', 100.0))
    buses = d.get('buses', [])
    lines = d.get('lines', [])
    nc.n_buses = min(len(buses), MAX_BUSES)
    nc.n_lines = min(len(lines), MAX_LINES)

    for i, b in enumerate(buses[:MAX_BUSES]):
        bus = Bus()
        bus.id = int(b.get('id', i))
        nameb = str(b.get('name', '')).encode('utf-8')[:63]
        bus.name = nameb + b'\0' * (64 - len(nameb))
        t = b.get('type', 'PQ')
        if isinstance(t, int):
            bus.type = int(t)
        else:
            tt = str(t).upper()
            bus.type = 0 if tt == 'SLACK' else 1 if tt == 'PV' else 2
        bus.V_pu = float(b.get('V_pu', 1.0))
        bus.theta_rad = float(b.get('theta_rad', 0.0))
        bus.P_gen_pu = float(b.get('P_gen_pu', 0.0))
        bus.Q_gen_pu = float(b.get('Q_gen_pu', 0.0))
        bus.P_load_pu = float(b.get('P_load_pu', 0.0))
        bus.Q_load_pu = float(b.get('Q_load_pu', 0.0))
        bus.lat = float(b.get('lat', 0.0))
        bus.lon = float(b.get('lon', 0.0))
        nc.buses[i] = bus

    for i, l in enumerate(lines[:MAX_LINES]):
        line = Line()
        line.id = int(l.get('id', i))
        line.from_bus = int(l.get('from_bus', 0))
        line.to_bus = int(l.get('to_bus', 0))
        line.R_pu = float(l.get('R_pu', 0.0))
        line.X_pu = float(l.get('X_pu', 0.0))
        line.B_pu = float(l.get('B_pu', 0.0))
        line.capacity_pu = float(l.get('capacity_pu', 0.0))
        nc.lines[i] = line

    return nc


def solve_case(case: dict, tolerance: float = 1e-6, max_iter: int = 50, lib_path: str = None) -> dict:
    lib = load_lib(lib_path)
    nc = dict_to_networkcase(case)
    res = SolveResult()
    rc = lib.gridedge_solve(byref(nc), byref(res), c_double(tolerance), c_int(max_iter))
    # convert
    n_b = int(res.n_buses) if res.n_buses > 0 else int(nc.n_buses)
    result = {
        'rc': int(rc),
        'converged': bool(res.converged),
        'iterations': int(res.iterations),
        'max_error_pu': float(res.max_error_pu),
        'solve_time_us': float(res.solve_time_us),
        'n_buses': n_b,
        'V_pu': [float(res.V_pu[i]) for i in range(n_b)],
        'theta_rad': [float(res.theta_rad[i]) for i in range(n_b)],
        'conv_iters': [int(res.conv_iters[i]) for i in range(min(int(res.iterations), CONV_SIZE))],
        'conv_errors': [float(res.conv_errors[i]) for i in range(min(int(res.iterations), CONV_SIZE))],
    }
    return result


if __name__ == '__main__':
    # quick smoke test
    import sys
    path = os.path.join(os.path.dirname(__file__), '..', 'motor-c', 'cases', 'ieee9.json')
    with open(path) as f:
        case = json.load(f)
    print('Using lib:', LIB_PATH)
    print(solve_case(case))
