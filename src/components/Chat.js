import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, push } from 'firebase/database';
import emptyChatImage from '../assets/empty_chat.png'; // Import the image

const Chat = ({
  db,
  serverId,
  username,
  onNewMessage,
  filterMessage,      // Optional: function(msg) => boolean
  renderMessage       // Optional: function(msg, defaultRender) => ReactNode
}) => {
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
      let messagesList = data
        ? Object.entries(data).map(([id, msg]) => ({
            id,
            ...msg,
          }))
        : [];

      // Filter out hidden messages
      if (typeof filterMessage === 'function') {
        messagesList = messagesList.filter(filterMessage);
      } else {
        messagesList = messagesList.filter(msg => !msg.hidden);
      }

      // Sort by timestamp ascending
      messagesList.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

      // Check for new messages by comparing message count
      const currentMessageCount = messagesList.length;
      if (
        currentMessageCount > lastMessageCountRef.current &&
        lastMessageCountRef.current !== 0
      ) {
        onNewMessage && onNewMessage(serverId);
      }
      lastMessageCountRef.current = currentMessageCount;

      setMessages(messagesList);
    });

    // Set initial message count on first load
    lastMessageCountRef.current = 0;

    return () => unsubscribe();
  }, [db, serverId, username, onNewMessage, filterMessage]);

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

  // Default message rendering with important highlight
  const defaultRenderMessage = (msg) => {
    if (msg.important) {
      return (
        <div
          style={{
            background: '#fffde7',
            borderLeft: '4px solid #ffd600',
            padding: '0.5em 1em',
            margin: '0.25em 0',
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          <span className="chat-username">{msg.username}</span>: {msg.message}
          <span className="chat-timestamp">
            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
          </span>
        </div>
      );
    }
    return (
      <div className="chat-message">
        <span className="chat-username">{msg.username}</span>: {msg.message}
        <span className="chat-timestamp">
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
        </span>
      </div>
    );
  };

  return (
    <div className="chat-container">
      {messages.length === 0 ? (
        <div className="no-messages">
          <img src={emptyChatImage} alt="No messages" className='no-messages-icon' /> {/* Use the imported image */}
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="chat-messages" ref={chatMessagesRef}>
          {messages.map((msg) =>
            renderMessage
              ? renderMessage(msg, defaultRenderMessage)
              : defaultRenderMessage(msg)
          )}
        </div>
      )}
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