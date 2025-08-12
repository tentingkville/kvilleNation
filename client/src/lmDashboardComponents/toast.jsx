import React, { useEffect, useState } from 'react';

export default function Toast({ type = 'success', message, duration = 3000, onClose }) {
  const [visible, setVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose(); 
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  if (!visible) return null;

  return (
    <p className={type === 'error' ? 'error-message' : 'success-message'}>
      {message}
    </p>
  );
}