import React, { useState, useEffect } from 'react';
import { utcToZonedTime } from 'date-fns-tz';
import '../styles/calendar.css';

const TIME_ZONE = 'America/New_York';
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function Calendar() {
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const dayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const previousMonth = () => setDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setDate(new Date(currentYear, currentMonth + 1, 1));

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/events`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        console.log("Fetched events:", data);  // Log fetched events
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, [date]);

  const getEventsForDay = (day) => {
    console.log(`Getting events for day ${day}... Events count: ${events.length}`);
    return events.filter((event) => {
      const startObj = event.startDateTime; 
      if (!startObj || !startObj.$date || !startObj.$date.$numberLong) {
        return false; 
      }
      const timestampStr = startObj.$date.$numberLong;
      const timestamp = parseInt(timestampStr, 10);
      const eventUTC = new Date(timestamp);
      const localDate = utcToZonedTime(eventUTC, TIME_ZONE);

      // Log details for each event being checked
      console.log(
        "Checking event:", event.name,
        "| Local Date:", localDate.toString(),
        "| Expected Day:", day,
        "| Day match:", localDate.getDate() === day,
        "| Month match:", localDate.getMonth() === currentMonth,
        "| Year match:", localDate.getFullYear() === currentYear
      );

      return (
        localDate.getDate() === day &&
        localDate.getMonth() === currentMonth &&
        localDate.getFullYear() === currentYear
      );
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="calendar">
      <header className="calendar-header">
        <button onClick={previousMonth}>&lt;</button>
        <div>{monthNames[currentMonth]} {currentYear}</div>
        <button onClick={nextMonth}>&gt;</button>
      </header>

      <div className="calendar-grid">
        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((dow) => (
          <div key={dow} className="header-cell">{dow}</div>
        ))}

        {Array.from({ length: dayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="day-cell empty"></div>
        ))}

        {days.map((day) => {
          const isToday = day === date.getDate() && date.getMonth() === currentMonth;
          return (
            <div key={day} className={`day-cell ${isToday ? 'today' : ''}`}>
              {day}
              <div className="events">
                {getEventsForDay(day).map((event) => (
                  <div key={event._id} className="event">
                    {event.name}
                    {event.startTime ? ` (${event.startTime}${event.endTime ? ` - ${event.endTime}` : ''})` : ''}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}