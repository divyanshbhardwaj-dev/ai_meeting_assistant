import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  CheckSquare,
  Settings,
  LogOut,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";
import JoinMeetingModal from "../../features/meetings/components/JoinMeetingModal";
import { authService } from "../../services/authService";
import { apiClient } from "../../services/apiClient";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    const checkGoogleStatus = async () => {
      try {
        const data = await apiClient("/auth/google/status");
        setIsGoogleConnected(data.is_connected);
      } catch (err) {
        console.error("Failed to check Google status", err);
      }
    };
    checkGoogleStatus();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Meetings", icon: Calendar },
    { path: "/calendar", label: "Google Calendar", icon: Zap },
    { path: "/action-items", label: "Action Items", icon: CheckSquare },
  ];

  return (
    <>
      <aside className="w-64 h-screen bg-white text-slate-900 flex flex-col border-r border-slate-200">
        {/* Header */}
        <div className="px-6 py-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              MeetingAI
            </h1>
          </div>
        </div>

        {/* New Meeting button */}
        <div className="px-4 mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-8 overflow-y-auto">
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Main Menu
            </div>
            <div className="space-y-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
                    isActive(path)
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${isActive(path) ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
                  />
                  <span className="text-sm font-medium">{label}</span>
                  {label === "Google Calendar" && isGoogleConnected && (
                    <CheckCircle2 className="ml-auto w-3.5 h-3.5 text-emerald-500" />
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Recent Activity
            </div>
            <p className="text-xs text-slate-500 px-3 italic">
              No recent meetings
            </p>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all duration-200 group">
            <Settings className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-slate-600" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400 group-hover:text-red-500" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <JoinMeetingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(id) => navigate(`/meeting/${id}`)}
      />
    </>
  );
}
