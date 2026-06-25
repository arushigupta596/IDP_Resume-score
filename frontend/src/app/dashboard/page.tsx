"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { DashboardStats, ChartData, Candidate } from "@/types";
import StatsCards from "@/components/dashboard/stats-cards";
import PipelineTracker from "@/components/dashboard/pipeline-tracker";
import ScoreDistribution from "@/components/dashboard/score-distribution-chart";
import CriteriaBreakdown from "@/components/dashboard/criteria-breakdown-chart";
import CandidatesTable from "@/components/dashboard/candidates-table";
import {
  Briefcase,
  FileText,
  Download,
  X,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [charts, setCharts] = useState<ChartData | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [jdOpen, setJdOpen] = useState(false);
  const [jdContent, setJdContent] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [s, c, cands] = await Promise.all([
          api.dashboard.getStats(),
          api.dashboard.getCharts(),
          api.candidates.list({ limit: "10", sort_by: "overall_score", sort_order: "desc" }),
        ]);
        setStats(s);
        setCharts(c);
        setCandidates(cands.candidates || []);
      } catch (e) {
        console.error("Failed to load dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleViewJD = async () => {
    if (!jdContent) {
      try {
        const data = await api.dashboard.getJD();
        setJdContent(data.content || "No JD content available.");
      } catch {
        setJdContent("Failed to load Job Description.");
      }
    }
    setJdOpen(true);
  };

  const handleExport = () => {
    window.open(api.candidates.export(), "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-6 bg-teal rounded-full" />
        <h1 className="text-xl font-semibold">Dashboard</h1>
      </div>

      {/* Hero Banner */}
      <div className="rounded-xl bg-gradient-to-r from-[var(--card)] to-[var(--secondary)] border border-border p-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex gap-2 mb-3">
              <Badge className="bg-teal/20 text-teal border-0 text-xs">
                <Briefcase className="w-3 h-3 mr-1" />
                DP World
              </Badge>
              <Badge className="bg-amber/20 text-amber border-0 text-xs">
                {stats?.total_candidates || 0} candidates scored
              </Badge>
            </div>
            <h2 className="text-2xl font-bold mb-1.5">
              <span className="text-teal">Resume Screening</span> & Scoring
            </h2>
            <p className="text-muted-foreground text-sm max-w-2xl leading-relaxed">
              AI-powered candidate evaluation for Market Research Analyst role in maritime logistics.
              Score and rank candidates across 5 key criteria dimensions.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="border-border text-xs h-8"
              onClick={handleViewJD}
            >
              <FileText className="w-3.5 h-3.5 mr-1.5" />
              View JD
            </Button>
            <Button
              size="sm"
              className="bg-teal hover:bg-teal-dim text-white text-xs h-8"
              onClick={handleExport}
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {stats && <StatsCards stats={stats} />}

      <PipelineTracker totalCandidates={stats?.total_candidates} />

      <div className="grid grid-cols-3 gap-4">
        {charts && <ScoreDistribution data={charts.score_distribution} />}
        {charts && <CriteriaBreakdown data={charts.criteria_averages} />}

        {/* Criteria Weightage */}
        <Card className="bg-card border-border px-4 py-3">
          <div className="flex items-center gap-1.5 mb-3">
            <Target className="w-3.5 h-3.5 text-teal" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Scoring Criteria
            </h3>
          </div>
          <div className="space-y-2.5">
            {[
              { name: "Maritime & Offshore", weight: 25, color: "#14b8a6" },
              { name: "Market Analysis", weight: 25, color: "#3b82f6" },
              { name: "MS Tools & BI", weight: 20, color: "#f59e0b" },
              { name: "Revenue Linking", weight: 15, color: "#8b5cf6" },
              { name: "Data Insights", weight: 15, color: "#ec4899" },
            ].map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[11px] text-foreground">{c.name}</span>
                  <span className="text-[11px] font-semibold" style={{ color: c.color }}>
                    {c.weight}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${c.weight * 4}%`, background: c.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-border">
            <p className="text-[10px] text-muted-foreground/70 leading-relaxed">
              Each criterion scored 0-10, weighted to produce an overall score out of 100.
            </p>
          </div>
        </Card>
      </div>

      <CandidatesTable candidates={candidates} title="Top Candidates" />

      {/* JD Modal */}
      {jdOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl mx-4">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal" />
                <h3 className="text-sm font-semibold">Job Description</h3>
              </div>
              <button
                onClick={() => setJdOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <pre className="text-sm text-foreground whitespace-pre-wrap leading-relaxed font-sans">
                {jdContent}
              </pre>
            </div>
            <div className="px-5 py-3 border-t border-border flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => setJdOpen(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
