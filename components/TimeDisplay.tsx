
import React, { useState, useEffect } from 'react';

export const TimeDisplay: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-right">
      <div className="text-3xl font-bold text-gray-900">
        {time.toLocaleTimeString('ko-KR', { hour12: false })}
      </div>
      <div className="text-sm text-gray-500 font-medium">
        {time.toLocaleDateString('ko-KR', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric', 
          weekday: 'long' 
        })}
      </div>
    </div>
  );
};
