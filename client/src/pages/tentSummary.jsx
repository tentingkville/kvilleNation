import React, { useEffect, useState } from 'react';
import '../styles/tentSummary.css';

function TentSummary() {
    const [tents, setTents] = useState([]);
    const [activeType, setActiveType] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetch('http://localhost:8081/api/tent/tents')
            .then(response => response.json())
            .then(setTents)
            .catch(error => console.error('Error fetching tents:', error));
    }, []);

    const groupTentsByType = () => {
        return tents.reduce((group, tent) => {
            (group[tent.typeOfTent] = group[tent.typeOfTent] || []).push(tent);
            return group;
        }, {});
    };
    const handleSearch = (event) => {
        const query = event.target.value.toLowerCase();
        setSearchQuery(query);
    
        if (query) {
            let matchedType = null;
    
            for (const type of tentTypesOrder) {
                const foundInType = tentGroups[type].some(tent => {
                    const { order, captainNetID, captainName } = tent;
                    const members = formatMembers(tent.members);
                    return order.toString().toLowerCase().includes(query) ||
                           captainNetID.toLowerCase().includes(query) ||
                           captainName.toLowerCase().includes(query) ||
                           members.keys.toLowerCase().includes(query) ||
                           members.names.toLowerCase().includes(query);
                });
    
                if (foundInType) {
                    matchedType = type;
                    break; // Stop searching once a match is found
                }
            }
    
            if (matchedType) {
                setActiveType(matchedType);
            }
        } else {
            setActiveType(null); // Reset active section if search query is cleared
        }
    };
    
    

    const formatMembers = (members) => {
        const keys = Object.keys(members).join(', ');
        const names = Object.values(members).join(', ');
        return { keys, names };
    };

    const highlightSearch = (text) => {
        if (!searchQuery) return text;

        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
        return parts.map((part, index) => 
            part.toLowerCase() === searchQuery.toLowerCase() ? <span key={index} style={{ backgroundColor: 'yellow' }}>{part}</span> : part
        );
    };

    const tentGroups = groupTentsByType();
    const tentTypesOrder = ['black', 'blue', 'dirty black', 'dirty blue', 'white', 'flex'];

    return (
        <div className="tent-summary">
            <input type="text" placeholder="Search..." onChange={handleSearch} />
            <div className="types-container">
                {tentTypesOrder.map(type => (
                    <div key={type} className="type-section">
                        <button className={`type-accordion ${activeType === type ? 'active' : ''}`}
                            onClick={() => setActiveType(activeType === type ? null : type)}>
                            <span className={`tent-type-label-${type.replace(/\s+/g, '-')}`}>
                                {type}
                            </span> ({tentGroups[type]?.length || 0})
                        </button>
                        <div className={`type-panel ${activeType === type ? 'active' : ''}`}>
                            {activeType === type && (
                                <div>
                                    <div className="tent-row header-row">
                                        {['Order', 'Date of Registration', 'Captain NetID', 'Captain Name', 'Member NetIDs', 'Member Names', 'Misses', 'Start Date', 'Last Check', 'Last Check Member', 'Last Miss', 'Last Miss LM', 'Buddy Tent'].map((header, index) => (
                                            <div key={index} className="tent-cell header-cell">
                                                {highlightSearch(header)}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="tents-table">
                                        {tentGroups[type].map((tent, index) => {
                                            const { keys, names } = formatMembers(tent.members);
                                            return (
                                                <div key={index} className="tent-row">
                                                    <div className="tent-cell">{highlightSearch(tent.order.toString())}</div>
                                                    <div className="tent-cell">{(new Date(tent.dateOfRegistration).toLocaleString('en-US'))}</div>
                                                    <div className="tent-cell">{(tent.captainNetID)}</div>
                                                    <div className="tent-cell">{(tent.captainName)}</div>
                                                    <div className="tent-cell">{(keys)}</div>
                                                    <div className="tent-cell">{(names)}</div>
                                                    <div className="tent-cell">{(tent.numberOfMisses.toString())}</div>
                                                    <div className="tent-cell">{(new Date(tent.startDate).toLocaleString('en-US'))}</div>
                                                    <div className="tent-cell">{(new Date(tent.dateOfLastCheck).toLocaleString('en-US'))}</div>
                                                    <div className="tent-cell">{(tent.lastCheck)}</div>
                                                    <div className="tent-cell">{(new Date(tent.dateOfLastMiss).toLocaleString('en-US'))}</div>
                                                    <div className="tent-cell">{('oops')}</div>
                                                    <div className="tent-cell">{(tent.buddyTent)}</div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TentSummary;
