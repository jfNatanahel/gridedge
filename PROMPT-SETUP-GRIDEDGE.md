# PROMPT — Generá toda la estructura del proyecto GridEdge

## Contexto para la IA

Soy estudiante universitario en Salta, Argentina. Estoy desarrollando **GridEdge**, un motor de análisis de flujo de potencia AC en tiempo real para redes eléctricas. El proyecto tiene 3 partes:

1. **Motor numérico en C** — resuelve Newton-Raphson para flujo de potencia AC
2. **Backend en Python/FastAPI** — expone el motor como API REST
3. **Frontend en React + Vite** — visualización 2D interactiva de la red eléctrica

### Estado actual del repo

- Tengo una carpeta `frontend/` con React + Vite ya instalado (npm, node_modules, etc.)
- Tengo un `README.md` en la raíz
- Solo existe la rama `main`
- El repo está en GitHub

### Lo que necesito que hagas

Generá **toda la estructura de archivos y carpetas** del proyecto con el contenido base de cada archivo listo para que cada desarrollador pueda arrancar a codear sin configurar nada.

---

## Estructura exacta que tenés que crear

### 1. RAÍZ DEL REPO

**`.gitignore`** — con estas reglas exactas:
```
# Motor C (cypthon)
motor-c/build/
motor-c/*.o
motor-c/*.so
motor-c/*.dll

# Backend Python
backend/__pycache__/
backend/**/__pycache__/
backend/.venv/
backend/venv/
backend/.env

# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env.local

# General
.DS_Store
*.log
*.idea/
.vscode/
```

**`.env.example`** — variables de entorno de ejemplo:
```
# Backend
MOTOR_LIB_PATH=../motor-c/build/libgridedge.so
CASES_PATH=../motor-c/cases
PORT=8000

# Frontend (crear como frontend/.env.local)
VITE_API_URL=http://localhost:8000
```

---

### 2. CARPETA `motor-c/`

Creá esta estructura completa:

```
motor-c/
├── Makefile
├── README.md
├── src/
│   ├── gridedge.h
│   ├── gridedge.c
│   ├── network.h
│   ├── network.c
│   ├── parser.h
│   ├── parser.c
│   ├── ybus.h
│   ├── ybus.c
│   ├── jacobian.h
│   ├── jacobian.c
│   ├── solver.h
│   ├── solver.c
│   ├── newton.h
│   └── newton.c
├── tests/
│   ├── test_ybus.c
│   └── test_newton.c
├── cases/
│   ├── ieee9.json
│   └── salta.json
└── build/         ← carpeta vacía, solo un .gitkeep
```

**Contenido de cada archivo:**

**`Makefile`:**
```makefile
CC = gcc
CFLAGS = -Wall -Wextra -O2 -fPIC -std=c11
SRC_DIR = src
BUILD_DIR = build
SRCS = $(wildcard $(SRC_DIR)/*.c)
OBJS = $(patsubst $(SRC_DIR)/%.c, $(BUILD_DIR)/%.o, $(SRCS))
LIB = $(BUILD_DIR)/libgridedge.so

all: $(BUILD_DIR) $(LIB)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(LIB): $(OBJS)
	$(CC) -shared -o $@ $^

$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c
	$(CC) $(CFLAGS) -c $< -o $@

test: all
	$(CC) $(CFLAGS) tests/test_ybus.c $(OBJS) -o $(BUILD_DIR)/test_ybus -lm
	$(CC) $(CFLAGS) tests/test_newton.c $(OBJS) -o $(BUILD_DIR)/test_newton -lm
	./$(BUILD_DIR)/test_ybus
	./$(BUILD_DIR)/test_newton

clean:
	rm -rf $(BUILD_DIR)

.PHONY: all test clean
```

**`src/network.h`** — structs de datos de la red:
```c
#ifndef NETWORK_H
#define NETWORK_H

#define MAX_BUSES 50
#define MAX_LINES 100

typedef enum {
    BUS_SLACK = 0,
    BUS_PV    = 1,
    BUS_PQ    = 2
} BusType;

typedef struct {
    int    id;
    char   name[64];
    BusType type;
    double V_pu;        // voltaje magnitud (per unit)
    double theta_rad;   // ángulo en radianes
    double P_gen_pu;    // potencia activa generada (pu)
    double Q_gen_pu;    // potencia reactiva generada (pu)
    double P_load_pu;   // potencia activa cargada (pu)
    double Q_load_pu;   // potencia reactiva cargada (pu)
    double lat;         // latitud (para visualización)
    double lon;         // longitud (para visualización)
} Bus;

typedef struct {
    int    id;
    int    from_bus;
    int    to_bus;
    double R_pu;        // resistencia (pu)
    double X_pu;        // reactancia (pu)
    double B_pu;        // susceptancia shunt (pu)
    double capacity_pu; // capacidad térmica (pu)
    // resultados post-solución
    double P_from_pu;
    double Q_from_pu;
    double P_to_pu;
    double Q_to_pu;
    double loading_pct;
} Line;

typedef struct {
    char   name[128];
    double base_mva;
    int    n_buses;
    int    n_lines;
    Bus    buses[MAX_BUSES];
    Line   lines[MAX_LINES];
} NetworkCase;

typedef struct {
    int    converged;           // 1 si convergió, 0 si no
    int    iterations;          // iteraciones hasta converger
    double max_error_pu;        // error máximo final
    double solve_time_us;       // tiempo en microsegundos
    int    n_buses;
    double V_pu[MAX_BUSES];     // voltajes resultado
    double theta_rad[MAX_BUSES];// ángulos resultado
    // tabla de convergencia
    int    conv_iters[50];
    double conv_errors[50];
} SolveResult;

#endif // NETWORK_H
```

**`src/network.c`** — implementación básica (inicialización):
```c
#include "network.h"
#include <string.h>

void network_init(NetworkCase *nc) {
    memset(nc, 0, sizeof(NetworkCase));
    nc->base_mva = 100.0;
    nc->n_buses  = 0;
    nc->n_lines  = 0;
}

void result_init(SolveResult *r) {
    memset(r, 0, sizeof(SolveResult));
}
```

