"use client";

import { PipelineStage } from "@/types";
import { Card } from "@/components/ui/card";

const STAGE_COLORS = [
  "text-teal",
  "text-teal",
  "text-blue-400",
  "text-amber",
  "text-emerald",
  "text-purple-400",
];

export default function PipelineTracker({ stages }: { stages: PipelineStage[] }) {
  return (
    <Card className="bg-card border-border px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Screening Pipeline
        </h3>
        <span className="text-[10px] text-muted-foreground/70">Upload to appointment</span>
      </div>
      <div className="grid grid-cols-6 gap-px bg-border rounded-lg overflow-hidden">
        {stages.map((stage, i) => (
          <div key={stage.stage} className="bg-card px-2 py-2 text-center">
            <p className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">
              Step {stage.stage}
            </p>
            <p className={`text-[11px] font-semibold ${STAGE_COLORS[i] || "text-foreground"}`}>
              {stage.name}
            </p>
            <p className="text-base font-bold leading-tight">{stage.count}</p>
            <p className="text-[9px] text-muted-foreground">{stage.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
