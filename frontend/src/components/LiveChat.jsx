import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';
import {
  MessageCircle, X, Send, Minus, Bot, User, Headphones,
  ChevronDown, Loader2, Paperclip, FileText, Download
} from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = /^(image\/(png|jpe?g|gif|webp|heic|heif)|application\/pdf)$/i;

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error('Read failed'));
    reader.readAsDataURL(file);
  });
}

function formatBytes(n) {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LiveChat() {
  const { user, isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState('bot'); // bot | waiting | active | closed
  const [agentName, setAgentName] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [connected, setConnected] = useState(false);
  const [unread, setUnread] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Connect socket when chat opens
  useEffect(() => {
    if (!isOpen || socketRef.current) return;

    const socket = io(`${API}/chat`, {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('chat:start', {
        userId: user?.id || null,
        customerName: user ? `${user.firstName} ${user.lastName}` : 'Guest',
        customerEmail: user?.email || null,
        userAgent: navigator.userAgent
      });
    });

    socket.on('chat:session', (data) => {
      setSessionId(data.sessionId);
      setStatus(data.status);
    });

    socket.on('chat:message', (msg) => {
      setMessages(prev => [...prev, msg]);
      if (isMinimized) setUnread(prev => prev + 1);
    });

    socket.on('chat:status', (data) => {
      setStatus(data.status);
      if (data.agentName) setAgentName(data.agentName);
    });

    socket.on('chat:typing', () => setIsTyping(true));
    socket.on('chat:stop-typing', () => setIsTyping(false));

    socket.on('chat:error', ({ message }) => {
      setUploadError(message || 'Something went wrong');
      setIsUploading(false);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isOpen, user, isMinimized]);

  const sendMessage = (text) => {
    const content = text || input.trim();
    if (!content || !sessionId || !socketRef.current) return;

    socketRef.current.emit('chat:message', { sessionId, content });

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'customer',
      senderName: user ? `${user.firstName}` : 'You',
      content,
      messageType: 'text',
      createdAt: new Date().toISOString()
    }]);

    setInput('');
    inputRef.current?.focus();
  };

  const handleFilePick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again later
    if (!file) return;

    setUploadError('');

    if (!ALLOWED_MIME.test(file.type)) {
      setUploadError('Only images and PDF files are allowed');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setUploadError(`File too large (max ${formatBytes(MAX_FILE_BYTES)})`);
      return;
    }
    if (!sessionId || !socketRef.current) {
      setUploadError('Chat is not ready yet, try again in a moment');
      return;
    }

    try {
      setIsUploading(true);
      const dataUrl = await readFileAsDataUrl(file);

      const attachment = {
        url: dataUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      };

      socketRef.current.emit('chat:message', {
        sessionId,
        content: '',
        attachment,
      });

      // Optimistic local bubble
      setMessages(prev => [...prev, {
        id: `local-${Date.now()}`,
        sender: 'customer',
        senderName: user ? `${user.firstName}` : 'You',
        content: '',
        messageType: 'file',
        attachmentUrl: dataUrl,
        attachmentName: file.name,
        attachmentType: file.type,
        attachmentSize: file.size,
        createdAt: new Date().toISOString()
      }]);
    } catch (err) {
      setUploadError('Could not read that file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }

    // Typing indicator
    if (sessionId && socketRef.current) {
      socketRef.current.emit('chat:typing', { sessionId });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socketRef.current?.emit('chat:stop-typing', { sessionId });
      }, 1500);
    }
  };

  const openChat = () => {
    setIsOpen(true);
    setIsMinimized(false);
    setUnread(0);
  };

  const minimizeChat = () => {
    setIsMinimized(true);
  };

  const closeChat = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setMessages([]);
    setSessionId(null);
    setStatus('bot');
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'bot': return { text: 'Virtual Assistant', color: 'bg-blue-500' };
      case 'waiting': return { text: 'Waiting for agent...', color: 'bg-yellow-500' };
      case 'active': return { text: `${agentName || 'Live Agent'}`, color: 'bg-green-500' };
      case 'closed': return { text: 'Chat ended', color: 'bg-gray-500' };
      default: return { text: 'Chat', color: 'bg-blue-500' };
    }
  };

  const badge = getStatusBadge();

  // ── Floating button ──────────────────────────────────────────────────
  if (!isOpen) {
    return (
      <button
        onClick={openChat}
        className="fixed bottom-6 right-6 z-50 bg-[#0A1E3F] hover:bg-[#06132A] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
        title="Chat with us"
      >
        <MessageCircle className="w-6 h-6" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>
    );
  }

  // ── Minimized bar ────────────────────────────────────────────────────
  if (isMinimized) {
    return (
      <div
        onClick={() => { setIsMinimized(false); setUnread(0); }}
        className="fixed bottom-6 right-6 z-50 bg-[#0A1E3F] text-white rounded-full px-5 py-3 flex items-center gap-2 shadow-lg cursor-pointer hover:bg-[#06132A] transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Chat with us</span>
        {unread > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unread}
          </span>
        )}
      </div>
    );
  }

  // ── Full chat window ─────────────────────────────────────────────────
  return (
    <div className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[380px] h-[85dvh] sm:h-[560px] bg-white sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* Header */}
      <div className="bg-[#0A1E3F] text-white px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
            {status === 'active' ? <Headphones className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">Redwood Crest Support</div>
            <div className="flex items-center gap-1.5 text-xs text-blue-100">
              <span className={`w-2 h-2 rounded-full ${badge.color} inline-block`} />
              {badge.text}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={minimizeChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={closeChat} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
        {messages.map((msg) => (
          <ChatBubble key={msg.id} msg={msg} onSuggestionClick={handleSuggestionClick} />
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-gray-400 text-xs pl-1">
            <div className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>{status === 'active' ? agentName : 'Assistant'} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {status !== 'closed' ? (
        <div className="border-t border-gray-200 px-3 py-2.5 bg-white shrink-0">
          {uploadError && (
            <div className="mb-2 text-[11px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-2.5 py-1.5 flex items-start justify-between gap-2">
              <span>{uploadError}</span>
              <button
                onClick={() => setUploadError('')}
                className="text-red-400 hover:text-red-600 shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp,image/heic,image/heif,application/pdf"
              className="hidden"
              onChange={handleFilePick}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || status === 'closed' || !sessionId}
              title="Attach image or PDF"
              className="text-gray-500 hover:text-[#0A1E3F] hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed rounded-full w-9 h-9 flex items-center justify-center transition-colors shrink-0"
            >
              {isUploading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Paperclip className="w-4 h-4" />
              }
            </button>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={status === 'waiting' ? 'Waiting for an agent...' : 'Type your message...'}
              className="flex-1 text-sm border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50"
              disabled={status === 'closed'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || status === 'closed'}
              className="bg-[#0A1E3F] hover:bg-[#06132A] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full w-9 h-9 flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-1.5">
            <span className="text-[10px] text-gray-400">Powered by Redwood Crest Bank</span>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-100 text-center shrink-0">
          <p className="text-xs text-gray-500 mb-2">This chat session has ended.</p>
          <button
            onClick={() => { closeChat(); setTimeout(openChat, 100); }}
            className="text-xs text-[#0A1E3F] hover:underline font-medium"
          >
            Start a new chat
          </button>
        </div>
      )}
    </div>
  );
}

// ── Chat bubble component ──────────────────────────────────────────────
function ChatBubble({ msg, onSuggestionClick }) {
  const isCustomer = msg.sender === 'customer';
  const isSystem = msg.sender === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full max-w-[280px] text-center">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] ${isCustomer ? 'order-1' : ''}`}>
        {/* Sender label */}
        {!isCustomer && (
          <div className="flex items-center gap-1.5 mb-1 pl-1">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-white ${msg.sender === 'bot' ? 'bg-blue-500' : 'bg-green-600'}`}>
              {msg.sender === 'bot' ? <Bot className="w-3 h-3" /> : <Headphones className="w-3 h-3" />}
            </div>
            <span className="text-[11px] text-gray-500 font-medium">{msg.senderName}</span>
          </div>
        )}

        {/* Attachment bubble (image or PDF) */}
        {msg.attachmentUrl && (
          <ChatAttachment msg={msg} isCustomer={isCustomer} />
        )}

        {/* Text bubble (only if there's text content) */}
        {msg.content && (
          <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
            msg.attachmentUrl ? 'mt-1' : ''
          } ${
            isCustomer
              ? 'bg-[#0A1E3F] text-white rounded-br-md'
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm'
          }`}>
            {msg.content}
          </div>
        )}

        {/* Suggestion chips */}
        {msg.messageType === 'suggestion' && msg.suggestions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 pl-1">
            {msg.suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => onSuggestionClick(s)}
                className="text-xs bg-white border border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 px-3 py-1.5 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-[10px] text-gray-400 mt-1 ${isCustomer ? 'text-right pr-1' : 'pl-1'}`}>
          {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

// ── Attachment rendering (image inline, PDF as download card) ──────────
function ChatAttachment({ msg, isCustomer }) {
  const { attachmentUrl, attachmentName, attachmentType, attachmentSize } = msg;
  const isImage = attachmentType?.startsWith('image/');

  if (isImage) {
    return (
      <a
        href={attachmentUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-2xl overflow-hidden border border-gray-200 bg-white max-w-[240px] hover:opacity-95 transition-opacity"
      >
        <img
          src={attachmentUrl}
          alt={attachmentName || 'attachment'}
          className="block w-full h-auto max-h-[260px] object-cover"
        />
      </a>
    );
  }

  return (
    <a
      href={attachmentUrl}
      download={attachmentName || 'file.pdf'}
      className={`flex items-center gap-2.5 max-w-[260px] px-3 py-2.5 rounded-2xl border transition-colors ${
        isCustomer
          ? 'bg-white/10 border-white/30 text-white hover:bg-white/20'
          : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
      }`}
    >
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
        isCustomer ? 'bg-white/20' : 'bg-red-50 text-red-600'
      }`}>
        <FileText className="w-4 h-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-medium truncate">{attachmentName || 'document.pdf'}</div>
        <div className={`text-[10px] ${isCustomer ? 'text-white/70' : 'text-gray-500'}`}>
          PDF{attachmentSize ? ` · ${formatBytes(attachmentSize)}` : ''}
        </div>
      </div>
      <Download className={`w-4 h-4 shrink-0 ${isCustomer ? 'text-white/80' : 'text-gray-500'}`} />
    </a>
  );
}
