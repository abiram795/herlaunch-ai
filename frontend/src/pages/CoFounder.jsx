import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbGet, dbSave, dbGetAll } from '../firebase';
import { Bot, Send, ArrowLeft, RefreshCw, Sparkles, Lightbulb, CheckSquare } from 'lucide-react';
import Loader from '../components/Loader';

const CoFounder = () => {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatting, setChatting] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Clickable growth suggestions
  const [suggestions, setSuggestions] = useState([
    "Brainstorm 3 cheap customer acquisition channels",
    "Identify our top 2 operational risks",
    "Suggest a pricing model for our service"
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchStartupAndChat = async () => {
      if (id === 'none') {
        setLoading(false);
        return;
      }
      try {
        const st = await dbGet('startups', id);
        if (st) {
          setStartup(st);
          
          // Check if there's a saved chat history in database
          const chatList = await dbGetAll('cofounderChats', 'startupId', id);
          if (chatList.length > 0) {
            setMessages(chatList[0].messages);
            if (chatList[0].suggestions) {
              setSuggestions(chatList[0].suggestions);
            }
          } else {
            // First time greeting
            const initialGreeting = [
              {
                sender: 'ai',
                text: `Hey partner! Super excited to build this with you. We've got a fantastic opportunity in the ${st.industry} space focusing on ${st.targetAudience}. Let's brainstorm. What should we figure out first? We can outline marketing ideas, refine the product flow, or challenge some assumptions!`,
                timestamp: new Date().toISOString()
              }
            ];
            setMessages(initialGreeting);
            // Save initial session
            await dbSave('cofounderChats', null, {
              startupId: id,
              userId: st.userId || 'demo_user_123',
              messages: initialGreeting,
              suggestions: suggestions
            });
          }
        }
      } catch (err) {
        console.error('Error loading co-founder room:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStartupAndChat();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (msgText) => {
    if (!msgText.trim() || chatting || !startup) return;

    const userMsg = {
      sender: 'user',
      text: msgText,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    setChatting(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/ai/cofounder/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: startup.idea,
          industry: startup.industry,
          targetAudience: startup.targetAudience,
          country: startup.country,
          budgetRange: startup.budgetRange,
          messages: updatedMessages.map(m => ({ role: m.sender === 'user' ? 'user' : 'model', content: m.text }))
        })
      });

      const data = await response.json();
      const aiResponse = {
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);
      
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }

      // Save chat log to Firestore/localStorage
      const existingChats = await dbGetAll('cofounderChats', 'startupId', id);
      const docId = existingChats.length > 0 ? existingChats[0].id : null;
      await dbSave('cofounderChats', docId, {
        startupId: id,
        userId: startup.userId || 'demo_user_123',
        messages: finalMessages,
        suggestions: data.suggestions || suggestions
      });

    } catch (err) {
      console.error('Error consulting Co-Founder AI:', err);
    } finally {
      setChatting(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  if (loading) {
    return <Loader message="Contacting your AI Co-Founder..." />;
  }

  if (id === 'none' || !startup) {
    return (
      <div className="glass" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <h2 style={{ fontFamily: 'Outfit', marginBottom: '1rem' }}>AI Co-Founder Mode</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Please launch or select an active startup from your Dashboard list to collaborate in AI Co-Founder Mode.
        </p>
        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      {/* Header bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-text-muted)' }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: '1.8rem', fontFamily: 'Outfit', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bot color="var(--color-primary)" />
          <span>AI Co-Founder Mode</span>
        </h1>
      </div>

      {/* Main chat box grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem' }} className="shark-tank-container">
        
        {/* Left: Chat timelines */}
        <div className="glass chat-box">
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-card-border)', background: 'var(--color-input-bg)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Co-Founder Partner (Online)</span>
          </div>

          <div className="chat-messages" style={{ maxHeight: '440px' }}>
            {messages.map((msg, index) => {
              const isUser = msg.sender === 'user';
              return (
                <div 
                  key={index} 
                  className={`message-bubble ${isUser ? 'message-user' : 'message-agent'}`}
                >
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8, marginBottom: '0.25rem' }}>
                    {isUser ? 'You' : 'Co-Founder'}
                  </div>
                  <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Clickable suggestion bubbles */}
          {suggestions.length > 0 && !chatting && (
            <div style={{ 
              padding: '0.5rem 1.5rem', 
              display: 'flex', 
              gap: '0.5rem', 
              flexWrap: 'wrap', 
              borderTop: '1px solid var(--color-card-border)' 
            }}>
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(sug)}
                  className="btn btn-secondary"
                  style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '0.75rem', 
                    borderRadius: '16px',
                    borderColor: 'var(--color-primary-glow)'
                  }}
                >
                  <Sparkles size={10} color="var(--color-primary)" />
                  <span>{sug}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input field */}
          <form onSubmit={handleFormSubmit} className="chat-input-area">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Ask your co-founder anything: critique this model, draft a checklist..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={chatting}
              required
            />
            <button type="submit" disabled={chatting} className="btn btn-primary" style={{ padding: '0 1.25rem' }}>
              {chatting ? <RefreshCw size={16} className="pulse-loader" /> : <Send size={16} />}
            </button>
          </form>
        </div>

        {/* Right: Venture Blueprint Details */}
        <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lightbulb color="var(--color-secondary)" size={18} />
            <span>Co-Founder Blueprint</span>
          </h3>

          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
            Work together to validate assumptions. The co-founder keeps track of your active venture parameters.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
            <div className="glass" style={{ padding: '0.75rem', background: 'var(--color-input-bg)' }}>
              <strong>Sector:</strong> {startup.industry}
            </div>
            <div className="glass" style={{ padding: '0.75rem', background: 'var(--color-input-bg)' }}>
              <strong>Audience:</strong> {startup.targetAudience}
            </div>
            <div className="glass" style={{ padding: '0.75rem', background: 'var(--color-input-bg)' }}>
              <strong>Country:</strong> {startup.country}
            </div>
            <div className="glass" style={{ padding: '0.75rem', background: 'var(--color-input-bg)' }}>
              <strong>Budget:</strong> {startup.budgetRange}
            </div>
          </div>

          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: 'var(--border-radius-sm)',
            background: 'rgba(108, 99, 255, 0.05)',
            border: '1px solid rgba(108, 99, 255, 0.1)',
            fontSize: '0.75rem',
            lineHeight: '1.4',
            color: 'var(--color-text-muted)'
          }}>
            <strong>Tip:</strong> Click any of the growth suggestions bubbles below the chat window to quickly execute co-founder actions.
          </div>
        </div>

      </div>

    </div>
  );
};

export default CoFounder;
