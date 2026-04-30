import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Plus, Calendar, CheckSquare, Settings, LogOut, Zap } from "lucide-react";
import { useState } from "react";
import JoinMeetingModal from "../../features/meetings/components/JoinMeetingModal";
import { authService } from "../../services/authService";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["main", "resources"])
  );

  const toggleSection = (section: string) => {
    const newSet = new Set(expandedSections);
    if (newSet.has(section)) {
      newSet.delete(section);
    } else {
      newSet.add(section);
    }
    setExpandedSections(newSet);
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Meetings", icon: Calendar },
    { path: "/action-items", label: "Action Items", icon: CheckSquare },
  ];

  return (
    <>
      <aside className="w-56 h-screen bg-linear-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-50 flex flex-col border-r border-slate-800 shadow-xl">
        {/* Header – compact */}
        <div className="px-3 pt-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-1.5 mb-0.5">
            <div className="w-6 h-6 bg-linear-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <h1 className="text-base font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              MeetingAI
            </h1>
          </div>
          <p className="text-[10px] text-slate-400">Intelligent meeting insights</p>
        </div>

        {/* New Meeting button – tighter */}
        <div className="px-2 py-3 border-b border-slate-800">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded text-xs font-medium transition-all duration-200 shadow hover:shadow-blue-500/50 active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            New Meeting
          </button>
        </div>

        {/* Navigation – reduced padding and gaps */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          <div>
            <button
              onClick={() => toggleSection("main")}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors"
            >
              <span>Navigation</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  expandedSections.has("main") ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedSections.has("main") && (
              <div className="mt-1 space-y-0.5">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <Link
                    key={path}
                    to={path}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 group ${
                      isActive(path)
                        ? "bg-slate-800 text-blue-400 shadow-lg shadow-blue-500/20"
                        : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="text-xs font-medium">{label}</span>
                    {isActive(path) && (
                      <div className="ml-auto w-1 h-1 bg-blue-400 rounded-full" />
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={() => toggleSection("recent")}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-300 transition-colors"
            >
              <span>Recent</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform ${
                  expandedSections.has("recent") ? "rotate-180" : ""
                }`}
              />
            </button>

            {expandedSections.has("recent") && (
              <div className="mt-1 space-y-0.5 max-h-32 overflow-y-auto">
                <p className="text-[10px] text-slate-500 px-2 py-1">
                  No recent meetings
                </p>
              </div>
            )}
          </div>
        </nav>

        {/* Footer – compact buttons */}
        <div className="px-2 py-3 border-t border-slate-800 space-y-0.5">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-md transition-all duration-200">
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium">Settings</span>
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-medium">Logout</span>
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