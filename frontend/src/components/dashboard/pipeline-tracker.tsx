"use client";

import { Card } from "@/components/ui/card";
import {
  FileText,
  Search,
  MessageSquare,
  UserCheck,
  BarChart3,
  Mail,
  Gift,
  XCircle,
} from "lucide-react";

const PIPELINE_STAGES = [
  { name: "Applied", icon: FileText, color: "text-blue-400", bg: "bg-blue-400/10" },
  { name: "Pre-Screening", icon: Search, color: "text-teal", bg: "bg-teal/10" },
  { name: "Interview", icon: MessageSquare, color: "text-purple-400", bg: "bg-purple-400/10" },
  { name: "Onboarded", icon: UserCheck, color: "text-emerald", bg: "bg-emerald/10" },
  { name: "Scored", icon: BarChart3, color: "text-amber", bg: "bg-amber/10" },
  { name: "Outreach", icon: Mail, color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { name: "Offered", icon: Gift, color: "text-green-400", bg: "bg-green-400/10" },
  { name: "Rejected", icon: XCircle, color: "text-red-400", bg: "bg-red-400/10" },
];

export default function PipelineTracker({ totalCandidates }: { totalCandidates?: number }) {
  const total = totalCandidates || 0;

  const counts = [
    total,
    Math.round(total * 0.85),
    Math.round(total * 0.4),
    Math.round(total * 0.25),
    total,
    Math.round(total * 0.15),
    Math.round(total * 0.08),
    Math.round(total * 0.12),
  ];

  return (
    <Card className="bg-card border-border px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Recruitment Pipeline
        </h3>
        <span className="text-[10px] text-muted-foreground/70">Applied to Offered</span>
      </div>
      <div className="grid grid-cols-8 gap-px bg-border rounded-lg overflow-hidden">
        {PIPELINE_STAGES.map((stage, i) => (
          <div key={stage.name} className="bg-card px-1.5 py-2 text-center">
            <div className={`mx-auto w-6 h-6 rounded-md ${stage.bg} flex items-center justify-center mb-1`}>
              <stage.icon className={`w-3.5 h-3.5 ${stage.color}`} />
            </div>
            <p className={`text-[9px] font-semibold ${stage.color} leading-tight`}>
              {stage.name}
            </p>
            <p className="text-base font-bold leading-tight mt-0.5">{counts[i]}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
