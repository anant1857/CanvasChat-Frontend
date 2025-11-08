'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext.jsx';
import { initSocket, getSocket, disconnectSocket } from '../../utils/socket.jsx';
import Canvas from '../../components/Canvas.jsx';
import Toolbar from '../../components/Toolbar.jsx';
import ChatBox from '../../components/ChatBox.jsx';
import UserList from '../../components/UserList.jsx';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function CanvasPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [roomId] = useState('global');
  const [mounted, setMounted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user || !mounted) return;

    const socket = initSocket();
    if (!socket) return;

    const handleConnect = () => {
      setIsConnected(true);
      socket.emit('user-joined', {
        userId: user._id,
        username: user.username,
        roomId,
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (socket.connected) {
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      disconnectSocket();
    };
  }, [user, roomId, mounted]);

  const handleClear = () => {
    if (!window.confirm('Clear canvas for everyone?')) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('clear-canvas', { roomId });
      const canvas = document.querySelector('canvas');
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const handleSave = async () => {
    try {
      const canvas = document.querySelector('canvas');
      if (!canvas) return alert('Canvas not found');

      const imageData = canvas.toDataURL('image/png');
      const title = prompt('Enter canvas title:');
      if (!title) return;

      await axios.post(`${API_URL}/api/canvas`, {
        title: title.trim(),
        roomId,
        imageData,
        thumbnailData: imageData,
        tags: ['collaborative', 'drawing'],
      });

      alert('Canvas saved! 🎨');
    } catch (error) {
      alert('Failed to save canvas');
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Exit canvas?')) {
      await logout();
      disconnectSocket();
      router.push('/');
    }
  };

  if (loading || !user || !mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-500">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto" />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Collaborative Canvas</h1>
            <p className="text-sm text-gray-600">Room: {roomId}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="font-medium">{user.username}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Exit
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-2">
            <Toolbar
              color={color}
              lineWidth={lineWidth}
              onColorChange={setColor}
              onLineWidthChange={setLineWidth}
              onClear={handleClear}
              onSave={handleSave}
            />
            <div className="mt-6">
              <UserList />
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Canvas color={color} lineWidth={lineWidth} roomId={roomId} />
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="h-[700px]">
              <ChatBox roomId={roomId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
