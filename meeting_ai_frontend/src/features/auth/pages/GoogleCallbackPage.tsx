import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiClient } from "../../../services/apiClient";
import Layout from "../../../shared/components/Layout";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState("Connecting your Google account...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get("code");
        console.log("Extracted code:", code ? "Found" : "Not Found");
        
        if (!code) {
          throw new Error("No code found in URL");
        }
        
        console.log("Calling exchange-code API...");
        const response = await apiClient(`/auth/google/exchange-code?code=${encodeURIComponent(code)}`);
        console.log("API Response:", response);
        
        setStatus("Successfully connected! Redirecting...");
        setTimeout(() => navigate("/"), 2000);
      } catch (err) {
        console.error("Google Auth Error:", err);
        setStatus("Failed to connect Google account. Please try again.");
      }
    };

    handleCallback();
  }, [navigate, location]);

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
        <h2 className="text-xl font-medium text-gray-900">{status}</h2>
      </div>
    </Layout>
  );
}
