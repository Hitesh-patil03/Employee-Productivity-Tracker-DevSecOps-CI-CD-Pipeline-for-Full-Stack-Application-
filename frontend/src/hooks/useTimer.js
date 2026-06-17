import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * useTimer — manages a task's elapsed seconds locally with start/stop
 * @param {number} initialSeconds - elapsed seconds already logged (from DB)
 * @param {boolean} initialRunning - whether the timer is currently running
 * @param {number} limitHours - allocated hours (0 = no limit)
 */
const useTimer = (initialSeconds = 0, initialRunning = false, limitHours = 0) => {
  const [elapsed, setElapsed] = useState(initialSeconds);
  const [running, setRunning] = useState(initialRunning);
  const intervalRef = useRef(null);
  const limitSeconds = limitHours * 3600;

  const tick = useCallback(() => {
    setElapsed((s) => {
      const next = s + 1;
      if (limitSeconds > 0 && next >= limitSeconds) {
        setRunning(false);
        clearInterval(intervalRef.current);
      }
      return next;
    });
  }, [limitSeconds]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, tick]);

  const start = useCallback(() => setRunning(true), []);
  const stop = useCallback(() => setRunning(false), []);
  const reset = useCallback(() => { setRunning(false); setElapsed(0); }, []);

  const pct = limitSeconds > 0 ? Math.min(100, Math.round((elapsed / limitSeconds) * 100)) : 0;
  const remaining = limitSeconds > 0 ? Math.max(0, limitSeconds - elapsed) : 0;
  const isOverLimit = limitSeconds > 0 && elapsed >= limitSeconds;

  return { elapsed, running, start, stop, reset, pct, remaining, isOverLimit };
};

export default useTimer;
