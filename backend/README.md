# GridEdge — Backend (FastAPI)

Instrucciones rápidas

1. Instalar dependencias:

```bash
cd backend
pip install -r requirements.txt
```

2. Ejecutar la API (desde `backend/`):

```bash
export MOTOR_LIB_PATH=../motor-c/build/libgridedge.so
uvicorn app.main:app --reload --port 8000
```

3. Endpoint: `POST /solve` envía un JSON con el caso (ver `motor-c/cases/ieee9.json`).

Nota: el wrapper usa `ctypes` para cargar `libgridedge.so`. Asegurate de compilar `motor-c` primero (`cd motor-c && make`).
