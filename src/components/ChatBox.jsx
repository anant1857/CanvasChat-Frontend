'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../utils/socket.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ChatBox({ roomId }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
  }, [roomId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.off('new-message');
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/messages/${roomId}`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !user) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit('send-message', {
      roomId,
      senderId: user._id,
      senderName: user.username,
      text: inputText.trim(),
    });

    setInputText('');
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="p-4 border-b bg-primary-50">
        <h2 className="text-xl font-bold">Chat</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${msg.sender?._id === user?._id ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs px-4 py-2 rounded-lg ${
              msg.sender?._id === user?._id ? 'bg-primary-500 text-white' : 'bg-white border'
            }`}>
              {msg.sender?._id !== user?._id && (
                <p className="text-xs font-medium mb-1">{msg.sender?.username}</p>
              )}
              <p className="text-sm">{msg.text}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
