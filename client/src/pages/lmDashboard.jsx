import React, { useState, useEffect } from 'react';
import '../styles/lmDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const LmDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
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
        body: JSON.stringify({
          netID,
          field,
          value: newValue,
        }),
      });

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.netID === netID ? { ...u, [field]: newValue } : u
          )
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

    const payload = {
      name,
      startDate,
      startTime,
      endDate,
      endTime,
    };

    try {
      const endpoint = id ? `/api/events/update/${id}` : '/api/events/create';
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
          setEvents((prevEvents) =>
            prevEvents.map((event) =>
              event._id === id ? updatedEvent : event
            )
          );
          setSuccessMessage('Event updated successfully!');
        } else {
          setEvents((prevEvents) => [...prevEvents, updatedEvent]);
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
    setEventForm({
      id: event._id,
      name: event.name,
      startDate: event.startDate,
      startTime: event.startTime || '',
      endDate: event.endDate || '',
      endTime: event.endTime || '',
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
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event._id !== id)
        );
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
  <div className="event-table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Start Date</th>
          <th>Start Time</th>
          <th>End Date</th>
          <th>End Time</th>
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
              <td>{event.startDate}</td>
              <td>{event.startTime}</td>
              <td>{event.endDate || 'N/A'}</td>
              <td>{event.endTime || 'N/A'}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEditEvent(event)}>
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
};

export default LmDashboard;