import { useState, useEffect, useCallback } from 'react';

interface UseTimerProps {
  initialTime: number;
  interval?: number;
  autoStart?: boolean;
  onComplete?: () => void;
}

interface UseTimerReturn {
  time: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  reset: () => void;
  percentRemaining: number;
}

/**
 * Custom hook for creating and managing a countdown timer
 */
export const useTimer = ({
  initialTime,
  interval = 1000,
  autoStart = false,
  onComplete,
}: UseTimerProps): UseTimerReturn => {
  const [time, setTime] = useState<number>(initialTime);
  const [isRunning, setIsRunning] = useState<boolean>(autoStart);
  
  // Calculate percentage of time remaining (0-100)
  const percentRemaining = Math.max(0, Math.min(100, (time / initialTime) * 100));
  
  // Start the timer
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);
  
  // Pause the timer
  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  // Reset the timer to initial value
  const reset = useCallback(() => {
    setTime(initialTime);
    setIsRunning(false);
  }, [initialTime]);
  
  // Timer effect
  useEffect(() => {
    if (!isRunning) return;
    
    const timerId = setInterval(() => {
      setTime((prevTime) => {
        const newTime = Math.max(0, prevTime - interval);
        
        // Check if timer has completed
        if (newTime === 0) {
          setIsRunning(false);
          clearInterval(timerId);
          onComplete?.();
        }
        
        return newTime;
      });
    }, interval);
    
    return () => clearInterval(timerId);
  }, [isRunning, interval, onComplete]);
  
  return {
    time,
    isRunning,
    start,
    pause,
    reset,
    percentRemaining,
  };
}; 