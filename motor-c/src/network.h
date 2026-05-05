#ifndef NETWORK_H
#define NETWORK_H

#define MAX_BUSES 50
#define MAX_LINES 100

typedef enum {
    BUS_SLACK = 0,
    BUS_PV    = 1,
    BUS_PQ    = 2
} BusType;

typedef struct {
    int    id;
    char   name[64];
    BusType type;
    double V_pu;        // voltaje magnitud (per unit)
    double theta_rad;   // ángulo en radianes
    double P_gen_pu;    // potencia activa generada (pu)
    double Q_gen_pu;    // potencia reactiva generada (pu)
    double P_load_pu;   // potencia activa cargada (pu)
    double Q_load_pu;   // potencia reactiva cargada (pu)
    double lat;         // latitud (para visualización)
    double lon;         // longitud (para visualización)
} Bus;

typedef struct {
    int    id;
    int    from_bus;
    int    to_bus;
    double R_pu;        // resistencia (pu)
    double X_pu;        // reactancia (pu)
    double B_pu;        // susceptancia shunt (pu)
    double capacity_pu; // capacidad térmica (pu)
    // resultados post-solución
    double P_from_pu;
    double Q_from_pu;
    double P_to_pu;
    double Q_to_pu;
    double loading_pct;
} Line;

typedef struct {
    char   name[128];
    double base_mva;
    int    n_buses;
    int    n_lines;
    Bus    buses[MAX_BUSES];
    Line   lines[MAX_LINES];
} NetworkCase;

typedef struct {
    int    converged;           // 1 si convergió, 0 si no
    int    iterations;          // iteraciones hasta converger
    double max_error_pu;        // error máximo final
    double solve_time_us;       // tiempo en microsegundos
    int    n_buses;
    double V_pu[MAX_BUSES];     // voltajos resultado
    double theta_rad[MAX_BUSES];// ángulos resultado
    // tabla de convergencia
    int    conv_iters[50];
    double conv_errors[50];
} SolveResult;

// utilidades
void network_init(NetworkCase *nc);
void result_init(SolveResult *r);

#endif // NETWORK_H
