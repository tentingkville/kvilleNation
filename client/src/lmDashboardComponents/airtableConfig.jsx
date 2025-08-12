import React, { useEffect, useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function AirtableConfigForm({ onSuccess, onError }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const [form, setForm] = useState({
    airtableApiKey: '',
    airtableBaseId: '',
    airtableTableId: '',
  });

  const [serverSnapshot, setServerSnapshot] = useState(form);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedApiKey, setMaskedApiKey] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/airtable-config`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (!res.ok) throw new Error('Failed to load Airtable config.');
        const data = await res.json();
        if (!cancelled) {
          setHasApiKey(Boolean(data.hasApiKey));
          setMaskedApiKey(data.maskedApiKey || '');
          const snap = {
            airtableApiKey: '', // never store the actual key
            airtableBaseId: data.airtableBaseId || '',
            airtableTableId: data.airtableTableId || '',
          };
          setForm(snap);
          setServerSnapshot(snap);
        }
      } catch (e) {
        onError?.(e.message || 'Could not load Airtable settings.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [onError]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onReset = () => setForm(serverSnapshot);

  const onSave = async () => {
    if (!form.airtableBaseId || !form.airtableTableId) {
      onError?.('Base ID and Table ID are required.');
      return;
    }
    try {
      setSaving(true);
      // Only send key if a new one is entered
      const payload = {
        airtableBaseId: form.airtableBaseId,
        airtableTableId: form.airtableTableId,
      };
      if (form.airtableApiKey.trim()) {
        payload.airtableApiKey = form.airtableApiKey.trim();
      }

      const res = await fetch(`${API_BASE_URL}/api/airtable-config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save Airtable config.');
      }
      const updated = await res.json();
      setHasApiKey(Boolean(updated.hasApiKey));
      setMaskedApiKey(updated.maskedApiKey || '');
      const snap = {
        airtableApiKey: '',
        airtableBaseId: updated.airtableBaseId || form.airtableBaseId,
        airtableTableId: updated.airtableTableId || form.airtableTableId,
      };
      setServerSnapshot(snap);
      setForm(snap);
      onSuccess?.('Airtable settings saved.');
    } catch (e) {
      onError?.(e.message || 'Could not save Airtable settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card"><p>Loading Airtable settings…</p></div>;

  return (
    <div className="card airtable-config">
      <div className="form-row">
        <label htmlFor="airtableApiKey">API Key</label>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <input
            id="airtableApiKey"
            name="airtableApiKey"
            type={showKey ? 'text' : 'password'}
            placeholder={hasApiKey ? maskedApiKey : 'Enter API Key'}
            value={form.airtableApiKey}
            onChange={onChange}
            autoComplete="off"
            style={{ flex: 1 }}
          />
          <button
            type="button"
            className="showSecondary"
            onClick={() => setShowKey((s) => !s)}
          >
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        {hasApiKey && !form.airtableApiKey && (
          <small style={{ color: '#888' }}>
            Key already set. Leave blank to keep current.
          </small>
        )}
      </div>

      <div className="form-row">
        <label htmlFor="airtableBaseId">Base ID *</label>
        <input
          id="airtableBaseId"
          name="airtableBaseId"
          type="text"
          placeholder="appXXXXXXXXXXXXXX"
          value={form.airtableBaseId}
          onChange={onChange}
        />
      </div>

      <div className="form-row">
        <label htmlFor="airtableTableId">Table ID *</label>
        <input
          id="airtableTableId"
          name="airtableTableId"
          type="text"
          placeholder="tblXXXXXXXXXXXXXX"
          value={form.airtableTableId}
          onChange={onChange}
        />
      </div>

      <div className="actions">
        <button type="button" onClick={onSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        <button type="button" className="secondary" onClick={onReset} disabled={saving}>
          Reset
        </button>
      </div>
    </div>
  );
}