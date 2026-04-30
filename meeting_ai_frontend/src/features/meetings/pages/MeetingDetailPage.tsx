import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
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
  FileText,
  Mic,
  ListChecks,
} from "lucide-react";

export default function MeetingDetailPage() {
  const { id } = useParams();
  const [meeting, setMeeting] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "transcript" | "tasks">("summary");

  useEffect(() => {
    fetchMeetingById(id!).then(setMeeting);
  }, [id]);

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

  const participants = Array.from(
    new Map(meeting.transcript_raw.map((item: any) => [item.participant.id, item.participant])).values()
  ) as any[];

  const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    completed: { label: "Completed", color: "text-emerald-800", bg: "bg-emerald-50", dot: "bg-emerald-500" },
    failed: { label: "Failed", color: "text-rose-800", bg: "bg-rose-50", dot: "bg-rose-500" },
    pending: { label: "Pending", color: "text-amber-800", bg: "bg-amber-50", dot: "bg-amber-500" },
    processing: { label: "Processing", color: "text-blue-800", bg: "bg-blue-50", dot: "bg-blue-500" },
  };

  const status = statusConfig[meeting.status] || statusConfig.pending;
  const meetingDate = new Date(meeting.transcript_raw[0]?.words[0]?.start_timestamp?.absolute || Date.now());

  const tabItems = [
    { id: "summary", label: "Summary", icon: FileText },
    { id: "transcript", label: "Transcript", icon: Mic },
    { id: "tasks", label: `Tasks (${meeting.tasks?.length || 0})`, icon: ListChecks },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          {/* Ultra-compact Header */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 p-3 mb-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-2 transition-colors group"
            >
              <ChevronLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-[11px] font-medium">Back to Meetings</span>
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-2">
              <div className="flex-1">
                <h1 className="text-lg lg:text-xl font-bold text-gray-900 mb-1 tracking-tight">
                  {meeting.title || "Untitled Meeting"}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span className="text-[11px]">
                      {meetingDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} at{" "}
                      {meetingDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${status.bg} ${status.color}`}>
                    <span className={`w-1 h-1 rounded-full ${status.dot}`} />
                    {status.label}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={copyUrl}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded text-[11px] font-medium text-gray-700 transition-all shadow-sm"
                >
                  <Copy className="w-3 h-3" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a
                  href={meeting.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-medium transition-all shadow-sm"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open
                </a>
                <button className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-50 rounded text-[11px] font-medium text-gray-700 transition-all shadow-sm">
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Dense Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Left Sidebar – Minimized spacing */}
            <div className="lg:col-span-1">
              <div className="space-y-2 sticky top-2">
                {/* Participants */}
                <div className="bg-white rounded-md shadow-sm border border-gray-100 p-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="p-0.5 bg-blue-50 rounded">
                      <Users className="w-3 h-3 text-blue-600" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900">Participants</h3>
                  </div>
                  <div className="space-y-1.5">
                    {participants.map((participant: any) => (
                      <div key={participant.id} className="flex items-center gap-2 group">
                        <div className="relative shrink-0">
                          <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[9px] font-semibold shadow-sm ring-2 ring-white">
                            {participant.name.split(" ")[0][0]}
                            {participant.name.split(" ")[1]?.[0] || ""}
                          </div>
                          {participant.is_host && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[6px] text-white font-bold">
                              ★
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-medium text-gray-900 truncate">{participant.name}</p>
                          <p className="text-[10px] text-gray-500 truncate">{participant.email}</p>
                        </div>
                        {participant.is_host && (
                          <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded-full font-medium">
                            Host
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Meeting Info */}
                <div className="bg-white rounded-md shadow-sm border border-gray-100 p-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="p-0.5 bg-purple-50 rounded">
                      <Clock className="w-3 h-3 text-purple-600" />
                    </div>
                    <h3 className="text-xs font-semibold text-gray-900">Meeting Info</h3>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <p className="text-gray-500 mb-0.5">Link</p>
                      <p className="text-blue-600 break-all text-[9px] font-mono bg-gray-50 p-1 rounded">
                        {meeting.meeting_url}
                      </p>
                    </div>
                    <div className="pt-1 border-t border-gray-100">
                      <p className="text-gray-500 mb-0.5">Turns</p>
                      <p className="text-gray-900 font-semibold">{meeting.transcript_text.split("\n").length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Dense tabs & bodies */}
            <div className="lg:col-span-2">
              {/* Tab bar - compact */}
              <div className="flex gap-1 bg-gray-100 p-0.5 rounded-md mb-2">
                {tabItems.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded text-[11px] font-medium transition-all flex-1 justify-center ${
                        activeTab === tab.id
                          ? "bg-white text-blue-600 shadow-sm"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Summary */}
              {activeTab === "summary" && (
                <div className="bg-white rounded-md shadow-sm border border-gray-100 p-3">
                  {meeting.summary ? (
                    <div className="space-y-3">
                      <div className="relative p-3 bg-linear-to-br from-blue-50 to-indigo-50 rounded border border-blue-100">
                        <div className="absolute top-0 left-0 w-0.5 h-full bg-blue-500 rounded-l" />
                        <h3 className="text-[11px] font-semibold text-blue-900 mb-1 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-blue-500" />
                          Key Points
                        </h3>
                        <p className="text-[11px] text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {meeting.summary}
                        </p>
                      </div>
                      {meeting.key_decisions && (
                        <div>
                          <h3 className="text-[11px] font-semibold text-gray-900 mb-1.5 flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-amber-500" />
                            Decisions
                          </h3>
                          <ul className="space-y-1">
                            {meeting.key_decisions.map((decision: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-1 text-[11px] text-gray-700">
                                <span className="mt-1 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                                {decision}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">No summary available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Transcript – tight spacing */}
              {activeTab === "transcript" && (
                <div className="bg-white rounded-md shadow-sm border border-gray-100 p-3">
                  <div className="space-y-2">
                    {meeting.transcript_raw.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-2 p-1.5 -mx-1.5 rounded hover:bg-gray-50 transition-colors">
                        <div className="shrink-0">
                          <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[9px] font-semibold shadow-sm">
                            {item.participant.name.split(" ")[0][0]}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-gray-900 mb-0.5">
                            {item.participant.name}
                          </p>
                          <p className="text-[11px] text-gray-700 leading-snug">
                            {item.words.map((w: any) => w.text).join(" ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks – minimal card padding */}
              {activeTab === "tasks" && (
                <div className="space-y-1.5">
                  {meeting.tasks && meeting.tasks.length > 0 ? (
                    meeting.tasks.map((task: any) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-md border border-gray-100 p-2.5 shadow-sm hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-2">
                          <div className="shrink-0 pt-0.5">
                            <div className="w-3.5 h-3.5 rounded border border-gray-200 group-hover:border-blue-400 cursor-pointer transition-colors flex items-center justify-center">
                              {task.completed && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[11px] font-semibold text-gray-900 mb-0.5">{task.task}</h4>
                            <div className="flex flex-wrap items-center gap-1 text-[10px]">
                              <span className="flex items-center gap-0.5 text-gray-500">
                                <Users className="w-2.5 h-2.5" /> {task.owner}
                              </span>
                              {task.due_date !== "TBD" && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="flex items-center gap-0.5 text-gray-500">
                                    <Calendar className="w-2.5 h-2.5" /> {task.due_date}
                                  </span>
                                </>
                              )}
                              {task.priority && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span
                                    className={`px-1 py-0.5 rounded-full text-[9px] font-medium ${
                                      task.priority === "high"
                                        ? "bg-rose-50 text-rose-700"
                                        : task.priority === "medium"
                                        ? "bg-amber-50 text-amber-700"
                                        : "bg-emerald-50 text-emerald-700"
                                    }`}
                                  >
                                    {task.priority}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 bg-white rounded-md border border-gray-100">
                      <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                        <ListChecks className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium">No tasks yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}