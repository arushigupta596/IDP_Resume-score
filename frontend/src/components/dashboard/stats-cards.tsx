"use client";

import { DashboardStats } from "@/types";
import { Card } from "@/components/ui/card";
import { Users, BarChart3, Trophy, CheckCircle } from "lucide-react";

export default function StatsCards({ stats }: { stats: DashboardStats }) {
  const cards = [
    {
      icon: Users,
      value: stats.total_candidates,
      label: "Candidates",
      sub: "resumes processed",
      color: "text-teal",
      bg: "bg-teal/10",
    },
    {
      icon: BarChart3,
      value: stats.average_score.toFixed(1),
      label: "Avg Score",
      sub: "out of 100",
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
    {
      icon: Trophy,
      value: stats.top_scorer_score,
      label: "Top Score",
      sub: stats.top_scorer_name,
      color: "text-amber",
      bg: "bg-amber/10",
    },
    {
      icon: CheckCircle,
      value: stats.shortlisted_count,
      label: "Shortlisted",
      sub: `${stats.recommended_count} AI recommended`,
      color: "text-emerald",
      bg: "bg-emerald/10",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {cards.map((c) => (
        <Card key={c.label} className="bg-card border-border px-3 py-2.5 text-center">
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <div className={`w-5 h-5 rounded ${c.bg} flex items-center justify-center shrink-0`}>
              <c.icon className={`w-3 h-3 ${c.color}`} />
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">{c.label}</p>
          </div>
          <p className="text-lg font-bold text-foreground leading-tight">{c.value}</p>
          <p className="text-[10px] text-muted-foreground/70 mt-0.5 truncate">{c.sub}</p>
        </Card>
      ))}
    </div>
  );
}
