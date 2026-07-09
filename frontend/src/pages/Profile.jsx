import React, { useState, useEffect } from 'react';
import { listenToAuth, logoutUser } from '../firebase';
import { User, Shield, Key, Heart } from 'lucide-react';
import Loader from '../components/Loader';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = listenToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loader message="Fetching account profile..." />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--color-text-main) 40%, var(--color-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Profile & Account Settings
      </h1>

      {user ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main profile card */}
          <div className="glass" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <img 
              src={user.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'} 
              alt={user.displayName}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                border: '4px solid var(--color-primary)',
                objectFit: 'cover'
              }}
            />

            <div style={{ flex: 1, minWidth: '250px' }}>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'Outfit', marginBottom: '0.25rem' }}>{user.displayName}</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>{user.email}</p>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-primary">Incubatee Founder</span>
                <span className="badge badge-success">Google Verified</span>
              </div>
            </div>
          </div>

          {/* Sandbox settings */}
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={18} color="var(--color-primary)" />
              <span>Incubator Environment</span>
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem', lineHeight: '1.5' }}>
              Your workspace stores startups securely on Google Cloud Firebase. In the absence of direct API keys, the workspace falls back to a sandbox storage layer running inside your local browser storage.
            </p>
            <div style={{
              background: 'var(--color-input-bg)',
              border: '1px solid var(--color-card-border)',
              padding: '1rem',
              borderRadius: 'var(--border-radius-sm)',
              fontSize: '0.85rem'
            }}>
              <strong>Local Sandbox Status:</strong> <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Active & Running</span>
            </div>
          </div>

          {/* Hackathon Project context */}
          <div className="glass" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontFamily: 'Outfit', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} color="var(--color-accent)" />
              <span>Project Mission: Catalyst for Equity</span>
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              HERLaunch AI is designed as an entry for the <strong>Women's Empowerment Hackathon</strong>. Its mission is to build resilient economic ecosystems, unlocking entrepreneurship resources for women globally by transforming early-stage ideas into investment-ready business assets through generative AI.
            </p>
          </div>

        </div>
      ) : (
        <div className="glass" style={{ padding: '2rem', textAlign: 'center' }}>
          <p>Please log in to view your profile dashboard.</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
