import React, { useMemo } from 'react';

export default function RoleStats({ users = [] }) {
  const { total, lms, admins } = useMemo(() => {
    const total = users.length;
    const lms = users.filter(u => !!u.isLineMonitor).length;
    const admins = users.filter(u => !!u.isSuperUser || !!u.isAdmin).length;
    return { total, lms, admins };
  }, [users]);

  return (
    <div className="card">
      <div className="stats-row">
        <div className="stat-box">
          <div>Total Users</div>
          <div className="dukeStats">{total}</div>
        </div>
        <div className="stat-box">
          <div>Line Monitors</div>
          <div className="dukeStats">{lms}</div>
        </div>
        <div className="stat-box">
          <div>Admins</div>
          <div className="dukeStats">{admins}</div>
        </div>
      </div>
    </div>
  );
}