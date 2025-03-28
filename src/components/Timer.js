"use client";

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";

const Timer = forwardRef(({ level, onTimeUp }, ref) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const intervalRef = useRef(null);

  useImperativeHandle(ref, () => ({
    stopTimer() {
      clearInterval(intervalRef.current);
    }
  }));

  useEffect(() => {
    let timeLimit;
    switch (level) {
      case "easy":
        timeLimit = 35;
        break;
      case "medium":
        timeLimit = 25;
        break;
      case "hard":
        timeLimit = 15;
        break;
      default:
        timeLimit = 15;
    }
    setTimeLeft(timeLimit);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 0) {
          clearInterval(intervalRef.current);
          onTimeUp();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [level, onTimeUp]);

  return <div className="timer">Time Left: {timeLeft}s</div>;
});

export default Timer;
