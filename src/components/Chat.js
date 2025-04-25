import React, { useState, useEffect } from 'react';
import { ref, onValue, push } from 'firebase/database';

const Chat = ({ db, serverId, username }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch and listen for messages
  useEffect(() => {
    if (!serverId || !username) return;

    const messagesRef = ref(db, `servers/${serverId}/messages`);
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const messagesList = data ? Object.values(data).map((msg, index) => ({
        id: Object.keys(data)[index], // Use key as ID
        ...msg,
      })) : [];
      setMessages(messagesList);
    });

    return () => {
      // Cleanup listener (optional, as onValue handles this)
    };
  }, [db, serverId, username]);

  // Handle sending a new message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !username) return;

    const messagesRef = ref(db, `servers/${serverId}/messages`);
    push(messagesRef, {
      message: newMessage,
      username: username,
      timestamp: Date.now(),
    });

    setNewMessage(''); // Clear input
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className="chat-message">
            <span className="chat-username">{msg.username}</span>: {msg.message}
            <span className="chat-timestamp">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="chat-input"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          disabled={!username}
        />
        <button type="submit" className="chat-send-btn" disabled={!username}>
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;