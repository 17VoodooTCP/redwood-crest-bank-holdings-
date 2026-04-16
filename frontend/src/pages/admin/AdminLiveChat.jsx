import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  MessageCircle, Send, Users, MapPin, Globe, Wifi, WifiOff,
  Bot, Headphones, Clock, ChevronRight, Phone, X, User,
  ArrowRightLeft, Loader2, Monitor
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function AdminLiveChat() {
  const [socket, setSocket] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [customerTyping, setCustomerTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, customerTyping, scrollToBottom]);

  // Connect to admin namespace
  useEffect(() => {
    const s = io(`${API}/admin-chat`, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    s.on('connect', () => {
      setConnected(true);
      s.emit('chat:get-sessions');
    });

    s.on('chat:sessions', (data) => {
      setSessions(data);
    });

    s.on('chat:session-update', (data) => {
      setSessions(prev => {
        const idx = prev.findIndex(s => s.id === data.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data };
          return updated;
        }
        return [data, ...prev];
      });
    });

    s.on('chat:session-closed', ({ sessionId }) => {
      setSessions(prev => prev.map(s =>
        s.id === sessionId ? { ...s, status: 'closed', isOnline: false } : s
      ));
    });

    s.on('chat:history', ({ sessionId, messages: hist }) => {
      if (sessionId === activeSession?.id || !activeSession) {
        setMessages(hist);
      }
    });

    s.on('chat:message', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Update last message in sessions list
      setSessions(prev => prev.map(sess =>
        sess.id === msg.sessionId
          ? { ...sess, lastMessage: msg.content, lastActivity: msg.createdAt }
          : sess
      ));
    });

    s.on('chat:activity', ({ sessionId, lastActivity }) => {
      setSessions(prev => prev.map(sess =>
        sess.id === sessionId ? { ...sess, lastActivity } : sess
      ));
    });

    s.on('chat:typing', ({ sessionId, sender }) => {
      if (sender === 'customer') setCustomerTyping(true);
    });

    s.on('chat:stop-typing', ({ sessionId, sender }) => {
      if (sender === 'customer') setCustomerTyping(false);
    });

    s.on('disconnect', () => setConnected(false));

    setSocket(s);

    // Refresh sessions every 10s
    const interval = setInterval(() => {
      if (s.connected) s.emit('chat:get-sessions');
    }, 10000);

    return () => {
      clearInterval(interval);
      s.disconnect();
    };
  }, []);

  // When activeSession changes, refetch
  useEffect(() => {
    if (activeSession?.id && socket?.connected) {
      setMessages([]);
      socket.emit('chat:join', { sessionId: activeSession.id });
    }
  }, [activeSession?.id]);

  const selectSession = (session) => {
    setActiveSession(session);
    setCustomerTyping(false);
  };

  const takeOver = () => {
    if (!activeSession || !socket) return;
    socket.emit('chat:takeover', {
      sessionId: activeSession.id,
      agentName: 'Admin'
    });
    setSessions(prev => prev.map(s =>
      s.id === activeSession.id ? { ...s, status: 'active' } : s
    ));
    setActiveSession(prev => ({ ...prev, status: 'active' }));
  };

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !activeSession || !socket) return;

    socket.emit('chat:message', {
      sessionId: activeSession.id,
      content,
      agentName: 'Admin'
    });

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'agent',
      senderName: 'Admin',
      content,
      messageType: 'text',
      suggestions: [],
      createdAt: new Date().toISOString()
    }]);

    setInput('');
    inputRef.current?.focus();
  };

  const closeSession = () => {
    if (!activeSession || !socket) return;
    socket.emit('chat:close', { sessionId: activeSession.id });
    setActiveSession(null);
    setMessages([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
    if (socket && activeSession) {
      socket.emit('chat:typing', { sessionId: activeSession.id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit('chat:stop-typing', { sessionId: activeSession.id });
      }, 1500);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'bot': return 'bg-blue-500';
      case 'waiting': return 'bg-yellow-500 animate-pulse';
      case 'active': return 'bg-green-500';
      case 'closed': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'bot': return 'Bot';
      case 'waiting': return 'Waiting';
      case 'active': return 'Live';
      case 'closed': return 'Closed';
      default: return status;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString();
  };

  const activeSessions = sessions.filter(s => s.status !== 'closed');
  const waitingSessions = sessions.filter(s => s.status === 'waiting');

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px] flex bg-white rounded-xl border border-gray-200 overflow-hidden">

      {/* ── Left sidebar: Sessions list ───────────────────────── */}
      <div className="w-[320px] border-r border-gray-200 flex flex-col shrink-0">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
              <Users className="w-4 h-4" />
              Live Conversations
            </h3>
            <div className="flex items-center gap-1.5">
              {connected
                ? <Wifi className="w-3.5 h-3.5 text-green-500" />
                : <WifiOff className="w-3.5 h-3.5 text-red-500" />
              }
              <span className={`text-xs ${connected ? 'text-green-600' : 'text-red-500'}`}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex gap-3 text-xs">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-gray-600">{activeSessions.length} active</span>
            </div>
            {waitingSessions.length > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span className="text-yellow-700 font-medium">{waitingSessions.length} waiting</span>
              </div>
            )}
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 px-6">
              <MessageCircle className="w-10 h-10 mb-3 opacity-40" />
              <p className="text-sm text-center">No active conversations</p>
              <p className="text-xs text-center mt-1">Chats will appear here when customers connect</p>
            </div>
          ) : (
            sessions.map(session => (
              <button
                key={session.id}
                onClick={() => selectSession(session)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-blue-50 transition-colors ${
                  activeSession?.id === session.id ? 'bg-blue-50 border-l-2 border-l-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Avatar with online indicator */}
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      {session.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">
                        {session.customerName || 'Guest'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {session.lastMessage || 'No messages yet'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                    <span className={`text-[10px] text-white px-1.5 py-0.5 rounded-full ${getStatusColor(session.status)}`}>
                      {getStatusLabel(session.status)}
                    </span>
                    <span className="text-[10px] text-gray-400">{formatTime(session.lastActivity)}</span>
                  </div>
                </div>

                {/* Location line */}
                {(session.city || session.country) && (
                  <div className="flex items-center gap-1 mt-1.5 ml-[46px] text-[10px] text-gray-400">
                    <MapPin className="w-3 h-3" />
                    <span>{[session.city, session.region, session.countryCode].filter(Boolean).join(', ')}</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right side: Chat area ─────────────────────────────── */}
      {activeSession ? (
        <div className="flex-1 flex flex-col">
          {/* Chat header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                {activeSession.isOnline && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                )}
              </div>
              <div>
                <div className="font-semibold text-sm text-gray-800">{activeSession.customerName}</div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {activeSession.ipAddress && (
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {activeSession.ipAddress}
                    </span>
                  )}
                  {activeSession.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {[activeSession.city, activeSession.country].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(activeSession.status === 'bot' || activeSession.status === 'waiting') && (
                <button
                  onClick={takeOver}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Take Over
                </button>
              )}
              <button
                onClick={closeSession}
                className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                End Chat
              </button>
            </div>
          </div>

          {/* Customer info banner */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-4 text-xs text-gray-500 shrink-0">
            {activeSession.customerEmail && (
              <span>Email: <strong className="text-gray-700">{activeSession.customerEmail}</strong></span>
            )}
            {activeSession.isp && (
              <span>ISP: <strong className="text-gray-700">{activeSession.isp}</strong></span>
            )}
            {activeSession.latitude && activeSession.longitude && (
              <span>Coords: <strong className="text-gray-700">{activeSession.latitude?.toFixed(2)}, {activeSession.longitude?.toFixed(2)}</strong></span>
            )}
            <span className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              Status: <strong className={`${
                activeSession.status === 'active' ? 'text-green-600'
                  : activeSession.status === 'waiting' ? 'text-yellow-600'
                    : 'text-blue-600'
              }`}>{getStatusLabel(activeSession.status)}</strong>
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
            {messages.map(msg => (
              <AdminChatBubble key={msg.id} msg={msg} />
            ))}

            {customerTyping && (
              <div className="flex items-center gap-2 text-gray-400 text-xs pl-1">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span>Customer is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {activeSession.status !== 'closed' && (activeSession.status === 'active' || activeSession.status === 'bot' || activeSession.status === 'waiting') && (
            <div className="border-t border-gray-200 px-4 py-3 bg-white shrink-0">
              {activeSession.status !== 'active' && (
                <div className="text-xs text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-lg mb-2 text-center">
                  Click "Take Over" to start chatting with this customer
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeSession.status === 'active' ? 'Type a message...' : 'Take over to start chatting...'}
                  disabled={activeSession.status !== 'active'}
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || activeSession.status !== 'active'}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 flex items-center gap-1.5 text-sm font-medium transition-colors shrink-0"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-10 h-10 text-gray-300" />
          </div>
          <p className="text-lg font-medium text-gray-500">Select a conversation</p>
          <p className="text-sm mt-1">Choose a chat from the left panel to view messages</p>
        </div>
      )}
    </div>
  );
}

function AdminChatBubble({ msg }) {
  const isCustomer = msg.sender === 'customer';
  const isSystem = msg.sender === 'system';
  const isBot = msg.sender === 'bot';
  const isAgent = msg.sender === 'agent';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
      <div className="max-w-[75%]">
        <div className="flex items-center gap-1.5 mb-1">
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${
            isCustomer ? 'bg-gray-500' : isBot ? 'bg-blue-500' : 'bg-green-600'
          }`}>
            {isCustomer ? <User className="w-3 h-3" /> : isBot ? <Bot className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">{msg.senderName}</span>
          <span className="text-[10px] text-gray-400">
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
        <div className={`px-3 py-2 rounded-xl text-sm ${
          isCustomer
            ? 'bg-white border border-gray-200 text-gray-800'
            : isBot
              ? 'bg-blue-50 border border-blue-200 text-blue-900'
              : 'bg-green-50 border border-green-200 text-green-900'
        }`}>
          {msg.content}
        </div>

        {msg.messageType === 'suggestion' && msg.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {msg.suggestions.map((s, i) => (
              <span key={i} className="text-[10px] bg-blue-50 text-blue-500 border border-blue-200 px-2 py-0.5 rounded-full">
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
