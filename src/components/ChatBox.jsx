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
    // Clear messages on mount (after logout)
    setMessages([]);
    loadMessages();
  }, [roomId, user]);

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
      // Only load if user is logged in
      if (!user) {
        setMessages([]);
        return;
      }

      const { data } = await axios.get(`${API_URL}/api/messages/${roomId}`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender?._id === user?._id;
            return (
              <div key={msg._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-slide-up`}>
                <div className={`max-w-[80%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  {!isOwn && (
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {msg.sender?.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {msg.sender?.username}
                      </span>
                    </div>
                  )}
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      isOwn
                        ? 'bg-primary-500 text-white rounded-br-none'
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.text}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}
