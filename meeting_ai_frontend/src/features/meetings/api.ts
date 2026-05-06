import { apiClient } from "../../services/apiClient";

export const fetchMeetings = () => apiClient("/allmeetings");

export const fetchMeetingById = (id: string) =>
  apiClient(`/allmeetings/${id}`);

export const injectBot = (meetingUrl: string) =>
  apiClient("/inject-bot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ meeting_url: meetingUrl }),
  });

export const deleteMeeting = (id: number) =>
  apiClient(`/meetings/${id}`, { method: "DELETE" });