**`src/gridedge.h`** — API pública que llama Python:
```c
#ifndef GRIDEDGE_H
#define GRIDEDGE_H

#include "network.h"

// Función principal: resuelve el flujo de potencia
// Recibe el caso de red, devuelve el resultado
// Retorna 0 si OK, -1 si error
int gridedge_solve(const NetworkCase *nc, SolveResult *result, double tolerance, int max_iter);

// Aplica una perturbación al caso y re-resuelve
// perturb_type: 0=generation_drop, 1=line_trip, 2=load_change
int gridedge_perturb(NetworkCase *nc, SolveResult *result,
                     int perturb_type, int target_id, double factor,
                     double tolerance, int max_iter);

// Calcula flujos por línea post-convergencia
void gridedge_calc_line_flows(NetworkCase *nc, const SolveResult *result);

#endif // GRIDEDGE_H
```

**`src/gridedge.c`** — implementación esqueleto:
```c
#include "gridedge.h"
#include "ybus.h"
#include "newton.h"
#include <time.h>
#include <string.h>

int gridedge_solve(const NetworkCase *nc, SolveResult *result,
                   double tolerance, int max_iter) {
    result_init(result);
    result->n_buses = nc->n_buses;

    // TODO: implementar en HU-02 a HU-07
    // 1. Construir Y-bus
    // 2. Inicializar flat start
    // 3. Correr Newton-Raphson
    // 4. Calcular flujos por línea

    return -1; // stub
}

int gridedge_perturb(NetworkCase *nc, SolveResult *result,
                     int perturb_type, int target_id, double factor,
                     double tolerance, int max_iter) {
    // TODO: implementar en HU-12
    // Aplicar perturbación sobre nc y llamar a gridedge_solve
    return -1; // stub
}

void gridedge_calc_line_flows(NetworkCase *nc, const SolveResult *result) {
    // TODO: implementar en HU-08
}
```

**`src/ybus.h`** y **`src/ybus.c`** — esqueleto con firma:
```c
// ybus.h
#ifndef YBUS_H
#define YBUS_H
#include "network.h"
#define MAX_N 50
// Matriz Y-bus: G (parte real) y B (parte imaginaria)
typedef struct {
    double G[MAX_N][MAX_N]; // conductancia
    double B[MAX_N][MAX_N]; // susceptancia
    int n;
} YBus;
void ybus_build(const NetworkCase *nc, YBus *ybus);
#endif

// ybus.c
#include "ybus.h"
#include <string.h>
void ybus_build(const NetworkCase *nc, YBus *ybus) {
    memset(ybus, 0, sizeof(YBus));
    ybus->n = nc->n_buses;
    // TODO: HU-02 — llenar G y B a partir de nc->lines
    // Para cada línea ij:
    //   y_ij = 1 / (R + jX) = G_ij + jB_ij
    //   Y[i][i] += y_ij + jB_shunt/2
    //   Y[j][j] += y_ij + jB_shunt/2
    //   Y[i][j] -= y_ij
    //   Y[j][i] -= y_ij
}
```

**`src/jacobian.h`** y **`src/jacobian.c`** — 4 bloques:
```c
// jacobian.h
#ifndef JACOBIAN_H
#define JACOBIAN_H
#include "network.h"
#include "ybus.h"
// J tiene dimensión (2*(n-1)) x (2*(n-1))
// Bloques: dP/dTheta | dP/dV
//          dQ/dTheta | dQ/dV
void jacobian_build(const NetworkCase *nc, const YBus *ybus,
                    const double *V, const double *theta,
                    double J[2*MAX_N][2*MAX_N], int *dim);
#endif

// jacobian.c
#include "jacobian.h"
#include <math.h>
#include <string.h>
void jacobian_build(const NetworkCase *nc, const YBus *ybus,
                    const double *V, const double *theta,
                    double J[2*MAX_N][2*MAX_N], int *dim) {
    // TODO: HU-03
    // Referencia: Grainger & Stevenson Cap. 9, ecuaciones 9.20 a 9.27
    // dP_i/dTheta_j (i!=j) = V_i * V_j * (G_ij*sin(theta_ij) - B_ij*cos(theta_ij))
    // dP_i/dTheta_i        = -Q_i - B_ii * V_i^2
    // etc.
    *dim = 0; // stub
}
```

**`src/solver.h`** y **`src/solver.c`** — factorización LU:
```c
// solver.h
#ifndef SOLVER_H
#define SOLVER_H
#define MAX_DIM 100
// Resuelve A*x = b usando factorización LU con pivoteo parcial
// Retorna 0 si OK, -1 si matriz singular
int lu_solve(double A[MAX_DIM][MAX_DIM], double b[MAX_DIM],
             double x[MAX_DIM], int n);
#endif

// solver.c
#include "solver.h"
#include <math.h>
int lu_solve(double A[MAX_DIM][MAX_DIM], double b[MAX_DIM],
             double x[MAX_DIM], int n) {
    // TODO: HU-04 — implementar factorización LU con pivoteo parcial
    // Paso 1: factorizar A = L*U (in-place)
    // Paso 2: forward substitution L*y = b
    // Paso 3: backward substitution U*x = y
    return -1; // stub
}
```

**`src/newton.h`** y **`src/newton.c`** — bucle iterativo:
```c
// newton.h
#ifndef NEWTON_H
#define NEWTON_H
#include "network.h"
#include "ybus.h"
int newton_raphson(const NetworkCase *nc, const YBus *ybus,
                   double *V, double *theta,
                   double tolerance, int max_iter,
                   SolveResult *result);
#endif

// newton.c
#include "newton.h"
#include "jacobian.h"
#include "solver.h"
#include <math.h>
#include <stdio.h>
int newton_raphson(const NetworkCase *nc, const YBus *ybus,
                   double *V, double *theta,
                   double tolerance, int max_iter,
                   SolveResult *result) {
    // TODO: HU-05
    // for k = 0 to max_iter:
    //   1. calcular mismatch dP, dQ
    //   2. verificar convergencia: if max(|dP|,|dQ|) < tol -> OK
    //   3. construir jacobiana
    //   4. resolver J*[dTheta, dV/V] = [dP, dQ]
    //   5. actualizar theta += dTheta, V *= (1 + dV/V)
    //   6. guardar en result->conv_errors[k]
    return 0; // stub
}
```

