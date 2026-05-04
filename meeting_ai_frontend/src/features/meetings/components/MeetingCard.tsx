import type { Meeting } from "../types";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Calendar, Clock } from "lucide-react";
import { useState } from "react";

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = {
    completed: {
      label: "Completed",
      badge: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    failed: {
      label: "Failed",
      badge: "bg-rose-50 text-rose-700",
      dot: "bg-rose-500",
    },
    pending: {
      label: "Pending",
      badge: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
    processing: {
      label: "Processing",
      badge: "bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    },
  };

  const status =
    statusConfig[meeting.status as keyof typeof statusConfig] ||
    statusConfig.pending;
  const createdDate = new Date(meeting.created_at || Date.now());
  const dateStr = createdDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const timeStr = createdDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      onClick={() => navigate(`/meeting/${meeting.id}`)}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-semibold text-slate-900 line-clamp-1 leading-snug group-hover:text-blue-600 transition-colors">
              {meeting.title || "Untitled Meeting"}
            </h3>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-slate-50 rounded-lg transition-colors shrink-0"
          >
            <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${status.badge}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {/* Summary Snippet */}
        {meeting.summary && (
          <p className="mb-4 text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {meeting.summary}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{dateStr}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeStr}</span>
            </div>
          </div>

          <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-all transform translate-x-1 group-hover:translate-x-0">
            <span className="text-[11px] font-bold">Details →</span>
          </div>
        </div>
      </div>

      {/* Context Menu Dropdown */}
      {showMenu && (
        <div
          className="absolute top-12 right-4 bg-white border border-slate-200 rounded-xl shadow-xl z-10 min-w-30 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Share
          </button>
          <button className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
