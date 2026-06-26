const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  return res.json();
}

export const api = {
  dashboard: {
    getStats: () => fetchAPI<any>("/api/dashboard/stats"),
    getCharts: () => fetchAPI<any>("/api/dashboard/charts"),
    getJD: () => fetchAPI<any>("/api/dashboard/jd"),
  },
  candidates: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return fetchAPI<any>(`/api/candidates${qs}`);
    },
    get: (id: string) => fetchAPI<any>(`/api/candidates/${id}`),
    update: (id: string, data: any) =>
      fetchAPI<any>(`/api/candidates/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    shortlist: (id: string) =>
      fetchAPI<any>(`/api/candidates/${id}/shortlist`, { method: "POST" }),
    reject: (id: string) =>
      fetchAPI<any>(`/api/candidates/${id}/reject`, { method: "POST" }),
    outreach: (id: string) =>
      fetchAPI<any>(`/api/candidates/${id}/outreach`, { method: "POST" }),
    outreachPreview: (id: string) =>
      fetchAPI<any>(`/api/candidates/${id}/outreach-preview`),
    export: () => `${API_BASE}/api/candidates/export`,
    compare: (ids: string[]) =>
      fetchAPI<any>("/api/candidates/compare", {
        method: "POST",
        body: JSON.stringify({ candidate_ids: ids }),
      }),
  },
  chat: {
    send: (message: string) =>
      fetchAPI<any>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      }),
    suggestions: () => fetchAPI<any>("/api/chat/suggestions"),
    preload: () => fetchAPI<any>("/api/chat/preload"),
  },
  upload: {
    resumes: async (files: File[]) => {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        body: formData,
      });
      return res.json();
    },
    ingest: () => fetchAPI<any>("/api/upload/ingest", { method: "POST" }),
    status: () => fetchAPI<any>("/api/upload/status"),
  },
};