**`src/parser.h`** y **`src/parser.c`** — lector de JSON:
```c
// parser.h
#ifndef PARSER_H
#define PARSER_H
#include "network.h"
// Lee un archivo JSON y llena el NetworkCase
// Retorna 0 si OK, -1 si error
// Requiere cJSON: https://github.com/DaveGamble/cJSON (1 archivo .c y .h)
int parser_load_case(const char *filepath, NetworkCase *nc);
#endif

// parser.c
#include "parser.h"
#include <stdio.h>
#include <string.h>
int parser_load_case(const char *filepath, NetworkCase *nc) {
    // TODO: HU-01
    // 1. Leer archivo JSON con fopen
    // 2. Parsear con cJSON (agregar cJSON.c y cJSON.h a src/)
    // 3. Llenar nc->buses y nc->lines
    // Descargar cJSON de: https://github.com/DaveGamble/cJSON/releases
    return -1; // stub
}
```

**`cases/ieee9.json`** — caso IEEE 9-bus estándar:
```json
{
  "name": "IEEE 9-Bus Test Case",
  "base_mva": 100,
  "buses": [
    {"id": 1, "name": "Bus 1", "type": "SLACK", "V_pu": 1.040, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -24.8, "lon": -65.4},
    {"id": 2, "name": "Bus 2", "type": "PV",    "V_pu": 1.025, "theta_deg": 0.0, "P_gen_MW": 163, "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -24.5, "lon": -65.0},
    {"id": 3, "name": "Bus 3", "type": "PV",    "V_pu": 1.025, "theta_deg": 0.0, "P_gen_MW": 85,  "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -25.2, "lon": -65.8},
    {"id": 4, "name": "Bus 4", "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -24.9, "lon": -65.2},
    {"id": 5, "name": "Bus 5", "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 125, "Q_load_MVAR": 50, "lat": -25.4, "lon": -65.1},
    {"id": 6, "name": "Bus 6", "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 90,  "Q_load_MVAR": 30, "lat": -25.1, "lon": -65.6},
    {"id": 7, "name": "Bus 7", "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -24.6, "lon": -65.3},
    {"id": 8, "name": "Bus 8", "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 100, "Q_load_MVAR": 35, "lat": -25.0, "lon": -65.5},
    {"id": 9, "name": "Bus 9", "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -24.7, "lon": -65.7}
  ],
  "lines": [
    {"id": 1, "from_bus": 1, "to_bus": 4, "R_pu": 0.0000, "X_pu": 0.0576, "B_pu": 0.0000, "capacity_MW": 250},
    {"id": 2, "from_bus": 4, "to_bus": 5, "R_pu": 0.0100, "X_pu": 0.0850, "B_pu": 0.0880, "capacity_MW": 250},
    {"id": 3, "from_bus": 5, "to_bus": 6, "R_pu": 0.0170, "X_pu": 0.0920, "B_pu": 0.0790, "capacity_MW": 150},
    {"id": 4, "from_bus": 3, "to_bus": 6, "R_pu": 0.0000, "X_pu": 0.0586, "B_pu": 0.0000, "capacity_MW": 300},
    {"id": 5, "from_bus": 6, "to_bus": 7, "R_pu": 0.0320, "X_pu": 0.1610, "B_pu": 0.1530, "capacity_MW": 150},
    {"id": 6, "from_bus": 7, "to_bus": 8, "R_pu": 0.0085, "X_pu": 0.0720, "B_pu": 0.0745, "capacity_MW": 250},
    {"id": 7, "from_bus": 8, "to_bus": 2, "R_pu": 0.0000, "X_pu": 0.0625, "B_pu": 0.0000, "capacity_MW": 250},
    {"id": 8, "from_bus": 8, "to_bus": 9, "R_pu": 0.0119, "X_pu": 0.1008, "B_pu": 0.1045, "capacity_MW": 150},
    {"id": 9, "from_bus": 9, "to_bus": 4, "R_pu": 0.0100, "X_pu": 0.0850, "B_pu": 0.0880, "capacity_MW": 250}
  ]
}
```

**`cases/salta.json`** — versión con nombres reales de Salta:
```json
{
  "name": "Red Eléctrica Salta Simplificada",
  "base_mva": 100,
  "buses": [
    {"id": 1, "name": "TermoAndes Güemes",      "type": "SLACK", "V_pu": 1.040, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -24.67, "lon": -65.05},
    {"id": 2, "name": "Cafayate Solar",          "type": "PV",    "V_pu": 1.025, "theta_deg": 0.0, "P_gen_MW": 80,  "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -26.07, "lon": -65.97},
    {"id": 3, "name": "Altiplano Solar",         "type": "PV",    "V_pu": 1.025, "theta_deg": 0.0, "P_gen_MW": 85,  "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -24.20, "lon": -66.33},
    {"id": 4, "name": "Cobos 500/132kV",         "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -24.78, "lon": -65.43},
    {"id": 5, "name": "Salta Capital",           "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 125, "Q_load_MVAR": 50, "lat": -24.79, "lon": -65.41},
    {"id": 6, "name": "Salta Este",              "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 90,  "Q_load_MVAR": 30, "lat": -24.82, "lon": -65.35},
    {"id": 7, "name": "Pampa Grande",            "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -25.13, "lon": -65.50},
    {"id": 8, "name": "Orán",                    "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 100, "Q_load_MVAR": 35, "lat": -23.13, "lon": -64.32},
    {"id": 9, "name": "Tartagal",                "type": "PQ",    "V_pu": 1.000, "theta_deg": 0.0, "P_gen_MW": 0,   "Q_gen_MVAR": 0,  "P_load_MW": 0,   "Q_load_MVAR": 0,  "lat": -22.52, "lon": -63.83}
  ],
  "lines": [
    {"id": 1, "from_bus": 1, "to_bus": 4, "R_pu": 0.0000, "X_pu": 0.0576, "B_pu": 0.0000, "capacity_MW": 250},
    {"id": 2, "from_bus": 4, "to_bus": 5, "R_pu": 0.0100, "X_pu": 0.0850, "B_pu": 0.0880, "capacity_MW": 250},
    {"id": 3, "from_bus": 5, "to_bus": 6, "R_pu": 0.0170, "X_pu": 0.0920, "B_pu": 0.0790, "capacity_MW": 150},
    {"id": 4, "from_bus": 3, "to_bus": 6, "R_pu": 0.0000, "X_pu": 0.0586, "B_pu": 0.0000, "capacity_MW": 300},
    {"id": 5, "from_bus": 6, "to_bus": 7, "R_pu": 0.0320, "X_pu": 0.1610, "B_pu": 0.1530, "capacity_MW": 150},
    {"id": 6, "from_bus": 7, "to_bus": 8, "R_pu": 0.0085, "X_pu": 0.0720, "B_pu": 0.0745, "capacity_MW": 250},
    {"id": 7, "from_bus": 8, "to_bus": 2, "R_pu": 0.0000, "X_pu": 0.0625, "B_pu": 0.0000, "capacity_MW": 250},
    {"id": 8, "from_bus": 8, "to_bus": 9, "R_pu": 0.0119, "X_pu": 0.1008, "B_pu": 0.1045, "capacity_MW": 150},
    {"id": 9, "from_bus": 9, "to_bus": 4, "R_pu": 0.0100, "X_pu": 0.0850, "B_pu": 0.0880, "capacity_MW": 250}
  ]
}
```

