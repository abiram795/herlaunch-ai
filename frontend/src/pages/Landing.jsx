import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle, listenToAuth, signUpUser, signInUser } from '../firebase';
import { Sparkles, Bot, ShieldCheck, TrendingUp, Users, Target } from 'lucide-react';
import Loader from '../components/Loader';

const Landing = () => {
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = listenToAuth((user) => {
      if (user) {
        navigate('/dashboard');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      if (authTab === 'signup') {
        await signUpUser(email, password, name);
      } else {
        await signInUser(email, password);
      }
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.message.replace('AuthError: ', '').replace('Firebase: ', ''));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setAuthError('');
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader message="Creating secure user session..." />;
  }

  const features = [
    {
      icon: <Sparkles color="var(--color-primary)" size={24} />,
      title: "Startup Idea Generator",
      desc: "Describe your concept and get an instant professional Business Model Canvas, value proposition, and SWOT analysis."
    },
    {
      icon: <TrendingUp color="var(--color-secondary)" size={24} />,
      title: "Market Intelligence Engine",
      desc: "Analyze your Total Addressable Market (TAM), competitive positioning, and target user personas using real-time insights."
    },
    {
      icon: <Bot color="var(--color-accent)" size={24} />,
      title: "AI Co-Founder Mode",
      desc: "A collaborative AI partner that challenges assumptions, brainstorms creative growth hacks, and refines operational milestones."
    },
    {
      icon: <ShieldCheck color="var(--color-success)" size={24} />,
      title: "AI Shark Tank Simulator",
      desc: "Pitch to a mock board (Investor Sarah, Customer Maya, Mentor Dr. Elena) and test your readiness in a sandbox environment."
    },
    {
      icon: <Users color="var(--color-primary)" size={24} />,
      title: "AI Startup Readiness Score",
      desc: "Receive a quantitative score out of 100 on scalability, demand, and funding readiness with actionable tips to level up."
    },
    {
      icon: <Target color="var(--color-secondary)" size={24} />,
      title: "Funding Navigator",
      desc: "Instantly discover government grants, seed loans, accelerators, and VC programs tailored specifically for women founders."
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hero Section */}
      <section style={{
        padding: '120px 2rem 80px 2rem',
        background: 'radial-gradient(circle at top right, rgba(168, 85, 247, 0.15), transparent 50%), radial-gradient(circle at bottom left, rgba(108, 99, 255, 0.1), transparent 40%)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow Spheres */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(108, 99, 255, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.4rem 1rem', 
            borderRadius: '20px', 
            background: 'rgba(236, 72, 153, 0.1)', 
            border: '1px solid rgba(236, 72, 153, 0.2)',
            color: 'var(--color-accent)',
            fontSize: '0.85rem',
            fontWeight: 600,
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            <Sparkles size={14} />
            <span>Catalyst for Equity & Entrepreneurship</span>
          </div>

          <h1 style={{
            fontSize: '3.5rem',
            lineHeight: '1.15',
            fontWeight: 800,
            fontFamily: 'Outfit, sans-serif',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, var(--color-text-main) 30%, var(--color-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Empowering Women Entrepreneurs <br/>
            With AI-Powered Incubation
          </h1>

          <p style={{
            fontSize: '1.2rem',
            color: 'var(--color-text-muted)',
            maxWidth: '720px',
            margin: '0 auto 2.5rem auto',
            lineHeight: '1.6'
          }}>
            HERLaunch AI is a virtual startup incubator designed to level the playing field. Move from business idea to investor-ready pitch with automated research, co-founder validation, and interactive simulations.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
            <button onClick={() => { setAuthTab('signin'); setShowAuthModal(true); }} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.05rem' }}>
              Launch Your Startup Idea
            </button>
          </div>
        </div>
      </section>

      {/* Stats Board */}
      <section style={{ padding: '2rem 1.5rem', borderY: '1px solid var(--color-card-border)', background: 'var(--color-bg-alt)' }}>
        <div style={{ 
          maxWidth: '1000px', 
          margin: '0 auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '2rem',
          textAlign: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary)' }}>$120B+</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Unlocking Female Economic Capital</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-secondary)' }}>0 to Hero</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Instant Pitch Deck Export</p>
          </div>
          <div>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-accent)' }}>100% Secure</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Private Local/Cloud Sandbox</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontFamily: 'Outfit', marginBottom: '0.75rem' }}>
            Incubator Engines & Modules
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
            A comprehensive, digital suite built specifically to accelerate female-led venture building.
          </p>
        </div>

        <div className="dashboard-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="glass stat-card" style={{ padding: '2rem' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '12px', 
                background: 'var(--color-bg-alt)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '1.25rem',
                border: '1px solid var(--color-card-border)'
              }}>
                {feat.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'Outfit' }}>
                {feat.title}
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>
                {feat.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 2rem', background: 'var(--color-bg-alt)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'Outfit', marginBottom: '0.75rem' }}>
              Empowered Testimonials
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Real impact reported by female founders using our sandbox tools.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="glass" style={{ padding: '2.5rem' }}>
              <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--color-text-main)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                "As a first-time founder from a marketing background, building a financial forecast sheet was terrifying. HERLaunch AI's forecasting models and line charts made it plug-and-play. I raised my $100k seed round last week!"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-accent), var(--color-secondary))' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Tasha Jenkins</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Founder of GreenSprouts</p>
                </div>
              </div>
            </div>

            <div className="glass" style={{ padding: '2.5rem' }}>
              <p style={{ fontStyle: 'italic', fontSize: '1.05rem', color: 'var(--color-text-main)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
                "The Shark Tank Simulator is brilliant. The AI Investor asked exactly the same questions that a real VC panel did. Practicing my answers beforehand gave me the confidence to pitch flawlessly."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }} />
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Dr. Julia Vance</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>CEO of MedFlow Tech</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        padding: '3rem 2rem',
        borderTop: '1px solid var(--color-card-border)',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
          © {new Date().getFullYear()} HERLaunch AI. Empowering women entrepreneurs, engineering resilient ecosystems.
        </p>
      </footer>

      {/* Glassmorphic Auth Modal (Separate Sign In / Sign Up) */}
      {showAuthModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }} onClick={() => setShowAuthModal(false)}>
          <div className="glass" style={{
            width: '100%',
            maxWidth: '440px',
            padding: '2.5rem 2rem',
            background: 'var(--color-sidebar-bg)',
            position: 'relative'
          }} onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setShowAuthModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '1.25rem',
                cursor: 'pointer'
              }}
            >
              ✕
            </button>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--color-card-border)', marginBottom: '1.5rem' }}>
              <button 
                onClick={() => { setAuthTab('signin'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: authTab === 'signin' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: 600,
                  borderBottom: authTab === 'signin' ? '2px solid var(--color-primary)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthTab('signup'); setAuthError(''); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: authTab === 'signup' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  fontWeight: 600,
                  borderBottom: authTab === 'signup' ? '2px solid var(--color-primary)' : 'none',
                  cursor: 'pointer'
                }}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: 'var(--color-error)',
                padding: '0.75rem',
                borderRadius: 'var(--border-radius-sm)',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {authTab === 'signup' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Jane Doe" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="name@company.com" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Password</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                {authTab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-card-border)' }} />
              <span>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--color-card-border)' }} />
            </div>

            <button onClick={handleGoogleAuth} className="btn btn-secondary" style={{ width: '100%' }}>
              Continue with Google
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Landing;
