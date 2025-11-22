'use client';

import React, { useEffect, useState } from 'react';
import { getSocket } from '../utils/socket.jsx';

export default function UserList() {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('active-users', setActiveUsers);

    return () => socket.off('active-users');
  }, []);

  const getAvatarColor = (username) => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-3">
      {activeUsers.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-sm">No users online</p>
        </div>
      ) : (
        activeUsers.map((user, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
          >
            <div className="relative">
              <div
                className={`w-12 h-12 ${getAvatarColor(user.username)} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md`}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <p className="font-medium text-gray-800">{user.username}</p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Online
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
