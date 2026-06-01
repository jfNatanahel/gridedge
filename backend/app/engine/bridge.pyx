# cython: language_level=3
import numpy as np
cimport numpy as np
from libc.stdlib cimport malloc, free

# 1. Declaramos las estructuras y funciones de C usando ctypedef para mapear los alias nativos
cdef extern from "types.h":
    ctypedef struct BusC:
        int id
        int type
        double V_pu
        double theta_rad
        double P_gen
        double Q_gen
        double P_load
        double Q_load

    ctypedef struct LineC:
        int id
        int from_bus
        int to_bus
        double R_pu
        double X_pu
        double B_pu
        double capacity

cdef extern from "solver.c":
    void build_ybus(const BusC* buses, int num_buses, const LineC* lines, int num_lines, double* G, double* B)
    double calculate_mismatches(const BusC* buses, int num_buses, const double* G, const double* B, double* dP, double* dQ)
    void build_jacobian(const BusC* buses, int num_buses, const double* G, const double* B, double* J)
# 2. Función principal expuesta hacia FastAPI
def run_newton_raphson(case_data, double tolerance=1e-6, int max_iterations=20):
    """
    Ejecuta el bucle de Newton-Raphson acoplando C con las matrices de NumPy.
    """
    # --- TODAS LAS DECLARACIONES CDEF ARRIBA DE TODO ---
    cdef int num_buses = len(case_data.buses)
    cdef int num_lines = len(case_data.lines)
    cdef int size_j = 2 * num_buses
    cdef int iteration = 0
    cdef b_convertido = False
    cdef double error = 1.0
    
    # Declaramos las memory views antes de usarlas o de mezclar código Python
    cdef double[:] G_view
    cdef double[:] B_view
    cdef double[:] J_view
    cdef double[:] dP_view
    cdef double[:] dQ_view
    
    # Asignamos memoria dinámica en C para los vectores de estructuras
    cdef BusC* buses_c = <BusC*> malloc(num_buses * sizeof(BusC))
    cdef LineC* lines_c = <LineC*> malloc(num_lines * sizeof(LineC))
    
    try:
        # Mapeamos los datos del JSON (Pydantic) a las estructuras de C
        for i, bus in enumerate(case_data.buses):
            buses_c[i].id = bus.id
            buses_c[i].type = 0 if bus.type == "SLACK" else (1 if bus.type == "PV" else 2)
            buses_c[i].V_pu = bus.V_pu
            buses_c[i].theta_rad = np.radians(bus.theta_deg) 
            buses_c[i].P_gen = bus.P_gen_MW / case_data.base_mva
            buses_c[i].Q_gen = bus.Q_gen_MVAR / case_data.base_mva
            buses_c[i].P_load = bus.P_load_MW / case_data.base_mva
            buses_c[i].Q_load = bus.Q_load_MVAR / case_data.base_mva

        for i, line in enumerate(case_data.lines):
            lines_c[i].id = line.id
            lines_c[i].from_bus = line.from_bus
            lines_c[i].to_bus = line.to_bus
            lines_c[i].R_pu = line.R_pu
            lines_c[i].X_pu = line.X_pu
            lines_c[i].B_pu = line.B_pu
            lines_c[i].capacity = line.capacity_MW

        # Inicializamos matrices de NumPy para la Y-bus y el Jacobiano
        G_np = np.zeros(num_buses * num_buses, dtype=np.float64)
        B_np = np.zeros(num_buses * num_buses, dtype=np.float64)
        J_np = np.zeros(size_j * size_j, dtype=np.float64)
        
        # Vectores de residuos
        dP_np = np.zeros(num_buses, dtype=np.float64)
        dQ_np = np.zeros(num_buses, dtype=np.float64)

        # Asignamos las matrices de NumPy a las vistas de Cython previamente declaradas
        G_view = G_np
        B_view = B_np
        J_view = J_np
        dP_view = dP_np
        dQ_view = dQ_np

        # Construimos la Y-bus una sola vez (la topología no cambia en el bucle)
        build_ybus(buses_c, num_buses, lines_c, num_lines, &G_view[0], &B_view[0])

        convergence_history = []

        # --- BUCLE PRINCIPAL DE NEWTON-RAPHSON ---
        for iteration in range(1, max_iterations + 1):
            # Calculamos residuos en C
            error = calculate_mismatches(buses_c, num_buses, &G_view[0], &B_view[0], &dP_view[0], &dQ_view[0])
            convergence_history.append({"iter": iteration, "max_error_pu": error})

            # Si el error es menor que la tolerancia, ¡el sistema se estabilizó!
            if error < tolerance:
                b_convertido = True
                break

            # Construimos el Jacobiano en C
            build_jacobian(buses_c, num_buses, &G_view[0], &B_view[0], &J_view[0])

            # Reshapeamos el Jacobiano y los residuos a sus formas matriciales para NumPy
            J_mat = J_np.reshape((size_j, size_j))
            mismatches = np.concatenate([dP_np, dQ_np])

            # Resolvemos el sistema lineal empleando LAPACK (J * dx = mismatches)
            dx = np.linalg.solve(J_mat, mismatches)

            # Actualizamos las variables de los nodos (buses) con las correcciones calculadas
            for i in range(num_buses):
                if buses_c[i].type == 0: # El Slack no se toca
                    continue
                
                # Actualización de ángulos (primera mitad del vector dx)
                buses_c[i].theta_rad += dx[i]
                
                # Actualización de voltajes (segunda mitad del vector dx, solo para nodos PQ)
                if buses_c[i].type == 2:
                    buses_c[i].V_pu += dx[i + num_buses]

        # Devolvemos los resultados empaquetados listos para FastAPI
        final_buses = []
        for i in range(num_buses):
            final_buses.append({
                "id": buses_c[i].id,
                "V_pu": buses_c[i].V_pu,
                "theta_deg": np.degrees(buses_c[i].theta_rad)
            })

        return b_convertido, iteration, error, final_buses, convergence_history

    finally:
        # CRÍTICO: Liberamos la memoria de C para evitar fugas de memoria (Memory Leaks)
        free(buses_c)
        free(lines_c)