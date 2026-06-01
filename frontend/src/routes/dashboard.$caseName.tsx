import { useEffect, useMemo } from "react";
import {
  createFileRoute,
  Link,
  useParams,
} from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Play,
  Activity,
  CircleCheck,
  CircleAlert,
  XCircle,
} from "lucide-react";

import { getCase } from "@/services/casesService";
import { postSolve } from "@/services/solveService";
import useNetworkStore from "@/store/useNetworkStore";
import NetworkMap2D from "@/components/network/NetworkMap2D";
import NetworkFlow from "@/components/network/NetworkFlow";
import ConvergenceTable from "@/components/metrics/ConvergenceTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  fmtAngle,
  fmtAngleDeg,
  fmtError,
  fmtLoading,
  fmtPower,
  fmtTime,
  fmtVoltage,
} from "@/utils/formatters";
import type { SystemStatus } from "@/types";

export const Route = createFileRoute("/dashboard/$caseName")({
  head: ({ params }) => ({
    meta: [
      { title: `GridEdge — ${params.caseName}` },
      {
        name: "description",
        content: `Dashboard de flujo de potencia para el caso ${params.caseName}.`,
      },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { caseName } = useParams({ from: "/dashboard/$caseName" });
  const setNetworkCase = useNetworkStore((s) => s.setNetworkCase);
  const setSolveResult = useNetworkStore((s) => s.setSolveResult);
  const setSystemStatus = useNetworkStore((s) => s.setSystemStatus);
  const solveResult = useNetworkStore((s) => s.solveResult);
  const systemStatus = useNetworkStore((s) => s.systemStatus);
  const reset = useNetworkStore((s) => s.reset);

  const caseQuery = useQuery({
    queryKey: ["case", caseName],
    queryFn: () => getCase(caseName),
  });

  useEffect(() => {
    reset();
    if (caseQuery.data) setNetworkCase(caseQuery.data);
    return () => {
      setNetworkCase(null);
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [caseQuery.data, caseName]);

  const solveMutation = useMutation({
    mutationFn: postSolve,
    onSuccess: (res) => {
      setSolveResult(res);
      setSystemStatus(res.converged ? "stable" : "warning");
      toast.success(
        res.converged
          ? `Convergió en ${res.iterations} iter (${res.solve_time_us} µs)`
          : "Solve no convergió",
      );
    },
    onError: (err: Error) => {
      setSystemStatus("error");
      toast.error(err.message);
    },
  });

  const handleSolve = () => {
    if (!caseQuery.data) return;
    solveMutation.mutate(caseQuery.data);
  };

  const convergenceRows = useMemo(() => {
    if (!solveResult?.conv_iters?.length) return [];
    return solveResult.conv_iters.map((it, i) => ({
      iter: it,
      normP: solveResult.conv_errors?.[i] ?? 0,
      normQ: 0,
      time_us: 0,
    }));
  }, [solveResult]);

  const isLoading = caseQuery.isLoading;
  const networkCase = caseQuery.data;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex shrink-0 items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-mono text-sm font-semibold">
                {networkCase?.name ?? caseName}
              </h1>
              <StatusBadge status={systemStatus} />
            </div>
            {networkCase?.description && (
              <p className="text-xs text-muted-foreground">
                {networkCase.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {solveResult && (
            <div className="hidden gap-4 text-xs text-muted-foreground md:flex">
              <Metric label="iter" value={String(solveResult.iterations)} />
              <Metric
                label="err"
                value={fmtError(solveResult.max_error_pu)}
              />
              <Metric label="t" value={fmtTime(solveResult.solve_time_us)} />
            </div>
          )}
          <Button
            onClick={handleSolve}
            disabled={!networkCase || solveMutation.isPending}
            size="sm"
          >
            {solveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resolviendo…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Solve
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-80 shrink-0 overflow-y-auto border-r border-border p-4 lg:block">
          <SectionTitle>Convergencia</SectionTitle>
          <ConvergenceTable rows={convergenceRows} />

          {caseQuery.error && (
            <Card className="mt-4 border-destructive/50 bg-destructive/5">
              <CardHeader>
                <CardTitle className="text-sm text-destructive">
                  Error al cargar el caso
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {(caseQuery.error as Error).message}
              </CardContent>
            </Card>
          )}
        </aside>

        <main className="flex min-w-0 flex-1 flex-col p-4">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando caso…
            </div>
          ) : networkCase ? (
            <Tabs defaultValue="flow" className="flex h-full flex-col">
              <TabsList className="self-start">
                <TabsTrigger value="flow">Interactivo</TabsTrigger>
                <TabsTrigger value="svg">Esquemático</TabsTrigger>
              </TabsList>
              <TabsContent value="flow" className="mt-3 min-h-0 flex-1">
                <NetworkFlow
                  networkCase={networkCase}
                  solveResult={solveResult}
                />
              </TabsContent>
              <TabsContent value="svg" className="mt-3 min-h-0 flex-1">
                <NetworkMap2D networkCase={networkCase} />
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No se pudo cargar el caso.
            </div>
          )}
        </main>

        <aside className="hidden w-96 shrink-0 overflow-y-auto border-l border-border p-4 xl:block">
          <SectionTitle>Buses</SectionTitle>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>V</TableHead>
                  <TableHead>θ</TableHead>
                  <TableHead>P</TableHead>
                  <TableHead>Q</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkCase?.buses.map((b, i) => {
                  const V =
                    solveResult?.V_pu?.[i] ??
                    b.voltage_pu ??
                    b.V_pu ??
                    null;
                  const thetaRad =
                    solveResult?.theta_rad?.[i] ??
                    b.angle_rad ??
                    (b.angle_deg != null
                      ? (b.angle_deg * Math.PI) / 180
                      : null);
                  return (
                    <TableRow key={b.id}>
                      <TableCell className="font-mono text-xs">
                        {b.name ?? b.id}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {fmtVoltage(V)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {solveResult
                          ? fmtAngle(thetaRad)
                          : fmtAngleDeg(b.angle_deg)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {fmtPower(b.p_mw)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {fmtPower(b.q_mvar)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <SectionTitle className="mt-6">Líneas</SectionTitle>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>From → To</TableHead>
                  <TableHead>R/X</TableHead>
                  <TableHead className="text-right">Load</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {networkCase?.lines.map((ln, i) => {
                  const from = ln.from ?? ln.from_bus;
                  const to = ln.to ?? ln.to_bus;
                  return (
                    <TableRow key={ln.id ?? `${from}-${to}-${i}`}>
                      <TableCell className="font-mono text-xs">
                        {ln.id ?? `L${i + 1}`}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {String(from)} → {String(to)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {(ln.R_pu ?? 0).toFixed(3)}/
                        {(ln.X_pu ?? 0).toFixed(3)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {fmtLoading(ln.loading_pct)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={`mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground ${className ?? ""}`}
    >
      {children}
    </h3>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="font-mono text-[10px] uppercase">{label}</span>
      <span className="font-mono text-xs text-foreground">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: SystemStatus }) {
  const map: Record<
    SystemStatus,
    { label: string; variant: "default" | "secondary" | "destructive" | "outline"; Icon: typeof Activity }
  > = {
    idle: { label: "idle", variant: "outline", Icon: Activity },
    stable: { label: "stable", variant: "default", Icon: CircleCheck },
    warning: { label: "warning", variant: "secondary", Icon: CircleAlert },
    critical: { label: "critical", variant: "destructive", Icon: CircleAlert },
    error: { label: "error", variant: "destructive", Icon: XCircle },
  };
  const { label, variant, Icon } = map[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
}
