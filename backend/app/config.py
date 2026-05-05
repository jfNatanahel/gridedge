import os
from dotenv import load_dotenv

load_dotenv()

MOTOR_LIB_PATH = os.getenv("MOTOR_LIB_PATH", "../motor-c/build/libgridedge.so")
CASES_PATH     = os.getenv("CASES_PATH", "../motor-c/cases")
PORT           = int(os.getenv("PORT", 8000))
TOLERANCE      = float(os.getenv("TOLERANCE", 1e-6))
MAX_ITER       = int(os.getenv("MAX_ITER", 50))
