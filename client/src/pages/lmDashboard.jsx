import React, { useState, useEffect } from 'react';
import '../styles/lmDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function combineDateTimeAsISO(dateStr, timeStr) {
  // If date is empty, return null
  if (!dateStr) return null;
  // If time is empty, default to "00:00" (start of the day)
  const safeTimeStr = timeStr || '00:00';

  // Create a local Date object from the user’s date+time
  // Example: "2025-01-12" + "14:00" => new Date("2025-01-12T14:00")
  const localDate = new Date(`${dateStr}T${safeTimeStr}`);

  // Option A (recommended): store exact local moment in ISO
  // e.g. "2025-01-12T14:00:00.000Z" (but includes offset if your environment is behind UTC)
  // return localDate.toISOString();

  // Option B: Convert explicitly to a midnight-UTC style if you want, but typically .toISOString() is best:
  return localDate.toISOString();
}

export default function LmDashboard() {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // We'll keep the form state for separate date/time inputs (for the user's convenience)
  const [eventForm, setEventForm] = useState({
    id: null,
    name: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

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

    fetchUsers();
    fetchEvents();
  }, []);

  const handleToggleRole = async (netID, field) => {
    try {
      const user = users.find((u) => u.netID === netID);
      const newValue = !user[field];

      const response = await fetch(`${API_BASE_URL}/api/admin/update-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ netID, field, value: newValue }),
      });

      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.netID === netID ? { ...u, [field]: newValue } : u))
        );
        setSuccessMessage(`Updated ${field} status for ${user.firstName}`);
        setErrorMessage('');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to update user.');
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred.');
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleCreateOrUpdateEvent = async () => {
    const { id, name, startDate, startTime, endDate, endTime } = eventForm;

    if (!name || !startDate) {
      setErrorMessage('Event name and start date are required.');
      setTimeout(() => setErrorMessage(''), 5000);
      return;
    }

    // Combine date & time into single ISO string
    const startDateTime = combineDateTimeAsISO(startDate, startTime); 
    let endDateTime = null;
    if (endDate) {
      endDateTime = combineDateTimeAsISO(endDate, endTime);
    }

    // Build the payload
    const payload = {
      name,
      startDateTime,  // single field
      endDateTime,    // single field
    };

    try {
      const endpoint = id ? `/api/events/update/${id}` : `/api/events/create`;
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedEvent = await response.json();

        if (id) {
          // Updating existing event
          setEvents((prev) =>
            prev.map((evt) => (evt._id === id ? updatedEvent : evt))
          );
          setSuccessMessage('Event updated successfully!');
        } else {
          // Creating a new event
          setEvents((prev) => [...prev, updatedEvent]);
          setSuccessMessage('Event created successfully!');
        }

        setErrorMessage('');
        setEventForm({
          id: null,
          name: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
        });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to save event.');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleEditEvent = (event) => {
    // We'll assume the server returns "startDateTime" & "endDateTime" as ISO strings
    // If event has separate fields, adapt accordingly
    setEventForm({
      id: event._id,
      name: event.name,
      // Convert ISO back to date/time strings for the form
      startDate: event.startDateTime ? event.startDateTime.slice(0, 10) : '',
      startTime: event.startDateTime ? event.startDateTime.slice(11, 16) : '',
      endDate: event.endDateTime ? event.endDateTime.slice(0, 10) : '',
      endTime: event.endDateTime ? event.endDateTime.slice(11, 16) : '',
    });
  };

  const handleDeleteEvent = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/delete/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setEvents((prev) => prev.filter((evt) => evt._id !== id));
        setSuccessMessage('Event deleted successfully!');
        setErrorMessage('');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to delete event.');
      }
    } catch (error) {
      setErrorMessage('An unexpected error occurred.');
    } finally {
      setTimeout(() => {
        setSuccessMessage('');
        setErrorMessage('');
      }, 5000);
    }
  };

  const filteredUsers = users.filter((user) =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="lm-dashboard">
      <h1>Line Monitor Dashboard</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}

      {/* USERS TABLE */}
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>NetID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Line Monitor</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.netID}>
                <td>{user.netID}</td>
                <td>{`${user.firstName} ${user.lastName}`}</td>
                <td>{user.email}</td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.isLineMonitor}
                      onChange={() => handleToggleRole(user.netID, 'isLineMonitor')}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={user.isSuperUser}
                      onChange={() => handleToggleRole(user.netID, 'isSuperUser')}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EVENTS SECTION */}
      <div className="events-section">
        <h2>Manage Events</h2>
        <div className="event-search-container">
          <input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* CREATE/EDIT FORM */}
        <div className="event-form">
          <input
            type="text"
            name="name"
            value={eventForm.name}
            onChange={handleInputChange}
            placeholder="Event Name"
            required
          />

          <label>
            Start Date:
            <input
              type="date"
              name="startDate"
              value={eventForm.startDate}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Start Time:
            <input
              type="time"
              name="startTime"
              value={eventForm.startTime}
              onChange={handleInputChange}
            />
          </label>
          <label>
            End Date:
            <input
              type="date"
              name="endDate"
              value={eventForm.endDate}
              onChange={handleInputChange}
            />
          </label>
          <label>
            End Time:
            <input
              type="time"
              name="endTime"
              value={eventForm.endTime}
              onChange={handleInputChange}
            />
          </label>

          <button onClick={handleCreateOrUpdateEvent}>
            {eventForm.id ? 'Update Event' : 'Create Event'}
          </button>
        </div>

        {/* EVENTS TABLE */}
        <div className="event-table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>StartDateTime</th>
                <th>EndDateTime</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events
                .filter((event) =>
                  event.name.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((event) => (
                  <tr key={event._id}>
                    <td>{event.name}</td>

                    {/* We assume the server is returning event.startDateTime & event.endDateTime as strings */}
                    <td>{event.startDateTime || 'N/A'}</td>
                    <td>{event.endDateTime || 'N/A'}</td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditEvent(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}