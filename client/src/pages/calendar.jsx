import React, { useState, useEffect } from 'react';
import '../styles/calendar.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Calendar = () => {
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
                setEvents(data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, [date]);

    const getEventsForDay = (day) =>
        events.filter((event) => {
            const eventDate = new Date(event.startDate);
            return (
                eventDate.getDate() === day &&
                eventDate.getMonth() === currentMonth &&
                eventDate.getFullYear() === currentYear
            );
        });

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
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
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                    <div key={day} className="header-cell">
                        {day}
                    </div>
                ))}
                {Array.from({ length: dayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} className="day-cell empty"></div>
                ))}
                {days.map((day) => (
                    <div
                        key={day}
                        className={`day-cell ${
                            day === date.getDate() && date.getMonth() === currentMonth
                                ? 'today'
                                : ''
                        }`}
                    >
                        {day}
                        <div className="events">
                            {getEventsForDay(day).map((event) => (
                                <div key={event._id} className="event">
                                    {event.name} ({event.startTime} {event.endTime ? `- ${event.endTime}` : ''})
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Calendar;