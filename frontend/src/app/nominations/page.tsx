"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Candidate } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Search,
  Download,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  User,
} from "lucide-react";

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-emerald/20 text-emerald border-emerald/30"
      : score >= 45
        ? "bg-amber/20 text-amber border-amber/30"
        : "bg-red-500/20 text-red-400 border-red-500/30";
  return (
    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-xl text-lg font-bold border ${color}`}>
      {score}
    </span>
  );
}

function MiniBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full rounded-full"
        style={{ width: `${(value / max) * 100}%`, background: color }}
      />
    </div>
  );
}

export default function NominationsPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
  const [loading, setLoading] = useState(true);

  const loadCandidates = async () => {
    setLoading(true);
    const params: Record<string, string> = {
      sort_by: "overall_score",
      sort_order: sortOrder,
      limit: "200",
    };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    const data = await api.candidates.list(params);
    setCandidates(data.candidates || []);
    setLoading(false);
  };

  useEffect(() => {
    loadCandidates();
  }, [sortOrder, statusFilter]);

  const handleSearch = () => loadCandidates();

  const handleAction = async (id: string, action: "shortlist" | "reject") => {
    if (action === "shortlist") await api.candidates.shortlist(id);
    else await api.candidates.reject(id);
    loadCandidates();
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-1 h-6 bg-teal rounded-full" />
        <h1 className="text-xl font-semibold">Candidates</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search candidates..."
            className="pl-9 bg-card border-border"
          />
        </div>
        <div className="flex gap-2">
          {["", "new", "shortlisted", "outreach", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                statusFilter === s
                  ? "border-teal bg-teal/10 text-teal"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
          className="border-border"
        >
          <ArrowUpDown className="w-3 h-3 mr-1" />
          Score {sortOrder === "desc" ? "High-Low" : "Low-High"}
        </Button>
        <a href={api.candidates.export()} className="ml-auto">
          <Button variant="outline" size="sm" className="border-border">
            <Download className="w-3 h-3 mr-1" />
            Export CSV
          </Button>
        </a>
      </div>

      {/* Candidate Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal border-t-transparent" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {candidates.map((c) => (
            <Link key={c.id} href={`/nominations/${c.id}`}>
              <Card className="bg-card border-border p-5 hover:border-teal/30 transition-colors cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{c.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.current_role}
                        </p>
                      </div>
                      <ScoreBadge score={c.overall_score} />
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="w-16 truncate">Maritime</span>
                        <MiniBar value={c.score_maritime} color="#14b8a6" />
                        <span className="w-4 text-right">{c.score_maritime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="w-16 truncate">Analysis</span>
                        <MiniBar value={c.score_market_analysis} color="#3b82f6" />
                        <span className="w-4 text-right">{c.score_market_analysis}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="w-16 truncate">MS Tools</span>
                        <MiniBar value={c.score_microsoft_tools} color="#f59e0b" />
                        <span className="w-4 text-right">{c.score_microsoft_tools}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="w-16 truncate">Revenue</span>
                        <MiniBar value={c.score_revenue_linking} color="#8b5cf6" />
                        <span className="w-4 text-right">{c.score_revenue_linking}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="w-16 truncate">Insights</span>
                        <MiniBar value={c.score_data_insights} color="#ec4899" />
                        <span className="w-4 text-right">{c.score_data_insights}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <Badge
                        className={`border-0 text-[10px] ${
                          c.recommendation === "recommended"
                            ? "bg-emerald/20 text-emerald"
                            : c.recommendation === "maybe"
                              ? "bg-amber/20 text-amber"
                              : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {c.recommendation}
                      </Badge>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAction(c.id, "shortlist");
                          }}
                          className="p-1 rounded hover:bg-emerald/10"
                          title="Shortlist"
                        >
                          <CheckCircle className="w-4 h-4 text-emerald" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleAction(c.id, "reject");
                          }}
                          className="p-1 rounded hover:bg-red-500/10"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
