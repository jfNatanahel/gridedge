#ifndef SOLVER_H
#define SOLVER_H
#define MAX_DIM 100
// Resuelve A*x = b usando factorización LU con pivoteo parcial
// Retorna 0 si OK, -1 si matriz singular
int lu_solve(double A[MAX_DIM][MAX_DIM], double b[MAX_DIM],
             double x[MAX_DIM], int n);
#endif
