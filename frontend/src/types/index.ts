export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  years_experience: number;
  education: string;
  current_role: string;
  current_company: string;
  skills: string[];
  resume_filename: string;
  overall_score: number;
  score_maritime: number;
  score_market_analysis: number;
  score_microsoft_tools: number;
  score_revenue_linking: number;
  score_data_insights: number;
  ai_summary: string;
  ai_strengths: string[];
  ai_weaknesses: string[];
  recommendation: string;
  status: string;
  hr_notes: string;
  created_at: string | null;
  updated_at: string | null;
}

export interface DashboardStats {
  total_candidates: number;
  average_score: number;
  top_scorer_name: string;
  top_scorer_score: number;
  shortlisted_count: number;
  rejected_count: number;
  new_count: number;
  recommended_count: number;
}

export interface PipelineStage {
  stage: string;
  name: string;
  count: number;
  label: string;
}

export interface ChartData {
  score_distribution: Record<string, number>;
  criteria_averages: Record<string, number>;
  experience_distribution: Record<string, number>;
  top_skills: { skill: string; count: number }[];
  pipeline: PipelineStage[];
}

export interface ChatResponse {
  response: string;
  candidates: Candidate[];
}

export interface ChatMessageType {
  role: "user" | "assistant";
  content: string;
  candidates?: Candidate[];
}
