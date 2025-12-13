import { useEffect, useState } from "react";
import { fetchWeatherData } from "../services/api";

export function useWeatherData(year) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const result = await fetchWeatherData(year);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [year]);

  return { data, loading, error };
}
