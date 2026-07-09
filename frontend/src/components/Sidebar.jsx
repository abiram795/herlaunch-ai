import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Lightbulb, 
  Bot, 
  HelpCircle, 
  DollarSign, 
  FileSpreadsheet, 
  Sparkles,
  Award,
  User
} from 'lucide-react';
import { dbGetAll } from '../firebase';

const Sidebar = ({ activeStartupId, onSelectStartup }) => {
  const [startups, setStartups] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchStartups = async () => {
      try {
        const list = await dbGetAll('startups');
        setStartups(list);
        if (list.length > 0 && !activeStartupId) {
          onSelectStartup(list[0].id);
        }
      } catch (err) {
        console.error('Error fetching startups for sidebar selector:', err);
      }
    };
    fetchStartups();
    
    // Add custom event listener to refresh list when new startup is saved
    window.addEventListener('herlaunch_refresh_startups', fetchStartups);
    return () => window.removeEventListener('herlaunch_refresh_startups', fetchStartups);
  }, [activeStartupId, onSelectStartup]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Incubator Workspace', path: `/workspace/${activeStartupId || 'new'}`, icon: <Lightbulb size={20} /> },
    { name: 'AI Co-Founder Mode', path: `/cofounder/${activeStartupId || 'none'}`, icon: <Bot size={20} /> },
    { name: 'Shark Tank Simulator', path: `/shark-tank/${activeStartupId || 'none'}`, icon: <Sparkles size={20} /> },
    { name: 'Funding Navigator', path: '/funding', icon: <DollarSign size={20} /> },
    { name: 'Profile Account', path: '/profile', icon: <User size={20} /> }
  ];

  return (
    <aside className="glass" style={{
      width: '260px',
      position: 'fixed',
      top: '70px',
      left: 0,
      bottom: 0,
      zIndex: 90,
      background: 'var(--color-sidebar-bg)',
      borderRight: '1px solid var(--color-card-border)',
      borderTopRightRadius: '0px',
      borderBottomRightRadius: '0px',
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem 1rem',
      gap: '2rem',
      overflowY: 'auto'
    }}>
      {/* Startup Quick Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
          Active Venture Context
        </label>
        
        {startups.length > 0 ? (
          <select 
            value={activeStartupId || ''} 
            onChange={(e) => onSelectStartup(e.target.value)}
            className="form-control"
            style={{ 
              padding: '0.5rem', 
              fontSize: '0.85rem', 
              background: 'var(--color-input-bg)',
              fontWeight: 500
            }}
          >
            {startups.map((st) => (
              <option key={st.id} value={st.id}>
                {st.idea.length > 25 ? `${st.idea.substring(0, 25)}...` : st.idea}
              </option>
            ))}
          </select>
        ) : (
          <div style={{ 
            fontSize: '0.8rem', 
            color: 'var(--color-accent)', 
            padding: '0.5rem',
            border: '1px dashed var(--color-card-border)',
            borderRadius: 'var(--border-radius-sm)',
            textAlign: 'center'
          }}>
            No Startup Profiles Yet
          </div>
        )}
      </div>

      {/* Main Navigation links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {navItems.map((item) => {
          // Determine if item is active
          const isActive = location.pathname.startsWith(item.path.split('/:')[0]);
          
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={() => `btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                justifyContent: 'flex-start',
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '0.9rem',
                border: isActive ? 'none' : '1px solid transparent',
                background: isActive ? undefined : 'transparent'
              }}
            >
              {item.icon}
              <span style={{ fontWeight: 500 }}>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Empowerment Motivation Widget */}
      <div className="glass" style={{
        padding: '1rem',
        borderRadius: 'var(--border-radius-sm)',
        background: 'rgba(236, 72, 153, 0.05)',
        border: '1px solid rgba(236, 72, 153, 0.1)',
        textAlign: 'center'
      }}>
        <Award size={24} color="var(--color-accent)" style={{ margin: '0 auto 0.5rem auto' }} />
        <h5 style={{ fontSize: '0.85rem', color: 'var(--color-text-main)', marginBottom: '0.25rem', fontFamily: 'Outfit' }}>
          Catalyst for Equity
        </h5>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
          "Engineering resilient economic ecosystems for women startup founders worldwide."
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
