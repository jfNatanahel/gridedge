#include <stdio.h>
#include "network.h"
#include "ybus.h"
#include "newton.h"

int main() {
    NetworkCase nc;
    network_init(&nc);
    nc.n_buses = 2;
    YBus ybus;
    ybus_build(&nc, &ybus);
    double V[2] = {1.0, 1.0};
    double theta[2] = {0.0, 0.0};
    SolveResult res;
    int ok = newton_raphson(&nc, &ybus, V, theta, 1e-6, 50, &res);
    printf("newton_raphson returned %d\n", ok);
    return 0;
}
