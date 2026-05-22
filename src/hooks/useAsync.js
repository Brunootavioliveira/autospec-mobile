import { useState, useCallback } from 'react';


export function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: false, error: null });

  const run = useCallback(async (...args) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn(...args);
      setState({ data, loading: false, error: null });
      return data;
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: e.message }));
      throw e;
    }
  }, deps);

  return { ...state, run };
}
