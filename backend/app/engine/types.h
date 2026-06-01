#ifndef TYPES_H
#define TYPES_H

// Estructura nativa para representar un Nodo (Bus) en C
typedef struct {
    int id;
    int type;          // 0 = SLACK, 1 = PV, 2 = PQ
    double V_pu;
    double theta_rad;  // Trabajamos en radianes internamente para las funciones sin() y cos()
    double P_gen;      // Potencia en pu (MW / base_mva)
    double Q_gen;      // Potencia en pu (MVAR / base_mva)
    double P_load;     // Potencia en pu
    double Q_load;     // Potencia en pu
} BusC;

// Estructura nativa para representar una Línea de Transmisión en C
typedef struct {
    int id;
    int from_bus;
    int to_bus;
    double R_pu;
    double X_pu;
    double B_pu;       // Susceptancia shunt total
    double capacity;
} LineC;

// Estructura para registrar cada paso de la convergencia
typedef struct {
    int iter;
    double max_error;
} ConvergenceRowC;

#endif // TYPES_H