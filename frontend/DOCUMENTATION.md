# Frontend — Documentación

Visión general
---------------

El frontend es una SPA construida con React + Vite y migrada a TypeScript.
Proporciona una interfaz para seleccionar casos, ejecutar la resolución en el
backend y visualizar resultados (mapa SVG, tablas de buses y líneas, panel
detallado de bus).

Stack y dependencias
- React (v18/19), Vite, TypeScript
- Estado: `zustand`
- Peticiones: capa `services/*` que usa `fetch` (helper `apiFetch<T>`)

Arranque y desarrollo
--------------------

Requisitos: Node 18+ (recomendado). En el directorio `frontend/`:

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

Variables de entorno
- `VITE_API_URL`: URL base del backend (por ejemplo `http://localhost:8000`).
  Puedes exportarla en la terminal o crear un archivo `.env` en `frontend/`.

Commandos útiles

- Desarrollo: `npm run dev`
- Build producción: `npm run build`
- Previsualizar build: `npm run preview`

Arquitectura de código (resumen)
-------------------------------

- `frontend/src/types.ts` — tipos compartidos que describen `Bus`, `Line`,
  `NetworkCase`, `SolveResult`, etc.
- `frontend/src/services/` — funciones que llaman a la API (`casesService.ts`,
  `solveService.ts`, `benchmarkService.ts`). Usa `apiFetch<T>` para requests.
- `frontend/src/store/useNetworkStore.ts` — store Zustand que contiene el caso
  actual, resultado de la solución, `selectedBusId`, `isLoading`, etc.
- `frontend/src/pages/CaseSelector/index.tsx` — lista y carga de casos.
- `frontend/src/pages/Dashboard/index.tsx` — panel principal con botón Solve,
  tabla de convergencia y panel derecho con tablas de buses y líneas.
- `frontend/src/components/network/` — mapa SVG y componentes: `BusNode`,
  `TransmissionLine`, `NodeTooltip`, `BusDetailPanel` (detalles del bus seleccionado).

Notas de desarrollo y debugging
------------------------------

- Importaciones de tipos: para evitar errores ESM en tiempo de ejecución,
  usa `import type { NetworkCase } from '../types'` cuando sólo necesites tipos.
- CORS: si el frontend lanza fetch fallidos por CORS, añade el origen al
  backend (`allowed_origins`) o ajusta `VITE_API_URL` para apuntar al proxy/servidor correcto.
- Problemas con paquetes: ejecutar `npm ci` o `npm install` en `frontend/`.

Flujo de usuario (guía rápida)
-----------------------------

1. Abrir `Case Selector` y elegir un caso (por ejemplo `ieee9`).
2. Revisar parámetros y pulsar `Solve` en `Dashboard`.
3. El frontend enviará `POST /api/solve`. Mientras tanto se muestra un spinner.
4. Al recibir respuesta, la vista actualiza tablas, el mapa resalta buses y
   líneas con resultados (magnitud de tensiones, flujos, etc.).
5. Hacer click en un bus para ver el panel derecho con detalles y botón de
   centrado en el mapa.

Testing y E2E
-------------

- No hay pruebas E2E incluidas por defecto. Recomendado: usar Playwright para
  pruebas de interacción (abrir página, seleccionar caso, pulsar Solve, verificar resultados).
- Para tests unitarios de componentes usar `vitest` + `@testing-library/react`.

Extensiones sugeridas
---------------------

- Añadir scripts para ejecutar tests y linters (`npm run test`, `npm run lint`).
- Añadir un `README.md` en `frontend/` con atajos de desarrollo si se necesita
  más detalle para onboarding de nuevos desarrolladores.

Cross-platform (Windows / WSL / Docker)
--------------------------------------

- Se añadió `cross-env` a las `devDependencies` y los scripts `dev`, `build`
  y `preview` usan `cross-env VITE_API_URL=...` para que la variable de entorno
  funcione tanto en Linux como en Windows.

- Usar WSL2 o Docker en Windows es la opción más simple para evitar problemas
  al compilar `motor-c` (Linux build produce `.so`). Si desarrollas en Windows
  nativo y necesitas compilar una DLL, hay que adaptar el `Makefile` o usar
  `CMake`/MSVC.

- Ejemplo con WSL2:

```bash
# desde WSL dentro del repo
cd frontend
npm install
cross-env VITE_API_URL=http://localhost:8000 npm run dev
```

- Si prefieres no fijar `VITE_API_URL` en los scripts, puedes exportarla en tu
  shell antes de ejecutar `npm run dev`.
