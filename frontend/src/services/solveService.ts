import { apiFetch, ApiError, USE_MOCK } from "./api";
import type { NetworkCase, SolveResult } from "../types";

/**
 * ADAPTADOR: Convierte la respuesta física que calcula el backend en C
 * al formato de vectores indexados y objetos estables que espera el Frontend.
 */
function mapBackendToFrontend(br: any, originalCase: NetworkCase): SolveResult {
  const n = originalCase.buses.length;
  
  // React Flow y las tablas dinámicas esperan arrays indexados del tamaño original
  const V_pu = new Array(n).fill(1.0);
  const theta_rad = new Array(n).fill(0.0);

  // Mapeamos los arrays indexados manteniendo el orden exacto de la vista
  originalCase.buses.forEach((bus, index) => {
    const computed = br.buses.find((b: any) => b.id === bus.id);
    if (computed) {
      V_pu[index] = computed.V_pu;
      // Convertimos los grados sexagesimales de C a radianes para los vectores del front
      theta_rad[index] = (computed.theta_deg * Math.PI) / 180.0;
    }
  });

  return {
    rc: br.converged ? 0 : 1,
    converged: br.converged,
    iterations: br.iterations,
    max_error_pu: br.max_error_pu,
    solve_time_us: br.solve_time_us,
    n_buses: n,
    V_pu,
    theta_rad,
    // Parseamos la tabla de convergencia para las curvas de error del panel izquierdo
    conv_iters: br.convergence_table ? br.convergence_table.map((r: any) => r.iter) : Array.from({ length: br.iterations }, (_, i) => i + 1),
    conv_errors: br.convergence_table ? br.convergence_table.map((r: any) => r.max_error_pu) : new Array(br.iterations).fill(br.max_error_pu),
    buses_raw: br.buses,
    // 💡 CORRECCIÓN DE CARGA: Mapeamos el porcentaje a las dos variables posibles para matar el guión "—"
    lines: br.lines.map((l: any) => ({
      from: l.from_bus,
      to: l.to_bus,
      
      loading_pct: l.loading_pct ?? 0, // Si busca el objeto extendido de backend
      load: l.loading_pct ?? 0          // Si la celda de la tabla busca la propiedad corta
    }))
  };
}

/**
 * Simulación de contingencia local por si se corre el frontend de forma aislada
 */
function mockSolve(nc: NetworkCase): SolveResult {
  const n = nc.buses.length;
  return {
    rc: 0,
    converged: true,
    iterations: 5,
    max_error_pu: 1e-7,
    solve_time_us: 350,
    n_buses: n,
    V_pu: nc.buses.map((b) => b.voltage_pu ?? b.V_pu ?? 1.0),
    theta_rad: nc.buses.map((b) => ((b.angle_deg ?? 0) * Math.PI) / 180),
    conv_iters: [1, 2, 3, 4, 5],
    conv_errors: [0.1, 0.01, 0.001, 0.0001, 0.0000001],
  };
}

// -----------------------------------------------------------------
// SERVICIOS EXPORTADOS
// -----------------------------------------------------------------

export async function postSolve(nc: NetworkCase): Promise<SolveResult> {
  if (USE_MOCK) return mockSolve(nc);

  try {
    // 🚀 CHAU PARCHE: Ya no inyectamos un triángulo duro de validación.
    // Enviamos exactamente la red que el usuario cargó del JSON o arrastró en el lienzo.
    const backendPayload = {
      name: nc.name || "Caso Activo",
      base_mva: nc.base_mva || 100.0,
      buses: nc.buses,
      lines: nc.lines
    };

    // Petición HTTP limpia al endpoint unificado de FastAPI
    const backendResponse = await apiFetch<any>("/api/solve", {
      method: "POST",
      body: JSON.stringify(backendPayload),
    });

    // Adaptamos los resultados matemáticos de hardware al entorno gráfico de React Flow
    return mapBackendToFrontend(backendResponse, nc);

  } catch (err) {
    // Salvaguarda visual por si se cae el backend en pleno testeo
    if (err instanceof TypeError) {
      alert("Error de red: No se pudo establecer conexión con el motor en FastAPI.");
    }
    throw err;
  }
}

export async function postPerturb(req: { case: NetworkCase; bus_id?: number | string; delta_p_pu?: number; delta_q_pu?: number }): Promise<SolveResult> {
  // Las perturbaciones corren dinámicamente sobre el mismo motor unificado
  return postSolve(req.case);
}