import React, { useState, useEffect, useContext } from 'react';
import '../styles/profile.css';
import UserContext from '../userContext.js';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Profile() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Identity + tent state
  const [netId, setNetId] = useState(user?.netID || null);
  const [tent, setTent] = useState(null);
  const [tentLoading, setTentLoading] = useState(true);

  // Redirect if not authed
  useEffect(() => {
    if (!user?.isAuthenticated) navigate('/login');
  }, [user, navigate]);

  // Ensure we have netID from backend (single source of truth)
  useEffect(() => {
    let cancelled = false;

    async function ensureNetId() {
      if (netId || !user?.isAuthenticated) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile/me`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Failed to load profile.');
        const me = await res.json();

        if (!cancelled) {
          setUser((prev) => ({ ...prev, netID: me.netID })); // persist to context
          setNetId(me.netID || null);
        }
      } catch {
        if (!cancelled) setNetId(null);
      }
    }

    ensureNetId();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.isAuthenticated, API_BASE_URL]);

  // Load tent by netID
  useEffect(() => {
  let cancelled = false;

  async function loadTent() {
    if (!netId) return;
    try {
      setTentLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/tent-checks`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error('Failed to load tent data.');
      const tents = await res.json();

      const needle = String(netId).toLowerCase().trim();
      const boundary = new RegExp(`(^|[^a-z0-9])${needle}([^a-z0-9]|$)`, 'i');

      const found = tents.find((t) => {
        const haystacks = [
          t.captainName,  // names
          t.members,  // names
          t.netIDs,   // <-- make sure backend sends this
        ]
          .filter(Boolean)
          .map((s) => String(s).toLowerCase());

        return haystacks.some((h) => boundary.test(h));
      });

      if (!cancelled) setTent(found || null);
    } catch (err) {
      console.error('Error loading tent data:', err);
      if (!cancelled) setTent(null);
    } finally {
      if (!cancelled) setTentLoading(false);
    }
  }

  loadTent();
  return () => {
    cancelled = true;
  };
}, [netId, API_BASE_URL]);

  // Form handlers
  const handleChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async () => {
    const { email, password, confirmPassword } = formData;

    if (password && password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setSuccessMessage('');
      return;
    }

    try {
      let anySuccess = false;

      if (email) {
        const resp = await fetch(`${API_BASE_URL}/api/profile/update-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ email }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update email.');
        }
        const data = await resp.json();
        setUser((prev) => ({ ...prev, email: data.email }));
        anySuccess = true;
      }

      if (password) {
        const resp = await fetch(`${API_BASE_URL}/api/profile/update-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          // Adjust keys to what your server expects
          body: JSON.stringify({ newPassword: password }),
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          throw new Error(err.error || 'Failed to update password.');
        }
        anySuccess = true;
      }

      if (anySuccess) {
        setSuccessMessage('Profile updated successfully!');
        setErrorMessage('');
        setFormData({ email: '', password: '', confirmPassword: '' });
      }
    } catch (e) {
      setErrorMessage(e.message || 'An unexpected error occurred.');
      setSuccessMessage('');
    }
  };

  // Helpers
  const membersArray = (tent?.members || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return (
  <div className="profile-container">
    <h1>Welcome, {user.firstName}!</h1>
    <p className="profile-greeting">
      Manage your profile and view your tent details below.
    </p>

    {/* Tent Overview Card */}
    <div className="tent-card">
      <div className="tent-card-header">
        <div className="tent-title-row">
          <h2 className="tent-name">
            {tent?.name || (tentLoading ? 'Loading…' : 'No tent found')}
          </h2>
        </div>
        {tent?.captain && (
          <div className="tent-caption">
            Captain: <strong>{tent.captainName}</strong>
          </div>
        )}

        {netId && (
          <div className="tent-caption tent-caption-dim">
            Matched by NetID: <code>{netId}</code>
          </div>
        )}
      </div>
      {/* Small stat boxes instead of pills */}
        {tent && (
          <div className="tent-stats" style={{ marginTop: '0.5rem' }}>
            {tent.order && (
              <div className="stat">
                <div className="stat-label">Order</div>
                <div className="stat-value">{tent.order}</div>
              </div>
            )}
            {tent.type && (
              <div className="stat">
                <div className="stat-label">Type</div>
                <div className="stat-value">{tent.type}</div>
              </div>
            )}
            <div className="stat">
              <div className="stat-label">Misses</div>
              <div
                className={`stat-value ${
                  Number(tent.numberOfMisses) > 0 ? 'stat-danger' : 'stat-safe'
                }`}
              >
                {tent.numberOfMisses}
              </div>
            </div>
          </div>
        )}

      {tentLoading ? (
        <div className="tent-skeleton">
          <div className="shimmer line w60"></div>
          <div className="shimmer line w40"></div>
          <div className="shimmer chips"></div>
        </div>
      ) : tent ? (
        <div className="tent-body">

          {/* Members */}
          <div className="members-wrap">
            <div className="members-title">Team Members</div>
            <ul className="members-list">
              {membersArray.map((m, i) => (
                <li key={i} className="member-chip">{m}</li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="tent-empty">
          We couldn’t find a tent associated with your netID.
        </div>
      )}
    </div>

    {/* Profile Update Form */}
    {/* Profile Update Form */}
    <div className="profile-form-card">
    <div className="profile-form">
        <label>
        Update Email:
        <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your new email"
        />
        </label>
        <label>
        Update Password:
        <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your new password"
        />
        </label>
        <label>
        Confirm Password:
        <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
        />
        </label>

        <button className="profile-update-btn" onClick={handleUpdate}>
        Update Profile
        </button>

        {successMessage && <p className="success-message">{successMessage}</p>}
        {errorMessage && <p className="error-message">{errorMessage}</p>}
    </div>
    </div>
    </div>
    );
    }

export default Profile;