#include "jacobian.h"
#include <math.h>
#include <string.h>

void jacobian_build(const NetworkCase *nc, const YBus *ybus,
                    const double *V, const double *theta,
                    double J[2*MAX_N][2*MAX_N], int *dim) {
    // TODO: HU-03
    // Referencia: Grainger & Stevenson Cap. 9, ecuaciones 9.20 a 9.27
    // dP_i/dTheta_j (i!=j) = V_i * V_j * (G_ij*sin(theta_ij) - B_ij*cos(theta_ij))
    // dP_i/dTheta_i        = -Q_i - B_ii * V_i^2
    // etc.
    *dim = 0; // stub
}
