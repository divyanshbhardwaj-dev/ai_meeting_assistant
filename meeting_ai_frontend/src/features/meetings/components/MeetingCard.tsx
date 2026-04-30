import type { Meeting } from "../types";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Calendar, ExternalLink } from "lucide-react";
import { useState } from "react";

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const statusConfig = {
    completed: {
      label: "Completed",
      badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-300",
      dot: "bg-emerald-500",
    },
    failed: {
      label: "Failed",
      badge: "bg-red-50 text-red-700 ring-1 ring-red-300",
      dot: "bg-red-500",
    },
    pending: {
      label: "Pending",
      badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-300",
      dot: "bg-amber-500",
    },
    processing: {
      label: "Processing",
      badge: "bg-blue-50 text-blue-700 ring-1 ring-blue-300",
      dot: "bg-blue-500",
    },
  };

  const status = statusConfig[meeting.status as keyof typeof statusConfig] || statusConfig.pending;
  const createdDate = new Date(meeting.created_at || Date.now());
  const dateStr = createdDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  const timeStr = createdDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

  // Extract domain from meeting_url for display
  let domain = "";
  try {
    if (meeting.meeting_url) {
      domain = new URL(meeting.meeting_url).hostname.replace("www.", "");
    }
  } catch (e) {
    domain = meeting.meeting_url;
  }

  return (
    <div
      onClick={() => navigate(`/meeting/${meeting.id}`)}
      className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Accent Bar */}
      <div className="absolute top-0 left-0 h-1 w-full bg-linear-to-r from-blue-500 to-blue-600" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
              {meeting.title || "Untitled Meeting"}
            </h3>
            {meeting.summary && (
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                {meeting.summary}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            title="More options"
          >
            <MoreVertical className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        {/* Meta Info */}
        <div className="space-y-2 mt-3 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{dateStr}</span>
            <span className="text-gray-300">•</span>
            <span>{timeStr}</span>
          </div>
          {domain && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
              <span className="truncate">{domain}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.badge}`}>
              {status.label}
            </span>
          </div>
          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
            View →
          </span>
        </div>
      </div>

      {/* Context Menu Dropdown */}
      {showMenu && (
        <div
          className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors first:rounded-t-lg">
            View Details
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Share
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors last:rounded-b-lg">
            Delete
          </button>
        </div>
      )}
    </div>
  );
}