from setuptools import setup, Extension
from Cython.Build import cythonize
import numpy as np

# Definimos la extensión (el módulo híbrido que queremos compilar)
ext_modules = [
    Extension(
        name="app.engine.bridge",  # Nombre completo del módulo resultante
        sources=["app/engine/bridge.pyx"],  # Archivo fuente de Cython (que incluye a solver.c)
        include_dirs=[
            "app/engine",  # Carpeta donde están types.h y solver.c
            np.get_include()  # 👈 CRÍTICO: Incluye las cabeceras de C de NumPy para que compile
        ],
        # Si estás en Linux/macOS podés agregar argumentos de optimización extra,
        # para Windows con MSVC se compila de forma directa y limpia de esta manera.
    )
]

setup(
    name="GridEdge Core Math Engine",
    ext_modules=cythonize(
        ext_modules,
        compiler_directives={"language_level": "3"}  # Forzamos compatibilidad con Python 3
    ),
)