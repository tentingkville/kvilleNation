import React from 'react';

export default function UsersTable({ users, onToggleRole }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>NetID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Line Monitor</th>
            <th>Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.netID}>
              <td>{user.netID}</td>
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{user.email}</td>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={!!user.isLineMonitor}
                    onChange={() => onToggleRole(user.netID, 'isLineMonitor')}
                  />
                  <span className="slider"></span>
                </label>
              </td>
              <td>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={!!user.isSuperUser}
                    onChange={() => onToggleRole(user.netID, 'isSuperUser')}
                  />
                  <span className="slider"></span>
                </label>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}