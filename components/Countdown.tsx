import { useEffect, useState } from "react";

interface CountdownProps {
  isActive: boolean;
  onComplete: () => void;
}

export function Countdown({ isActive, onComplete }: CountdownProps) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setCount(null);
      return;
    }

    setCount(3);
  }, [isActive]);

  useEffect(() => {
    if (count === null) return;
    
    if (count === 0) {
      onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((c) => (c ? c - 1 : 0));
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (!isActive || count === null || count === 0) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
      <div className="text-9xl font-black text-white drop-shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-bounce">
        {count}
      </div>
    </div>
  );
}
