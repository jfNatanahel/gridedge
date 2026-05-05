#ifndef NEWTON_H
#define NEWTON_H
#include "network.h"
#include "ybus.h"
int newton_raphson(const NetworkCase *nc, const YBus *ybus,
                   double *V, double *theta,
                   double tolerance, int max_iter,
                   SolveResult *result);
#endif
