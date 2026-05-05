#ifndef YBUS_H
#define YBUS_H
#include "network.h"
#define MAX_N 50
// Matriz Y-bus: G (parte real) y B (parte imaginaria)
typedef struct {
    double G[MAX_N][MAX_N]; // conductancia
    double B[MAX_N][MAX_N]; // susceptancia
    int n;
} YBus;
void ybus_build(const NetworkCase *nc, YBus *ybus);
#endif
