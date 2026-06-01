import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getCases } from "@/services/casesService";
import { BASE_URL, USE_MOCK } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, ArrowRight, ServerCrash } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GridEdge — Seleccionar caso" },
      {
        name: "description",
        content:
          "Selecciona un caso IEEE para resolver el flujo de potencia y visualizar la red.",
      },
    ],
  }),
  component: CaseSelectorPage,
});

function CaseSelectorPage() {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["cases"],
    queryFn: getCases,
    retry: 1,
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                GridEdge
              </h1>
              <p className="text-xs text-muted-foreground">
                Power Flow Studio
              </p>
            </div>
          </div>
          <Badge variant={USE_MOCK ? "secondary" : "outline"}>
            {USE_MOCK ? "MOCK" : `API: ${BASE_URL}`}
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Seleccionar caso de red
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cargá un caso IEEE desde el backend o el almacenamiento local para
            comenzar.
          </p>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando casos…
          </div>
        )}

        {error && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="flex flex-row items-start gap-3 space-y-0">
              <ServerCrash className="mt-1 h-5 w-5 text-destructive" />
              <div className="flex-1">
                <CardTitle className="text-base text-destructive">
                  No se pudo cargar la lista de casos
                </CardTitle>
                <p className="mt-1 text-xs text-muted-foreground">
                  {(error as Error).message}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                Reintentar
              </Button>
            </CardHeader>
          </Card>
        )}

        {data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((c) => (
              <Card
                key={c.name}
                className="group transition-colors hover:border-primary/50"
              >
                <CardHeader>
                  <CardTitle className="font-mono text-base">
                    {c.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {c.description || "Sin descripción"}
                  </p>
                  <Button asChild className="w-full" size="sm">
                    <Link
                      to="/dashboard/$caseName"
                      params={{ caseName: c.name }}
                    >
                      Abrir
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {data && data.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No hay casos disponibles.
          </p>
        )}
      </main>
    </div>
  );
}