**`tests/test_ybus.c`** — test de la matriz Y-bus:
```c
#include <stdio.h>
#include <math.h>
#include "../src/network.h"
#include "../src/ybus.h"

int main() {
    printf("=== Test Y-bus IEEE 9-bus ===\n");
    // TODO: cargar ieee9.json y comparar Y-bus contra valores de referencia
    // Referencia: Grainger & Stevenson, Appendix A, Tabla A-1
    printf("PENDIENTE: implementar HU-02 primero\n");
    return 0;
}
```

**`tests/test_newton.c`** — test de Newton-Raphson:
```c
#include <stdio.h>
#include <math.h>
#include "../src/network.h"
#include "../src/gridedge.h"

int main() {
    printf("=== Test Newton-Raphson IEEE 9-bus ===\n");
    // Resultado esperado bus 1: V=1.040 pu, theta=0.0°
    // Resultado esperado bus 2: V=1.025 pu, theta≈9.28°
    // Resultado esperado bus 3: V=1.025 pu, theta≈4.66°
    printf("PENDIENTE: implementar HU-05 primero\n");
    return 0;
}
```

---

### 3. CARPETA `backend/`

```
backend/
├── requirements.txt
├── main.py
└── app/
    ├── __init__.py
    ├── config.py
    ├── routers/
    │   ├── __init__.py
    │   ├── solve.py
    │   ├── cases.py
    │   └── benchmark.py
    ├── schemas/
    │   ├── __init__.py
    │   ├── network.py
    │   └── perturb.py
    └── engine/
        ├── __init__.py
        ├── loader.py
        ├── bridge.py
        └── numpy_solver.py
```

**`requirements.txt`:**
```
fastapi==0.111.0
uvicorn[standard]==0.29.0
pydantic==2.7.1
python-dotenv==1.0.1
numpy==1.26.4
```

**`main.py`:**
```python
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
```

**`app/config.py`:**
```python
import os
from dotenv import load_dotenv

load_dotenv()

MOTOR_LIB_PATH = os.getenv("MOTOR_LIB_PATH", "../motor-c/build/libgridedge.so")
CASES_PATH     = os.getenv("CASES_PATH", "../motor-c/cases")
PORT           = int(os.getenv("PORT", 8000))
TOLERANCE      = float(os.getenv("TOLERANCE", 1e-6))
MAX_ITER       = int(os.getenv("MAX_ITER", 50))
```

**`app/schemas/network.py`** — modelos Pydantic:
```python
from pydantic import BaseModel
from typing import List, Optional
from enum import Enum

class BusType(str, Enum):
    SLACK = "SLACK"
    PV    = "PV"
    PQ    = "PQ"

class BusInput(BaseModel):
    id:           int
    name:         str
    type:         BusType
    V_pu:         float = 1.0
    theta_deg:    float = 0.0
    P_gen_MW:     float = 0.0
    Q_gen_MVAR:   float = 0.0
    P_load_MW:    float = 0.0
    Q_load_MVAR:  float = 0.0
    lat:          float = 0.0
    lon:          float = 0.0

class LineInput(BaseModel):
    id:           int
    from_bus:     int
    to_bus:       int
    R_pu:         float
    X_pu:         float
    B_pu:         float = 0.0
    capacity_MW:  float = 100.0

class NetworkCase(BaseModel):
    name:     str
    base_mva: float = 100.0
    buses:    List[BusInput]
    lines:    List[LineInput]

class ConvergenceRow(BaseModel):
    iter:         int
    max_error_pu: float

class BusResult(BaseModel):
    id:        int
    name:      str
    V_pu:      float
    theta_deg: float
    status:    str  # "normal" | "warning" | "critical"

class LineResult(BaseModel):
    id:          int
    from_bus:    int
    to_bus:      int
    P_from_MW:   float
    Q_from_MVAR: float
    loading_pct: float
    status:      str  # "normal" | "warning" | "overload"

class SolveResult(BaseModel):
    converged:          bool
    iterations:         int
    max_error_pu:       float
    solve_time_us:      float
    buses:              List[BusResult]
    lines:              List[LineResult]
    convergence_table:  List[ConvergenceRow]
```

**`app/schemas/perturb.py`:**
```python
from pydantic import BaseModel
from enum import Enum

class PerturbType(str, Enum):
    GENERATION_DROP = "generation_drop"
    LINE_TRIP       = "line_trip"
    LOAD_CHANGE     = "load_change"

class PerturbRequest(BaseModel):
    case_name:    str
    perturb_type: PerturbType
    target_id:    int    # id del bus o línea afectado
    factor:       float  # 0.0 a 1.0 (0 = apagado total, 1 = sin cambio)
```

**`app/routers/solve.py`:**
```python
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
```

**`app/routers/cases.py`:**
```python
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
```

**`app/routers/benchmark.py`:**
```python
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
```

**`app/engine/loader.py`:**
```python
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
```

**`app/engine/numpy_solver.py`:**
```python
import numpy as np

def solve_numpy(case_dict: dict) -> dict:
    """
    Implementación de Newton-Raphson en Python/NumPy puro.
    Usada únicamente para el benchmark comparativo.
    TODO: HU-14 — implementar
    """
    raise NotImplementedError("Pendiente HU-14")
```

---

### 4. CARPETA `frontend/src/`

> La carpeta frontend/ ya existe con Vite. Solo creá los archivos dentro de src/.

