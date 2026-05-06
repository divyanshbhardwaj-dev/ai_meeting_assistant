import { useParams } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import Layout from "../../../shared/components/Layout";
import { fetchMeetingById } from "../api";
import {
  ChevronLeft,
  Copy,
  Share2,
  ExternalLink,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  LayoutDashboard,
  MessageSquare,
  ListTodo,
  Loader2,
} from "lucide-react";

type LiveLine = { speaker: string; text: string; timestamp: number };
type TranscriptGroup = { speaker: string; timestamp?: number | string; messages: string[] };

const SPEAKER_COLORS = [
  "bg-indigo-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-pink-500",
  "bg-cyan-500",
  "bg-orange-500",
  "bg-teal-500",
  "bg-fuchsia-500",
];

const getSpeakerColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return SPEAKER_COLORS[hash % SPEAKER_COLORS.length];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] || "?") + (parts[1]?.[0] || "")).toUpperCase();
};

const formatTime = (ts?: number | string) => {
  if (!ts) return "";
  const d = new Date(ts);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
};

const parseLine = (line: string): { speaker: string; text: string } => {
  const colonIdx = line.indexOf(": ");
  if (colonIdx < 0) return { speaker: "Unknown", text: line };
  return { speaker: line.slice(0, colonIdx), text: line.slice(colonIdx + 2) };
};

