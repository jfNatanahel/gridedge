#include "newton.h"
#include "jacobian.h"
#include "solver.h"
#include <math.h>
#include <stdio.h>

int newton_raphson(const NetworkCase *nc, const YBus *ybus,
                   double *V, double *theta,
                   double tolerance, int max_iter,
                   SolveResult *result) {
    // TODO: HU-05
    // for k = 0 to max_iter:
    //   1. calcular mismatch dP, dQ
    //   2. verificar convergencia: if max(|dP|,|dQ|) < tol -> OK
    //   3. construir jacobiana
    //   4. resolver J*[dTheta, dV/V] = [dP, dQ]
    //   5. actualizar theta += dTheta, V *= (1 + dV/V)
    //   6. guardar en result->conv_errors[k]
    return 0; // stub
}
