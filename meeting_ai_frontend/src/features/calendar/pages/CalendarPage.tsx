import { useEffect, useState } from "react";
import { apiClient } from "../../../services/apiClient";
import Layout from "../../../shared/components/Layout";
import { Calendar, RefreshCw, AlertCircle, CheckCircle2, Video, Clock, ExternalLink } from "lucide-react";
import { authService } from "../../../services/authService";

export default function CalendarPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [googleInfo, setGoogleInfo] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Google Calendar</h1>
          </div>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {isLoading && !events.length ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-gray-500">Checking connection status...</p>
          </div>
        ) : !isConnected ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Calendar className="w-10 h-10 text-blue-500" />
            </div>
            <div className="space-y-2 max-w-md">
              <h2 className="text-xl font-semibold text-gray-900">Connect your Calendar</h2>
              <p className="text-gray-500">
                Link your Google Calendar to automatically join meetings and generate intelligent summaries.
              </p>
            </div>
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-95"
            >
              Connect Google Calendar
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {googleInfo?.picture ? (
                  <img src={googleInfo.picture} alt="Profile" className="w-16 h-16 rounded-full border-2 border-blue-100 shadow-sm" />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                    {googleInfo?.name?.charAt(0) || googleInfo?.email?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{googleInfo?.name || "Google User"}</h2>
                  <p className="text-gray-500">{googleInfo?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1 text-green-600 text-xs font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Google Account Connected
                  </div>
                </div>
              </div>
              <div className="hidden md:block px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold">
                Connected via Gmail
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50">
                <h3 className="font-semibold text-gray-900">Upcoming Meetings</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {events.length > 0 ? (
                  events.map((event) => (
                    <div key={event.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {event.summary || "Untitled Meeting"}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              <span>{formatDate(event.start.dateTime || event.start.date)}</span>
                              <span>•</span>
                              <span>{formatTime(event.start.dateTime || event.start.date)}</span>
                            </div>
                            {event.hangoutLink && (
                              <div className="flex items-center gap-1.5 text-blue-600">
                                <Video className="w-4 h-4" />
                                <a 
                                  href={event.hangoutLink} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="hover:underline"
                                >
                                  Google Meet Link
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
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="View in Google Calendar"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-gray-500">No upcoming meetings found.</p>
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
