import React, { useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function SeasonToggle({ onSuccess, onError }) {
  const [inSeason, setInSeason] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/season-status`);
        if (!res.ok) throw new Error('Failed to fetch season status');
        const data = await res.json();
        setInSeason(!!data.inSeason);
      } catch (err) {
        console.error(err);
        onError?.('Could not load season status.');
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  const handleToggle = async () => {
    try {
      setSaving(true);
      const newValue = !inSeason;

      const res = await fetch(`${API_BASE_URL}/api/season-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ inSeason: newValue }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update season status.');
      }

      setInSeason(newValue);
      onSuccess?.(
        newValue
          ? 'Season set to IN SEASON – tent counts enabled.'
          : 'Season set to OFF-SEASON – tent counts disabled.'
      );
    } catch (err) {
      onError?.(err.message || 'Could not update season status.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card">Loading season status…</div>;

  return (
  <div className="season-settings-card">

    <div className="season-settings-header">
      <h2>Season Settings</h2>
      <p>Toggle whether K-Ville is currently in season.</p>
    </div>

    <div className="season-status-row">

      {/* LEFT STATUS */}
      <span
        className={`season-status-indicator ${inSeason ? 'on' : 'off'}`}
      >
        {inSeason ? "In Season" : "Off-Season"}
      </span>

      {/* MIDDLE TOGGLE */}
      <div className="season-toggle-group">
        <span
          className={`season-toggle-text ${inSeason ? 'on' : 'off'}`}
        >
          {inSeason ? "ON" : "OFF"}
        </span>

        <label className="switch">
          <input
            type="checkbox"
            checked={inSeason}
            onChange={handleToggle}
          />
          <span className="slider"></span>
        </label>
      </div>

      {/* RIGHT BUTTON */}
      <button
        className="season-toggle-button"
        disabled={saving}
        onClick={handleToggle}
      >
        {saving
          ? "Saving…"
          : inSeason
          ? "Switch to Off-Season"
          : "Switch to In-Season"}
      </button>

    </div>
  </div>
);
}