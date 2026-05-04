import type { Meeting } from "../types";
import { useNavigate } from "react-router-dom";
import { MoreVertical, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function MeetingRow({ meeting }: { meeting: Meeting }) {
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

  const status =
    statusConfig[meeting.status as keyof typeof statusConfig] ||
    statusConfig.pending;
  const createdDate = new Date(meeting.created_at || Date.now());
  const dateStr = createdDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <>
      <tr
        onClick={() => navigate(`/meeting/${meeting.id}`)}
        className="hover:bg-gray-50 transition-colors cursor-pointer group"
      >
        {/* Source Icon */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
          </div>
        </td>

        {/* Meeting Title */}
        <td className="px-6 py-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-medium text-gray-900 line-clamp-1">
              {meeting.title || "Untitled Meeting"}
            </h3>
            {meeting.summary && (
              <p className="text-xs text-gray-500 line-clamp-1">
                {meeting.summary}
              </p>
            )}
          </div>
        </td>

        {/* Date & Time */}
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{dateStr}</span>
            <span className="text-xs text-gray-500">
              {createdDate.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${status.dot}`} />
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.badge}`}
            >
              {status.label}
            </span>
          </div>
        </td>

        {/* Action */}
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/meeting/${meeting.id}`);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-gray-100 rounded-lg"
              title="View details"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </td>
      </tr>

      {/* Context Menu */}
      {showMenu && (
        <tr>
          <td colSpan={5} className="px-6 py-2 bg-gray-50">
            <div className="flex gap-2">
              <button className="text-xs px-3 py-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 font-medium">
                View Details
              </button>
              <button className="text-xs px-3 py-1.5 hover:bg-gray-200 rounded transition-colors text-gray-700 font-medium">
                Share
              </button>
              <button className="text-xs px-3 py-1.5 hover:bg-gray-200 rounded transition-colors text-red-600 font-medium">
                Delete
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
