import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface ConvergenceRow {
  iter: number;
  normP: number;
  normQ: number;
  time_us: number;
}

interface Props {
  rows?: ConvergenceRow[];
}

export default function ConvergenceTable({ rows = [] }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded-md border border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
        Sin datos de convergencia. Ejecutá Solve.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">k</TableHead>
            <TableHead>||ΔP||</TableHead>
            <TableHead>||ΔQ||</TableHead>
            <TableHead className="text-right">µs</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.iter}>
              <TableCell className="font-mono text-xs">{r.iter}</TableCell>
              <TableCell className="font-mono text-xs">
                {r.normP.toExponential(2)}
              </TableCell>
              <TableCell className="font-mono text-xs">
                {r.normQ.toExponential(2)}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                {r.time_us}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
