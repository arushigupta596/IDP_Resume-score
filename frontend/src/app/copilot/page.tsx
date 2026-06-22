"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api } from "@/lib/api";
import { ChatMessageType } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Upload,
  Bot,
  User,
  Loader2,
  FileText,
  CheckCircle,
  X,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";

export default function CopilotPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      role: "assistant",
      content:
        "Hello! I'm your AI Copilot for candidate evaluation. I can help you find the best candidates, compare scores, and answer questions about the applicant pool. Ask me anything or upload resumes to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [preloaded, setPreloaded] = useState<Record<string, any>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    processed: number;
    total: number;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    onDrop: async (files) => {
      setUploading(true);
      setUploadResult(null);
      try {
        const result = await api.upload.resumes(files);
        setUploadResult({ processed: result.processed, total: result.total });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Successfully processed ${result.processed} out of ${result.total} resumes. ${result.errors?.length ? `\n\nErrors:\n${result.errors.join("\n")}` : "All resumes scored and ready for analysis."}`,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Failed to upload resumes. Please try again." },
        ]);
      } finally {
        setUploading(false);
      }
    },
  });

  useEffect(() => {
    api.chat.suggestions().then((data) => setSuggestions(data.suggestions || []));
    api.chat.preload().then((data) => setPreloaded(data.cached || {})).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (msg: string) => {
    if (!msg.trim()) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);

    const cached = preloaded[msg];
    if (cached) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: cached.response,
          candidates: cached.candidates,
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const data = await api.chat.send(msg);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          candidates: data.candidates,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I encountered an error. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <div className="p-6 pb-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-teal rounded-full" />
          <h1 className="text-xl font-semibold">AI Copilot</h1>
        </div>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-4 mb-4 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-teal bg-teal/5"
              : "border-border hover:border-teal/50"
          }`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing resumes...
            </div>
          ) : uploadResult ? (
            <div className="flex items-center justify-center gap-2 text-sm text-emerald">
              <CheckCircle className="w-4 h-4" />
              {uploadResult.processed}/{uploadResult.total} resumes processed
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadResult(null);
                }}
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Upload className="w-4 h-4" />
              Drag & drop resumes here or click to upload (PDF/DOCX, up to 100 files)
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 px-6">
        <div className="space-y-4 pb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-teal/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-teal" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-xl p-4 text-sm ${
                  msg.role === "user"
                    ? "bg-teal/20 text-foreground"
                    : "bg-card border border-border"
                }`}
              >
                <div className="prose dark:prose-invert prose-sm max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_p]:my-1 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mt-1 [&_h3]:mb-1 [&_strong]:text-teal [&_table]:text-xs [&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1 [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_td]:border [&_td]:border-border [&_th]:bg-secondary">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>

                {msg.candidates && msg.candidates.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.candidates.slice(0, 5).map((c) => (
                      <Link
                        key={c.id}
                        href={`/nominations/${c.id}`}
                        className="block bg-secondary/50 rounded-lg p-3 hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">{c.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {c.current_role}
                              {c.current_company ? ` at ${c.current_company}` : ""}
                            </p>
                          </div>
                          <span
                            className={`text-lg font-bold ${
                              c.overall_score >= 70
                                ? "text-emerald"
                                : c.overall_score >= 45
                                  ? "text-amber"
                                  : "text-red-400"
                            }`}
                          >
                            {c.overall_score}
                          </span>
                        </div>
                        <div className="flex gap-1 mt-2">
                          {c.skills?.slice(0, 4).map((s) => (
                            <Badge
                              key={s}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {s}
                            </Badge>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-teal" />
              </div>
              <div className="bg-card border border-border rounded-xl p-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Suggestion Chips & Input */}
      <div className="px-6 pb-6">
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.slice(0, 5).map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-teal/50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input)}
            placeholder="Ask about candidates, scores, or comparisons..."
            className="bg-card border-border"
            disabled={loading}
          />
          <Button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="bg-teal hover:bg-teal-dim text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
