"use client";

import { Candidate } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald/20 text-emerald"
      : score >= 45
        ? "bg-amber/20 text-amber"
        : "bg-red-500/20 text-red-400";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${color}`}>
      {score}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-blue-500/20 text-blue-400",
    shortlisted: "bg-emerald/20 text-emerald",
    rejected: "bg-red-500/20 text-red-400",
    interviewed: "bg-purple-500/20 text-purple-400",
  };
  return (
    <Badge className={`border-0 text-xs ${styles[status] || styles.new}`}>
      {status}
    </Badge>
  );
}

export default function CandidatesTable({
  candidates,
  title = "Top Candidates & Coverage",
}: {
  candidates: Candidate[];
  title?: string;
}) {
  return (
    <Card className="bg-card border-border px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
        <Link
          href="/nominations"
          className="text-xs text-teal hover:text-teal-dim flex items-center gap-1"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-xs">
              <th className="text-left py-3 px-2 font-medium">Candidate</th>
              <th className="text-left py-3 px-2 font-medium">Score</th>
              <th className="text-left py-3 px-2 font-medium">Key Skills</th>
              <th className="text-left py-3 px-2 font-medium">Experience</th>
              <th className="text-left py-3 px-2 font-medium">Status</th>
              <th className="text-right py-3 px-2 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30">
                <td className="py-3 px-2">
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.current_role}</p>
                  </div>
                </td>
                <td className="py-3 px-2">
                  <ScoreBadge score={c.overall_score} />
                </td>
                <td className="py-3 px-2">
                  <div className="flex flex-wrap gap-1">
                    {c.skills.slice(0, 3).map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-secondary px-1.5 py-0.5 rounded"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-3 px-2 text-muted-foreground">
                  {c.years_experience} yrs
                </td>
                <td className="py-3 px-2">
                  <StatusBadge status={c.status} />
                </td>
                <td className="py-3 px-2 text-right">
                  <Link
                    href={`/nominations/${c.id}`}
                    className="text-xs text-teal hover:underline"
                  >
                    View profile
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
