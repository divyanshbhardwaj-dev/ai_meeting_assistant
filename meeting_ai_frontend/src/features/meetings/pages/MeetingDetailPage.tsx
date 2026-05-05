import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Layout from "../../../shared/components/Layout";
import { fetchMeetingById } from "../api";
import {
  ChevronLeft,
  Copy,
  ExternalLink,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Mic,
  ListChecks,
  Zap,
} from "lucide-react";

export default function MeetingDetailPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "summary" | "transcript" | "tasks"
  >("summary");
  
  // Live transcript state
  const [liveTranscript, setLiveTranscript] = useState<{speaker: string, text: string}[]>([]);
  const [activePartial, setActivePartial] = useState<{speaker: string, text: string} | null>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let pollingInterval: any = null;
    let reconnectTimeout: any = null;
    let reconnectAttempts = 0;
    let wsConnected = false;
    let unmounted = false;

    const parseTranscriptLines = (transcript: string) =>
      transcript.split('\n').filter(Boolean).map((line: string) => {
        const splitIdx = line.indexOf(':');
        if (splitIdx > -1) {
          return { speaker: line.slice(0, splitIdx).trim(), text: line.slice(splitIdx + 1).trim() };
        }
        return { speaker: "System", text: line };
      });

    const loadMeeting = async () => {
      const data = await fetchMeetingById(id!);
      setMeeting(data);

      if (!wsConnected && (data.transcript_text || data.transcript)) {
        setLiveTranscript(parseTranscriptLines(data.transcript_text || data.transcript));
      }
    };

    loadMeeting();

    const setupWebSocket = () => {
      if (unmounted) return;

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      let wsUrl: string;
      if (apiUrl && apiUrl !== "/") {
        wsUrl = apiUrl.replace(/^http/, "ws").replace(/\/$/, "") + `/ws/${id}`;
      } else {
        const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        wsUrl = `${wsProtocol}//${window.location.host}/ws/${id}`;
      }
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        wsConnected = true;
        reconnectAttempts = 0;
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "transcript_update") {
            if (data.is_final) {
               setLiveTranscript(prev => [...prev, { speaker: data.speaker, text: data.text }]);
               setActivePartial(null);
            } else {
               setActivePartial({ speaker: data.speaker, text: data.text });
            }
          } else if (data.type === "status_update") {
            setMeeting((prev: any) => prev ? { ...prev, status: data.status } : prev);
            // Refresh full meeting data to get final transcript, summary, etc.
            loadMeeting();
          }
        } catch (e) {
          console.error("Error parsing WS message:", e);
        }
      };

      ws.onerror = () => {
        wsConnected = false;
      };

      ws.onclose = () => {
        wsConnected = false;
        wsRef.current = null;
        if (unmounted) return;

        if (!pollingInterval) {
          pollingInterval = setInterval(loadMeeting, 3000);
        }

        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
        reconnectAttempts++;
        reconnectTimeout = setTimeout(setupWebSocket, delay);
      };

      wsRef.current = ws;
    };

    setupWebSocket();

    return () => {
      unmounted = true;
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [id]);

  useEffect(() => {
    // Auto-scroll to bottom of transcript
    if (activeTab === "transcript" && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveTranscript, activeTab]);

  if (!meeting) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-center items-center h-64">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-full border-2 border-gray-200" />
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin" />
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

  const participants = meeting.participants || [];

  const statusConfig: Record<
    string,
    { label: string; color: string; bg: string; dot: string }
  > = {
    completed: {
      label: "Completed",
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      dot: "bg-emerald-500",
    },
    failed: {
      label: "Failed",
      color: "text-rose-700",
      bg: "bg-rose-50",
      dot: "bg-rose-500",
    },
    pending: {
      label: "Pending",
      color: "text-amber-700",
      bg: "bg-amber-50",
      dot: "bg-amber-500",
    },
    processing: {
      label: "Processing",
      color: "text-blue-700",
      bg: "bg-blue-50",
      dot: "bg-blue-500",
    },
  };

  const status = statusConfig[meeting.status] || statusConfig.pending;
  const meetingDate = new Date(meeting.created_at || Date.now());

  const tabItems = [
    { id: "summary", label: "Summary", icon: FileText },
    { id: "transcript", label: "Transcript", icon: Mic },
    {
      id: "tasks",
      label: `Tasks (${meeting.tasks?.length || 0})`,
      icon: ListChecks,
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors group mb-1"
            >
              <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span className="text-sm font-medium">Back to Meetings</span>
            </button>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              {meeting.title || "Untitled Meeting"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {meetingDate.toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>
                  {meetingDate.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                {status.label}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyUrl}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Copy className="w-4 h-4" />
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <a
              href={meeting.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm active:scale-95 shadow-blue-500/10"
            >
              <ExternalLink className="w-4 h-4" />
              Join Call
            </a>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Tabs Navigation */}
            <div className="flex gap-1 p-1 bg-slate-100/50 rounded-2xl w-fit">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                const isLive = tab.id === 'transcript' && (meeting.status === 'processing' || activePartial);
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all relative ${
                      activeTab === tab.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isLive && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Summary View */}
              {activeTab === "summary" && (
                <div className="p-8 space-y-8">
                  {meeting.summary ? (
                    <div className="space-y-8">
                      <section>
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-blue-600" />
                          Executive Summary
                        </h3>
                        <div className="prose prose-slate max-w-none">
                          <p className="text-slate-600 leading-relaxed text-[15px]">
                            {meeting.summary}
                          </p>
                        </div>
                      </section>

                      {meeting.key_decisions &&
                        meeting.key_decisions.length > 0 && (
                          <section className="pt-8 border-t border-slate-100">
                            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                              Key Decisions
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                              {meeting.key_decisions.map(
                                (decision: string, idx: number) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                                  >
                                    <span className="shrink-0 w-6 h-6 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-400">
                                      {idx + 1}
                                    </span>
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                                      {decision}
                                    </p>
                                  </div>
                                ),
                              )}
                            </div>
                          </section>
                        )}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-slate-300" />
                      </div>
                      <h4 className="text-slate-900 font-bold mb-1">
                        No summary yet
                      </h4>
                      <p className="text-sm text-slate-500">
                        Analysis will appear once processing is complete.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Transcript View */}
              {activeTab === "transcript" && (
                <div className="p-8 h-150 overflow-y-auto flex flex-col">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2 sticky top-0 bg-white z-10 py-2">
                    <Mic className="w-5 h-5 text-blue-600" />
                    {meeting.status === 'completed' || meeting.status === 'failed' ? 'Full Transcript' : 'Live Transcript'}
                  </h3>
                  <div className="space-y-6 flex-1">
                    {/* If meeting is completed, show the official historical transcript first */}
                    {(meeting.status === 'completed' || meeting.status === 'failed') && 
                     meeting.transcript_raw && meeting.transcript_raw.length > 0 ? (
                      meeting.transcript_raw.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 group">
                          <div className="shrink-0 pt-1">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[11px] font-bold border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                              {item.participant?.name?.split(" ")[0][0] || "U"}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0 pb-6 border-b border-slate-50 last:border-0">
                            <p className="text-sm font-bold text-slate-900 mb-1">
                              {item.participant?.name || "Unknown"}
                            </p>
                            <p className="text-[15px] text-slate-600 leading-relaxed">
                              {item.words?.map((w: any) => w.text).join(" ") || ""}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (liveTranscript.length > 0 || activePartial) ? (
                      // Show live stream if we are in processing mode or have live data
                      <>
                        {liveTranscript.map((item: any, idx: number) => (
                          <div key={idx} className="flex gap-4 group">
                            <div className="shrink-0 pt-1">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[11px] font-bold border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-100 transition-colors">
                                {item.speaker?.[0] || "U"}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 pb-6 border-b border-slate-50 last:border-0">
                              <p className="text-sm font-bold text-slate-900 mb-1">
                                {item.speaker || "Unknown"}
                              </p>
                              <p className="text-[15px] text-slate-600 leading-relaxed">
                                {item.text}
                              </p>
                            </div>
                          </div>
                        ))}
                        {activePartial && (
                          <div className="flex gap-4 group opacity-70 animate-pulse">
                            <div className="shrink-0 pt-1">
                              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[11px] font-bold border border-slate-200">
                                {activePartial.speaker?.[0] || "U"}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 pb-6 border-b border-slate-50 last:border-0">
                              <p className="text-sm font-bold text-slate-900 mb-1">
                                {activePartial.speaker || "Unknown"} <span className="text-[10px] font-normal text-blue-500 ml-2 italic">typing...</span>
                              </p>
                              <p className="text-[15px] text-slate-600 leading-relaxed">
                                {activePartial.text}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : meeting.status === 'completed' ? (
                       // If completed but no transcript at all
                       <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
                          <Mic className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-slate-900 font-bold mb-1">
                          No transcript available
                        </h4>
                        <p className="text-sm text-slate-500">
                          We didn't detect any spoken words in this meeting.
                        </p>
                      </div>
                    ) : (
                      // Only show "Listening..." if it's currently live/processing
                      <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center animate-pulse">
                          <Mic className="w-8 h-8 text-slate-300" />
                        </div>
                        <h4 className="text-slate-900 font-bold mb-1">
                          Listening...
                        </h4>
                        <p className="text-sm text-slate-500">
                          Waiting for someone to speak.
                        </p>
                      </div>
                    )}
                    <div ref={transcriptEndRef} />
                  </div>
                </div>
              )}

              {/* Tasks View */}
              {activeTab === "tasks" && (
                <div className="p-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-blue-600" />
                    Action Items
                  </h3>
                  <div className="space-y-3">
                    {meeting.tasks && meeting.tasks.length > 0 ? (
                      meeting.tasks.map((task: any) => (
                        <div
                          key={task.id}
                          className="bg-slate-50/50 rounded-2xl border border-slate-100 p-5 hover:border-blue-200 hover:bg-white transition-all group"
                        >
                          <div className="flex items-start gap-4">
                            <div className="shrink-0 pt-1">
                              <div className="w-5 h-5 rounded-lg border-2 border-slate-200 group-hover:border-blue-400 cursor-pointer transition-colors flex items-center justify-center bg-white">
                                {task.is_completed && (
                                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-sm font-bold mb-2 ${task.is_completed ? "text-slate-400 line-through" : "text-slate-900"}`}
                              >
                                {task.task}
                              </h4>
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                <span className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-100 text-slate-600 font-medium">
                                  <Users className="w-3.5 h-3.5 text-slate-400" />{" "}
                                  {task.owner || "Unassigned"}
                                </span>
                                {task.due_date && (
                                  <span className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-100 text-slate-600 font-medium">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />{" "}
                                    {new Date(
                                      task.due_date,
                                    ).toLocaleDateString()}
                                  </span>
                                )}
                                {task.priority && (
                                  <span
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                      task.priority === "high"
                                        ? "bg-rose-50 text-rose-700 border border-rose-100"
                                        : task.priority === "medium"
                                          ? "bg-amber-50 text-amber-700 border border-amber-100"
                                          : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 bg-slate-50/50 rounded-3xl border border-slate-100 border-dashed">
                        <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <ListChecks className="w-8 h-8 text-slate-200" />
                        </div>
                        <h4 className="text-slate-900 font-bold mb-1">
                          No tasks yet
                        </h4>
                        <p className="text-sm text-slate-500">
                          We couldn't identify any clear action items.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-1 space-y-6">
            {/* Participants Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                Participants ({participants.length})
              </h3>
              <div className="space-y-4">
                {participants.map((participant: any) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold shadow-xs">
                      {participant.name.split(" ")[0][0]}
                      {participant.name.split(" ")[1]?.[0] || ""}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate leading-none mb-1">
                        {participant.name}
                      </p>
                        <p className="text-[11px] text-slate-500 truncate">
                        {participant.email || "No email"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600" />
                Insights Info
              </h3>
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                    Original URL
                  </label>
                  <p className="text-[11px] text-blue-600 font-medium break-all bg-slate-50 p-2.5 rounded-xl border border-slate-100 hover:bg-white hover:border-blue-100 transition-all cursor-pointer truncate">
                    {meeting.meeting_url}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Turns
                    </label>
                    <p className="text-xl font-bold text-slate-900 tracking-tight">
                      {liveTranscript.length > 0 ? liveTranscript.length : (meeting.transcript_raw?.length || 0)}
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
                      Words
                    </label>
                    <p className="text-xl font-bold text-slate-900 tracking-tight">
                      {liveTranscript.length > 0 
                        ? liveTranscript.reduce((acc, curr) => acc + curr.text.split(' ').length, 0)
                        : (meeting.transcript_text?.split(" ").length || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
