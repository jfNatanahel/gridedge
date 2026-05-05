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