**`src/main.jsx`** — sin cambios si ya existe, sino:
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

**`src/App.jsx`** — router de pantallas con estado:
```jsx
import { useState } from 'react'
import CaseSelector from './pages/CaseSelector'
import Dashboard from './pages/Dashboard'

// GridEdge no usa react-router porque las "pantallas" son estados, no URLs
// screen: 'selector' | 'dashboard'

export default function App() {
  const [screen, setScreen] = useState('selector')
  const [loadedCase, setLoadedCase] = useState(null)

  const handleCaseLoaded = (networkCase) => {
    setLoadedCase(networkCase)
    setScreen('dashboard')
  }

  const handleBackToSelector = () => {
    setScreen('selector')
  }

  return (
    <div className="app">
      {screen === 'selector' && (
        <CaseSelector onCaseLoaded={handleCaseLoaded} />
      )}
      {screen === 'dashboard' && (
        <Dashboard
          networkCase={loadedCase}
          onBack={handleBackToSelector}
        />
      )}
    </div>
  )
}
```

**`src/store/useNetworkStore.js`** — estado global con Zustand:
```js
import { create } from 'zustand'

const useNetworkStore = create((set) => ({
  // Caso de red cargado
  networkCase: null,
  setNetworkCase: (nc) => set({ networkCase: nc }),

  // Resultado del último solve
  solveResult: null,
  setSolveResult: (result) => set({ solveResult: result }),

  // Estado del sistema derivado del solveResult
  // 'idle' | 'stable' | 'warning' | 'critical' | 'error'
  systemStatus: 'idle',
  setSystemStatus: (status) => set({ systemStatus: status }),

  // Nodo seleccionado (click en el mapa)
  selectedBusId: null,
  setSelectedBusId: (id) => set({ selectedBusId: id }),

  // Loading mientras la API responde
  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),

  // Acción: limpiar todo (reset)
  reset: () => set({
    solveResult: null,
    systemStatus: 'idle',
    selectedBusId: null,
    isLoading: false
  })
}))

export default useNetworkStore
```

**`src/services/api.js`** — configuración base de fetch:
```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Error de API')
  }
  return res.json()
}
```

**`src/services/solveService.js`:**
```js
import { apiFetch } from './api'

export const postSolve = (networkCase) =>
  apiFetch('/api/solve', { method: 'POST', body: JSON.stringify(networkCase) })

export const postPerturb = (req) =>
  apiFetch('/api/perturb', { method: 'POST', body: JSON.stringify(req) })
```

**`src/services/casesService.js`:**
```js
import { apiFetch } from './api'

export const getCases  = ()     => apiFetch('/api/cases')
export const getCase   = (name) => apiFetch(`/api/case/${name}`)
```

**`src/services/benchmarkService.js`:**
```js
import { apiFetch } from './api'

export const getBenchmark = () => apiFetch('/api/benchmark')
```

**`src/utils/voltageToColor.js`** — función pura sin React:
```js
/**
 * Convierte un voltaje en pu a un color de estado.
 * Normal:   0.95 - 1.05 pu → verde
 * Alerta:   0.90 - 0.95 pu → amarillo
 * Crítico:  < 0.90 pu      → rojo
 */
export function voltageToColor(v_pu) {
  if (v_pu === null || v_pu === undefined) return '#6B7280' // gris
  if (v_pu >= 0.95 && v_pu <= 1.05) return '#22C55E'       // verde
  if (v_pu >= 0.90 && v_pu < 0.95)  return '#EAB308'       // amarillo
  return '#EF4444'                                           // rojo
}

export function voltageToStatus(v_pu) {
  if (v_pu >= 0.95 && v_pu <= 1.05) return 'normal'
  if (v_pu >= 0.90 && v_pu < 0.95)  return 'warning'
  return 'critical'
}
```

**`src/utils/loadingToColor.js`:**
```js
/**
 * Convierte carga porcentual de una línea a color.
 * < 70%  → verde
 * 70-90% → naranja
 * > 90%  → rojo
 */
export function loadingToColor(pct) {
  if (pct < 70)  return '#22C55E'
  if (pct < 90)  return '#F97316'
  return '#EF4444'
}

export function loadingToStatus(pct) {
  if (pct < 70)  return 'normal'
  if (pct < 90)  return 'warning'
  return 'overload'
}
```

**`src/utils/formatters.js`:**
```js
export const fmtVoltage  = (v)    => v != null ? `${v.toFixed(3)} pu` : '—'
export const fmtAngle    = (deg)  => deg != null ? `${deg.toFixed(2)}°` : '—'
export const fmtPower    = (mw)   => mw != null ? `${mw.toFixed(1)} MW` : '—'
export const fmtTime     = (us)   => us != null ? `${us.toFixed(0)} µs` : '—'
export const fmtError    = (e)    => e != null ? e.toExponential(2) : '—'
export const fmtLoading  = (pct)  => pct != null ? `${pct.toFixed(1)}%` : '—'
```

**`src/styles/index.css`** — variables y reset:
```css
:root {
  /* Fondos */
  --bg-primary:   #0A0E1A;
  --bg-secondary: #111827;
  --bg-sidebar:   #0F172A;
  --bg-card:      #1E293B;

  /* Bordes */
  --border:       #1E293B;
  --border-light: #334155;

  /* Texto */
  --text-primary:   #F1F5F9;
  --text-secondary: #94A3B8;
  --text-muted:     #475569;

  /* Acento */
  --accent:       #3B82F6;
  --accent-glow:  rgba(59, 130, 246, 0.15);

  /* Estados */
  --green:  #22C55E;
  --yellow: #EAB308;
  --orange: #F97316;
  --red:    #EF4444;
  --gray:   #6B7280;

  /* Tipografía */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Espaciado base */
  --sidebar-width-left:  280px;
  --sidebar-width-right: 300px;
  --topbar-height:       52px;
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.app { width: 100vw; height: 100vh; overflow: hidden; }
```

