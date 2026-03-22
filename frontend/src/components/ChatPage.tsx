import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import RoomList from './RoomList';
import MessageItem from './MessageItem';
import Header from '../class-components/Header.class';

interface Room {
  id: number;
  name: string;
  description?: string;
}

interface Message {
  id: number;
  content: string;
  user_id: number;
  room_id: number;
  username: string;
  createdAt: string;
}

interface Props {
  token: string;
  userId: number;
  apiUrl: string;
  onLogout: () => void;
}

export default function ChatPage({ token, userId, apiUrl, onLogout }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDesc, setNewRoomDesc] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io(apiUrl, { auth: { token } });
    socketRef.current = socket;

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      socket.off('newMessage');
      socket.off('connect');
      socket.off('disconnect');
      socket.disconnect();
    };
  }, [apiUrl, token]);

  useEffect(() => {
    fetchRooms();
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch(`${apiUrl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const user = await res.json();
      setUsername(user.username);
    } catch {
      // network error
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await fetch(`${apiUrl}/chat/rooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setRooms(data);
    } catch {
      // network error
    }
  };

  const fetchMessages = async (roomId: number) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`${apiUrl}/chat/rooms/${roomId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data);
    } catch {
      // network error
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleRoomSelect = (room: Room) => {
    if (selectedRoom) {
      socketRef.current?.emit('leaveRoom', { roomId: selectedRoom.id });
    }
    setSelectedRoom(room);
    socketRef.current?.emit('joinRoom', { roomId: room.id });
    fetchMessages(room.id);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRoom) return;
    socketRef.current?.emit('sendMessage', {
      roomId: selectedRoom.id,
      content: newMessage,
    });
    setNewMessage('');
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      await fetch(`${apiUrl}/chat/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newRoomName, description: newRoomDesc }),
      });
      setNewRoomName('');
      setNewRoomDesc('');
      setShowCreateRoom(false);
      fetchRooms();
    } catch {
      // network error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Arial, sans-serif',
  };

  const sidebarStyle: React.CSSProperties = {
    width: '250px',
    borderRight: '1px solid #ddd',
    display: 'flex',
    flexDirection: 'column',
    padding: '10px',
    backgroundColor: '#f5f5f5',
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const messagesStyle: React.CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  };

  const inputAreaStyle: React.CSSProperties = {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd',
    gap: '10px',
  };

  return (
    <div style={containerStyle}>
      <div style={sidebarStyle}>
        <Header
          username={username}
          isConnected={isConnected}
          onLogout={onLogout}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '10px',
          }}
        >
          <h3 style={{ margin: 0 }}>Rooms</h3>
          <button
            onClick={() => setShowCreateRoom(!showCreateRoom)}
            style={{
              fontSize: '20px',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
            }}
          >
            +
          </button>
        </div>

        {showCreateRoom && (
          <div
            style={{
              marginBottom: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
            }}
          >
            <input
              placeholder="Room name"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              style={{ padding: '5px' }}
            />
            <input
              placeholder="Description (optional)"
              value={newRoomDesc}
              onChange={(e) => setNewRoomDesc(e.target.value)}
              style={{ padding: '5px' }}
            />
            <button
              onClick={handleCreateRoom}
              style={{ padding: '5px', cursor: 'pointer' }}
            >
              Create
            </button>
          </div>
        )}

        <RoomList
          rooms={rooms}
          selectedRoom={selectedRoom}
          onSelectRoom={handleRoomSelect}
        />
      </div>

      <div style={mainStyle}>
        {selectedRoom ? (
          <>
            <div
              style={{
                padding: '10px',
                borderBottom: '1px solid #ddd',
                backgroundColor: '#f9f9f9',
              }}
            >
              <h3 style={{ margin: 0 }}>#{selectedRoom.name}</h3>
              {selectedRoom.description && (
                <p
                  style={{
                    margin: '5px 0 0',
                    color: '#666',
                    fontSize: '14px',
                  }}
                >
                  {selectedRoom.description}
                </p>
              )}
            </div>

            <div style={messagesStyle}>
              {loadingMessages ? (
                <p>Loading messages...</p>
              ) : (
                messages.map((msg) => (
                  <MessageItem
                    key={msg.id}
                    message={msg}
                    isOwn={msg.user_id === userId}
                  />
                ))
              )}
            </div>

            <div style={inputAreaStyle}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '8px', fontSize: '16px' }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '8px 16px',
                  fontSize: '16px',
                  cursor: 'pointer',
                }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flex: 1,
            }}
          >
            <p style={{ color: '#666' }}>Select a room to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
