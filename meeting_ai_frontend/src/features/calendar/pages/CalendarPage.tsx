import { useEffect, useState } from "react";
import { apiClient } from "../../../services/apiClient";
import Layout from "../../../shared/components/Layout";
import { Calendar, RefreshCw, AlertCircle, CheckCircle2, Video, Clock, ExternalLink, LogOut, Users } from "lucide-react";
import { authService } from "../../../services/authService";

export default function CalendarPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [googleInfo, setGoogleInfo] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    setError("");
    try {
      const status = await apiClient("/auth/google/status");
      setIsConnected(status.is_connected);
      setGoogleInfo(status.google_info);

      if (status.is_connected) {
        const eventsData = await apiClient("/auth/google/events");
        setEvents(eventsData);
      }
    } catch (err) {
      console.error("Failed to fetch calendar data", err);
      setError("Failed to load calendar events. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConnect = async () => {
    try {
      const data = await authService.getGoogleAuthUrl();
      if (data.auth_url) {
        window.location.href = data.auth_url;
      }
    } catch (err) {
      console.error("Failed to get Google Auth URL", err);
      setError("Failed to initiate Google connection.");
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect your Google Calendar?")) return;
    
    setIsDisconnecting(true);
    setError("");
    try {
      await apiClient("/auth/google/disconnect", { method: "POST" });
      setIsConnected(false);
      setGoogleInfo(null);
      setEvents([]);
    } catch (err) {
      console.error("Failed to disconnect Google Calendar", err);
      setError("Failed to disconnect Google Calendar. Please try again.");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 rounded-2xl shadow-sm">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Google Calendar</h1>
              <p className="text-sm text-slate-500 font-medium">Sync and automate your meetings</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Sync Now
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <p className="text-sm text-rose-700 font-medium">{error}</p>
          </div>
        )}

        {isLoading && !events.length ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-slate-500 font-medium">Loading your calendar...</p>
          </div>
        ) : !isConnected ? (
          <div className="bg-white rounded-[32px] p-16 shadow-sm border border-slate-200 flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-blue-50 rounded-[32px] flex items-center justify-center shadow-inner">
              <Calendar className="w-12 h-12 text-blue-600" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Connect your Calendar</h2>
              <p className="text-slate-500 leading-relaxed font-medium">
                Link your Google Calendar to automatically join meetings and generate intelligent summaries in real-time.
              </p>
            </div>
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              Connect Google Calendar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {/* User Profile Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {googleInfo?.picture ? (
                  <img src={googleInfo.picture} alt="Profile" className="w-20 h-20 rounded-2xl border-2 border-white shadow-md ring-1 ring-slate-100" />
                ) : (
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 font-bold text-2xl border border-slate-200">
                    {googleInfo?.name?.charAt(0) || googleInfo?.email?.charAt(0) || "U"}
                  </div>
                )}
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{googleInfo?.name || "Google User"}</h2>
                  <p className="text-slate-500 font-medium mb-2">{googleInfo?.email}</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Connected
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-3">
                <button
                  onClick={handleDisconnect}
                  disabled={isDisconnecting}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 disabled:opacity-50 active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                  {isDisconnecting ? "Disconnecting..." : "Disconnect Calendar"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[32px] shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">Upcoming Meetings</h3>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                  {events.length} Events
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="p-8 hover:bg-slate-50/50 transition-all group">
                      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-2 flex-1">
                          <h4 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {event.summary || "Untitled Meeting"}
                          </h4>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span>{formatDate(event.start.dateTime || event.start.date)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>{formatTime(event.start.dateTime || event.start.date)}</span>
                            </div>
                            {event.hangoutLink && (
                              <div className="flex items-center gap-2 text-blue-600 font-bold">
                                <Video className="w-4 h-4" />
                                <a 
                                  href={event.hangoutLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  Google Meet
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                        {event.htmlLink && (
                          <a
                            href={event.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-100 shadow-sm"
                            title="View in Google Calendar"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>

                      {event.attendees && event.attendees.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-slate-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Participants</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {event.attendees.map((attendee: any, idx: number) => (
                              <div 
                                key={idx} 
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-xs font-medium border border-slate-100 hover:bg-white hover:border-blue-100 transition-all cursor-default group/participant"
                                title={attendee.email}
                              >
                                <div className="w-5 h-5 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-400 group-hover/participant:text-blue-600 group-hover/participant:border-blue-200 transition-colors">
                                  {attendee.displayName?.charAt(0) || attendee.email?.charAt(0).toUpperCase() || "?"}
                                </div>
                                <span>{attendee.displayName || attendee.email}</span>
                                {attendee.organizer && (
                                  <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">Host</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-full flex items-center justify-center">
                       <Calendar className="w-8 h-8 text-slate-200" />
                    </div>
                    <p className="text-slate-500 font-bold">No upcoming meetings found.</p>
                    <p className="text-sm text-slate-400">Time for a coffee break!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
