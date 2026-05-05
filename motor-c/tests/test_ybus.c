#include <stdio.h>
#include "network.h"
#include "ybus.h"

int main() {
    NetworkCase nc;
    network_init(&nc);
    nc.n_buses = 3;
    nc.n_lines = 2;
    nc.lines[0].from_bus = 0;
    nc.lines[0].to_bus = 1;
    nc.lines[0].R_pu = 0.01;
    nc.lines[0].X_pu = 0.1;

    nc.lines[1].from_bus = 1;
    nc.lines[1].to_bus = 2;
    nc.lines[1].R_pu = 0.015;
    nc.lines[1].X_pu = 0.12;

    YBus ybus;
    ybus_build(&nc, &ybus);
    printf("YBus n = %d (expect %d)\n", ybus.n, nc.n_buses);
    return 0;
}
