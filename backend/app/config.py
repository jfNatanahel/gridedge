import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

CASES_PATH = os.getenv("GRIDEDGE_CASES_PATH", str(BASE_DIR / "data" / "cases"))

# Umbrales de seguridad eléctrica para las alertas

VOLTAGE_CRITICAL_LOW = 0.95   # pu: Por debajo de esto, el nodo parpadea en ROJO
VOLTAGE_WARNING_LOW = 0.98    # pu: Zona de precaución (AMARILLO)
VOLTAGE_CRITICAL_HIGH = 1.05  # pu: Sobretensión crítica (ROJO)

LINE_OVERLOAD_THRESHOLD = 0.95  # 95%: La línea parpadea por sobrecarga térmica