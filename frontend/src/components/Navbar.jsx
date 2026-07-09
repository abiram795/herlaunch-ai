import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { listenToAuth, logoutUser } from '../firebase';
import { Sun, Moon, LogOut, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = listenToAuth((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="navbar glass" style={{
      background: 'var(--color-sidebar-bg)',
      borderBottom: '1px solid var(--color-card-border)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Link to={user ? "/dashboard" : "/"} style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {/* Logo Icon */}
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.25rem',
            fontFamily: 'Outfit, sans-serif'
          }}>
            H
          </div>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 'bold',
            fontFamily: 'Outfit, sans-serif',
            background: 'linear-gradient(135deg, var(--color-text-main) 30%, var(--color-secondary) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            HERLaunch AI
          </span>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Dark/Light Mode toggle */}
        <button 
          onClick={toggleTheme} 
          className="btn-icon" 
          title="Toggle Light/Dark Theme"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* User Info & Action */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                {user.displayName}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                {user.email}
              </span>
            </div>
            
            <img 
              src={user.photoURL || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200'} 
              alt={user.displayName} 
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '2px solid var(--color-primary)',
                objectFit: 'cover'
              }}
            />

            <button 
              onClick={handleLogout} 
              className="btn btn-secondary" 
              style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', fontSize: '0.85rem' }}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <Link to="/" className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem' }}>
            Get Started
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
