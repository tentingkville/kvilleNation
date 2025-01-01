import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';  // <-- Import from socket.io-client
import axios from 'axios';
import '../styles/tentCheck.css'; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Initialize Socket.IO client with the backend URL
// If you need credentials and CORS, enable { withCredentials: true }
const socket = io(API_BASE_URL, { withCredentials: true });

const TentCheck = () => {
  const [tents, setTents] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState({});
  const [isCheckStarted, setIsCheckStarted] = useState(false);
  const [numCheckers, setNumCheckers] = useState(
    parseInt(localStorage.getItem('numCheckers')) || 1
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem('currentPage')) || 0
  );

  useEffect(() => {
    // 1) Fetch initial data from the backend
    const fetchInitialData = async () => {
      try {
        const tentsResponse = await axios.get(`${API_BASE_URL}/api/tent-checks`, {
          withCredentials: true
        });
        const sortedTents = tentsResponse.data.sort((a, b) => a.order - b.order);

        const checkResponse = await axios.get(`${API_BASE_URL}/api/check-status`, {
          withCredentials: true
        });
        const { isCheckInProgress, activeTents } = checkResponse.data;

        setIsCheckStarted(isCheckInProgress);
        if (isCheckInProgress && activeTents) {
          setTents(activeTents); // activeTents already have groupIndex assigned
        } else {
          setTents(sortedTents);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    // 2) Listen for real-time Socket.IO events
    socket.on('checkStarted', ({activeTents, numCheckers}) => {
      setIsCheckStarted(true);
      setTents(activeTents);
      setNumCheckers(numCheckers);
      setCurrentPage(0);
      localStorage.setItem('numCheckers', numCheckers);
    });

    socket.on('tentStatusUpdated', (data) => {
      setTents((prevTents) => prevTents.filter((tent) => tent.id !== data.id));
    });

    socket.on('checkCanceled', () => {
      setIsCheckStarted(false);
      setTents([]);
      setCurrentPage(0);
      localStorage.setItem('currentPage', 0); // Reset pagination on cancel
    });

    // Cleanup when component unmounts
    return () => {
      socket.off('checkStarted');
      socket.off('tentStatusUpdated');
      socket.off('checkCanceled');
    };
  }, []);

  // Helper to format date/time
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${date} ${time}`;
  };

  // Called when "Start Check" button is clicked
  const handleStartCheck = async () => {
    if (isCheckStarted) {
      alert('A check has already started.');
      return;
    }

    const chunkSize = Math.ceil(tents.length / numCheckers);
    let assignedTents = [...tents];

    for (let i = 0; i < numCheckers; i++) {
      const start = i * chunkSize;
      const end = start + chunkSize;
      const groupTents = assignedTents.slice(start, end);
      groupTents.forEach((tent) => {
        tent.groupIndex = i;
      });
    }

    setTents(assignedTents);
    setIsCheckStarted(true);

    // We call an API route, which on the backend triggers `io.emit('checkStarted', ...)`
    try {
      await axios.post(`${API_BASE_URL}/api/start-check`, {
        tents: assignedTents,
        numCheckers
      }, { withCredentials: true });
      alert('Check started!');
    } catch (error) {
      console.error('Error starting check:', error);
    }
  };

  // Called when "Cancel Check" button is clicked
  const handleCancelCheck = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/cancel-check`, {}, { withCredentials: true });
      // The backend triggers 'checkCanceled' for all clients
      setIsCheckStarted(false);
      setTents([]);
      setCurrentPage(0);
      localStorage.setItem('currentPage', 0);
      alert('Check has been canceled');
    } catch (error) {
      console.error('Error canceling check:', error);
    }
  };

  // Toggle user selection in a tent
  const toggleSelection = (tentId, member) => {
    setSelectedMembers((prevSelected) => {
      const selectedInTent = prevSelected[tentId] || [];
      if (selectedInTent.includes(member)) {
        return {
          ...prevSelected,
          [tentId]: selectedInTent.filter((m) => m !== member),
        };
      } else {
        return {
          ...prevSelected,
          [tentId]: [...selectedInTent, member],
        };
      }
    });
  };

  // Called when the "How many checkers?" input changes
  const handleNumCheckersChange = (e) => {
    if (isCheckStarted) {
      alert('Cannot change number of checkers during an active check');
      return;
    }
    const newNumCheckers = parseInt(e.target.value) || 1;
    setNumCheckers(newNumCheckers);
    localStorage.setItem('numCheckers', newNumCheckers);
  };

  // Switch between pages (groupIndex)
  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex);
    localStorage.setItem('currentPage', pageIndex);
  };

  // Mark a tent as Miss
  const handleMiss = async (tentId) => {
    try {
      const tent = tents.find((t) => t.id === tentId);
      if (!tent) {
        console.error(`Tent with ID ${tentId} not found.`);
        return;
      }

      const lastMissLM = 'user'; // Replace with actual user if needed
      const dateOfLastMiss = getCurrentDateTime();

      // Add a CSS class for a removal animation
      document.getElementById(`tent-${tentId}`).classList.add('removing');

      setTimeout(async () => {
        await axios.post(`${API_BASE_URL}/api/tent-checks/update`, {
          id: tentId,
          misses: (tent.numberOfMisses || 0) + 1,
          lastMissLM,
          dateOfLastMiss
        }, { withCredentials: true });
        // The backend triggers 'tentStatusUpdated' after updating
      }, 500);
    } catch (error) {
      console.error('Error marking miss:', error);
    }
  };

  // Mark a tent as Make
  const handleMake = async (tentId) => {
    const madeMembers = selectedMembers[tentId] || [];
    const dateOfLastCheck = getCurrentDateTime();

    try {
      document.getElementById(`tent-${tentId}`).classList.add('removing');

      setTimeout(async () => {
        await axios.post(`${API_BASE_URL}/api/tent-checks/update`, {
          id: tentId,
          lastCheck: madeMembers.join(', ') || 'No members selected',
          dateOfLastCheck
        }, { withCredentials: true });
        // The backend triggers 'tentStatusUpdated' after updating
      }, 500);
    } catch (error) {
      console.error('Error marking make:', error);
    }
  };

  // Filter tents by groupIndex (the current "page")
  const tentsInCurrentPage = tents.filter(tent => tent.groupIndex === currentPage);
  return (
    <div className="tent-check">
      {/* If check not started, show the "Start Check" UI */}
      {!isCheckStarted ? (
        <div className="start-check">
          <h2>Start Tent Check</h2>
          <label htmlFor="numCheckers">How many checkers?</label>
          <input
            id="numCheckers"
            type="number"
            value={numCheckers}
            onChange={handleNumCheckersChange}
            min="1"
          />
          <button onClick={handleStartCheck}>Start Check</button>
        </div>
      ) : (
        // If check is started, show the pagination and tent list
        <div>
          <button className="cancel-check" onClick={handleCancelCheck}>
            Cancel Check
          </button>
          <div className="pagination">
            {[...Array(numCheckers)].map((_, index) => (
              <button
                key={index}
                className={currentPage === index ? 'active' : ''}
                onClick={() => handlePageChange(index)}
              >
                Page {index + 1}
              </button>
            ))}
          </div>

          {tentsInCurrentPage.map((tent) => (
            <div key={tent.id} id={`tent-${tent.id}`} className="tent-card">
              <h2>Tent {tent.order}</h2>
              <p><strong>Day Number:</strong> {tent.dayNumber}</p>
              <p><strong>Night Number:</strong> {tent.nightNumber}</p>
              <ul className="members-list">
                {tent.members.split(',').map((member) => (
                  <li
                    key={member.trim()}
                    className={
                      selectedMembers[tent.id]?.includes(member.trim()) ? 'selected' : ''
                    }
                    onClick={() => toggleSelection(tent.id, member.trim())}
                  >
                    {member.trim()}
                  </li>
                ))}
              </ul>
              <div className="actions">
                <button onClick={() => handleMiss(tent.id)}>Miss</button>
                <button onClick={() => handleMake(tent.id)}>Make</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TentCheck;