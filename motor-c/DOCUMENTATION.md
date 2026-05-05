# DOCUMENTACIÓN — motor-c (GridEdge)

Resumen
-------
Este directorio contiene el núcleo numérico en C del proyecto GridEdge: estructuras de datos, funciones para construir la matriz Y-bus, plantillas para el Jacobiano, un resolvedor LU y el bucle de Newton-Raphson. Los ficheros actuales son una base esquelética que permite compilar y ejecutar tests básicos; las funciones principales están apuntadas con TODOs para implementar las HUs posteriores.

Estructura
---------

```
motor-c/
├── Makefile
├── README.md
├── src/
│   ├── gridedge.h
│   ├── gridedge.c
│   ├── network.h
│   ├── network.c
│   ├── parser.h         (no implementado aún)
│   ├── parser.c         (no implementado aún)
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
└── build/         ← contiene `.gitkeep` (y será el output de compilación)
```

Archivo por archivo
-------------------

- **Makefile** — Regla principal para compilar la biblioteca compartida `libgridedge.so` y para ejecutar pruebas. Variables clave: `CC`, `CFLAGS`, `SRC_DIR`, `BUILD_DIR`. Targets: `all`, `test`, `clean`.

- **README.md** — Breve descripción del propósito y comandos de compilación.

- **src/network.h** — Definiciones de tipos y estructuras:
  - `Bus`: datos por barra (id, name, tipo, V_pu, theta_rad, potencias, coordenadas).
  - `Line`: datos por línea (from_bus, to_bus, R/X/B, resultados post-solución).
  - `NetworkCase`: caso completo (nombre, base_mva, arrays de `Bus`/`Line`).
  - `SolveResult`: estructura para almacenar resultados del solver y la historia de convergencia.
  - Prototipos: `network_init()` y `result_init()`.

- **src/network.c** — Implementa `network_init()` y `result_init()` (inicialización y ceros).

- **src/gridedge.h** — API pública pensada para exponer desde Python (ctypes/cffi):
  - `gridedge_solve(const NetworkCase *nc, SolveResult *result, double tolerance, int max_iter)` — función principal para resolver el flujo.
  - `gridedge_perturb(...)` — aplica perturbaciones y re-solve.
  - `gridedge_calc_line_flows(...)` — calcula flujos en líneas tras convergencia.

- **src/gridedge.c** — Entrada pública; actualmente contiene stubs con comentarios TODO para conectar Y-bus, Newton y cálculo de flujos.

- **src/ybus.h / src/ybus.c** — Estructura `YBus` (matrices G y B) y `ybus_build()`. `ybus_build()` inicializa la estructura; implementar la construcción de la matriz Y a partir de `NetworkCase::lines` (comentado con HU-02).

- **src/jacobian.h / src/jacobian.c** — Interfaz para construir la matriz Jacobiana del sistema (bloques dP/dTheta, dP/dV, dQ/dTheta, dQ/dV). `jacobian_build()` está esquelético y marca HU-03.

- **src/solver.h / src/solver.c** — Prototipo `lu_solve()` para resolver sistemas lineales con factorización LU y pivoteo parcial. Implementación pendiente (HU-04).

- **src/newton.h / src/newton.c** — Bucle de Newton-Raphson: calcula mismatches, comprueba tolerancias, construye Jacobiano y utiliza `lu_solve()` para actualizar `theta` y `V`. Contiene pasos a implementar (HU-05).

- **tests/test_ybus.c** — Test mínimo que crea un `NetworkCase` simple, llama a `ybus_build()` e imprime `ybus.n`. Útil para verificar compilación e inclusión de fuentes.

- **tests/test_newton.c** — Test mínimo que prepara V/theta, llama a `newton_raphson()` y muestra el código de retorno. Actualmente `newton_raphson()` es un stub y retorna 0.

- **cases/*.json** — Casos de red en formato JSON (ejemplos `ieee9.json` y `salta.json`). Pueden usarse más adelante con un parser JSON (pendiente).

- **build/.gitkeep** — Placeholder para que la carpeta `build/` exista en el repo. Tras compilar, `libgridedge.so` aparecerá en `build/`.

Cómo compilar y ejecutar tests
-----------------------------

Desde la raíz del repo:

```bash
cd motor-c
make test
```

El target `test` ejecuta `make` internamente, compila una biblioteca compartida y compila y corre los ejecutables de test `test_ybus` y `test_newton`.

Notas sobre resultados esperados
-------------------------------
- `test_ybus` imprime algo como `YBus n = 3 (expect 3)` si el `NetworkCase` de test define `n_buses = 3`.
- `test_newton` imprimirá `newton_raphson returned 0` porque la función está stubbed para retornar 0 por ahora.

Próximos pasos y tareas pendientes
---------------------------------

- Implementar HU-02: calcular e insertar elementos en `YBus` según `nc->lines` en `ybus.c`.
- Implementar HU-03: construir el Jacobiano completo en `jacobian.c`.
- Implementar HU-04: factorizar y resolver usando LU con pivoteo en `solver.c`.
- Implementar HU-05: bucle Newton-Raphson en `newton.c` y devolver información de convergencia en `SolveResult`.
- Implementar parser JSON/IO en `parser.c` para cargar `cases/*.json` en `NetworkCase`.
- Escribir el wrapper Python/ctypes y el backend FastAPI para exponer la librería.

Notas para el wrapper Python y FastAPI
------------------------------------

- Ruta esperada para la librería en `.env.example`: `MOTOR_LIB_PATH=../motor-c/build/libgridedge.so`.
- Recomendado usar `ctypes` o `cffi` en Python para exponer las funciones C: serializar `NetworkCase` desde un JSON o estructura Python y pasar punteros a la función `gridedge_solve`.
- Antes de cargar la librería en Python, ejecutar `make` en `motor-c` para generar `libgridedge.so`.

Consejos de desarrollo
----------------------

- Mantener las funciones internas (ybus/jacobian/solver/newton) con tests unitarios pequeños antes de integrarlas.
- Documentar cada HU con un ejemplo pequeño (3 buses) y comparar resultados con un paquete de referencia (p. ej. pandapower) cuando ya esté implementado.

Contacto
--------
Si necesitan que genere el wrapper Python o el backend FastAPI, indicamelo y preparo los archivos base y rutas de la API.