export default function MeetingDetailPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "transcript" | "tasks">("summary");
  const [liveLines, setLiveLines] = useState<LiveLine[]>([]);
  const [activePartial, setActivePartial] = useState<{ speaker: string; text: string } | null>(null);
  const [, setWsConnected] = useState(false);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Initial Data Fetch
  useEffect(() => {
    fetchMeetingById(id!).then((data) => {
      setMeeting(data);
      // Auto-jump to live transcription tab when the meeting is in progress
      if (data.status === "processing") {
        setActiveTab("transcript");
      }
      if (data.transcript) {
        const lines: LiveLine[] = data.transcript
          .split("\n")
          .filter((l: string) => l.trim())
          .map((line: string) => ({ ...parseLine(line), timestamp: 0 }));
        setLiveLines(lines);
      }
    });
  }, [id]);

  // WebSocket Connection for Live Updates
  useEffect(() => {
    if (!id || !meeting || meeting.status === "completed") return;

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
    const wsBaseUrl = /^https?:\/\//.test(API_URL)
      ? API_URL.replace(/^http/, "ws")
      : `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}`;
    const wsUrl = `${wsBaseUrl}/ws/${id}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("WebSocket connected to:", wsUrl);
      setWsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "transcript_update") {
          if (data.is_final) {
            setLiveLines((prev) => [
              ...prev,
              { speaker: data.speaker, text: data.text, timestamp: Date.now() },
            ]);
            setActivePartial(null);
          } else {
            setActivePartial({ speaker: data.speaker, text: data.text });
          }
        } else if (data.type === "status_update") {
          setMeeting((prev: any) => ({ ...prev, status: data.status }));
          // Refetch with a small delay so any post-status DB writes settle.
          if (data.status === "completed" || data.status === "failed") {
            const refetch = (attempt = 0) => {
              fetchMeetingById(id!)
                .then((fresh) => {
                  console.log("[refetch] meeting completion data", {
                    hasTranscriptRaw: Array.isArray(fresh?.transcript_raw) && fresh.transcript_raw.length > 0,
                    hasSummary: !!fresh?.summary,
                    taskCount: fresh?.tasks?.length ?? 0,
                  });
                  setMeeting(fresh);
                  // If summary/transcript still missing and we haven't retried yet, retry once.
                  const incomplete = !fresh?.summary || !(fresh?.transcript_raw?.length || fresh?.tasks?.length);
                  if (incomplete && attempt < 1) {
                    setTimeout(() => refetch(attempt + 1), 1500);
                  }
                })
                .catch((err) => console.error("[refetch] failed", err));
            };
            setTimeout(() => refetch(), 600);
          }
        }
      } catch (err) {
        console.error("WS Message Error:", err);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
      setWsConnected(false);
    };

    return () => ws.close();
  }, [id, meeting?.status]);

  // Auto-scroll transcript
  useEffect(() => {
    if (activeTab === "transcript") {
      transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveLines, activePartial, activeTab]);

  // Group consecutive same-speaker live messages (Slack-style)
  const liveGroups = useMemo<TranscriptGroup[]>(() => {
    const groups: TranscriptGroup[] = [];
    for (const line of liveLines) {
      const last = groups[groups.length - 1];
      if (last && last.speaker === line.speaker) {
        last.messages.push(line.text);
      } else {
        groups.push({
          speaker: line.speaker,
          timestamp: line.timestamp || undefined,
          messages: [line.text],
        });
      }
    }
    return groups;
  }, [liveLines]);

  // Group consecutive same-speaker turns from completed transcript_raw
  const completedGroups = useMemo<TranscriptGroup[]>(() => {
    const raw = meeting?.transcript_raw;
    if (!raw || !Array.isArray(raw)) return [];
    const groups: TranscriptGroup[] = [];
    for (const item of raw) {
      const speaker = item.participant?.name || "Unknown";
      const text = (item.words || []).map((w: any) => w.text).join(" ");
      const ts = item.words?.[0]?.start_timestamp?.absolute;
      const last = groups[groups.length - 1];
      if (last && last.speaker === speaker) {
        last.messages.push(text);
      } else {
        groups.push({ speaker, timestamp: ts, messages: [text] });
      }
    }
    return groups;
  }, [meeting?.transcript_raw]);

  if (!meeting) {
    return (
      <Layout>
        <div className="w-full px-4 py-8 animate-pulse">
          <div className="h-4 w-20 bg-gray-200 rounded mb-4" />
          <div className="flex justify-between items-end mb-8">
            <div className="space-y-3">
              <div className="h-6 w-32 bg-gray-200 rounded" />
              <div className="h-10 w-64 bg-gray-200 rounded" />
              <div className="flex gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded" />
                <div className="h-8 w-24 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="h-12 w-48 bg-gray-200 rounded" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3 space-y-4">
              <div className="h-10 w-64 bg-gray-200 rounded" />
              <div className="h-64 bg-gray-200 rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded" />
              <div className="h-48 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(meeting.meeting_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const participants = (() => {
    if (meeting.participants && meeting.participants.length > 0) {
      return meeting.participants;
    }
    if (meeting.transcript_raw) {
      return Array.from(
        new Map(meeting.transcript_raw.map((item: any) => [item.participant.id, item.participant])).values()
      );
    }
    return [];
  })() as any[];

  const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    completed: { label: "Completed", color: "text-green-700", bg: "bg-green-50", dot: "bg-green-500" },
    failed: { label: "Failed", color: "text-red-700", bg: "bg-red-50", dot: "bg-red-500" },
    pending: { label: "Pending", color: "text-amber-700", bg: "bg-amber-50", dot: "bg-amber-500" },
    processing: { label: "Processing", color: "text-[#4F46E5]", bg: "bg-[#EEF2FF]", dot: "bg-[#4F46E5]" },
  };

  const status = statusConfig[meeting.status] || statusConfig.pending;
  const meetingDate = new Date(
    meeting.transcript_raw?.[0]?.words?.[0]?.start_timestamp?.absolute || meeting.created_at || Date.now()
  );

  return (
    <Layout>
      <div className="w-full px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-1 text-[#777681] hover:text-[#4F46E5] mb-2 transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${status.bg} border border-gray-200`}>
                  {meeting.status === "processing" ? (
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </div>
                      <span className="text-red-600">Live now</span>
                    </div>
                  ) : (
                    <>
                      <div className={`w-2 h-2 rounded-full ${status.dot}`} />
                      <span className={status.color}>{status.label}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#777681] uppercase">
                  <Calendar className="w-3.5 h-3.5" />
                  {meetingDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                </div>
              </div>

              <h1 className="text-2xl lg:text-3xl font-extrabold text-[#0F1523] leading-tight mb-3">
                {meeting.title || "Untitled Meeting Session"}
              </h1>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={copyUrl}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-[#4F46E5] hover:bg-[#EEF2FF] rounded-md text-[#0F1523] text-sm font-bold transition-all active:scale-[0.98] shadow-sm"
                >
                  <Copy className="w-4 h-4" />
                  {copied ? "Copied Link" : "Copy URL"}
                </button>
                <a
                  href={meeting.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md text-sm font-bold transition-all shadow-sm active:scale-[0.98]"
                >
                  <ExternalLink className="w-4 h-4" />
                  Join Original
                </a>
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-md text-[#0F1523] text-sm font-bold transition-all active:scale-[0.98] shadow-sm">
                  <Share2 className="w-4 h-4" />
                  Share Session
                </button>
              </div>
            </div>

            <div className="hidden lg:flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex -space-x-2">
                  {participants?.slice(0, 5).map((p, i) => (
                    <div 
                      key={i} 
                      title={p.name}
                      className="w-8 h-8 rounded-full border-2 border-white bg-[#4F46E5] flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-gray-100"
                    >
                      {p.name.split(" ")[0][0]}{p.name.split(" ")[1]?.[0] || ""}
                    </div>
                  ))}
                  {participants?.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-[#777681] shadow-sm ring-1 ring-gray-100">
                      +{participants.length - 5}
                    </div>
                  )}
                </div>
                <div className="pl-1">
                  <p className="text-[10px] font-bold text-[#777681] uppercase leading-none">Participants</p>
                  <p className="text-sm font-black text-[#0F1523]">{participants?.length || 0} Attended</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {/* Tab Navigation */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4 w-fit border border-gray-200">
              <button
                onClick={() => setActiveTab("summary")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "summary" ? "bg-white text-[#4F46E5] shadow-md border border-gray-200" : "text-[#777681] hover:text-[#0F1523]"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Summary
              </button>
              <button
                onClick={() => setActiveTab("transcript")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "transcript" ? "bg-white text-[#4F46E5] shadow-md border border-gray-200" : "text-[#777681] hover:text-[#0F1523]"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Transcript
                {meeting.status === "processing" && (
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("tasks")}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === "tasks" ? "bg-white text-[#4F46E5] shadow-md border border-gray-200" : "text-[#777681] hover:text-[#0F1523]"
                }`}
              >
                <ListTodo className="w-4 h-4" />
                Tasks
                <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] ${
                  activeTab === "tasks" ? "bg-[#EEF2FF] text-[#4F46E5]" : "bg-gray-200 text-[#777681]"
                }`}>
                  {meeting.tasks?.length || 0}
                </span>
              </button>
            </div>

            {/* Tab Panels */}
            <div className="min-h-125">
              {activeTab === "summary" && (
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  {meeting.summary ? (
                    <div className="space-y-6">
                      <div className="bg-[#F8FAFF] rounded-xl p-6 border border-[#4F46E5]/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F46E5]/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <h3 className="text-base font-bold text-[#0F1523] mb-4 flex items-center gap-2">
                          <div className="w-1.5 h-5 bg-[#4F46E5] rounded-full" />
                          Key Intelligence
                        </h3>
                        <p className="text-[#374151] text-base leading-relaxed font-medium">
                          {meeting.summary}
                        </p>
                      </div>

                      {meeting.key_decisions && meeting.key_decisions.length > 0 && (
                        <div>
                          <h3 className="text-xs font-bold text-[#777681] uppercase mb-4 tracking-widest">Crucial Decisions</h3>
                          <div className="grid gap-3">
                            {meeting.key_decisions.map((decision: string, idx: number) => (
                              <div key={idx} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-[#4F46E5]/30 transition-all group">
                                <div className="w-6 h-6 bg-[#EEF2FF] group-hover:bg-[#4F46E5] group-hover:text-white rounded-md flex items-center justify-center text-[#4F46E5] font-bold text-xs shrink-0 transition-colors">
                                  {idx + 1}
                                </div>
                                <p className="text-sm text-[#374151] font-semibold leading-snug">{decision}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0F1523] uppercase mb-1">No Intelligence Generated</h3>
                      <p className="text-xs text-[#777681] font-medium max-w-xs text-center uppercase tracking-wider">
                        {meeting.status === 'processing' 
                          ? "We're analyzing the conversation in real-time. Summary will appear shortly." 
                          : "Intelligence wasn't generated for this session."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "transcript" && (() => {
                const useCompleted = meeting.status === "completed" && completedGroups.length > 0;
                const groups = useCompleted ? completedGroups : liveGroups;
                const showPartial = !useCompleted && activePartial;
                const isEmpty = groups.length === 0 && !showPartial;
                const isLive = meeting.status === "processing";

                return (
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-150 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-white">
                      <h3 className="text-xs font-bold text-[#777681] uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Meeting Dialogue
                        {groups.length > 0 && (
                          <span className="text-[10px] font-bold text-[#A1A1AA] normal-case tracking-normal">
                            · {groups.length} {groups.length === 1 ? "turn" : "turns"}
                          </span>
                        )}
                      </h3>
                      {isLive && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 uppercase bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                          </span>
                          Live
                        </div>
                      )}
                    </div>

                    {/* Slack-style messages */}
                    <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-200">
                      {isEmpty ? (
                        <div className="flex flex-col items-center justify-center h-full space-y-3 px-4">
                          {isLive ? (
                            <>
                              <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                                <Loader2 className="w-5 h-5 text-[#4F46E5] animate-spin" />
                              </div>
                              <p className="text-[10px] font-bold text-[#777681] uppercase tracking-widest text-center">
                                Connecting to audio stream...
                                <span className="font-medium normal-case text-gray-400 mt-1 block">
                                  Live transcript will appear as people speak
                                </span>
                              </p>
                            </>
                          ) : (
                            <div className="flex flex-col items-center opacity-40 grayscale">
                              <MessageSquare className="w-12 h-12 mb-3" />
                              <p className="font-bold uppercase text-[10px]">No dialogue recorded</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {groups.map((group, idx) => (
                            <div
                              key={idx}
                              className="group/msg flex gap-3 px-5 py-2 hover:bg-gray-50/70 transition-colors"
                            >
                              <div className="shrink-0">
                                <div
                                  className={`w-9 h-9 rounded-md flex items-center justify-center text-[11px] font-bold text-white shadow-sm ${getSpeakerColor(group.speaker)}`}
                                >
                                  {getInitials(group.speaker)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                  <span className="text-[15px] font-bold text-[#0F1523] leading-tight">
                                    {group.speaker}
                                  </span>
                                  {group.timestamp && (
                                    <span className="text-[11px] text-[#A1A1AA] font-medium">
                                      {formatTime(group.timestamp)}
                                    </span>
                                  )}
                                </div>
                                <div className="space-y-1">
                                  {group.messages.map((msg, mIdx) => (
                                    <p
                                      key={mIdx}
                                      className="text-[14px] text-[#1D1C1D] leading-[1.46] break-words"
                                    >
                                      {msg}
                                    </p>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}

                          {showPartial && activePartial && (() => {
                            const lastGroup = groups[groups.length - 1];
                            const continuation = lastGroup && lastGroup.speaker === activePartial.speaker;
                            return (
                              <div
                                className={`flex gap-3 px-5 transition-colors ${
                                  continuation ? "py-1 -mt-1" : "py-2"
                                }`}
                              >
                                <div className="shrink-0">
                                  {continuation ? (
                                    <div className="w-9 h-9" />
                                  ) : (
                                    <div
                                      className={`w-9 h-9 rounded-md flex items-center justify-center text-[11px] font-bold text-white shadow-sm opacity-70 ${getSpeakerColor(activePartial.speaker)}`}
                                    >
                                      {getInitials(activePartial.speaker)}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  {!continuation && (
                                    <div className="flex items-baseline gap-2 mb-0.5">
                                      <span className="text-[15px] font-bold text-gray-500 leading-tight">
                                        {activePartial.speaker}
                                      </span>
                                      <span className="text-[10px] text-[#A1A1AA] font-medium italic">
                                        typing…
                                      </span>
                                    </div>
                                  )}
                                  <p className="text-[14px] text-gray-500 leading-[1.46] italic flex items-center gap-2 break-words">
                                    {activePartial.text}
                                    <span className="inline-flex gap-0.5 ml-0.5">
                                      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                      <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></span>
                                    </span>
                                  </p>
                                </div>
                              </div>
                            );
                          })()}

                          <div ref={transcriptEndRef} />
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}

              {activeTab === "tasks" && (
                <div className="grid gap-3">
                  {meeting.tasks && meeting.tasks.length > 0 ? (
                    meeting.tasks.map((task: any) => (
                      <div key={task.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#4F46E5] hover:shadow-md transition-all group/task relative overflow-hidden">
                        <div className="flex items-start gap-4">
                          <button className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                            task.is_completed 
                              ? "bg-green-50 border-green-200 text-green-600" 
                              : "bg-gray-50 border-gray-200 text-gray-300 group-hover/task:border-[#4F46E5] group-hover/task:bg-[#EEF2FF]"
                          }`}>
                            <CheckCircle2 className={`w-4 h-4 ${task.is_completed ? "opacity-100" : "opacity-40"}`} />
                          </button>
                          <div className="flex-1">
                            <h4 className={`text-base font-bold text-[#0F1523] mb-2 group-hover/task:text-[#4F46E5] transition-colors ${task.is_completed ? "line-through opacity-50" : ""}`}>
                              {task.task}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100">
                                <Users className="w-3.5 h-3.5 text-[#777681]" />
                                <span className="text-[10px] font-bold text-[#0F1523] uppercase">{task.owner || "Unassigned"}</span>
                              </div>
                              {task.due_date && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-md border border-gray-100 text-[#777681]">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-bold uppercase">
                                    {new Date(task.due_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                  </span>
                                </div>
                              )}
                              {task.priority && (
                                <div
                                  className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase border shadow-sm ${
                                    task.priority === "high"
                                      ? "bg-red-50 text-red-600 border-red-100"
                                      : task.priority === "medium"
                                      ? "bg-amber-50 text-amber-600 border-amber-100"
                                      : "bg-blue-50 text-blue-600 border-blue-100"
                                  }`}
                                >
                                  {task.priority} Priority
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-20 text-center">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ListTodo className="w-8 h-8 text-gray-300" />
                      </div>
                      <h3 className="text-sm font-bold text-[#0F1523] uppercase mb-1">No Actions Identified</h3>
                      <p className="text-xs text-[#777681] font-medium max-w-xs mx-auto uppercase tracking-wider">
                        We haven't detected any specific tasks or follow-ups in the conversation yet.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <div className="bg-[#0F1523] rounded-2xl p-5 text-white relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#4F46E5]/30 blur-[60px] rounded-full -mr-16 -mt-16" />
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-[#4F46E5] rounded-full" />
                Session Metadata
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[9px] font-bold text-gray-500 uppercase mb-1.5 tracking-wider">Connection Link</p>
                  <p className="text-xs font-bold text-gray-300 truncate bg-white/5 p-2.5 rounded-lg border border-white/10 select-all cursor-pointer hover:bg-white/10 transition-colors">
                    {meeting.meeting_url}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-1 tracking-wider">Dialogue</p>
                    <div className="flex items-end gap-1">
                      <p className="text-xl font-black text-white">{liveLines.length || meeting.transcript_text?.split("\n").length || 0}</p>
                      <span className="text-[9px] font-bold text-gray-400 mb-1 uppercase">Turns</span>
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-all">
                    <p className="text-[9px] font-bold text-gray-500 uppercase mb-1 tracking-wider">Attendance</p>
                    <div className="flex items-end gap-1">
                      <p className="text-xl font-black text-white">{participants?.length || 0}</p>
                      <span className="text-[9px] font-bold text-gray-400 mb-1 uppercase">Participants</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#777681] mb-4 flex items-center gap-2">
                <div className="w-1 h-3 bg-[#4F46E5] rounded-full" />
                Who's Present
              </h3>
              <div className="space-y-3">
                {participants?.length > 0 ? (
                  participants.map((participant: any) => (
                    <div key={participant.id} className="flex items-center gap-3 group p-1.5 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="w-9 h-9 bg-[#EEF2FF] rounded-lg flex items-center justify-center text-[#4F46E5] text-[11px] font-bold shadow-sm border border-[#4F46E5]/10">
                        {participant.name.split(" ")[0][0]}{participant.name.split(" ")[1]?.[0] || ""}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#0F1523] truncate">{participant.name}</p>
                        <p className="text-[10px] font-medium text-[#777681] truncate">{participant.email || "No email provided"}</p>
                      </div>
                      {participant.is_organizer === "True" && (
                        <div className="w-1.5 h-1.5 bg-[#4F46E5] rounded-full ring-4 ring-[#EEF2FF]" title="Organizer" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-bold text-[#777681] text-center py-4 uppercase">Waiting for data...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}