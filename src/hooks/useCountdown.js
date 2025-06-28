import { useState, useEffect } from 'react';

export default function useCountdown(targetDate) {
  const countDownDate = targetDate ? new Date(targetDate).getTime() : 0;
  const [timeLeft, setTimeLeft] = useState(countDownDate - Date.now());

  useEffect(() => {
    if (!countDownDate) return;
    const interval = setInterval(() => {
      const delta = countDownDate - Date.now();
      setTimeLeft(delta > 0 ? delta : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [countDownDate]);

  const days    = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: timeLeft === 0 };
}
