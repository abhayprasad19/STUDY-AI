// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from "react";

const useFetch = (fetchFn, deps = [], immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn(...args);
      setData(result.data);
      return result.data;
    } catch (err) {
      setError(err.message || "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  }, [execute]);

  return { data, loading, error, refetch: execute };
};

export default useFetch;
