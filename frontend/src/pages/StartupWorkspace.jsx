import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { dbGet, dbGetAll, dbSave, firebaseAuth } from '../firebase';
import { 
  Sparkles, 
  ChevronRight, 
  AlertTriangle, 
  Target, 
  TrendingUp, 
  Users, 
  Layers, 
  DollarSign, 
  Presentation, 
  Download, 
  Activity,
  Lightbulb
} from 'lucide-react';
import Loader from '../components/Loader';

// Chart.js imports
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { jsPDF } from 'jspdf';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend
);

const StartupWorkspace = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'business');

  const getCurrencySymbol = () => {
    return startup?.country?.toLowerCase()?.trim() === 'india' ? '₹' : '$';
  };

  // Business plan / SWOT states
  const [businessPlan, setBusinessPlan] = useState(null);
  // Market intelligence states
  const [marketIntel, setMarketIntel] = useState(null);
  // Readiness score states
  const [readiness, setReadiness] = useState(null);
  // Financial states
  const [finances, setFinances] = useState(null);
  // Pitch deck states
  const [pitchDeck, setPitchDeck] = useState(null);
  const [activeSlide, setActiveSlide] = useState('problem');

  useEffect(() => {
    const fetchAllData = async () => {
      if (id === 'new') {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Fetch startup meta
        const st = await dbGet('startups', id);
        if (!st) {
          setStartup(null);
          setLoading(false);
          return;
        }
        setStartup(st);

        // Fetch corresponding models if they exist
        const bpList = await dbGetAll('businessPlans', 'startupId', id);
        if (bpList.length > 0) setBusinessPlan(bpList[0]);

        const miList = await dbGetAll('marketResearch', 'startupId', id);
        if (miList.length > 0) setMarketIntel(miList[0]);

        const rdList = await dbGetAll('readinessScores', 'startupId', id);
        if (rdList.length > 0) setReadiness(rdList[0]);

        const fnList = await dbGetAll('financialForecasts', 'startupId', id);
        if (fnList.length > 0) setFinances(fnList[0]);

        const pdList = await dbGetAll('pitchDecks', 'startupId', id);
        if (pdList.length > 0) setPitchDeck(pdList[0]);

      } catch (err) {
        console.error('Error fetching workspace models:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id]);

  // Sync state tab to URL query parameter
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const callAI = async (endpoint, dataKey, dbCol, stateSetter) => {
    setAiGenerating(true);
    const currentUser = firebaseAuth.currentUser;
    const fallbackUserId = currentUser ? currentUser.uid : 'demo_user_123';
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await fetch(`${backendUrl}/api/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idea: startup.idea,
          industry: startup.industry,
          targetAudience: startup.targetAudience,
          country: startup.country,
          budgetRange: startup.budgetRange
        })
      });
      const data = await response.json();
      
      // Save output in DB
      const dbEntry = await dbSave(dbCol, null, {
        startupId: id,
        userId: startup.userId || fallbackUserId,
        ...data
      });

      stateSetter(dbEntry);
    } catch (err) {
      console.warn(`Backend API offline. Generating localized sandbox mock for /api/ai/${endpoint}:`, err);
      
      let mockData = {};
      if (endpoint === 'generate-plan') {
        mockData = {
          executiveSummary: `HERLaunch AI has crafted this business plan for a venture in ${startup.industry}. The startup addresses a critical gap for ${startup.targetAudience} by offering an innovative solution centered on: "${startup.idea}". Guided by a commitment to equity and resilience, this project aims to capture initial market share in ${startup.country} within the first 12 months.`,
          businessModel: `A hybrid subscription-based and transaction fee business model. Users pay a monthly SaaS tier for access.`,
          valueProposition: `Empowering ${startup.targetAudience} with a seamless, AI-driven digital platform, decreasing operational overhead by up to 40%.`,
          revenueStreams: [
            "Premium SaaS subscription tiers for business tools",
            "Direct commissions on partner transactions",
            "1-on-1 advisor matching commissions"
          ],
          customerSegments: [
            `Early-stage female startup founders in ${startup.country}`,
            `Incubator networks and universities looking for digital platform toolkits`
          ],
          uniqueSellingProposition: `The only dedicated incubator ecosystem that combines automated financial modeling tailored specifically for female founders.`,
          swotAnalysis: {
            strengths: ["Low cost structure", "High alignment with empowerment initiatives", "Glassmorphic UI"],
            weaknesses: ["New brand presence", "LLM API dependency"],
            opportunities: ["Corporate diversity grants", "Dialect expansions"],
            threats: ["Rapid legacy replication", "Cloud hosting cost shifts"]
          }
        };
      } else if (endpoint === 'market-intelligence') {
        mockData = {
          marketSize: "TAM: $2.5 Billion globally. SAM: $350 Million in the specific country segment. SOM: $15 Million target capture within 3 years.",
          trends: [
            "Rising digital adaptation in traditional industries",
            "Increased focus on female founders and ESG financing",
            "Shift towards modular, AI-assisted productivity suites"
          ],
          competitorAnalysis: [
            {
              name: "Traditional Incubators",
              strengths: ["Strong institutional networking"],
              weaknesses: ["Geographic constraints", "High equity requests"]
            },
            {
              name: "Generic AI Pitch Generators",
              strengths: ["Low cost"],
              weaknesses: ["No integrated finance forecasting"]
            }
          ],
          personas: [
            {
              name: "Elena Rodriguez",
              role: "Aspiring Tech Founder",
              demographics: "Age 29, residing in a suburban hub.",
              painPoints: ["Lacks formal finance training", "No direct VC contacts"],
              goals: ["Pitch confidently to seed investors", "Find structural mentorship"]
            }
          ],
          growthOpportunities: ["Regional entrepreneur hubs", "B2B university licensing"],
          riskFactors: ["Saturated AI content markets", "Regional data privacy compliance"]
        };
      } else if (endpoint === 'readiness-score') {
        mockData = {
          categories: {
            innovation: 82,
            scalability: 78,
            marketDemand: 85,
            revenuePotential: 75,
            fundingReadiness: 60
          },
          overallScore: 76,
          breakdown: `The startup displays excellent innovation and high market demand. The core value proposition addresses a genuine pain point for ${startup.targetAudience || 'customers'}. However, funding readiness is currently lower due to early-stage financial planning and competitive crowding, which can be improved with detailed competitor mapping.`,
          improvementSuggestions: [
            "Create a detailed 3-year cash flow forecast using the Financial Forecast module.",
            "Refine your competitor differentiation strategy in the USP section.",
            "Complete a mock pitch session in the AI Shark Tank simulator to polish responses to investor questions."
          ]
        };
      } else if (endpoint === 'financial-forecast') {
        mockData = {
          startupCosts: [
            { category: "Software Development", cost: 12000 },
            { category: "Legal & Entity Filing", cost: 1500 },
            { category: "Branding & Web Design", cost: 3500 },
            { category: "Initial Marketing Launch", cost: 4000 }
          ],
          monthlyExpenses: [
            { category: "Server & Database Hosting", cost: 500 },
            { category: "Customer Acquisition", cost: 1200 },
            { category: "Software Licensing (APIs)", cost: 400 },
            { category: "Administrative Overhead", cost: 800 }
          ],
          monthlyRevenue: [
            { source: "Monthly Subscriptions", amount: 5000 },
            { source: "Transaction Fees", amount: 1500 },
            { source: "Enterprise Group Licensing", amount: 2500 }
          ],
          profitForecast: [
            { month: "Month 1", revenue: 3500, expenses: 2900, profit: 600 },
            { month: "Month 2", revenue: 5200, expenses: 2900, profit: 2300 },
            { month: "Month 3", revenue: 6800, expenses: 3100, profit: 3700 },
            { month: "Month 4", revenue: 9000, expenses: 3300, profit: 5700 },
            { month: "Month 5", revenue: 11500, expenses: 3500, profit: 8000 },
            { month: "Month 6", revenue: 15000, expenses: 3800, profit: 11200 }
          ],
          breakEvenEstimate: "Operating in profit from Month 1 due to low capital overhead and direct digital outreach."
        };
      } else if (endpoint === 'pitch-deck') {
        mockData = {
          slides: {
            problem: {
              title: "The Problem",
              bulletPoints: [
                "Lack of accessible capital and direct mentorship for early-stage women founders.",
                "Traditional startup databases lack structural tools built specifically for early validation stages.",
                "High consultancy costs prevent ideas from being fully developed."
              ]
            },
            solution: {
              title: "The Solution",
              bulletPoints: [
                "HERLaunch AI acts as a virtual startup incubator, reducing consulting costs to zero.",
                "Real-time AI simulations allow rapid preparation for funding and market fit.",
                "Interactive templates provide legal and financial forecasting in minutes."
              ]
            },
            market: {
              title: "Market Opportunity",
              bulletPoints: [
                "Women-led businesses are growing 2.5x faster than the national average.",
                "The market size of AI-driven business intelligence platforms exceeds $5 Billion.",
                "A clear opportunity to capture early-stage pre-seed ideas before traditional accelerators."
              ]
            },
            businessModel: {
              title: "Business Model",
              bulletPoints: [
                "Premium SaaS subscription tier: $15/month for unlimited analysis and exports.",
                "Transaction-based match commission (3%) for connect-grants.",
                "Corporate sponsorship tiers for diversity recruiting and investment pipelines."
              ]
            },
            competition: {
              title: "Competition & Defense",
              bulletPoints: [
                "Competitors: Traditional software suites (costly) and generic chatbots (lack structure).",
                "Our Defense: Dynamic ecosystem tailored exclusively to female entrepreneur ecosystems.",
                "High user lock-in with structured Firestore progress tracking."
              ]
            },
            financials: {
              title: "Financial Projections",
              bulletPoints: [
                "Targeting $200k Annual Recurring Revenue (ARR) in Year 1.",
                "Projected operational margins exceed 80% due to highly scalable API-first setup.",
                "Estimated break-even within 3 months of initial MVP launch."
              ]
            },
            team: {
              title: "The Team",
              bulletPoints: [
                "Founded by visionary software engineers and diversity startup consultants.",
                "Backed by HERLaunch AI's virtual incubator mentors.",
                "Guided by active angel investors acting as core advisors."
              ]
            },
            ask: {
              title: "The Ask",
              bulletPoints: [
                "Seeking $150,000 in pre-seed funding to accelerate product expansion.",
                "Use of Funds: 60% engineering development, 30% user growth, 10% legal compliance.",
                "Milestones: Reach 10,000 active startup plans and sign 3 major incubator partnerships."
              ]
            }
          }
        };
      }

      // Save output in DB
      const dbEntry = await dbSave(dbCol, null, {
        startupId: id,
        userId: startup.userId || fallbackUserId,
        ...mockData
      });

      stateSetter(dbEntry);
    } finally {
      setAiGenerating(false);
    }
  };

  if (loading) {
    return <Loader message="Opening digital incubator canvas..." />;
  }

  if (id === 'new' || !startup) {
    return (
      <div className="glass" style={{ padding: '3rem', textAlign: 'center', marginTop: '2rem' }}>
        <h2 style={{ fontFamily: 'Outfit', marginBottom: '1rem' }}>Incubator Workspace</h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
          Please go back to the Dashboard and launch/select a startup idea to open this workspace.
        </p>
        <a href="/dashboard" className="btn btn-primary">Go to Dashboard</a>
      </div>
    );
  }

  // ----------------------------------------------------
  // CHART CONFIGURATIONS
  // ----------------------------------------------------
  
  // 1. Financial Startup Costs Bar Chart
  const startupCostsData = finances ? {
    labels: finances.startupCosts.map(c => c.category),
    datasets: [{
      label: `Initial Cost Allocation (${getCurrencySymbol()})`,
      data: finances.startupCosts.map(c => c.cost),
      backgroundColor: ['#6C63FF', '#A855F7', '#EC4899', '#22C55E', '#F59E0B'],
      borderRadius: 8
    }]
  } : null;

  // 2. Financial 6-Month Profit Projection Line Chart
  const profitProjectionData = finances ? {
    labels: finances.profitForecast.map(f => f.month),
    datasets: [
      {
        label: 'Revenue',
        data: finances.profitForecast.map(f => f.revenue),
        borderColor: '#22C55E',
        backgroundColor: 'rgba(34, 197, 150, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Expenses',
        data: finances.profitForecast.map(f => f.expenses),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Profit / Loss',
        data: finances.profitForecast.map(f => f.profit),
        borderColor: '#6C63FF',
        borderDash: [5, 5],
        tension: 0.2
      }
    ]
  } : null;

  // ----------------------------------------------------
  // PDF PITCH DECK EXPORT ENGINE
  // ----------------------------------------------------
  const exportPitchDeckPDF = () => {
    if (!pitchDeck) return;
    
    // Landscape presentation sizing (10 x 5.6 inches)
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'in',
      format: [10, 5.625]
    });

    const slidesList = Object.keys(pitchDeck.slides);

    slidesList.forEach((slideKey, index) => {
      const slide = pitchDeck.slides[slideKey];
      
      // Page styling - Dark Slide aesthetic
      doc.setFillColor(15, 23, 42); // Background Color: #0F172A
      doc.rect(0, 0, 10, 5.625, 'F');
      
      // Top Decorative line
      doc.setFillColor(108, 99, 255); // Primary: #6C63FF
      doc.rect(0, 0, 10, 0.15, 'F');

      // Slide Title (Outfit font fallback - Helvetica bold)
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(28);
      doc.text(slide.title.toUpperCase(), 0.75, 1.0);

      // Slide Subtitle / Brand logo
      doc.setTextColor(168, 85, 247); // Secondary: #A855F7
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.text("HERLAUNCH AI INCUBATOR", 0.75, 1.4);

      // Body Bullet Points
      doc.setTextColor(203, 213, 225); // Slate light text
      doc.setFontSize(16);
      
      let yOffset = 2.2;
      slide.bulletPoints.forEach((bullet) => {
        const lines = doc.splitTextToSize(`•  ${bullet}`, 8.5); // wrap text
        lines.forEach(line => {
          doc.text(line, 0.75, yOffset);
          yOffset += 0.35;
        });
        yOffset += 0.15; // gap between bullet groups
      });

      // Bottom Slide Counter
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(10);
      doc.text(`Slide ${index + 1} of ${slidesList.length}`, 0.75, 5.15);
      doc.text(startup.idea.substring(0, 45) + "...", 5.5, 5.15, { align: 'left' });

      // Add a page if it's not the last slide
      if (index < slidesList.length - 1) {
        doc.addPage();
      }
    });

    doc.save(`HERLaunch_PitchDeck_${startup.industry.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div style={{ paddingBottom: '4rem' }}>
      
      {/* AI Loader */}
      {aiGenerating && (
        <Loader 
          message="Consulting HERLaunch AI Incubation Engine..." 
          subtext="Executing generative strategy models. This will take about 10-15 seconds." 
        />
      )}

      {/* Header Profile Title */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
          <span>Startups</span>
          <ChevronRight size={12} />
          <span style={{ color: 'var(--color-primary)' }}>Workspace Canvas</span>
        </div>
        
        <h1 style={{ fontSize: '1.8rem', fontFamily: 'Outfit', color: 'var(--color-text-main)' }}>
          {startup.idea}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Industry: <strong>{startup.industry}</strong> | Target Audience: <strong>{startup.targetAudience}</strong>
        </p>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="tabs-container">
        <button className={`tab-btn ${activeTab === 'business' ? 'active' : ''}`} onClick={() => handleTabChange('business')}>
          Business Plan
        </button>
        <button className={`tab-btn ${activeTab === 'market' ? 'active' : ''}`} onClick={() => handleTabChange('market')}>
          Market Intel
        </button>
        <button className={`tab-btn ${activeTab === 'readiness' ? 'active' : ''}`} onClick={() => handleTabChange('readiness')}>
          Readiness Score
        </button>
        <button className={`tab-btn ${activeTab === 'financial' ? 'active' : ''}`} onClick={() => handleTabChange('financial')}>
          Financial Forecast
        </button>
        <button className={`tab-btn ${activeTab === 'pitch' ? 'active' : ''}`} onClick={() => handleTabChange('pitch')}>
          Pitch Deck Slides
        </button>
      </div>

      {/* ---------------------------------------------------- */}
      {/* TAB 1: BUSINESS PLAN */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'business' && (
        <div>
          {!businessPlan ? (
            <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <Lightbulb size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3>No Business Plan Generated</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
                Ask our AI incubator model to analyze the business structure, construct value propositions, revenue channels, and a SWOT analysis.
              </p>
              <button 
                onClick={() => callAI('generate-plan', 'businessPlan', 'businessPlans', setBusinessPlan)} 
                className="btn btn-primary"
              >
                <Sparkles size={16} />
                <span>Generate Business Plan</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Executive Summary Card */}
              <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  Executive Summary
                </h3>
                <p style={{ color: 'var(--color-text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {businessPlan.executiveSummary}
                </p>
              </div>

              {/* Value prop and USP grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--color-secondary)' }}>
                    Core Value Proposition
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
                    {businessPlan.valueProposition}
                  </p>
                </div>

                <div className="glass" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '0.75rem', color: 'var(--color-accent)' }}>
                    Unique Selling Proposition (USP)
                  </h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
                    {businessPlan.uniqueSellingProposition}
                  </p>
                </div>
              </div>

              {/* Streams and Customer Segment details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '1rem' }}>
                    Revenue Streams
                  </h3>
                  <ul className="details-list">
                    {businessPlan.revenueStreams.map((rs, i) => (
                      <li key={i}>
                        <ChevronRight size={14} color="var(--color-primary)" style={{ marginTop: '3px' }} />
                        <span style={{ fontSize: '0.9rem' }}>{rs}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '1rem' }}>
                    Target Customer Segments
                  </h3>
                  <ul className="details-list">
                    {businessPlan.customerSegments.map((cs, i) => (
                      <li key={i}>
                        <ChevronRight size={14} color="var(--color-secondary)" style={{ marginTop: '3px' }} />
                        <span style={{ fontSize: '0.9rem' }}>{cs}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* SWOT Analysis Visual Blocks */}
              <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                  SWOT Analysis
                </h3>
                <div className="swot-grid">
                  <div className="glass swot-box swot-s">
                    <h4 style={{ color: 'var(--color-success)', fontSize: '1.1rem' }}>Strengths</h4>
                    <ul className="details-list" style={{ gap: '0.4rem' }}>
                      {businessPlan.swotAnalysis.strengths.map((s, i) => (
                        <li key={i} style={{ border: 'none', padding: '0.2rem 0', background: 'none' }}>
                          <span style={{ fontSize: '0.85rem' }}>• {s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass swot-box swot-w">
                    <h4 style={{ color: 'var(--color-error)', fontSize: '1.1rem' }}>Weaknesses</h4>
                    <ul className="details-list" style={{ gap: '0.4rem' }}>
                      {businessPlan.swotAnalysis.weaknesses.map((w, i) => (
                        <li key={i} style={{ border: 'none', padding: '0.2rem 0', background: 'none' }}>
                          <span style={{ fontSize: '0.85rem' }}>• {w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass swot-box swot-o">
                    <h4 style={{ color: 'var(--color-primary)', fontSize: '1.1rem' }}>Opportunities</h4>
                    <ul className="details-list" style={{ gap: '0.4rem' }}>
                      {businessPlan.swotAnalysis.opportunities.map((o, i) => (
                        <li key={i} style={{ border: 'none', padding: '0.2rem 0', background: 'none' }}>
                          <span style={{ fontSize: '0.85rem' }}>• {o}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass swot-box swot-t">
                    <h4 style={{ color: 'var(--color-accent)', fontSize: '1.1rem' }}>Threats</h4>
                    <ul className="details-list" style={{ gap: '0.4rem' }}>
                      {businessPlan.swotAnalysis.threats.map((t, i) => (
                        <li key={i} style={{ border: 'none', padding: '0.2rem 0', background: 'none' }}>
                          <span style={{ fontSize: '0.85rem' }}>• {t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 2: MARKET INTELLIGENCE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'market' && (
        <div>
          {!marketIntel ? (
            <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <TrendingUp size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3>No Market Research Found</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
                Analyze competitors, estimate market sizing metrics (TAM, SAM, SOM) and draft core user personas for this industry.
              </p>
              <button 
                onClick={() => callAI('market-intelligence', 'marketIntel', 'marketResearch', setMarketIntel)} 
                className="btn btn-primary"
              >
                <Sparkles size={16} />
                <span>Perform Market Research</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* TAM SAM SOM estimation block */}
              <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--color-primary)' }}>
                  Market Size Estimation (TAM, SAM, SOM)
                </h3>
                <p style={{ color: 'var(--color-text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                  {marketIntel.marketSize}
                </p>
              </div>

              {/* Competitor cards grid */}
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '1rem' }}>
                  Competitive Positioning Grid
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                  {marketIntel.competitorAnalysis.map((comp, idx) => (
                    <div key={idx} className="glass" style={{ padding: '1.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontFamily: 'Outfit', color: 'var(--color-accent)', marginBottom: '0.75rem' }}>
                        {comp.name}
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>Strengths:</strong>
                          <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                            {comp.strengths.map((str, i) => <li key={i}>{str}</li>)}
                          </ul>
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.8rem', color: 'var(--color-error)' }}>Weaknesses:</strong>
                          <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                            {comp.weaknesses.map((wk, i) => <li key={i}>{wk}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personas panels */}
              <div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '1rem' }}>
                  Primary Target Persona
                </h3>
                {marketIntel.personas.map((pers, idx) => (
                  <div key={idx} className="glass" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 800,
                      fontSize: '1.5rem'
                    }}>
                      {pers.name.charAt(0)}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: '280px' }}>
                      <h4 style={{ fontFamily: 'Outfit', fontSize: '1.2rem', color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>
                        {pers.name}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                        Role: {pers.role} | Demographics: {pers.demographics}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}>Core Pain Points:</strong>
                          <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                            {pers.painPoints.map((pt, i) => <li key={i}>{pt}</li>)}
                          </ul>
                        </div>
                        <div>
                          <strong style={{ fontSize: '0.85rem', color: 'var(--color-success)' }}>Daily Goals:</strong>
                          <ul style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', paddingLeft: '1.2rem', marginTop: '0.25rem' }}>
                            {pers.goals.map((gl, i) => <li key={i}>{gl}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Trends and opportunities lists */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '1rem' }}>
                    Industry Trends
                  </h3>
                  <ul className="details-list">
                    {marketIntel.trends.map((tr, i) => (
                      <li key={i}>
                        <ChevronRight size={14} color="var(--color-primary)" />
                        <span style={{ fontSize: '0.9rem' }}>{tr}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="glass" style={{ padding: '1.75rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '1rem' }}>
                    Growth Opportunities
                  </h3>
                  <ul className="details-list">
                    {marketIntel.growthOpportunities.map((go, i) => (
                      <li key={i}>
                        <ChevronRight size={14} color="var(--color-success)" />
                        <span style={{ fontSize: '0.9rem' }}>{go}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 3: READINESS SCORE */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'readiness' && (
        <div>
          {!readiness ? (
            <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <Activity size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3>Calculate Readiness Score</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
                Analyze your project's alignment with institutional seed funding criteria and receive a score breakdown from 0 to 100.
              </p>
              <button 
                onClick={() => callAI('readiness-score', 'readiness', 'readinessScores', setReadiness)} 
                className="btn btn-primary"
              >
                <Sparkles size={16} />
                <span>Calculate Scores</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Radial Dial & Breakdown Summary */}
              <div className="glass" style={{ padding: '2rem', display: 'flex', gap: '2.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                
                {/* SVG Radial Score Meter */}
                <div className="score-radial-container">
                  <svg className="score-radial-svg" viewBox="0 0 120 120">
                    <circle className="score-radial-bg" cx="60" cy="60" r="50" />
                    <circle 
                      className="score-radial-progress" 
                      cx="60" 
                      cy="60" 
                      r="50" 
                      strokeDasharray="314.16" 
                      strokeDashoffset={314.16 - (314.16 * readiness.overallScore) / 100}
                    />
                    <defs>
                      <linearGradient id="scoreGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-primary)" />
                        <stop offset="100%" stopColor="var(--color-accent)" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="score-radial-text">
                    <span>{readiness.overallScore}</span>
                    <span className="score-radial-label">Overall</span>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '280px' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--color-text-main)' }}>
                    Incubation Analysis
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                    {readiness.breakdown}
                  </p>
                </div>
              </div>

              {/* Categories Details Progression */}
              <div className="glass" style={{ padding: '2rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', marginBottom: '1.5rem' }}>
                  Dimension Metric Scores
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {Object.keys(readiness.categories).map((catName) => {
                    const score = readiness.categories[catName];
                    let barColor = 'var(--color-primary)';
                    if (catName === 'innovation') barColor = 'var(--color-primary)';
                    else if (catName === 'scalability') barColor = 'var(--color-secondary)';
                    else if (catName === 'marketDemand') barColor = 'var(--color-accent)';
                    else if (catName === 'revenuePotential') barColor = 'var(--color-success)';
                    else barColor = 'var(--color-warning)';

                    // Capitalize label nicely
                    const label = catName.replace(/([A-Z])/g, ' $1').toUpperCase();

                    return (
                      <div key={catName} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                          <span style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                          <span style={{ color: 'var(--color-text-main)' }}>{score} / 100</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--color-card-border)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${score}%`, height: '100%', background: barColor, borderRadius: '4px', transition: 'width 1s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Suggestions items */}
              <div className="glass" style={{ padding: '1.75rem', borderLeft: '4px solid var(--color-warning)' }}>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle color="var(--color-warning)" size={18} />
                  <span>Improvement Action Plan</span>
                </h3>
                <ul className="details-list">
                  {readiness.improvementSuggestions.map((sug, i) => (
                    <li key={i}>
                      <span style={{ color: 'var(--color-warning)', fontWeight: 800 }}>{i + 1}.</span>
                      <span style={{ fontSize: '0.9rem' }}>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 4: FINANCIAL FORECAST */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'financial' && (
        <div>
          {!finances ? (
            <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <DollarSign size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3>Estimate Financial Forecast</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
                Construct 6-month operational projection forecasts, calculate break-even estimates and allocate startup costs.
              </p>
              <button 
                onClick={() => callAI('financial-forecast', 'finances', 'financialForecasts', setFinances)} 
                className="btn btn-primary"
              >
                <Sparkles size={16} />
                <span>Estimate Financials</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Key numbers cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                <div className="glass stat-card">
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Startup Cost
                  </span>
                  <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-primary)' }}>
                    {getCurrencySymbol()}{finances.startupCosts.reduce((a, b) => a + b.cost, 0).toLocaleString()}
                  </span>
                </div>
                
                <div className="glass stat-card">
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Monthly Expenses
                  </span>
                  <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-error)' }}>
                    {getCurrencySymbol()}{finances.monthlyExpenses.reduce((a, b) => a + b.cost, 0).toLocaleString()}/mo
                  </span>
                </div>

                <div className="glass stat-card">
                  <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Monthly Projected Revenue
                  </span>
                  <span style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: 'var(--color-success)' }}>
                    {getCurrencySymbol()}{finances.monthlyRevenue.reduce((a, b) => a + b.amount, 0).toLocaleString()}/mo
                  </span>
                </div>
              </div>

              {/* Line and Bar Charts grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="glass" style={{ padding: '1.5rem', minHeight: '320px' }}>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                    Startup Cost Allocation
                  </h4>
                  {startupCostsData && <Bar data={startupCostsData} options={{ responsive: true, maintainAspectRatio: true }} />}
                </div>

                <div className="glass" style={{ padding: '1.5rem', minHeight: '320px' }}>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>
                    6-Month Projections (Revenue vs Expenses)
                  </h4>
                  {profitProjectionData && <Line data={profitProjectionData} options={{ responsive: true, maintainAspectRatio: true }} />}
                </div>
              </div>

              {/* Break even analysis banner */}
              <div className="glass" style={{ padding: '1.5rem 2rem', background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', color: 'var(--color-success)', marginBottom: '0.5rem' }}>
                  Break-Even Assessment
                </h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', lineHeight: '1.5' }}>
                  {finances.breakEvenEstimate}
                </p>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* TAB 5: PITCH DECK */}
      {/* ---------------------------------------------------- */}
      {activeTab === 'pitch' && (
        <div>
          {!pitchDeck ? (
            <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
              <Presentation size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem auto' }} />
              <h3>Generate Investor Pitch Deck</h3>
              <p style={{ color: 'var(--color-text-muted)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.95rem' }}>
                Structure professional presentation slides (Problem, Solution, Market, Revenue, Competitors) and export the deck into a sharp PDF format.
              </p>
              <button 
                onClick={() => callAI('pitch-deck', 'pitchDeck', 'pitchDecks', setPitchDeck)} 
                className="btn btn-primary"
              >
                <Sparkles size={16} />
                <span>Generate Pitch Deck</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* PDF Download top panel */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                <button onClick={exportPitchDeckPDF} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
                  <Download size={16} />
                  <span>Export Deck to PDF</span>
                </button>
              </div>

              {/* Slide Navigator and Presentation Canvas */}
              <div className="slide-editor-container">
                
                {/* Left slide selector links */}
                <div className="glass" style={{ display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.5rem' }}>
                  {Object.keys(pitchDeck.slides).map((slideKey) => {
                    const slide = pitchDeck.slides[slideKey];
                    const isActive = activeSlide === slideKey;

                    return (
                      <button
                        key={slideKey}
                        onClick={() => setActiveSlide(slideKey)}
                        className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
                        style={{
                          justifyContent: 'flex-start',
                          padding: '0.6rem 0.8rem',
                          fontSize: '0.85rem',
                          background: isActive ? undefined : 'transparent',
                          border: isActive ? 'none' : '1px solid transparent'
                        }}
                      >
                        <span style={{ textTransform: 'capitalize' }}>{slide.title}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Slide preview display canvas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div className="slide-canvas">
                    
                    <h2 style={{ fontSize: '2rem', fontFamily: 'Outfit', color: '#FFF' }}>
                      {pitchDeck.slides[activeSlide].title.toUpperCase()}
                    </h2>
                    
                    <ul style={{ 
                      color: '#CBD5E1', 
                      fontSize: '1.15rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.75rem',
                      paddingLeft: '1.5rem',
                      lineHeight: '1.6',
                      marginTop: '1.5rem'
                    }}>
                      {pitchDeck.slides[activeSlide].bulletPoints.map((bp, i) => (
                        <li key={i}>{bp}</li>
                      ))}
                    </ul>

                    <div className="slide-footer">
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600 }}>
                        HERLAUNCH AI INCUBATOR
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
                        ACTIVE CONTEXT: {startup.industry.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default StartupWorkspace;
