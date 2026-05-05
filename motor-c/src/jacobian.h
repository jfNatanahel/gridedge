#ifndef JACOBIAN_H
#define JACOBIAN_H
#include "network.h"
#include "ybus.h"
// J tiene dimensión (2*(n-1)) x (2*(n-1))
// Bloques: dP/dTheta | dP/dV
//          dQ/dTheta | dQ/dV
void jacobian_build(const NetworkCase *nc, const YBus *ybus,
                    const double *V, const double *theta,
                    double J[2*MAX_N][2*MAX_N], int *dim);
#endif
