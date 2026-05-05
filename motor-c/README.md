# motor-c — Núcleo numérico de GridEdge

Este directorio contiene el motor numérico en C para resolver flujos de potencia AC.

Estructura:
- `src/`  : código fuente C
- `tests/`: pruebas unitarias básicas
- `cases/`: archivos JSON con casos de red
- `build/`: salida de compilación (contiene `libgridedge.so` después de compilar)

Compilar:

```sh
make
```

Ejecutar pruebas:

```sh
make test
```
