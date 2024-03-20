import React, { useState } from 'react';
import '../styles/calendar.css'; 

const Calendar = () => {
  const [date, setDate] = useState(new Date());
  
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const dayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const previousMonth = () => {
    setDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  return (
    <div className="calendar">
      <header className="calendar-header">
        <button onClick={previousMonth}>&lt;</button>
        <div>
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button onClick={nextMonth}>&gt;</button>
      </header>
      <div className="calendar-grid">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
          <div key={day} className="header-cell">{day}</div>
        ))}
        {Array.from({ length: dayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="day-cell empty"></div>
        ))}
        {days.map(day => (
          <div key={day} className={`day-cell ${day === date.getDate() && date.getMonth() === currentMonth ? 'today' : ''}`}>
            {day}
            {/* Placeholder for event dots */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
