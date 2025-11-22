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
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('shared');
  const [layers, setLayers] = useState([
    { id: 'shared', name: 'Shared Canvas', owner: 'Everyone', visible: true, description: 'Draw with everyone' },
    { id: 'personal', name: 'My Private Canvas', owner: user?.username || 'You', visible: true, description: 'Your personal workspace' },
  ]);

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
    const layerName = currentLayer === 'shared' ? 'Shared Canvas' : 'My Private Canvas';
    if (!window.confirm(`Clear ${layerName}?`)) return;
    
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      
      // Only emit to others if clearing shared canvas
      if (currentLayer === 'shared') {
        const socket = getSocket();
        if (socket) {
          socket.emit('clear-canvas', { roomId });
        }
      } else {
        // Save cleared personal canvas to localStorage
        localStorage.removeItem(`canvas-personal-${user._id}`);
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
        tags: ['collaborative', 'drawing', currentLayer],
      });

      alert('Canvas saved! 🎨');
    } catch (error) {
      alert('Failed to save canvas');
    }
  };

  const handleExportCode = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    
    // Generate React component code
    const code = `import React from 'react';

const CanvasComponent = () => {
  return (
    <div className="canvas-container p-4">
      <img 
        src="${imageData}" 
        alt="Canvas Design"
        className="w-full h-auto rounded-lg shadow-lg"
      />
    </div>
  );
};

export default CanvasComponent;`;

    // Create downloadable file
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'CanvasComponent.jsx';
    a.click();
    URL.revokeObjectURL(url);

    alert('✅ React component exported!\n\nFile saved: CanvasComponent.jsx');
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-500 to-primary-700">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto" />
          <p className="mt-4 font-medium">Loading canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      {/* Top Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center justify-between shadow-lg z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
            <h1 className="text-xl font-bold text-white">Collaborative Canvas</h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-xs text-gray-300">{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsUserListOpen(!isUserListOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Users
          </button>

          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Chat
          </button>

          <div className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-white font-medium text-sm">{user.username}</span>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Exit
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <Toolbar
        color={color}
        lineWidth={lineWidth}
        onColorChange={setColor}
        onLineWidthChange={setLineWidth}
        onClear={handleClear}
        onSave={handleSave}
        onExportCode={handleExportCode}
        currentLayer={currentLayer}
        onLayerChange={setCurrentLayer}
        layers={layers}
      />

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center bg-gray-900 p-4 overflow-hidden">
        <Canvas 
          color={color} 
          lineWidth={lineWidth} 
          roomId={roomId}
          currentLayer={currentLayer}
          userId={user._id}
          username={user.username}
        />
      </div>

      {/* Sliding Chat Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isChatOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-primary-500 text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat Room
            </h2>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 hover:bg-primary-600 rounded transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatBox roomId={roomId} />
          </div>
        </div>
      </div>

      {/* Sliding User List Panel */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-40 ${
          isUserListOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gray-800 text-white">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Active Users
            </h2>
            <button
              onClick={() => setIsUserListOpen(false)}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <UserList />
          </div>
        </div>
      </div>

      {/* Overlay when panels are open */}
      {(isChatOpen || isUserListOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => {
            setIsChatOpen(false);
            setIsUserListOpen(false);
          }}
        />
      )}
    </div>
  );
}
