import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../styles/tentCheck.css'; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const socket = io(API_BASE_URL, { withCredentials: true });

export default function TentCheck() {
  const [tents, setTents] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState({});
  const [isCheckStarted, setIsCheckStarted] = useState(false);
  const [numCheckers, setNumCheckers] = useState(
    parseInt(localStorage.getItem('numCheckers')) || 1
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem('currentPage')) || 0
  );

  // 1) On mount: fetch data, listen to sockets
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // fetch all tents
        const tentsResponse = await axios.get(`${API_BASE_URL}/api/tent-checks`, {
          withCredentials: true,
        });
        const sortedTents = tentsResponse.data.sort((a, b) => a.order - b.order);

        // check if a check is in progress
        const checkResponse = await axios.get(`${API_BASE_URL}/api/check-status`, {
          withCredentials: true,
        });
        const { isCheckInProgress, activeTents } = checkResponse.data;

        setIsCheckStarted(isCheckInProgress);
        if (isCheckInProgress && activeTents) {
          setTents(activeTents);
        } else {
          setTents(sortedTents);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };

    fetchInitialData();

    // Socket listeners
    socket.on('checkStarted', ({ activeTents, numCheckers }) => {
      setIsCheckStarted(true);
      setTents(activeTents);
      setNumCheckers(numCheckers);
      setCurrentPage(0);
      localStorage.setItem('numCheckers', numCheckers);
    });

    socket.on('tentStatusUpdated', (data) => {
      setTents((prev) => prev.filter((tent) => tent.id !== data.id));
    });

    socket.on('checkCanceled', () => {
      setIsCheckStarted(false);
      setTents([]);
      setCurrentPage(0);
      localStorage.setItem('currentPage', 0);
    });

    // *** New: Listen for 'checkEnded' ***
    socket.on('checkEnded', () => {
      setIsCheckStarted(false);
      setTents([]);
      setCurrentPage(0);
      localStorage.setItem('currentPage', 0);
      alert('Check ended!');
    });

    return () => {
      socket.off('checkStarted');
      socket.off('tentStatusUpdated');
      socket.off('checkCanceled');
      socket.off('checkEnded');
    };
  }, []);

  // 2) If the check is started but no tents remain, end automatically
  //    We'll call /api/end-check to let the server know.
  useEffect(() => {
    if (isCheckStarted && tents.length === 0) {
      alert('No more tents — ending check now...');
      axios.post(`${API_BASE_URL}/api/end-check`, {}, { withCredentials: true })
        .catch((err) => console.error('Error ending check automatically:', err));
      // The server will emit 'checkEnded', which resets everything
    }
  }, [isCheckStarted, tents]);

  // Helper: format date/time
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${date} ${time}`;
  };

  const handleStartCheck = async () => {
    if (isCheckStarted) {
      alert('A check has already started.');
      return;
    }
    // Re-fetch tents
    const tentsResponse = await axios.get(`${API_BASE_URL}/api/tent-checks`, {
      withCredentials: true,
    });
    const sortedTents = tentsResponse.data.sort((a, b) => a.order - b.order);

    // chunk them by groupIndex
    const chunkSize = Math.ceil(sortedTents.length / numCheckers);
    let assignedTents = [...sortedTents];
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

    try {
      await axios.post(
        `${API_BASE_URL}/api/start-check`,
        {
          tents: assignedTents,
          numCheckers,
        },
        { withCredentials: true }
      );
      alert('Check started!');
    } catch (error) {
      console.error('Error starting check:', error);
    }
  };

  const handleCancelCheck = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/cancel-check`, {}, { withCredentials: true });
      setIsCheckStarted(false);
      setTents([]);
      setCurrentPage(0);
      localStorage.setItem('currentPage', 0);
      alert('Check has been canceled');
    } catch (error) {
      console.error('Error canceling check:', error);
    }
  };

  // *** Optionally add a manual "End Check" button. ***
  const handleEndCheck = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/end-check`, {}, { withCredentials: true });
      // The server will emit 'checkEnded', which resets everything
    } catch (error) {
      console.error('Error ending check:', error);
    }
  };

  const toggleSelection = (tentId, member) => {
    setSelectedMembers((prev) => {
      const selectedInTent = prev[tentId] || [];
      if (selectedInTent.includes(member)) {
        return {
          ...prev,
          [tentId]: selectedInTent.filter((m) => m !== member),
        };
      } else {
        return {
          ...prev,
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

      const lastMissLM = 'user'; // Replace with actual user if needed
      const dateOfLastMiss = getCurrentDateTime();

      document.getElementById(`tent-${tentId}`).classList.add('removing');
      setTimeout(async () => {
        await axios.post(
          `${API_BASE_URL}/api/tent-checks/update`,
          {
            id: tentId,
            misses: (tent.numberOfMisses || 0) + 1,
            lastMissLM,
            dateOfLastMiss,
          },
          { withCredentials: true }
        );
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
        await axios.post(
          `${API_BASE_URL}/api/tent-checks/update`,
          {
            id: tentId,
            lastCheck: madeMembers.join(', ') || 'No members selected',
            dateOfLastCheck,
          },
          { withCredentials: true }
        );
      }, 500);
    } catch (error) {
      console.error('Error marking make:', error);
    }
  };

  const tentsInCurrentPage = tents.filter((t) => t.groupIndex === currentPage);

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
          {/* Manual "End Check" button if you want */}
          <button className="end-check" onClick={handleEndCheck}>
            End Check
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
                      selectedMembers[tent.id]?.includes(member.trim())
                        ? 'selected'
                        : ''
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
}