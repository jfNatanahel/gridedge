#ifndef GRIDEDGE_H
#define GRIDEDGE_H

#include "network.h"

// Función principal: resuelve el flujo de potencia
// Recibe el caso de red, devuelve el resultado
// Retorna 0 si OK, -1 si error
int gridedge_solve(const NetworkCase *nc, SolveResult *result, double tolerance, int max_iter);

// Aplica una perturbación al caso y re-resuelve
// perturb_type: 0=generation_drop, 1=line_trip, 2=load_change
int gridedge_perturb(NetworkCase *nc, SolveResult *result,
                     int perturb_type, int target_id, double factor,
                     double tolerance, int max_iter);

// Calcula flujos por línea post-convergencia
void gridedge_calc_line_flows(NetworkCase *nc, const SolveResult *result);

#endif // GRIDEDGE_H
