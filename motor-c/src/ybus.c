#include "ybus.h"
#include <string.h>

void ybus_build(const NetworkCase *nc, YBus *ybus) {
    memset(ybus, 0, sizeof(YBus));
    ybus->n = nc->n_buses;
    // TODO: HU-02 — llenar G y B a partir de nc->lines
    // Para cada línea ij:
    //   y_ij = 1 / (R + jX) = G_ij + jB_ij
    //   Y[i][i] += y_ij + jB_shunt/2
    //   Y[j][j] += y_ij + jB_shunt/2
    //   Y[i][j] -= y_ij
    //   Y[j][i] -= y_ij
}
