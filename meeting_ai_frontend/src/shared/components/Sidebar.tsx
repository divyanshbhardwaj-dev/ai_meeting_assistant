import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Plus,
  Calendar,
  CheckSquare,
  Settings,
  LogOut,
  Zap,
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
      <aside className="w-64 h-screen bg-white text-[#0F1523] flex flex-col border-r border-gray-200 shadow-sm relative">
        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-[#4F46E5] rounded-lg flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white fill-white/20" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#0F1523] leading-none mb-1">
                Meeting<span className="text-[#4F46E5]">AI</span>
              </h1>
              <p className="text-[10px] text-[#777681] font-bold uppercase tracking-wider">Workspace</p>
            </div>
          </div>
        </div>

        {/* New Meeting button */}
        <div className="px-4 py-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-md text-sm font-semibold transition-all shadow-sm active:scale-[0.98] cursor-pointer group"
          >
            <Plus className="w-4 h-4 transition-transform group-hover:rotate-90" />
            New Meeting
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
          <div>
            <div className="px-3 mb-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#777681] uppercase tracking-widest">Platform</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="space-y-0.5">
              {navItems.map(({ path, label, icon: Icon }) => {
                const active = isActive(path);
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 group relative text-sm font-medium ${
                      active
                        ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold"
                        : "text-[#777681] hover:text-[#0F1523] hover:bg-gray-50"
                    }`}
                  >
                    {active && (
                      <div className="absolute left-0 w-1 h-5 bg-[#4F46E5] rounded-r-full" />
                    )}
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? "text-[#4F46E5]" : ""}`} />
                    <span>{label}</span>
                    {label === "Google Calendar" && isGoogleConnected && (
                      <div className="ml-auto w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2 flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#777681] uppercase tracking-widest">Recent Activity</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="px-3">
              <p className="text-xs text-[#777681] italic">No recent activity</p>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 mt-auto border-t border-gray-200 space-y-1 bg-gray-50/50">
          <button className="w-full flex items-center gap-3 px-3 py-2 text-[#777681] hover:text-[#0F1523] hover:bg-gray-100 rounded-md transition-all duration-200 group">
            <Settings className="w-4 h-4 shrink-0 transition-colors group-hover:text-[#4F46E5]" />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-[#777681] hover:text-red-600 hover:bg-red-50 rounded-md transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 shrink-0 transition-colors group-hover:text-red-500" />
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