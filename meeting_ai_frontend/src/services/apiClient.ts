const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token");
  
  const headers = {
    ...options.headers,
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  };

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL.replace(/\/$/, "")}${endpoint}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  if (!res.ok) throw new Error("API Error");

  return res.json();
}