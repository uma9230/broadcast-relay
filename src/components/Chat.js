import React, { useState, useEffect, useRef } from 'react';
import { ref, onValue, push } from 'firebase/database';
import emptyChatImage from '../assets/empty_chat.png'; // Import the image
import '../assets/hidden-message.css'; // Import enhanced hidden message styling
import '../assets/important-indicator.css'; // Import enhanced important message styling

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
        : [];      // Use custom filter if provided, otherwise keep all messages including hidden ones
      if (typeof filterMessage === 'function') {
        messagesList = messagesList.filter(filterMessage);
      }
      // We no longer filter out hidden messages - we'll display them with blur styling

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
  
  // Default message rendering with important highlight and hidden styles
  const defaultRenderMessage = (msg) => {
    // Determine which CSS classes to apply
    let messageClasses = "chat-message";
    
    if (msg.important) {
      messageClasses += " important-message";
    }
    
    if (msg.hidden) {
      messageClasses += " hidden-message";
    }
    
    // For important messages
    if (msg.important) {
      return (
        <div 
          className={messageClasses}
          title={msg.hidden ? "This message is hidden by admin" : "Important message"}
        >          <div className="important-indicator">
            <span className="important-star">★</span>
            <span>Important</span>
          </div>
          <div className="message-content">
            <span className="chat-username">{msg.username}</span>: {msg.message}
            <span className="chat-timestamp">
              {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
            </span>
            {msg.hidden && (
              <span 
                className="hidden-indicator" 
                title="This message is hidden by admin"
                aria-label="Hidden message"
              >
                Hidden
              </span>
            )}
          </div>
        </div>
      );
    }
    
    // For regular messages (including hidden ones)
    return (
      <div 
        className={messageClasses} 
        title={msg.hidden ? "This message is hidden by admin" : ""}
      >
        <span className="chat-username">{msg.username}</span>: {msg.message}
        <span className="chat-timestamp">
          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''}
        </span>
        {msg.hidden && (
          <span 
            className="hidden-indicator" 
            title="This message is hidden by admin"
            aria-label="Hidden message"
          >
            Hidden
          </span>
        )}
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