**`src/pages/CaseSelector/index.jsx`** — pantalla de selección:
```jsx
import { useEffect, useState } from 'react'
import { getCases, getCase } from '../../services/casesService'
import { postSolve } from '../../services/solveService'
import useNetworkStore from '../../store/useNetworkStore'

export default function CaseSelector({ onCaseLoaded }) {
  const [cases, setCases]     = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const { setSolveResult, setNetworkCase } = useNetworkStore()

  useEffect(() => {
    getCases()
      .then(data => setCases(data.cases))
      .catch(() => setError('No se pudo conectar con el backend'))
  }, [])

  const handleLoad = async (caseName) => {
    setLoading(true)
    setError(null)
    try {
      const nc     = await getCase(caseName)
      const result = await postSolve(nc)
      setNetworkCase(nc)
      setSolveResult(result)
      onCaseLoaded(nc)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ /* TODO: aplicar diseño Figma */ padding: '2rem' }}>
      <h1>GridEdge — Seleccioná una red</h1>
      {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
      {loading && <p>Cargando y resolviendo...</p>}
      {cases.map(c => (
        <button key={c.name} onClick={() => handleLoad(c.name)}>
          {c.name}
        </button>
      ))}
    </div>
  )
}
```

**`src/pages/Dashboard/index.jsx`** — pantalla principal (esqueleto):
```jsx
import TopBar       from './TopBar'
import SidebarLeft  from './SidebarLeft'
import SidebarRight from './SidebarRight'
import NetworkMap2D from '../../components/network/NetworkMap2D'
import useNetworkStore from '../../store/useNetworkStore'

export default function Dashboard({ networkCase, onBack }) {
  const { solveResult, systemStatus } = useNetworkStore()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar caseName={networkCase?.name} onBack={onBack} />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <SidebarLeft  networkCase={networkCase} />
        <main style={{ flex: 1 }}>
          <NetworkMap2D
            buses={networkCase?.buses || []}
            lines={networkCase?.lines || []}
            solveResult={solveResult}
          />
        </main>
        <SidebarRight solveResult={solveResult} />
      </div>
    </div>
  )
}
```

**`src/components/network/NetworkMap2D.jsx`** — el componente más importante:
```jsx
import { useState } from 'react'
import BusNode        from './BusNode'
import TransmissionLine from './TransmissionLine'
import NodeTooltip    from './NodeTooltip'
import useNetworkStore from '../../store/useNetworkStore'

// Coordenadas del canvas SVG (800x500)
// Los buses del JSON tienen lat/lon — convertimos a coordenadas SVG
function latLonToSVG(lat, lon) {
  // Bounding box de Salta: lat -22 a -27, lon -62 a -68
  const LAT_MIN = -27, LAT_MAX = -22
  const LON_MIN = -68, LON_MAX = -62
  const W = 800, H = 500
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W
  const y = ((lat - LAT_MAX) / (LAT_MIN - LAT_MAX)) * H
  return { x, y }
}

export default function NetworkMap2D({ buses, lines, solveResult }) {
  const { selectedBusId, setSelectedBusId } = useNetworkStore()

  // Mapear resultados a buses por id
  const busResults = {}
  solveResult?.buses?.forEach(b => { busResults[b.id] = b })

  const lineResults = {}
  solveResult?.lines?.forEach(l => { lineResults[l.id] = l })

  // Posiciones en SVG
  const positions = {}
  buses.forEach(b => { positions[b.id] = latLonToSVG(b.lat, b.lon) })

  const selectedBus = buses.find(b => b.id === selectedBusId)
  const selectedPos = selectedBus ? positions[selectedBus.id] : null

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        viewBox="0 0 800 500"
        style={{ width: '100%', height: '100%' }}
        onClick={() => setSelectedBusId(null)}
      >
        {/* Líneas de transmisión */}
        {lines.map(line => (
          <TransmissionLine
            key={line.id}
            line={line}
            fromPos={positions[line.from_bus]}
            toPos={positions[line.to_bus]}
            result={lineResults[line.id]}
          />
        ))}

        {/* Nodos */}
        {buses.map(bus => (
          <BusNode
            key={bus.id}
            bus={bus}
            pos={positions[bus.id]}
            result={busResults[bus.id]}
            isSelected={bus.id === selectedBusId}
            onClick={(e) => {
              e.stopPropagation()
              setSelectedBusId(bus.id === selectedBusId ? null : bus.id)
            }}
          />
        ))}
      </svg>

      {/* Tooltip fuera del SVG para poder usar HTML */}
      {selectedBus && selectedPos && (
        <NodeTooltip
          bus={selectedBus}
          result={busResults[selectedBus.id]}
          svgPos={selectedPos}
        />
      )}
    </div>
  )
}
```

**`src/components/network/BusNode.jsx`:**
```jsx
import { voltageToColor } from '../../utils/voltageToColor'

const BUS_ICONS = {
  SLACK: '⚡',  // generador de referencia
  PV:    '☀️',  // generador solar/renovable
  PQ:    '🏙️'   // carga / consumo
}

export default function BusNode({ bus, pos, result, isSelected, onClick }) {
  if (!pos) return null
  const color  = voltageToColor(result?.V_pu)
  const radius = 14

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Halo de selección */}
      {isSelected && (
        <circle cx={pos.x} cy={pos.y} r={radius + 6}
          fill="none" stroke="#3B82F6" strokeWidth={2} opacity={0.6} />
      )}
      {/* Círculo principal */}
      <circle
        cx={pos.x} cy={pos.y} r={radius}
        fill={color} fillOpacity={0.15}
        stroke={color} strokeWidth={2}
      />
      {/* Ícono del tipo */}
      <text x={pos.x} y={pos.y + 1}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={12}>
        {BUS_ICONS[bus.type] || '●'}
      </text>
      {/* Nombre del nodo */}
      <text x={pos.x} y={pos.y + radius + 12}
        textAnchor="middle"
        fontSize={10} fill="#94A3B8">
        {bus.name}
      </text>
      {/* Voltaje */}
      {result && (
        <text x={pos.x} y={pos.y + radius + 22}
          textAnchor="middle"
          fontSize={9} fill={color}>
          {result.V_pu.toFixed(3)} pu
        </text>
      )}
    </g>
  )
}
```

