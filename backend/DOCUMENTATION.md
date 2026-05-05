# Backend — Documentación

Descripción
------------

El backend es una API construida con FastAPI que expone endpoints para listar
casos, obtener un caso por nombre y ejecutar la resolución del caso usando el
motor numérico (C) a través de un wrapper `ctypes`.

Estructura relevante
- `backend/app/main.py` — punto de entrada de la app (uvicorn). Contiene los
  routers principales y el middleware CORS.
- `backend/gridedge_wrapper.py` — wrapper `ctypes` que intenta cargar la
  biblioteca compartida del motor (`libgridedge.so`) y expone `solve_case()`.
- `backend/test_wrapper.py` — script de humo para validar el wrapper localmente.
- `backend/schemas.py` — modelos y tipos (Pydantic) usados por los endpoints.

Requisitos y setup
------------------

Recomendado: usar un entorno virtual dentro de `backend/`.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt || pip install fastapi uvicorn pydantic
```

Si estás desarrollando el `motor-c`, compila la biblioteca y deja la ruta
disponible para el wrapper:

```bash
cd ../motor-c
make
# Si libgridedge.so se genera en build/, exporta la ruta
export LD_LIBRARY_PATH="$PWD/build:$LD_LIBRARY_PATH"
```

Ejecución
---------

```bash
cd backend
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

Prueba rápida del wrapper
------------------------

Con el `.venv` activado y la biblioteca compartida disponible, ejecuta:

```bash
.venv/bin/python backend/test_wrapper.py
```

Deberías ver un JSON con la salida del `solve_case()` (en desarrollo puede
retornar `rc: -1` si el motor está stubbed).

Endpoints y ejemplos
--------------------

- `GET /` — estado del servicio.

```bash
curl -sS http://localhost:8000/
```

- `GET /api/cases` — lista de casos.

```bash
curl -sS http://localhost:8000/api/cases
```

- `GET /api/case/{name}` — descarga un caso JSON.

```bash
curl -sS http://localhost:8000/api/case/ieee9
```

- `POST /api/solve` — envía el objeto `NetworkCase` JSON para resolver.

```bash
curl -sS -X POST http://localhost:8000/api/solve \
  -H "Content-Type: application/json" \
  -d @examples/ieee9.json
```

Notas de debugging
------------------

- Ctypes error (biblioteca no encontrada): verifica `LD_LIBRARY_PATH` o la
  ruta en `gridedge_wrapper.py` donde se intenta cargar `libgridedge.so`.
- Response con `rc: -1`: normalmente indica que el motor está stubbed o falla
  la inicialización; revisa los logs del backend y la salida del test wrapper.
- Problemas de dependencias Python: activa `.venv` y reinstala con pip.

Configuración CORS
------------------

El archivo `backend/app/main.py` añade `CORSMiddleware` con una lista de
orígenes por defecto (por ejemplo `http://localhost:5173`). Si trabajas en
otro puerto, añade ese origen a `allowed_origins`.

Casos de ejemplo
-----------------

Los casos de ejemplo se almacenan en `motor-c/cases/` y son consumidos por el
backend para servir datos al frontend.

Pruebas y CI
-----------

- `test_wrapper.py` es un test de humo; para tests unitarios de la API se puede
  añadir `pytest` y tests en `backend/tests/`.

Contacto
-------

Si tienes dudas sobre el wrapper o las firmas C ↔ Python, contacta con el
desarrollador responsable del motor C y reporta la salida del `test_wrapper.py`.

Cross-platform (Windows / WSL / Docker)
--------------------------------------

- El wrapper ahora intenta auto-detectar la biblioteca en `../motor-c/build/`.
  También puedes forzar la ruta con la variable de entorno `MOTOR_LIB_PATH`:

```bash
export MOTOR_LIB_PATH=/path/to/build/libgridedge.so
```

- En Windows la librería puede tener extensión `.dll` (por ejemplo `gridedge.dll`).
  Recomiendo usar WSL2 o Docker para mantener un entorno Linux idéntico al CI.

- Ejemplo rápido con WSL2:

```bash
# desde WSL dentro del repo
cd motor-c && make
cd ../backend
export MOTOR_LIB_PATH=$PWD/../motor-c/build/libgridedge.so
.venv/bin/python -m uvicorn app.main:app --reload --port 8000
```

- Alternativa Docker (desarrollo): podemos añadir un `docker-compose.yml`
  que compile `motor-c`, comparta `libgridedge.so` con el contenedor del
  backend y arranque uvicorn. Puedo generar un `docker-compose` base si lo
  quieres.
