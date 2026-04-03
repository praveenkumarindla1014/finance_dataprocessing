import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for API calls with loading/error states.
 * @param {Function} apiCall  – the api function to call
 * @param {boolean} immediate – call on mount?
 */
export const useApi = (apiCall, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiCall(...args);
        setData(res.data);
        return res.data;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || 'Something went wrong';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiCall]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, loading, error, execute, setData };
};
