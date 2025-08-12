import React, { useState } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function FileUploadCard({
  title,
  uploadPath,     // e.g. "/api/files/policy"
  accept = "*/*", // e.g. "application/pdf"
  onSuccess,
  onError,
}) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleUpload() {
    if (!file) {
      onError?.('Please choose a file first.');
      return;
    }
    try {
      setBusy(true);
      const form = new FormData();
      form.append('file', file);

      const res = await fetch(`${API_BASE_URL}${uploadPath}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: form,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }
      onSuccess?.('File uploaded successfully.');
      setFile(null);
    } catch (e) {
      onError?.(e.message || 'Upload failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card">
      <h3 style={{ marginTop: 0, marginBottom: 10}}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="file"
          accept={accept}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
        <button
        type="button"
        className="upload-btn"
        onClick={handleUpload}
        disabled={busy || !file}
        >
        {busy ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      <small style={{ color: '#666', marginTop: 10 }}>
        Accepted: {accept || 'any'}
      </small>
    </div>
  );
}