import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { dbGetAll, dbSave, firebaseAuth } from '../firebase';
import { Plus, Sparkles, AlertCircle, ArrowRight, Lightbulb, Bot, TrendingUp, DollarSign } from 'lucide-react';
import Loader from '../components/Loader';

const Dashboard = ({ activeStartupId, onSelectStartup }) => {
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newIdeaMode, setNewIdeaMode] = useState(false);
  const [savingIdea, setSavingIdea] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [idea, setIdea] = useState('');
  const [industry, setIndustry] = useState('Technology');
  const [targetAudience, setTargetAudience] = useState('');
  const [country, setCountry] = useState('United States');
  const [budgetRange, setBudgetRange] = useState('$10,000 - $50,000');

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const list = await dbGetAll('startups');
        setStartups(list);
      } catch (err) {
        console.error('Error fetching startups:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStartups();
  }, []);

  const handleLaunchIdea = async (e) => {
    e.preventDefault();
    if (!idea) return;
    setSavingIdea(true);

    try {
      const currentUser = firebaseAuth.currentUser;
      const newStartup = await dbSave('startups', null, {
        userId: currentUser ? currentUser.uid : 'demo_user_123',
        idea,
        industry,
        targetAudience,
        country,
        budgetRange
      });

      // Dispatch event to refresh Sidebar startup dropdown
      window.dispatchEvent(new Event('herlaunch_refresh_startups'));

      setStartups(prev => [newStartup, ...prev]);
      onSelectStartup(newStartup.id);
      setIdea('');
      setTargetAudience('');
      setNewIdeaMode(false);

      // Redirect to the newly created startup's workspace
      navigate(`/workspace/${newStartup.id}`);
    } catch (err) {
      console.error('Error launching startup idea:', err);
    } finally {
      setSavingIdea(false);
    }
  };

  if (loading) {
    return <Loader message="Fetching your incubator workspace..." />;
  }

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      {/* Top Welcome Panel */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', background: 'linear-gradient(135deg, var(--color-text-main) 40%, var(--color-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Startup Portfolio
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
            Manage your startup profiles and access AI-driven analysis tools.
          </p>
        </div>

        {!newIdeaMode && (
          <button onClick={() => setNewIdeaMode(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Launch New Venture</span>
          </button>
        )}
      </div>

      {/* New Startup Idea Form Modal / Banner */}
      {newIdeaMode && (
        <div className="glass" style={{ padding: '2rem', marginBottom: '2rem', background: 'rgba(108, 99, 255, 0.05)', border: '1px solid rgba(108, 99, 255, 0.15)' }}>
          <h2 style={{ fontSize: '1.4rem', fontFamily: 'Outfit', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb color="var(--color-primary)" />
            <span>Launch Your Startup Idea</span>
          </h2>
          
          <form onSubmit={handleLaunchIdea}>
            <div className="form-group">
              <label>What is your business idea? (Be as descriptive as you like)</label>
              <textarea 
                className="form-control"
                rows="3"
                placeholder="e.g. An AI-powered peer tutoring network that connects high school girls to female engineering students..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                required
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label>Industry Segment</label>
                <select className="form-control" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="Technology & SaaS">Technology & SaaS</option>
                  <option value="Education Technology">EdTech</option>
                  <option value="Healthcare & BioTech">Healthcare & Biotech</option>
                  <option value="FinTech">FinTech</option>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Sustainability & CleanTech">Sustainability & CleanTech</option>
                  <option value="Social Impact">Social Impact</option>
                </select>
              </div>

              <div className="form-group">
                <label>Primary Target Audience</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Working mothers, Gen Z girls"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Market Country</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={country}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCountry(val);
                    if (val.toLowerCase().trim() === 'india') {
                      setBudgetRange('₹5,00,000 - ₹20,00,000');
                    } else {
                      setBudgetRange('$10,000 - $50,000');
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label>Budget Allocation Range</label>
                <select className="form-control" value={budgetRange} onChange={(e) => setBudgetRange(e.target.value)}>
                  {country.toLowerCase().trim() === 'india' ? (
                    <>
                      <option value="Under ₹5,00,000">Under ₹5,00,000</option>
                      <option value="₹5,00,000 - ₹20,00,000">₹5,00,000 - ₹20,00,000</option>
                      <option value="₹20,00,000 - ₹1,00,00,000">₹20,00,000 - ₹1,00,00,000</option>
                      <option value="₹1,00,00,000 - ₹5,00,00,000">₹1,00,00,000 - ₹5,00,00,000</option>
                      <option value="Flexible / Venture Scale">Flexible / Venture Scale</option>
                    </>
                  ) : (
                    <>
                      <option value="Under $10,000">Under $10,000</option>
                      <option value="$10,000 - $50,000">$10,000 - $50,000</option>
                      <option value="$50,000 - $150,000">$50,000 - $150,000</option>
                      <option value="$150,000 - $500,000">$150,000 - $500,000</option>
                      <option value="Flexible / Venture Scale">Flexible / Venture Scale</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setNewIdeaMode(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={savingIdea} className="btn btn-primary" style={{ minWidth: '140px' }}>
                {savingIdea ? (
                  <div className="spinner" style={{ width: '18px', height: '18px' }} />
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Launch Incubator</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main stats counters */}
      {startups.length > 0 && (
        <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
          <div className="glass stat-card">
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Active Startups
            </span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>
              {startups.length}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Active incubation session running
            </span>
          </div>

          <div className="glass stat-card" style={{ borderLeft: '1px solid var(--color-card-border)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              AI Co-Founder Sessions
            </span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>
              Active
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              Brainstorming ecosystem online
            </span>
          </div>

          <div className="glass stat-card" style={{ borderLeft: '1px solid var(--color-card-border)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
              Shark Tank Simulator
            </span>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit' }}>
              Ready
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-accent)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              3 judges standing by
            </span>
          </div>
        </div>
      )}

      {/* Startups Portfolio Cards */}
      <h2 style={{ fontSize: '1.4rem', fontFamily: 'Outfit', marginBottom: '1.25rem' }}>
        Incubated Ventures
      </h2>

      {startups.length === 0 ? (
        <div className="glass" style={{
          padding: '4rem 2rem',
          textAlign: 'center',
          border: '2px dashed var(--color-card-border)',
          background: 'none'
        }}>
          <AlertCircle size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Active Startup Ventures</h3>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '440px', margin: '0 auto 2rem auto', fontSize: '0.95rem' }}>
            HERLaunch AI virtual incubator is ready. Enter your startup details above to generate business plans, competitor intelligence, readiness scores, and pitch decks.
          </p>
          <button onClick={() => setNewIdeaMode(true)} className="btn btn-primary">
            <Plus size={18} />
            <span>Launch Your First Idea</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {startups.map((st) => (
            <div 
              key={st.id} 
              className="glass" 
              style={{ 
                padding: '1.75rem', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1rem',
                borderLeft: activeStartupId === st.id ? '4px solid var(--color-primary)' : undefined,
                transition: 'all 0.2s ease-in-out'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: '280px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
                    {st.idea}
                  </h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <span className="badge badge-primary">{st.industry}</span>
                    <span className="badge badge-secondary">Target: {st.targetAudience}</span>
                    <span className="badge badge-accent">{st.country}</span>
                    <span className="badge badge-success">Budget: {st.budgetRange}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link 
                    to={`/workspace/${st.id}`} 
                    onClick={() => onSelectStartup(st.id)}
                    className="btn btn-primary"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  >
                    <span>Open Workspace</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              {/* Mini Quick links to modular tools */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '1rem', 
                paddingTop: '1rem',
                borderTop: '1px solid var(--color-card-border)',
                fontSize: '0.85rem'
              }}>
                <Link 
                  to={`/cofounder/${st.id}`} 
                  onClick={() => onSelectStartup(st.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}
                >
                  <Bot size={16} color="var(--color-primary)" />
                  <span>Consult AI Co-Founder</span>
                </Link>

                <Link 
                  to={`/shark-tank/${st.id}`} 
                  onClick={() => onSelectStartup(st.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}
                >
                  <Sparkles size={16} color="var(--color-accent)" />
                  <span>Interactive Shark Pitch</span>
                </Link>

                <Link 
                  to={`/workspace/${st.id}?tab=financial`} 
                  onClick={() => onSelectStartup(st.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}
                >
                  <TrendingUp size={16} color="var(--color-success)" />
                  <span>Forecast Models</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
