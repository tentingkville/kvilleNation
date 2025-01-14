import React, { useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import '../styles/tentCheck.css'; 
import UserContext from '../userContext';
import {debounce} from 'lodash';

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
  const [excludedNames, setExcludedNames] = useState([]);
  // total pages = actual checkers + 1 for the "Duke Card Checker"

  const [dukeSearchTerm, setDukeSearchTerm] = useState('');
  const { user } = useContext(UserContext); 
  // 1) On mount: fetch data, listen to sockets
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // fetch all tents
        const tentsResponse = await axios.get(`${API_BASE_URL}/api/tent-checks`, {
          withCredentials: true,
        });
        const sortedTents = tentsResponse.data.sort((a, b) =>
          a.order.localeCompare(b.order, 'en', { numeric: true })
        );
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
    socket.on('excludedNamesUpdated', (serverExcluded) => {
      setExcludedNames(serverExcluded);
    });
    socket.on('selectedMembersUpdated', (serverSelected) => {
      setSelectedMembers(serverSelected);
    });

    return () => {
      socket.off('checkStarted');
      socket.off('tentStatusUpdated');
      socket.off('checkCanceled');
      socket.off('checkEnded');
      socket.off('excludedNamesUpdated');
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
  const toggleExcludedName = (name) => {
    setExcludedNames((prev) => {
      const updated = prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name];
      debounceEmit('excludedNamesUpdated', updated); // Debounced emit
      return updated;
    });
  };
  const getCurrentDateTime = () => {
    const dateTimeStr = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/New_York',
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());
    
    return dateTimeStr;
  };
  const handleStartCheck = async () => {
    if (isCheckStarted) {
      alert('A check is already in progress.');
      return;
    }
  
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tent-checks`, {
        withCredentials: true,
      });
  
      const sortedTents = response.data.sort((a, b) =>
        a.order.localeCompare(b.order, 'en', { numeric: true })
      );
  
      const chunkSize = Math.ceil(sortedTents.length / numCheckers);
      const assignedTents = sortedTents.map((tent, index) => ({
        ...tent,
        groupIndex: Math.floor(index / chunkSize),
      }));
  
      setTents(assignedTents);
      setIsCheckStarted(true);
  
      await axios.post(
        `${API_BASE_URL}/api/start-check`,
        { tents: assignedTents, numCheckers },
        { withCredentials: true }
      );
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

  const decrementCheckers = () => {
    setNumCheckers((prev) => {
      const newVal = Math.max(1, prev - 1);
      localStorage.setItem('numCheckers', newVal);
      return newVal;
    });
  };

  const incrementCheckers = () => {
    setNumCheckers((prev) => {
      const newVal = prev + 1;
      localStorage.setItem('numCheckers', newVal);
      return newVal;
    });
  };
  const debounceEmit = debounce((event, data) => {
    socket.emit(event, data);
  }, 200);

  const toggleSelection = (tentId, member) => {
    if (excludedNames.includes(member)) {
      alert(`${member} is excluded!`);
      return;
    }
  
    setSelectedMembers((prev) => {
      const selectedInTent = prev[tentId] || [];
      const updated = selectedInTent.includes(member)
        ? {
            ...prev,
            [tentId]: selectedInTent.filter((m) => m !== member),
          }
        : {
            ...prev,
            [tentId]: [...selectedInTent, member],
          };
  
      debounceEmit('selectedMembersUpdated', updated); // Debounced emit
      return updated;
    });
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

      const lastMissLM = user.firstName || "Unknown User"; 
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
  const allMembers = [];
  tents.forEach((tent) => {
    const membersArr = tent.members.split(',').map(m => m.trim()).filter(Boolean);
    membersArr.forEach((m) => {
      if (!allMembers.includes(m)) {
        allMembers.push(m);
      }
    });
  });

  function getRangeForPage(pageIndex) {
    // 1) Filter out tents for this page
    const pageTents = tents.filter((t) => t.groupIndex === pageIndex);
    if (pageTents.length === 0) return '';
  
    // 2) Since you assigned groupIndex *after* sorting,
    //    the subset is already in ascending order.
    //    So just take the first and last item in pageTents.
    const firstOrder = pageTents[0].order;
    const lastOrder = pageTents[pageTents.length - 1].order;
  
    // 3) Return the 'lowest' - 'highest' range
    return `${firstOrder} - ${lastOrder}`;
  }
  const MemberList = React.memo(({ members, tentId, toggleSelection, selectedMembers, excludedNames }) => (
    <ul className="members-list">
      {members.map((member) => (
        <li
          key={member}
          className={
            excludedNames.includes(member)
              ? 'excluded'
              : selectedMembers[tentId]?.includes(member)
              ? 'selected'
              : ''
          }
          onClick={() => toggleSelection(tentId, member)}
        >
          {member}
        </li>
      ))}
    </ul>
  ));
  return (
    <div className="tent-check">
      {!isCheckStarted ? (
        <div className="start-check">
          <h2>Start Tent Check</h2>
          <label>How many checkers?</label>
          <div className="spinner-container">
            <button onClick={decrementCheckers} className="spinner-button">
              –
            </button>
            <span className="checker-value">{numCheckers}</span>
            <button onClick={incrementCheckers} className="spinner-button">
              +
            </button>
          </div>
          <button onClick={handleStartCheck}>Start Check</button>
        </div>
      ) : (
        <div>
          <button className="cancel-check" onClick={handleCancelCheck}>
            Cancel Check
          </button>
          <div className="pagination">
            {[...Array(numCheckers + 1)].map((_, index) => {
              const isDukePage = index === numCheckers;
              let range = '';
  
              if (!isDukePage) {
                range = getRangeForPage(index); // e.g. "A - U"
              }
  
              return (
                <button
                  key={index}
                  className={currentPage === index ? 'active' : ''}
                  onClick={() => handlePageChange(index)}
                >
                  {isDukePage
                    ? 'Duke Card Checker'
                    : `Page ${index + 1} (${range})`}
                </button>
              );
            })}
          </div>
  
          {currentPage === numCheckers ? (
            /* DUKE CARD CHECKER PAGE */
            <div className="duke-card-checker">
              <h2>Duke Card Checker</h2>
              <p>Select names to exclude (they will appear 'excluded' on other pages)</p>
  
              <div className="search-bar">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={dukeSearchTerm}
                  onChange={(e) => setDukeSearchTerm(e.target.value)}
                />
              </div>
  
              <ul>
                {allMembers
                  .filter((name) =>
                    name.toLowerCase().includes(dukeSearchTerm.toLowerCase())
                  )
                  .map((name) => {
                    const isExcluded = excludedNames.includes(name);
  
                    return (
                      <li
                        key={name}
                        className={isExcluded ? 'excluded' : ''}
                        onClick={() => toggleExcludedName(name)}
                      >
                        {name}
                      </li>
                    );
                  })}
              </ul>
            </div>
          ) : (
            /* NORMAL CHECKER PAGES for index < numCheckers */
            <div>
              {tentsInCurrentPage.map((tent) => (
                <div key={tent.id} id={`tent-${tent.id}`} className="tent-card">
                  <h2>Tent {tent.order}</h2>
                  <p>
                    <strong>Day Number:</strong> {tent.dayNumber}
                  </p>
                  <p>
                    <strong>Night Number:</strong> {tent.nightNumber}
                  </p>
                  {tent.name && (
                    <p>
                      <strong className="tent-name">{tent.name}</strong>
                    </p>
                  )}
                  <MemberList
                    members={tent.members.split(',').map((m) => m.trim())}
                    tentId={tent.id}
                    toggleSelection={toggleSelection}
                    selectedMembers={selectedMembers}
                    excludedNames={excludedNames}
                  />
                  <div className="actions">
                    <button onClick={() => handleMiss(tent.id)}>Miss</button>
                    <button onClick={() => handleMake(tent.id)}>Make</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}