**`src/components/network/TransmissionLine.jsx`:**
```jsx
import { loadingToColor } from '../../utils/loadingToColor'

export default function TransmissionLine({ line, fromPos, toPos, result }) {
  if (!fromPos || !toPos) return null
  const color     = loadingToColor(result?.loading_pct || 0)
  const thickness = result ? Math.max(1.5, result.loading_pct / 25) : 1.5

  // Punto medio para la etiqueta
  const mx = (fromPos.x + toPos.x) / 2
  const my = (fromPos.y + toPos.y) / 2

  // Flecha de dirección (triángulo en el punto medio)
  const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x)
  const arrowSize = 6
  const ax = mx + Math.cos(angle) * arrowSize
  const ay = my + Math.sin(angle) * arrowSize

  return (
    <g>
      {/* Línea principal */}
      <line
        x1={fromPos.x} y1={fromPos.y}
        x2={toPos.x}   y2={toPos.y}
        stroke={color} strokeWidth={thickness}
        strokeOpacity={0.7}
      />
      {/* Flecha de dirección de flujo */}
      {result && result.P_from_MW > 0 && (
        <circle cx={ax} cy={ay} r={3} fill={color} />
      )}
      {/* Carga porcentual */}
      {result && (
        <text x={mx} y={my - 6}
          textAnchor="middle"
          fontSize={9} fill={color}>
          {result.loading_pct.toFixed(0)}%
        </text>
      )}
    </g>
  )
}
```

**`src/components/network/NodeTooltip.jsx`:**
```jsx
import { fmtVoltage, fmtAngle, fmtPower } from '../../utils/formatters'

export default function NodeTooltip({ bus, result, svgPos }) {
  // Posicionar el tooltip en HTML sobre el canvas SVG
  // svgPos está en coordenadas del viewBox (0-800, 0-500)
  // Necesitamos convertir a porcentajes del contenedor
  const leftPct = (svgPos.x / 800) * 100
  const topPct  = (svgPos.y / 500) * 100

  return (
    <div style={{
      position: 'absolute',
      left: `calc(${leftPct}% + 20px)`,
      top:  `calc(${topPct}% - 40px)`,
      background: '#1E293B',
      border: '1px solid #334155',
      borderRadius: 8,
      padding: '10px 14px',
      minWidth: 180,
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{bus.name}</p>
      <p style={{ fontSize: 12, color: '#94A3B8' }}>Tipo: {bus.type}</p>
      {result && <>
        <p style={{ fontSize: 12 }}>Voltaje: {fmtVoltage(result.V_pu)}</p>
        <p style={{ fontSize: 12 }}>Ángulo:  {fmtAngle(result.theta_deg)}</p>
        <p style={{ fontSize: 12 }}>P gen:   {fmtPower(bus.P_gen_MW)}</p>
        <p style={{ fontSize: 12 }}>P carga: {fmtPower(bus.P_load_MW)}</p>
      </>}
    </div>
  )
}
```

**`src/components/metrics/ConvergenceTable.jsx`:**
```jsx
import { fmtError, fmtTime } from '../../utils/formatters'

export default function ConvergenceTable({ convergenceTable = [] }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>
        Convergencia Newton-Raphson
      </p>
      <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ color: '#64748B' }}>
            <th style={{ textAlign: 'left', paddingBottom: 4 }}>Iter</th>
            <th style={{ textAlign: 'right' }}>Error (pu)</th>
          </tr>
        </thead>
        <tbody>
          {convergenceTable.map((row, i) => {
            const isLast = i === convergenceTable.length - 1
            return (
              <tr key={row.iter}
                style={{ color: isLast ? '#22C55E' : '#F1F5F9' }}>
                <td style={{ padding: '2px 0' }}>{row.iter}</td>
                <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>
                  {fmtError(row.max_error_pu)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
```

**`src/components/ui/Badge.jsx`** — badge de estado del sistema:
```jsx
const CONFIG = {
  idle:     { label: 'Sin datos',        bg: '#1E293B', color: '#94A3B8' },
  stable:   { label: 'ESTABLE',          bg: '#14532D', color: '#22C55E' },
  warning:  { label: 'ALERTA',           bg: '#713F12', color: '#EAB308' },
  critical: { label: 'CRÍTICO',          bg: '#7F1D1D', color: '#EF4444' },
  error:    { label: 'ERROR / DIVERGE',  bg: '#3B1F2B', color: '#F43F5E' },
}

export default function Badge({ status = 'idle' }) {
  const { label, bg, color } = CONFIG[status] || CONFIG.idle
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      background: bg, color,
      padding: '4px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 600, letterSpacing: '0.05em'
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
      {label}
    </span>
  )
}
```

**`src/components/ui/ErrorAlert.jsx`:**
```jsx
export default function ErrorAlert({ message }) {
  if (!message) return null
  return (
    <div style={{
      background: '#7F1D1D', border: '1px solid #EF4444',
      borderRadius: 8, padding: '10px 14px',
      color: '#FCA5A5', fontSize: 12
    }}>
      ⚠️ {message}
    </div>
  )
}
```

---

### 5. DATOS MOCK PARA DESARROLLO

Creá `src/mockData.js` para que Dev 3 y Dev 4 puedan desarrollar sin el backend:

