import React, { useState, useEffect } from 'react';

export default function AnimatedCounter({ value }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1800;
    const frames = 60;
    const increment = value / (duration / (1000 / frames));

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.ceil(start));
      }
    }, 1000 / frames);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span className="font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
      {count}
    </span>
  );
}