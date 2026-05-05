#include "network.h"
#include <string.h>

void network_init(NetworkCase *nc) {
    memset(nc, 0, sizeof(NetworkCase));
    nc->base_mva = 100.0;
    nc->n_buses  = 0;
    nc->n_lines  = 0;
}

void result_init(SolveResult *r) {
    memset(r, 0, sizeof(SolveResult));
}