```js
export const MOCK_CASE = {
  name: "Red Salta Simplificada",
  base_mva: 100,
  buses: [
    { id:1, name:"TermoAndes Güemes",  type:"SLACK", V_pu:1.04, theta_deg:0,    P_gen_MW:0,  Q_gen_MVAR:0,  P_load_MW:0,   Q_load_MVAR:0,  lat:-24.67, lon:-65.05 },
    { id:2, name:"Cafayate Solar",     type:"PV",    V_pu:1.025,theta_deg:0,    P_gen_MW:80, Q_gen_MVAR:0,  P_load_MW:0,   Q_load_MVAR:0,  lat:-26.07, lon:-65.97 },
    { id:3, name:"Altiplano Solar",    type:"PV",    V_pu:1.025,theta_deg:0,    P_gen_MW:85, Q_gen_MVAR:0,  P_load_MW:0,   Q_load_MVAR:0,  lat:-24.20, lon:-66.33 },
    { id:4, name:"Cobos 500/132kV",    type:"PQ",    V_pu:1.0,  theta_deg:0,    P_gen_MW:0,  Q_gen_MVAR:0,  P_load_MW:0,   Q_load_MVAR:0,  lat:-24.78, lon:-65.43 },
    { id:5, name:"Salta Capital",      type:"PQ",    V_pu:1.0,  theta_deg:0,    P_gen_MW:0,  Q_gen_MVAR:0,  P_load_MW:125, Q_load_MVAR:50, lat:-24.79, lon:-65.41 },
    { id:6, name:"Salta Este",         type:"PQ",    V_pu:1.0,  theta_deg:0,    P_gen_MW:0,  Q_gen_MVAR:0,  P_load_MW:90,  Q_load_MVAR:30, lat:-24.82, lon:-65.35 },
    { id:7, name:"Pampa Grande",       type:"PQ",    V_pu:1.0,  theta_deg:0,    P_gen_MW:0,  Q_gen_MVAR:0,  P_load_MW:0,   Q_load_MVAR:0,  lat:-25.13, lon:-65.50 },
    { id:8, name:"Orán",               type:"PQ",    V_pu:1.0,  theta_deg:0,    P_gen_MW:0,  Q_gen_MVAR:0,  P_load_MW:100, Q_load_MVAR:35, lat:-23.13, lon:-64.32 },
    { id:9, name:"Tartagal",           type:"PQ",    V_pu:1.0,  theta_deg:0,    P_gen_MW:0,  Q_gen_MVAR:0,  P_load_MW:0,   Q_load_MVAR:0,  lat:-22.52, lon:-63.83 }
  ],
  lines: [
    { id:1, from_bus:1, to_bus:4, R_pu:0.0000, X_pu:0.0576, B_pu:0.0000, capacity_MW:250 },
    { id:2, from_bus:4, to_bus:5, R_pu:0.0100, X_pu:0.0850, B_pu:0.0880, capacity_MW:250 },
    { id:3, from_bus:5, to_bus:6, R_pu:0.0170, X_pu:0.0920, B_pu:0.0790, capacity_MW:150 },
    { id:4, from_bus:3, to_bus:6, R_pu:0.0000, X_pu:0.0586, B_pu:0.0000, capacity_MW:300 },
    { id:5, from_bus:6, to_bus:7, R_pu:0.0320, X_pu:0.1610, B_pu:0.1530, capacity_MW:150 },
    { id:6, from_bus:7, to_bus:8, R_pu:0.0085, X_pu:0.0720, B_pu:0.0745, capacity_MW:250 },
    { id:7, from_bus:8, to_bus:2, R_pu:0.0000, X_pu:0.0625, B_pu:0.0000, capacity_MW:250 },
    { id:8, from_bus:8, to_bus:9, R_pu:0.0119, X_pu:0.1008, B_pu:0.1045, capacity_MW:150 },
    { id:9, from_bus:9, to_bus:4, R_pu:0.0100, X_pu:0.0850, B_pu:0.0880, capacity_MW:250 }
  ]
}

export const MOCK_RESULT = {
  converged: true, iterations: 4, max_error_pu: 0.0000003, solve_time_us: 847,
  buses: [
    { id:1, name:"TermoAndes Güemes",  V_pu:1.040, theta_deg: 0.00,  status:"normal"   },
    { id:2, name:"Cafayate Solar",     V_pu:1.025, theta_deg: 9.28,  status:"normal"   },
    { id:3, name:"Altiplano Solar",    V_pu:1.025, theta_deg: 4.66,  status:"normal"   },
    { id:4, name:"Cobos 500/132kV",    V_pu:1.026, theta_deg:-2.22,  status:"normal"   },
    { id:5, name:"Salta Capital",      V_pu:0.996, theta_deg:-3.99,  status:"normal"   },
    { id:6, name:"Salta Este",         V_pu:1.013, theta_deg:-3.69,  status:"normal"   },
    { id:7, name:"Pampa Grande",       V_pu:1.026, theta_deg: 3.72,  status:"normal"   },
    { id:8, name:"Orán",               V_pu:1.016, theta_deg: 6.02,  status:"normal"   },
    { id:9, name:"Tartagal",           V_pu:0.938, theta_deg:-4.35,  status:"warning"  }
  ],
  lines: [
    { id:1, from_bus:1, to_bus:4, P_from_MW: 71.6, Q_from_MVAR:27.0, loading_pct:28.6, status:"normal" },
    { id:2, from_bus:4, to_bus:5, P_from_MW: 40.9, Q_from_MVAR:-1.4, loading_pct:16.4, status:"normal" },
    { id:3, from_bus:5, to_bus:6, P_from_MW:-83.2, Q_from_MVAR: 3.7, loading_pct:55.5, status:"normal" },
    { id:4, from_bus:3, to_bus:6, P_from_MW: 85.0, Q_from_MVAR:-3.5, loading_pct:28.3, status:"normal" },
    { id:5, from_bus:6, to_bus:7, P_from_MW: 60.7, Q_from_MVAR:15.7, loading_pct:40.5, status:"normal" },
    { id:6, from_bus:7, to_bus:8, P_from_MW: 18.0, Q_from_MVAR: 3.2, loading_pct: 7.2, status:"normal" },
    { id:7, from_bus:8, to_bus:2, P_from_MW:163.0, Q_from_MVAR: 6.5, loading_pct:65.2, status:"normal" },
    { id:8, from_bus:8, to_bus:9, P_from_MW: 40.6, Q_from_MVAR: 1.3, loading_pct:27.1, status:"normal" },
    { id:9, from_bus:9, to_bus:4, P_from_MW: 40.6, Q_from_MVAR: 9.2, loading_pct:16.2, status:"normal" }
  ],
  convergence_table: [
    { iter:1, max_error_pu:0.452     },
    { iter:2, max_error_pu:0.031     },
    { iter:3, max_error_pu:0.000082  },
    { iter:4, max_error_pu:0.0000003 }
  ]
}
```

---

## Qué hacer después de crear todos los archivos

1. **Backend**: `cd backend && pip install -r requirements.txt && uvicorn main:app --reload`
2. **Frontend**: `cd frontend && npm install zustand && npm run dev`
3. Verificar que `http://localhost:8000/health` devuelva `{"status":"ok"}`
4. Verificar que `http://localhost:5173` muestre la pantalla CaseSelector
5. El frontend va a mostrar error de conexión si el backend no corre — eso es esperado

## Archivos que NO tenés que crear

- `frontend/node_modules/` — ya existe
- `frontend/package.json` — ya existe
- `frontend/vite.config.js` — ya existe
- `README.md` raíz — ya existe

---

**Creá todos los archivos y carpetas descriptos arriba con exactamente el contenido mostrado. No omitas ningún archivo. No cambies los nombres. No agregues dependencias que no estén en requirements.txt o en las instrucciones.**
