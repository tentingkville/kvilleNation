import { useState, useEffect } from 'react';

function TentLinkForm({ onSuccess, onError }) {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [url, setUrl] = useState('');
  const [active, setActive] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/tent-link`)
      .then(res => res.json())
      .then(data => {
        setUrl(data.url || '');
        setActive(data.active ?? false);
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tent-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, active })
      });
      if (!res.ok) throw new Error('Failed to save link');
      onSuccess?.('Tent link updated successfully.');
    } catch (err) {
      onError?.(err.message);
    }
  };

  return (
    <div className="card">
      <h3>Tent Sign-Up Link</h3>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{ width: '100%', marginTop: 10, marginBottom: 10 }}
      />
        <div className="toggle-container">
        <label className="switch">
            <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            />
            <span className="slider"></span>
        </label>
            <span className={`toggle-label ${active ? 'active' : 'inactive'}`}>
                {active ? 'Link Active' : 'Link Inactive'}
            </span>
        </div>
      <button style={{marginTop: 10}}className="upload-btn" onClick={handleSave}>Update</button>
    </div>
  );
}

export default TentLinkForm;