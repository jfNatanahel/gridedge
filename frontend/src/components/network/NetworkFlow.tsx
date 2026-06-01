import { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
  type EdgeProps,
  BaseEdge,
  getSmoothStepPath,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import dagre from "dagre";
import { Zap, Factory, Plug, CircleDot } from "lucide-react";
import type { NetworkCase, Bus, Line, SolveResult } from "@/types";
import { voltageToColor } from "@/utils/voltageToColor";
import { loadingToColor } from "@/utils/loadingToColor";
import { fmtVoltage, fmtLoading, fmtPower } from "@/utils/formatters";

interface Props {
  networkCase: NetworkCase;
  solveResult?: SolveResult | null;
  onSelectBus?: (id: number | string) => void;
}

const NODE_W = 150;
const NODE_H = 70;

type BusNodeData = {
  bus: Bus;
  V: number | null;
  busType: string;
  isSelected?: boolean;
};

type LineEdgeData = {
  line: Line;
  loading: number;
};

function BusNodeView({ data }: NodeProps<Node<BusNodeData>>) {
  const { bus, V, busType } = data;
  const color = voltageToColor(V);
  const Icon =
    busType === "Slack" ? Zap : busType === "PV" ? Factory : busType === "PQ" ? Plug : CircleDot;
  const isGen = (bus.p_mw ?? 0) > 0 || busType === "Slack" || busType === "PV";

  return (
    <div
      className="group flex w-[150px] flex-col items-center rounded-md border-2 bg-card px-3 py-2 shadow-md transition-shadow hover:shadow-lg"
      style={{ borderColor: color }}
    >
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border-0 !bg-muted-foreground" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border-0 !bg-muted-foreground" />
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-muted-foreground" />
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-muted-foreground" />

      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="h-3.5 w-3.5" style={{ color }} />
          <span className="font-mono text-xs font-semibold text-foreground">
            {bus.name ?? `Bus ${bus.id}`}
          </span>
        </div>
        <span className="rounded-sm bg-muted px-1 py-px font-mono text-[9px] uppercase text-muted-foreground">
          {busType}
        </span>
      </div>

      <div className="mt-1 flex w-full items-baseline justify-between">
        <span className="font-mono text-[10px] text-muted-foreground">V</span>
        <span className="font-mono text-sm font-bold" style={{ color }}>
          {fmtVoltage(V)}
        </span>
      </div>

      {(bus.p_mw ?? 0) !== 0 && (
        <div className="mt-0.5 flex w-full items-baseline justify-between">
          <span className="font-mono text-[10px] text-muted-foreground">
            {isGen ? "Pgen" : "Pload"}
          </span>
          <span className="font-mono text-[10px] text-foreground">
            {fmtPower(Math.abs(bus.p_mw ?? 0))}
          </span>
        </div>
      )}
    </div>
  );
}

function LineEdgeView(props: EdgeProps<Edge<LineEdgeData>>) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, markerEnd } =
    props;
  const [path] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });
  const loading = data?.loading ?? 0;
  const color = loadingToColor(loading);
  const stroke = Math.max(1.5, Math.min(6, loading / 18));
  const animated = loading > 70;

  return (
    <>
      <BaseEdge
        id={props.id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: stroke,
          strokeDasharray: animated ? "8 6" : undefined,
          animation: animated ? "gridedge-flow 1s linear infinite" : undefined,
        }}
      />
      {/* label */}
      <foreignObject
        x={(sourceX + targetX) / 2 - 28}
        y={(sourceY + targetY) / 2 - 11}
        width={56}
        height={22}
        className="pointer-events-none"
      >
        <div
          className="flex items-center justify-center rounded-sm border border-border bg-card/95 px-1 py-0.5 font-mono text-[10px] shadow-sm"
          style={{ color }}
        >
          {fmtLoading(loading)}
        </div>
      </foreignObject>
    </>
  );
}

const nodeTypes = { bus: BusNodeView };
const edgeTypes = { line: LineEdgeView };

function layout(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "LR", nodesep: 60, ranksep: 90 });
  g.setDefaultEdgeLabel(() => ({}));
  nodes.forEach((n) => g.setNode(n.id, { width: NODE_W, height: NODE_H }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);
  return nodes.map((n) => {
    const pos = g.node(n.id);
    return {
      ...n,
      position: { x: pos.x - NODE_W / 2, y: pos.y - NODE_H / 2 },
      sourcePosition: Position.Right,
      targetPosition: Position.Left,
    };
  });
}

export default function NetworkFlow({ networkCase, solveResult, onSelectBus }: Props) {
  const { nodes, edges } = useMemo(() => {
    const ns: Node<BusNodeData>[] = networkCase.buses.map((b, i) => {
      const V = solveResult?.V_pu?.[i] ?? b.voltage_pu ?? b.V_pu ?? null;
      return {
        id: String(b.id),
        type: "bus",
        position: { x: 0, y: 0 },
        data: { bus: b, V, busType: b.type ?? "PQ" },
      };
    });

    const es: Edge<LineEdgeData>[] = networkCase.lines.map((ln, i) => {
      const from = String(ln.from ?? ln.from_bus);
      const to = String(ln.to ?? ln.to_bus);
      return {
        id: String(ln.id ?? `e-${from}-${to}-${i}`),
        source: from,
        target: to,
        type: "line",
        data: { line: ln, loading: ln.loading_pct ?? 0 },
        markerEnd: { type: MarkerType.ArrowClosed, color: loadingToColor(ln.loading_pct ?? 0) },
      };
    });

    return { nodes: layout(ns, es), edges: es };
  }, [networkCase, solveResult]);

  const onNodeClick = useCallback(
    (_e: React.MouseEvent, node: Node) => onSelectBus?.(node.id),
    [onSelectBus],
  );

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-muted/20">
      <style>{`
        @keyframes gridedge-flow {
          from { stroke-dashoffset: 14; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        proOptions={{ hideAttribution: true }}
        minZoom={0.2}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
      >
        <Background gap={20} size={1} className="!bg-background" />
        <Controls className="!bg-card !border-border" showInteractive={false} />
        <MiniMap
          className="!bg-card !border-border"
          nodeColor={(n) => voltageToColor((n.data as BusNodeData)?.V ?? null)}
          maskColor="hsl(var(--muted) / 0.6)"
          pannable
          zoomable
        />
      </ReactFlow>
    </div>
  );
}
