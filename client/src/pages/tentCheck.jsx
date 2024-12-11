import React, { useState, useEffect } from 'react';
import Pusher from 'pusher-js';
import axios from 'axios';
import '../styles/tentCheck.css'; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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

    // Initialize Pusher
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });

    // Subscribe to a channel (you can name it something meaningful, e.g. 'tent-check-channel')
    const channel = pusher.subscribe('tent-check-channel');

    // Replaces socket.on('checkStarted', ...)
    channel.bind('checkStarted', (activeTents) => {
      setIsCheckStarted(true);
      setTents(activeTents);
    });

    // Replaces socket.on('tentStatusUpdated', ...)
    channel.bind('tentStatusUpdated', (data) => {
      setTents((prevTents) => prevTents.filter((tent) => tent.id !== data.id));
    });

    // Replaces socket.on('checkCanceled', ...)
    channel.bind('checkCanceled', () => {
      setIsCheckStarted(false);
      setTents([]);
      setCurrentPage(0);
      localStorage.setItem('currentPage', 0); // Reset pagination on cancel
    });

    // Cleanup when component unmounts
    return () => {
      pusher.unsubscribe('tent-check-channel');
    };
  }, []); // Empty dependency array to run only once

  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { month: 'numeric', day: 'numeric', year: 'numeric' };
    const date = now.toLocaleDateString('en-US', options);
    const time = now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${date} ${time}`;
  };

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

    // Instead of socket.emit, we call an API endpoint that triggers the Pusher event
    try {
      await axios.post(`${API_BASE_URL}/api/start-check`, {
        tents: assignedTents,
        numCheckers,
      });
      alert('Check started!');
    } catch (error) {
      console.error('Error starting check:', error);
    }
  };

  const handleCancelCheck = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/cancel-check`);
      // No need to manually set state here if the Pusher event handles it, but we do just in case
      setIsCheckStarted(false);
      setTents([]);
      setCurrentPage(0);
      localStorage.setItem('currentPage', 0);
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
    localStorage.setItem('numCheckers', newNumCheckers);
  };

  const handlePageChange = (pageIndex) => {
    setCurrentPage(pageIndex);
    localStorage.setItem('currentPage', pageIndex);
  };

  const handleMiss = async (tentId) => {
    try {
      const tent = tents.find((t) => t.id === tentId);
      if (!tent) {
        console.error(`Tent with ID ${tentId} not found.`);
        return;
      }

      const lastMissLM = 'user'; // Replace with actual user info if needed
      const dateOfLastMiss = getCurrentDateTime();

      document.getElementById(`tent-${tentId}`).classList.add('removing');

      setTimeout(async () => {
        await axios.post(`${API_BASE_URL}/api/tent-checks/update`, {
          id: tentId,
          misses: (tent.numberOfMisses || 0) + 1,
          lastMissLM,
          dateOfLastMiss,
        });
        // The backend triggers 'tentStatusUpdated' via Pusher, so no need for socket.emit
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
        // The backend triggers 'tentStatusUpdated' via Pusher
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
              <p><strong>Day Number:</strong> {tent.dayNumber}</p>
              <p><strong>Night Number:</strong> {tent.nightNumber}</p>
              <ul className="members-list">
                {tent.members.split(',').map((member) => (
                  <li
                    key={member.trim()}
                    className={selectedMembers[tent.id]?.includes(member.trim()) ? 'selected' : ''}
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