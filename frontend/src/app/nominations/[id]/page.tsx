"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Candidate } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  CheckCircle,
  XCircle,
  HelpCircle,
  Save,
  Download,
} from "lucide-react";

const CRITERIA = [
  { key: "score_maritime", label: "Maritime & Offshore", color: "#14b8a6", weight: "25%" },
  { key: "score_market_analysis", label: "Market Analysis", color: "#3b82f6", weight: "25%" },
  { key: "score_microsoft_tools", label: "Microsoft Tools", color: "#f59e0b", weight: "20%" },
  { key: "score_revenue_linking", label: "Revenue Linking", color: "#8b5cf6", weight: "15%" },
  { key: "score_data_insights", label: "Data Insights", color: "#ec4899", weight: "15%" },
];

export default function CandidateProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.candidates.get(params.id as string).then((data) => {
      setCandidate(data);
      setNotes(data.hr_notes || "");
    });
  }, [params.id]);

  if (!candidate) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal border-t-transparent" />
      </div>
    );
  }

  const handleStatus = async (status: string) => {
    await api.candidates.update(candidate.id, { status });
    setCandidate({ ...candidate, status });
  };

  const handleSaveNotes = async () => {
    setSaving(true);
    await api.candidates.update(candidate.id, { hr_notes: notes });
    setSaving(false);
  };

  const scoreColor = candidate.overall_score >= 70
    ? "text-emerald border-emerald"
    : candidate.overall_score >= 45
      ? "text-amber border-amber"
      : "text-red-400 border-red-500";

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.push("/nominations")}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Nominations
      </button>

      {/* Header */}
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal/20 to-blue-500/20 flex items-center justify-center text-2xl font-bold text-teal">
          {candidate.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{candidate.name}</h1>
          <p className="text-muted-foreground">{candidate.current_role}</p>
          {candidate.current_company && (
            <p className="text-sm text-muted-foreground">at {candidate.current_company}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            {candidate.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {candidate.email}
              </span>
            )}
            {candidate.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />
                {candidate.phone}
              </span>
            )}
            {candidate.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {candidate.location}
              </span>
            )}
          </div>
        </div>
        <div className={`w-24 h-24 rounded-2xl border-2 ${scoreColor} flex flex-col items-center justify-center`}>
          <span className="text-3xl font-bold">{candidate.overall_score}</span>
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
      </div>

      {/* Quick Info + Actions */}
      <div className="flex gap-3">
        {candidate.education && (
          <Badge variant="secondary" className="gap-1">
            <GraduationCap className="w-3 h-3" />
            {candidate.education}
          </Badge>
        )}
        <Badge variant="secondary" className="gap-1">
          <Briefcase className="w-3 h-3" />
          {candidate.years_experience} yrs experience
        </Badge>
        <Badge
          className={`border-0 ${
            candidate.recommendation === "recommended"
              ? "bg-emerald/20 text-emerald"
              : candidate.recommendation === "maybe"
                ? "bg-amber/20 text-amber"
                : "bg-red-500/20 text-red-400"
          }`}
        >
          AI: {candidate.recommendation}
        </Badge>
        <div className="ml-auto flex gap-2">
          <Button
            size="sm"
            variant={candidate.status === "shortlisted" ? "default" : "outline"}
            className={candidate.status === "shortlisted" ? "bg-emerald hover:bg-emerald/80" : "border-emerald text-emerald"}
            onClick={() => handleStatus("shortlisted")}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            Shortlist
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-amber text-amber"
            onClick={() => handleStatus("interviewed")}
          >
            <HelpCircle className="w-3.5 h-3.5 mr-1" />
            Maybe
          </Button>
          <Button
            size="sm"
            variant={candidate.status === "rejected" ? "default" : "outline"}
            className={candidate.status === "rejected" ? "bg-red-500 hover:bg-red-600" : "border-red-500 text-red-400"}
            onClick={() => handleStatus("rejected")}
          >
            <XCircle className="w-3.5 h-3.5 mr-1" />
            Reject
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Score Breakdown */}
        <Card className="bg-card border-border p-5 col-span-2">
          <h3 className="text-sm font-semibold mb-4">AI Score Breakdown</h3>
          <div className="space-y-4">
            {CRITERIA.map((cr) => {
              const val = candidate[cr.key as keyof Candidate] as number;
              return (
                <div key={cr.key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm">{cr.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        weight: {cr.weight}
                      </span>
                      <span className="text-sm font-bold" style={{ color: cr.color }}>
                        {val}/10
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(val / 10) * 100}%`,
                        background: cr.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Skills */}
        <Card className="bg-card border-border p-5">
          <h3 className="text-sm font-semibold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((s) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s}
              </Badge>
            ))}
          </div>
        </Card>

        {/* AI Assessment */}
        <Card className="bg-card border-border p-5 col-span-2">
          <h3 className="text-sm font-semibold mb-3">AI Assessment</h3>
          <p className="text-sm text-muted-foreground mb-4">{candidate.ai_summary}</p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-emerald mb-2">Strengths</h4>
              <ul className="space-y-1">
                {candidate.ai_strengths.map((s, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald mt-0.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber mb-2">Areas of Concern</h4>
              <ul className="space-y-1">
                {candidate.ai_weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <XCircle className="w-3 h-3 text-amber mt-0.5 flex-shrink-0" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* HR Notes */}
        <Card className="bg-card border-border p-5">
          <h3 className="text-sm font-semibold mb-3">HR Notes</h3>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this candidate..."
            className="bg-secondary border-border min-h-[120px] mb-3"
          />
          <Button
            size="sm"
            onClick={handleSaveNotes}
            disabled={saving}
            className="bg-teal hover:bg-teal-dim text-white"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            {saving ? "Saving..." : "Save Notes"}
          </Button>
        </Card>
      </div>
    </div>
  );
}
