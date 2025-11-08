'use client';

import React, { useEffect, useState } from 'react';
import { getSocket } from '../utils/socket.jsx';

export default function UserList() {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('active-users', setActiveUsers);
    socket.on('user-connected', ({ username }) => console.log(`${username} joined`));
    socket.on('user-disconnected', ({ username }) => console.log(`${username} left`));

    return () => {
      socket.off('active-users');
      socket.off('user-connected');
      socket.off('user-disconnected');
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold mb-3">Active Users ({activeUsers.length})</h3>
      <div className="space-y-2">
        {activeUsers.map((user, i) => (
          <div key={i} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{user.username}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
