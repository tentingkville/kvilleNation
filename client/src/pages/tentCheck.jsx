import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../styles/tentCheck.css'; // Include your CSS file

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const socket = io(API_BASE_URL); // WebSocket connection

const TentCheck = () => {
  const [tents, setTents] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState({});
  const [isCheckStarted, setIsCheckStarted] = useState(false);
  const [numCheckers, setNumCheckers] = useState(
    parseInt(localStorage.getItem('numCheckers')) || 1
  ); // Load numCheckers from local storage or default to 1
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem('currentPage')) || 0
  ); // Load currentPage from local storage or default to 0

  // Fetch tents and check state on component load
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const tentsResponse = await axios.get(`${API_BASE_URL}/api/tent-checks`);
        const sortedTents = tentsResponse.data.sort((a, b) => a.order - b.order);

        const checkResponse = await axios.get(`${API_BASE_URL}/api/check-status`);
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

    // Set up socket listeners
    socket.on('checkStarted', (activeTents) => {
      setIsCheckStarted(true);
      setTents(activeTents); // activeTents already have groupIndex assigned
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

    return () => {
      socket.off('checkStarted');
      socket.off('tentStatusUpdated');
      socket.off('checkCanceled');
    };
  }, []); // Empty dependency array to run only once

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
    const date = now.toLocaleDateString('en-US', options); // Format: 3/1/2024
    const time = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }); // Format: 8:49am
    return `${date} ${time}`;
  };

  const handleStartCheck = () => {
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

    socket.emit('startCheck', { tents: assignedTents, numCheckers });

    alert('Check started!');
  };

  const handleCancelCheck = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/cancel-check`);
      setIsCheckStarted(false);
      setTents([]);
      setCurrentPage(0);
      localStorage.setItem('currentPage', 0); // Reset pagination
      alert('Check has been canceled');
    } catch (error) {
      console.error('Error canceling check:', error);
    }
  };

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

  const handleNumCheckersChange = (e) => {
    if (isCheckStarted) {
      alert('Cannot change number of checkers during an active check');
      return;
    }
    const newNumCheckers = parseInt(e.target.value) || 1;
    setNumCheckers(newNumCheckers);
    localStorage.setItem('numCheckers', newNumCheckers); // Save to local storage
  };

  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex);
    localStorage.setItem('currentPage', pageIndex); // Save current page to local storage
  };

  const handleMiss = async (tentId) => {
    try {
      const tent = tents.find((t) => t.id === tentId);
      if (!tent) {
        console.error(`Tent with ID ${tentId} not found.`);
        return;
      }

      const lastMissLM = 'user'; // Replace with actual user (e.g., user.netID)
      const dateOfLastMiss = getCurrentDateTime();

      document.getElementById(`tent-${tentId}`).classList.add('removing');

      setTimeout(async () => {
        await axios.post(`${API_BASE_URL}/api/tent-checks/update`, {
          id: tentId,
          misses: (tent.numberOfMisses || 0) + 1,
          lastMissLM,
          dateOfLastMiss,
        });

        socket.emit('updateTentStatus', {
          id: tentId,
          misses: (tent.numberOfMisses || 0) + 1,
          lastMissLM,
          dateOfLastMiss,
        });
      }, 500);
    } catch (error) {
      console.error('Error marking miss:', error);
    }
  };

  const handleMake = async (tentId) => {
    const madeMembers = selectedMembers[tentId] || [];
    const dateOfLastCheck = getCurrentDateTime();

    try {
      document.getElementById(`tent-${tentId}`).classList.add('removing');

      setTimeout(async () => {
        await axios.post(`${API_BASE_URL}/api/tent-checks/update`, {
          id: tentId,
          lastCheck: madeMembers.join(', ') || 'No members selected',
          dateOfLastCheck,
        });

        socket.emit('updateTentStatus', {
          id: tentId,
          lastCheck: madeMembers.join(', ') || 'No members selected',
          dateOfLastCheck,
        });
      }, 500);
    } catch (error) {
      console.error('Error marking make:', error);
    }
  };

  const tentsInCurrentPage = tents.filter((tent) => tent.groupIndex === currentPage);

  return (
    <div className="tent-check">
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
              <p>
                <strong>Day Number:</strong> {tent.dayNumber}
              </p>
              <p>
                <strong>Night Number:</strong> {tent.nightNumber}
              </p>
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