# GridEdge

Proyecto GridEdge — simulador y herramienta de análisis de redes eléctricas.

## Resumen rápido

- `motor-c/`: núcleo numérico en C (biblioteca y casos de ejemplo).
- `backend/`: API en Python (FastAPI) y wrapper ctypes hacia `motor-c`.
- `frontend/`: aplicación React + Vite (TypeScript) para visualización e interacción.

## Objetivo

El repositorio contiene el motor numérico (C), un backend en FastAPI que expone
endpoints para cargar casos y ejecutar soluciones, y un frontend en React/Vite
para interactuar con la red, ver resultados y depurar flujos y buses.

## Documentación

- Documentación del backend: [backend/DOCUMENTATION.md](backend/DOCUMENTATION.md)
- Documentación del frontend: [frontend/DOCUMENTATION.md](frontend/DOCUMENTATION.md)
- Documentación del motor C: [motor-c/DOCUMENTATION.md](motor-c/DOCUMENTATION.md)

## Quick start (desarrollo)

### 1) Motor C (compilar y tests)

```bash
cd motor-c
make           # compila la biblioteca compartida y builds/tests
make test      # ejecuta tests locales (requiere make + gcc)
```

### 2) Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt || pip install fastapi uvicorn pydantic
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

> Nota: si no existe `requirements.txt`, instala las dependencias listadas arriba.

### 3) Frontend (Vite + React + TypeScript)

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

Por defecto Vite sirve en `http://localhost:5173`. Si usas otro puerto, añade
ese origen a las reglas CORS del backend.

## Endpoints principales

- `GET /` — estado del servicio.
- `GET /api/cases` — lista de casos disponibles.
- `GET /api/case/{name}` — carga un caso por nombre.
- `POST /api/solve` — envía un caso para resolver y recibe `SolveResult`.

## Soporte y troubleshooting (rápido)

- Errores CORS en el navegador: añade el origen del frontend a `allowed_origins`
	en `backend/app/main.py` o configura correctamente el middleware CORS.
- `ModuleNotFoundError: fastapi`: activa el `.venv` y usa el Python del entorno.
- Errores runtime en Vite por imports de tipos: usa `import type { X } from './types'`.
- Node / dependencias: ejecutar `npm install` desde `frontend/` y usar Node 18+.

## Contribuir

- Añade casos de ejemplo en `motor-c/cases/`.
- Mantén coherencia entre las firmas en C y el wrapper Python (`backend/gridedge_wrapper.py`).
- Para cambios en el frontend, sigue las convenciones TypeScript en `frontend/src/`.

---

Si necesitas una sección adicional (diagramas, API spec OpenAPI, o un tutorial paso-a-paso), dime qué prefieres y la añado.
