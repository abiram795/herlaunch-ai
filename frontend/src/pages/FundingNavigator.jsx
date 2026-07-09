import React, { useState, useEffect } from 'react';
import { DollarSign, Search, Award, Landmark, Sparkles, AlertCircle } from 'lucide-react';
import Loader from '../components/Loader';

const FundingNavigator = () => {
  const [country, setCountry] = useState('United States');
  const [industry, setIndustry] = useState('Technology & SaaS');
  const [loading, setLoading] = useState(false);
  const [programs, setPrograms] = useState([]);

  // Curated static local database for quick boot
  const curatedPrograms = [
    {
      name: "Cartier Women's Initiative Awards",
      provider: "Cartier & INSEAD Business School",
      description: "An international business program for women-run impact startups. Offers grants up to $100,000, mentoring, and networking.",
      type: "Grant & Accelerator",
      link: "https://www.cartierwomensinitiative.com"
    },
    {
      name: "Amber Grant for Women Entrepreneurs",
      provider: "WomensNet",
      description: "A monthly $10,000 grant awarded to a female business owner, with a year-end grand prize of $25,000. Low eligibility barrier.",
      type: "Grant",
      link: "https://womensnet.net"
    },
    {
      name: "Tory Burch Foundation Fellows Program",
      provider: "Tory Burch Foundation",
      description: "Provides a $5,000 grant, business education, and access to a massive community of female founders and capital networking.",
      type: "Program & Grant",
      link: "https://www.toryburchfoundation.org"
    },
    {
      name: "Halcyon Female Founders Fellowship",
      provider: "Halcyon Incubator",
      description: "Designed for women-led social enterprise startups, providing residency, consulting, and equity-free stipends.",
      type: "Accelerator",
      link: "https://www.halcyonhouse.org"
    }
  ];

  useEffect(() => {
    // Start with default curated programs
    setPrograms(curatedPrograms);
  }, []);

  const handleSearchAI = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/ai/funding/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ country, industry })
      });

      const data = await response.json();
      if (data.programs && data.programs.length > 0) {
        setPrograms(data.programs);
      }
    } catch (err) {
      console.error('Error fetching funding recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      
      {loading && (
        <Loader 
          message="Searching global directories with HERLaunch AI..." 
          subtext="Locating active women grants, corporate fellowships, and government lending initiatives."
        />
      )}

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontFamily: 'Outfit', background: 'linear-gradient(135deg, var(--color-text-main) 40%, var(--color-secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Funding & Accelerator Navigator
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
          Discover grants, accelerators, and incubation schemes tailored specifically to your region and sector.
        </p>
      </div>

      {/* Filter panel */}
      <div className="glass" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Search size={18} color="var(--color-primary)" />
          <span>Search Filters</span>
        </h3>

        <form onSubmit={handleSearchAI} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
            <label>Country / Region</label>
            <input 
              type="text" 
              className="form-control" 
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ flex: 1, minWidth: '220px', marginBottom: 0 }}>
            <label>Industry Sector</label>
            <select className="form-control" value={industry} onChange={(e) => setIndustry(e.target.value)}>
              <option value="Technology & SaaS">Technology & SaaS</option>
              <option value="Education Technology">EdTech</option>
              <option value="Healthcare & BioTech">Healthcare & BioTech</option>
              <option value="FinTech">FinTech</option>
              <option value="E-Commerce & Retail">E-Commerce & Retail</option>
              <option value="Sustainability & CleanTech">Sustainability & CleanTech</option>
              <option value="Social Impact">Social Impact</option>
              <option value="Agriculture & Food">Agriculture & Food</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '0.5rem', height: '43px' }}>
            <Sparkles size={16} />
            <span>Search with AI</span>
          </button>
        </form>
      </div>

      {/* Program listings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {programs.map((prog, idx) => (
          <div key={idx} className="glass" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            
            <div style={{ 
              width: '44px', 
              height: '44px', 
              borderRadius: '10px', 
              background: 'var(--color-bg-alt)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid var(--color-card-border)',
              color: 'var(--color-primary)'
            }}>
              {prog.type.toLowerCase().includes('grant') ? <Award size={20} /> : <Landmark size={20} />}
            </div>

            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontFamily: 'Outfit', fontWeight: 600 }}>{prog.name}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                    Provider: <strong>{prog.provider}</strong>
                  </p>
                </div>
                <span className="badge badge-primary">{prog.type}</span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', marginTop: '0.75rem', lineHeight: '1.5' }}>
                {prog.description}
              </p>

              <div style={{ marginTop: '1rem' }}>
                <a 
                  href={prog.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Visit Website
                </a>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Notice box */}
      <div className="glass" style={{ display: 'flex', gap: '1rem', padding: '1.25rem', marginTop: '2rem', background: 'rgba(108, 99, 255, 0.03)', borderStyle: 'dashed' }}>
        <AlertCircle size={20} color="var(--color-primary)" style={{ flexShrink: 0 }} />
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
          <strong>Note:</strong> Always review the specific eligibility, deadline, and matching criteria on the official program website before applying. Grants and accelerator applications fluctuate seasonally.
        </p>
      </div>

    </div>
  );
};

export default FundingNavigator;
