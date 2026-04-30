import { useEffect, useState } from "react";
import { fetchMeetings } from "../api";
import type { Meeting } from "../types";

export const useMeetings = () => {
  const [data, setData] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
};