import { create } from "zustand";
import type { NetworkCase, SolveResult, SystemStatus } from "../types";

interface NetworkStore {
  networkCase: NetworkCase | null;
  setNetworkCase: (nc: NetworkCase | null) => void;

  solveResult: SolveResult | null;
  setSolveResult: (r: SolveResult | null) => void;

  systemStatus: SystemStatus;
  setSystemStatus: (s: SystemStatus) => void;

  selectedBusId: number | string | null;
  setSelectedBusId: (id: number | string | null) => void;

  isLoading: boolean;
  setIsLoading: (v: boolean) => void;

  reset: () => void;
}

const useNetworkStore = create<NetworkStore>((set) => ({
  networkCase: null,
  setNetworkCase: (nc) => set({ networkCase: nc }),

  solveResult: null,
  setSolveResult: (r) => set({ solveResult: r }),

  systemStatus: "idle",
  setSystemStatus: (s) => set({ systemStatus: s }),

  selectedBusId: null,
  setSelectedBusId: (id) => set({ selectedBusId: id }),

  isLoading: false,
  setIsLoading: (v) => set({ isLoading: v }),

  reset: () =>
    set({
      solveResult: null,
      systemStatus: "idle",
      selectedBusId: null,
      isLoading: false,
    }),
}));

export default useNetworkStore;
