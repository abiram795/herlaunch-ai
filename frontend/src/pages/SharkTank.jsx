import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbGet, dbSave } from '../firebase';
import { Sparkles, Send, ShieldAlert, CheckCircle, HelpCircle, Trophy, User, ArrowLeft, RefreshCw } from 'lucide-react';
import Loader from '../components/Loader';

const SharkTank = () => {
  const { id } = useParams();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatting, setChatting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  
  // Active agent selected ('investor' | 'customer' | 'mentor')
  const [activeAgent, setActiveAgent] = useState('investor');
  const [chatHistory, setChatHistory] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  
  // Evaluation output states
  const [evaluation, setEvaluation] = useState(null);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchStartup = async () => {
      if (id === 'none') {
        setLoading(false);
        return;
      }
      try {
        const st = await dbGet('startups', id);
        if (st) {
          setStartup(st);
          
          // Set initial greeting from the active agent
          setChatHistory([
            {
              role: 'investor',
              agentName: 'Investor AI (Sarah)',
              content: `Welcome to the Pitch room! I'm Sarah, a seed-stage venture capitalist. Your startup targeting ${st.industry} sounds interesting. Tell me: what core problem are you solving for ${st.targetAudience}, and why is now the best time to build it?`,
              timestamp: new Date().toISOString()
            }
          ]);
        }
      } catch (err) {
        console.error('Error fetching startup for Shark Tank:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStartup();
  }, [id]);

  useEffect(() => {
    // Scroll chat to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatting || !startup) return;

    const userMsg = {
      role: 'user',
      agentName: 'Founder',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setChatting(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      
      // Call chat endpoint to get the active agent's question
      const response = await fetch(`${backendUrl}/api/ai/shark-tank/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: startup.idea,
          industry: startup.industry,
          targetAudience: startup.targetAudience,
          country: startup.country,
          budgetRange: startup.budgetRange,
          history: [...chatHistory, userMsg].map(m => ({ role: m.role, content: m.content })),
          activeAgent: activeAgent
        })
      });

      const data = await response.json();
      
      setChatHistory(prev => [...prev, {
        role: data.agent,
        agentName: data.agentName,
        content: data.content,
        timestamp: new Date().toISOString()
      }]);
    } catch (err) {
      console.error('Error sending message to Shark Tank:', err);
    } finally {
      setChatting(false);
    }
  };

  const handleAgentChange = (agentKey) => {
    setActiveAgent(agentKey);
    // Add a transition text from the new agent to prompt the user
    let promptText = "";
    if (agentKey === 'investor') {
      promptText = "Investor Sarah here. Let's dig deeper: What are your primary customer acquisition costs and how will you protect your margins?";
    } else if (agentKey === 'customer') {
      promptText = "Customer Maya here. Honestly, why should I switch from my current solution? Explain how your product changes my daily workflow.";
    } else {
      promptText = "Startup Mentor Dr. Elena joining. I want to look at the operation: What key milestones do you need to reach in the next 90 days to prove this out?";
    }

    setChatHistory(prev => [...prev, {
      role: agentKey,
      agentName: agentKey === 'investor' ? 'Investor AI (Sarah)' : agentKey === 'customer' ? 'Customer AI (Maya)' : 'Startup Mentor AI (Dr. Elena)',
      content: promptText,
      timestamp: new Date().toISOString()
    }]);
  };

  const handleEvaluateSession = async () => {
    if (chatHistory.length < 2 || !startup) return;
    setEvaluating(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/ai/shark-tank/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: startup.idea,
          industry: startup.industry,
          targetAudience: startup.targetAudience,
          country: startup.country,
          budgetRange: startup.budgetRange,
          history: chatHistory.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();
      
      // Save session evaluation in firestore
      const savedSession = await dbSave('sharkTankSessions', null, {
        startupId: id,
        userId: startup.userId || 'demo_user_123',
        chatHistory: chatHistory,
        ...data
      });

      setEvaluation(savedSession);
    } catch (err) {
      console.error('Error evaluating pitch session:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleReset = () => {
    setEvaluation(null);
    setChatHistory([
      {
        role: 'investor',
        agentName: 'Investor AI (Sarah)',
        content: `Welcome to the Pitch room! I'm Sarah, a seed-stage venture capitalist. Your startup targeting ${startup.industry} sounds interesting. Tell me: what core problem are you solving for ${startup.targetAudience}, and why is now the best time to build it?`,
        timestamp: new Date().toISOString()
      }
    ]);
    setActiveAgent('investor');
  };

  if (loading) {
    return <Loader message="Setting up AI Shark Tank chamber..." />;
  }

  if (id === 'none' || !startup) {
    return (
      <div className="glass" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <h2 style={{ fontFamily: 'Outfit', marginBottom: '1rem' }}>AI Shark Tank Simulator</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Please launch or select an active startup from your Dashboard list to test your pitch in front of the sharks.
        </p>
        <Link to="/dashboard" className="btn btn-primary">Go to Dashboard</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <Link to="/dashboard" style={{ color: 'var(--color-text-muted)' }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: '1.8rem', fontFamily: 'Outfit', color: 'var(--color-text-main)' }}>
          AI Shark Tank Simulator
        </h1>
      </div>

      {!evaluation ? (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem', minHeight: '520px' }} className="shark-tank-container">
          
          {/* Left panel: Judges Selectors */}
          <div className="glass" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', marginBottom: '0.5rem' }}>Meet the Judges</h3>
            
            <button 
              onClick={() => handleAgentChange('investor')} 
              className={`btn ${activeAgent === 'investor' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', border: activeAgent === 'investor' ? 'none' : '1px solid var(--color-card-border)' }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#6C63FF' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Investor Sarah</div>
                <div style={{ fontSize: '0.7rem', color: activeAgent === 'investor' ? '#CBD5E1' : 'var(--color-text-muted)' }}>Venture Capital & Unit Economics</div>
              </div>
            </button>

            <button 
              onClick={() => handleAgentChange('customer')} 
              className={`btn ${activeAgent === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', border: activeAgent === 'customer' ? 'none' : '1px solid var(--color-card-border)' }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#EC4899' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Customer Maya</div>
                <div style={{ fontSize: '0.7rem', color: activeAgent === 'customer' ? '#CBD5E1' : 'var(--color-text-muted)' }}>Target Audience & Usability</div>
              </div>
            </button>

            <button 
              onClick={() => handleAgentChange('mentor')} 
              className={`btn ${activeAgent === 'mentor' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', width: '100%', border: activeAgent === 'mentor' ? 'none' : '1px solid var(--color-card-border)' }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22C55E' }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Mentor Dr. Elena</div>
                <div style={{ fontSize: '0.7rem', color: activeAgent === 'mentor' ? '#CBD5E1' : 'var(--color-text-muted)' }}>Launch Strategy & Operations</div>
              </div>
            </button>

            <div style={{ marginTop: 'auto', borderTop: '1px solid var(--color-card-border)', paddingTop: '1rem' }}>
              <button 
                onClick={handleEvaluateSession} 
                disabled={chatHistory.length < 2 || evaluating}
                className="btn btn-accent"
                style={{ width: '100%', display: 'flex', gap: '0.5rem', padding: '0.75rem' }}
              >
                {evaluating ? (
                  <div className="spinner" style={{ width: '18px', height: '18px' }} />
                ) : (
                  <>
                    <Trophy size={16} />
                    <span>Evaluate Pitch Session</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right panel: Chat Screen */}
          <div className="glass chat-box">
            
            {/* Active Judge Status Bar */}
            <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--color-card-border)', background: 'var(--color-input-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                  Talking to: {activeAgent === 'investor' ? 'Sarah' : activeAgent === 'customer' ? 'Maya' : 'Dr. Elena'}
                </span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {chatHistory.length} messages in history
              </span>
            </div>

            {/* Chat message timeline */}
            <div className="chat-messages">
              {chatHistory.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={index} 
                    className={`message-bubble ${isUser ? 'message-user' : 'message-agent'}`}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, opacity: 0.8, marginBottom: '0.25rem' }}>
                      {msg.agentName}
                    </div>
                    <div style={{ fontSize: '0.9rem', lineHeight: '1.5' }}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input form */}
            <form onSubmit={handleSendMessage} className="chat-input-area">
              <input 
                type="text" 
                className="form-control" 
                placeholder={`Type your reply to ${activeAgent === 'investor' ? 'Sarah' : activeAgent === 'customer' ? 'Maya' : 'Dr. Elena'}...`}
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

        </div>
      ) : (
        /* Evaluation Results Card */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass" style={{ padding: '2.5rem', textAlign: 'center', background: 'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 80%)' }}>
            <Trophy size={48} color="var(--color-secondary)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              VC Board Evaluation Scorecard
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto' }}>
              Your pitch has been evaluated by our AI panel. Here is your structured readiness report.
            </p>
          </div>

          {/* Scores Breakdown grids */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            <div className="glass stat-card">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Investor Confidence
              </span>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-primary)' }}>
                {evaluation.scores.investorConfidence}%
              </span>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-card-border)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${evaluation.scores.investorConfidence}%`, height: '100%', background: 'var(--color-primary)' }} />
              </div>
            </div>

            <div className="glass stat-card">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Market Fit
              </span>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-accent)' }}>
                {evaluation.scores.marketFit}%
              </span>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-card-border)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${evaluation.scores.marketFit}%`, height: '100%', background: 'var(--color-accent)' }} />
              </div>
            </div>

            <div className="glass stat-card">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Scalability Score
              </span>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-secondary)' }}>
                {evaluation.scores.scalability}%
              </span>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-card-border)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${evaluation.scores.scalability}%`, height: '100%', background: 'var(--color-secondary)' }} />
              </div>
            </div>

            <div className="glass stat-card">
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Funding Readiness
              </span>
              <span style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-success)' }}>
                {evaluation.scores.fundingReadiness}%
              </span>
              <div style={{ width: '100%', height: '6px', background: 'var(--color-card-border)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                <div style={{ width: `${evaluation.scores.fundingReadiness}%`, height: '100%', background: 'var(--color-success)' }} />
              </div>
            </div>
          </div>

          {/* Feedback summary */}
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
              Judges Feedback Report
            </h3>
            <p style={{ color: 'var(--color-text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>
              {evaluation.feedback}
            </p>
          </div>

          {/* Recommendations list */}
          <div className="glass" style={{ padding: '1.75rem', borderLeft: '4px solid var(--color-success)' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle color="var(--color-success)" size={18} />
              <span>Incubator Recommendations</span>
            </h3>
            <ul className="details-list">
              {evaluation.recommendations.map((rec, i) => (
                <li key={i}>
                  <span style={{ color: 'var(--color-success)', fontWeight: 800 }}>{i + 1}.</span>
                  <span style={{ fontSize: '0.9rem' }}>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action links */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={handleReset} className="btn btn-secondary">
              <RefreshCw size={14} />
              <span>Pitch Again</span>
            </button>
            <Link to="/dashboard" className="btn btn-primary">
              Return to Dashboard
            </Link>
          </div>

        </div>
      )}

    </div>
  );
};

export default SharkTank;
