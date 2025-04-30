import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, push } from 'firebase/database';

const Chat = ({ db, serverId, username, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const lastMessageCountRef = useRef(0);
  const chatMessagesRef = useRef(null);

  const scrollToBottom = () => {
    const chatMessages = chatMessagesRef.current;
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
      console.log("Scrolled to bottom, scrollHeight:", chatMessages.scrollHeight, "scrollTop:", chatMessages.scrollTop);
    } else {
      console.log("chatMessagesRef is not ready yet");
    }
  };

  // Fetch and listen for messages
  useEffect(() => {
    if (!serverId || !username) return;

    const messagesRef = ref(db, `servers/${serverId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const messagesList = data ? Object.entries(data).map(([id, msg]) => ({
        id,
        ...msg,
      })) : [];

      // Check for new messages by comparing message count
      const currentMessageCount = messagesList.length;
      if (currentMessageCount > lastMessageCountRef.current && lastMessageCountRef.current !== 0) {
        // New message detected, notify parent
        onNewMessage(serverId);
      }
      lastMessageCountRef.current = currentMessageCount;

      setMessages(messagesList);
    });

    // Set initial message count on first load
    lastMessageCountRef.current = 0;

    return () => unsubscribe();
  }, [db, serverId, username, onNewMessage]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      <div className="chat-messages" ref={chatMessagesRef}>
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