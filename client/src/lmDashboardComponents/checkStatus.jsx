import React, { useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function CheckStatus({ onSuccess, onError, autoRefreshMs = 10000 }) {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ isCheckInProgress: false, activeTents: [] });
  const [busy, setBusy] = useState(false);

  async function fetchStatus() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/check-status`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      onError?.(e.message || 'Could not load check status.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    if (autoRefreshMs > 0) {
      const t = setInterval(fetchStatus, autoRefreshMs);
      return () => clearInterval(t);
    }
  }, []); // eslint-disable-line

  async function post(path, okMsg) {
    try {
      setBusy(true);
      const res = await fetch(`${API_BASE_URL}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error(await res.text());
      onSuccess?.(okMsg);
      await fetchStatus();
    } catch (e) {
      onError?.(e.message || 'Action failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="check-status-row">
        <span className={`pill ${status.isCheckInProgress ? 'pill-live' : 'pill-idle'}`}>
          {status.isCheckInProgress ? 'Check In Progress' : 'Idle'}
        </span>
        <span className="pill pill-muted">Active Tents: {status.activeTents?.length || 0}</span>
      </div>

      <div className="actions">
        <button
          type="button"
          disabled={busy || !status.isCheckInProgress}
          onClick={() => post('/api/end-check', 'Check ended.')}
        >
          End Check
        </button>
        <button
          type="button"
          className="secondary"
          disabled={busy || !status.isCheckInProgress}
          onClick={() => post('/api/cancel-check', 'Check canceled.')}
        >
          Cancel Check
        </button>
        <button
          type="button"
          className="secondary"
          disabled={busy}
          onClick={fetchStatus}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}