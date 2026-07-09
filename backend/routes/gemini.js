const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('Gemini API initialized successfully.');
  } catch (error) {
    console.error('Error initializing Gemini API:', error);
  }
} else {
  console.warn('GEMINI_API_KEY not found in environment. Running in mock-fallback mode.');
}

// Helper to invoke Gemini model
async function generateAIResponse(prompt, isJson = true) {
  if (!genAI) {
    throw new Error('Gemini API not configured');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });
  
  const options = {};
  if (isJson) {
    options.responseMimeType = 'application/json';
  }

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: options
  });

  const response = await result.response;
  const text = response.text();
  
  if (isJson) {
    return JSON.parse(text);
  }
  return text;
}

// ----------------------------------------------------
// 1. STARTUP IDEA GENERATOR / BUSINESS PLAN
// ----------------------------------------------------
router.post('/generate-plan', async (req, res) => {
  const { idea, industry, targetAudience, country, budgetRange } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Startup idea is required' });
  }

  const prompt = `
    You are a professional startup incubator consultant. Generate a comprehensive business plan for a startup.
    
    Startup Idea Details:
    - Idea: ${idea}
    - Industry: ${industry || 'General'}
    - Target Audience: ${targetAudience || 'General public'}
    - Target Country: ${country || 'Global'}
    - Budget Range: ${budgetRange || 'Flexible'}
    
    Provide the response in JSON format with exactly the following keys:
    {
      "executiveSummary": "A concise executive summary outlining the vision, problem, and solution.",
      "businessModel": "How the business will create, deliver, and capture value.",
      "valueProposition": "A powerful statement of what makes the startup unique and valuable to its audience.",
      "revenueStreams": ["List of at least 3 concrete revenue streams"],
      "customerSegments": ["List of at least 3 customer segments"],
      "uniqueSellingProposition": "The distinct advantage that separates it from competitors.",
      "swotAnalysis": {
        "strengths": ["At least 3 strengths"],
        "weaknesses": ["At least 3 weaknesses"],
        "opportunities": ["At least 3 opportunities"],
        "threats": ["At least 3 threats"]
      }
    }
  `;

  try {
    const data = await generateAIResponse(prompt, true);
    res.json(data);
  } catch (error) {
    console.error('Gemini error generating business plan, using mock data:', error);
    // Graceful Mock Fallback
    const mockPlan = {
      executiveSummary: `HERLaunch AI incubator has crafted this business plan for a venture in ${industry || 'Tech'}. The startup addresses a critical gap for ${targetAudience || 'entrepreneurs'} by offering an innovative solution centered on: "${idea}". Guided by a commitment to equity and resilience, this project aims to capture initial market share in ${country || 'Global'} within the first 12 months.`,
      businessModel: `A hybrid subscription-based and transaction fee business model. Users pay a monthly SaaS tier for access, and a minor commission is charged on service bookings.`,
      valueProposition: `Empowering ${targetAudience || 'users'} with a seamless, AI-driven digital platform, decreasing operational overhead by up to 40% and offering customized startup acceleration resources.`,
      revenueStreams: [
        "Premium SaaS subscription tiers for business tools",
        "Direct commissions on partner transactions",
        "1-on-1 advisor matching commissions"
      ],
      customerSegments: [
        `Early-stage female startup founders in ${country || 'Global'}`,
        `Incubator networks and universities looking for digital platform toolkits`,
        `Angel investors seeking pre-vetted female-led business pipelines`
      ],
      uniqueSellingProposition: `The only dedicated incubator ecosystem that combines automated financial modeling, legal mapping, and real-time AI Co-Founder critiques tailored specifically for female founders.`,
      swotAnalysis: {
        strengths: [
          "Low cost structure through Gemini-based automation",
          "High alignment with global women's empowerment initiatives",
          "User-friendly glassmorphic UI making complex SaaS tools accessible"
        ],
        weaknesses: [
          "High dependency on continuous LLM API access",
          "Brand presence is new and needs organic building",
          "Limited history of exit cases to display immediately"
        ],
        opportunities: [
          "Integration with global corporate diversity grants",
          "Expansion to localized dialects and offline mobile access",
          "Partnership with micro-finance lenders for direct funding integration"
        ],
        threats: [
          "Rapid replication by legacy incubation software providers",
          "Shifts in local startup regulatory guidelines",
          "Fluctuations in cloud backend infrastructure hosting costs"
        ]
      }
    };
    res.json(mockPlan);
  }
});

// ----------------------------------------------------
// 2. MARKET INTELLIGENCE ENGINE
// ----------------------------------------------------
router.post('/market-intelligence', async (req, res) => {
  const { idea, industry, targetAudience, country, budgetRange } = req.body;

  const prompt = `
    You are an expert market research analyst. Perform a market intelligence assessment for the following startup idea:
    
    Startup Idea: ${idea}
    Industry: ${industry || 'General'}
    Target Audience: ${targetAudience || 'General public'}
    Target Country: ${country || 'Global'}
    
    Provide the response in JSON format with exactly the following keys:
    {
      "marketSize": "Estimated Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Obtainable Market (SOM) with numbers and justifications.",
      "trends": ["List of at least 3 major industry trends impacting this startup"],
      "competitorAnalysis": [
        {
          "name": "Competitor 1 Name or Category",
          "strengths": ["Competitor strength 1", "Competitor strength 2"],
          "weaknesses": ["Competitor weakness 1", "Competitor weakness 2"]
        },
        {
          "name": "Competitor 2 Name or Category",
          "strengths": ["Competitor strength 1"],
          "weaknesses": ["Competitor weakness 1"]
        }
      ],
      "personas": [
        {
          "name": "Example Persona Name (e.g. Founder Sarah)",
          "role": "Title",
          "demographics": "Age, background, income level, location",
          "painPoints": ["Pain point 1", "Pain point 2"],
          "goals": ["Goal 1", "Goal 2"]
        }
      ],
      "growthOpportunities": ["List of at least 3 growth opportunities"],
      "riskFactors": ["List of at least 3 risk factors"]
    }
  `;

  try {
    const data = await generateAIResponse(prompt, true);
    res.json(data);
  } catch (error) {
    console.error('Gemini error generating market intelligence, using mock data:', error);
    // Graceful Mock Fallback
    const mockIntel = {
      marketSize: "TAM: $2.5 Billion globally, driven by growing investments in female entrepreneurship. SAM: $350 Million in the specific country/industry segment. SOM: $15 Million target capture within 3 years by focusing on early adopters.",
      trends: [
        "Rising digital adaptation in traditional industries",
        "Increased focus on female founders and ESG financing guidelines",
        "Shift towards modular, AI-assisted productivity suites"
      ],
      competitorAnalysis: [
        {
          name: "Traditional Incubators",
          strengths: ["Strong institutional networking", "Established investor demo days"],
          weaknesses: ["Geographic constraints", "High entry barriers and equity requests"]
        },
        {
          name: "Generic AI Pitch Generators",
          strengths: ["Low cost", "Instant outline creation"],
          weaknesses: ["No integrated finance forecasting", "Lacks women-centric funding navigation and community support"]
        }
      ],
      personas: [
        {
          name: "Elena Rodriguez",
          role: "Aspiring Tech Founder",
          demographics: "Age 29, residing in a suburban hub, background in marketing, self-funded budget.",
          painPoints: [
            "Lacks formal finance training to build balance sheet forecasts",
            "Has no direct contacts in local venture capitalist groups"
          ],
          goals: [
            "Pitch her startup confidently to seed-stage investors",
            "Find structural mentorship without giving away early equity"
          ]
        }
      ],
      growthOpportunities: [
        "Unmapped market segments in regional entrepreneur hubs",
        "Integration of web3 credentials for funding checks",
        "B2B sales to university entrepreneurship programs"
      ],
      riskFactors: [
        "Saturated AI-driven content markets making branding difficult",
        "Changes in regional data privacy and compliance laws",
        "Potential customer churn due to self-guided workflow models"
      ]
    };
    res.json(mockIntel);
  }
});

// ----------------------------------------------------
// 3. AI STARTUP READINESS SCORE
// ----------------------------------------------------
router.post('/readiness-score', async (req, res) => {
  const { idea, industry, targetAudience, country, budgetRange } = req.body;

  const prompt = `
    You are a venture capital analyst evaluating an early-stage startup. Score the startup readiness across five categories on a scale of 0 to 100.
    
    Startup Idea: ${idea}
    Industry: ${industry}
    Target Audience: ${targetAudience}
    Country: ${country}
    Budget: ${budgetRange}
    
    Provide the response in JSON format with exactly the following keys:
    {
      "categories": {
        "innovation": 85,
        "scalability": 75,
        "marketDemand": 80,
        "revenuePotential": 70,
        "fundingReadiness": 65
      },
      "overallScore": 75,
      "breakdown": "A short summary explaining the reasons behind the scores.",
      "improvementSuggestions": [
        "Specific action item 1 to increase scores",
        "Specific action item 2 to increase scores",
        "Specific action item 3 to increase scores"
      ]
    }
  `;

  try {
    const data = await generateAIResponse(prompt, true);
    res.json(data);
  } catch (error) {
    console.error('Gemini error generating readiness score, using mock data:', error);
    // Graceful Mock Fallback
    const mockScore = {
      categories: {
        innovation: 82,
        scalability: 78,
        marketDemand: 85,
        revenuePotential: 75,
        fundingReadiness: 60
      },
      overallScore: 76,
      breakdown: `The startup displays excellent innovation and high market demand. The core value proposition addresses a genuine pain point for ${targetAudience || 'customers'}. However, funding readiness is currently lower due to early-stage financial planning and competitive crowding, which can be improved with detailed competitor mapping.`,
      improvementSuggestions: [
        "Create a detailed 3-year cash flow forecast using the Financial Forecast module.",
        "Refine your competitor differentiation strategy in the USP section.",
        "Complete a mock pitch session in the AI Shark Tank simulator to polish responses to investor questions."
      ]
    };
    res.json(mockScore);
  }
});

// ----------------------------------------------------
// 4. FINANCIAL FORECAST DASHBOARD
// ----------------------------------------------------
router.post('/financial-forecast', async (req, res) => {
  const { idea, industry, targetAudience, country, budgetRange } = req.body;

  const prompt = `
    You are a financial modeler for startups. Estimate financial forecast data for the following startup:
    
    Startup Idea: ${idea}
    Industry: ${industry}
    Budget Range: ${budgetRange}
    
    Provide the response in JSON format with exactly the following keys:
    {
      "startupCosts": [
        { "category": "Product Development", "cost": 15000 },
        { "category": "Marketing & Launch", "cost": 5000 },
        { "category": "Legal & Registration", "cost": 2000 },
        { "category": "Operations & SaaS tools", "cost": 3000 }
      ],
      "monthlyExpenses": [
        { "category": "Hosting & Infrastructure", "cost": 800 },
        { "category": "Marketing & Ads", "cost": 1500 },
        { "category": "Contractors & Support", "cost": 3000 },
        { "category": "Miscellaneous", "cost": 500 }
      ],
      "monthlyRevenue": [
        { "source": "SaaS Subscription", "amount": 6500 },
        { "source": "Transaction Fees", "amount": 2000 },
        { "source": "Advisory Sessions", "amount": 1500 }
      ],
      "profitForecast": [
        { "month": "Month 1", "revenue": 4000, "expenses": 5800, "profit": -1800 },
        { "month": "Month 2", "revenue": 5500, "expenses": 5800, "profit": -300 },
        { "month": "Month 3", "revenue": 7000, "expenses": 6000, "profit": 1000 },
        { "month": "Month 4", "revenue": 9000, "expenses": 6200, "profit": 2800 },
        { "month": "Month 5", "revenue": 11500, "expenses": 6500, "profit": 5000 },
        { "month": "Month 6", "revenue": 14000, "expenses": 6800, "profit": 7200 }
      ],
      "breakEvenEstimate": "Estimated to break even in Month 3 of operations based on steady customer acquisition."
    }
  `;

  try {
    const data = await generateAIResponse(prompt, true);
    res.json(data);
  } catch (error) {
    console.error('Gemini error generating financial forecast, using mock data:', error);
    // Graceful Mock Fallback
    const mockFinance = {
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
    res.json(mockFinance);
  }
});

// ----------------------------------------------------
// 5. AI SHARK TANK SIMULATOR
// ----------------------------------------------------
router.post('/shark-tank/chat', async (req, res) => {
  const { idea, industry, targetAudience, country, budgetRange, history, activeAgent } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Startup idea is required' });
  }

  // activeAgent is 'investor' or 'customer' or 'mentor'
  const agentName = activeAgent === 'investor' ? 'Investor AI (Sarah)' : 
                    activeAgent === 'customer' ? 'Customer AI (Maya)' : 'Startup Mentor AI (Dr. Elena)';

  const agentInstructions = {
    investor: "You are Sarah, a critical Venture Capital Investor. You care about ROI, market size, defensibility, cost of acquisition, unit economics, exit routes, and how realistic the budget is. Ask tough, direct financial/strategic questions.",
    customer: "You are Maya, a potential customer representing the target audience. You care about how simple the solution is, price sensitivity, switching costs, whether it actually solves your daily frustration, and if you would pay for it.",
    mentor: "You are Dr. Elena, an experienced startup incubator mentor. You care about founder wellness, operational risks, step-by-step launch strategies, partnership ideas, team cohesion, and product-market fit. Be encouraging but highly analytical."
  };

  const currentInstruction = agentInstructions[activeAgent] || agentInstructions.mentor;

  const prompt = `
    You are an AI Shark Tank Simulator roleplayer. 
    
    Active Agent Role: ${agentName}
    Agent Instructions: ${currentInstruction}
    
    Startup Pitch Context:
    - Idea: ${idea}
    - Industry: ${industry}
    - Target Audience: ${targetAudience}
    - Target Country: ${country}
    - Budget Range: ${budgetRange}
    
    Conversation History:
    ${JSON.stringify(history)}
    
    Generate the next single response from ${agentName}. Ensure you stay strictly in character. Do not speak for other agents. Write a short, highly realistic response (2-4 sentences). Ask exactly ONE clear, challenging question.
    
    Provide response in JSON format:
    {
      "agent": "${activeAgent}",
      "agentName": "${agentName}",
      "content": "Your response text here. Ask a direct question..."
    }
  `;

  try {
    const data = await generateAIResponse(prompt, true);
    res.json(data);
  } catch (error) {
    console.error('Gemini error in Shark Tank chat, using mock response:', error);
    // Graceful Mock Fallback
    let content = "";
    if (activeAgent === 'investor') {
      content = "I see the vision, but let's talk numbers. Your CAC (Customer Acquisition Cost) in this space could be extremely high. How exactly are you planning to reach your target customers organically without burning through your initial budget?";
    } else if (activeAgent === 'customer') {
      content = "This sounds interesting, but honestly, I'm already using three different apps that do parts of this. How simple is it to switch over to your tool, and is the monthly price low enough to justify it for my startup?";
    } else {
      content = "It's key to build a resilient foundation. Have you thought about how you will test this solution in a small, localized sandbox environment before deploying it nationally? Who would be your first 10 design partners?";
    }

    res.json({
      agent: activeAgent,
      agentName: agentName,
      content: content
    });
  }
});

router.post('/shark-tank/evaluate', async (req, res) => {
  const { idea, industry, targetAudience, country, budgetRange, history } = req.body;

  const prompt = `
    You are a startup panel evaluator. Based on the startup context and the following pitch chat history, evaluate the startup performance.
    
    Startup Context:
    - Idea: ${idea}
    - Industry: ${industry}
    
    Chat History:
    ${JSON.stringify(history)}
    
    Generate an evaluation report in JSON format with exactly these keys:
    {
      "scores": {
        "investorConfidence": 78,
        "marketFit": 82,
        "scalability": 75,
        "fundingReadiness": 65
      },
      "feedback": "A summary of how the founder handled the questions, highlighting positive traits and identifying gaps.",
      "recommendations": [
        "Actionable recommendation 1",
        "Actionable recommendation 2",
        "Actionable recommendation 3"
      ]
    }
  `;

  try {
    const data = await generateAIResponse(prompt, true);
    res.json(data);
  } catch (error) {
    console.error('Gemini error evaluating Shark Tank session, using mock evaluation:', error);
    // Graceful Mock Fallback
    res.json({
      scores: {
        investorConfidence: 75,
        marketFit: 80,
        scalability: 72,
        fundingReadiness: 62
      },
      feedback: "The founder demonstrated a strong understanding of customer pain points and provided clear descriptions of the product features. However, financial projections, CAC estimations, and defensibility against existing tech players require further refinement to secure institutional backing.",
      recommendations: [
        "Define your direct channels for low-cost customer acquisition (e.g. university networks).",
        "Draft a clear IP and data security statement to present to potential investors.",
        "Adjust budget categories to allocate more capital toward product engineering in the early phases."
      ]
    });
  }
});

// ----------------------------------------------------
// 6. AI PITCH DECK GENERATOR
// ----------------------------------------------------
router.post('/pitch-deck', async (req, res) => {
  const { idea, industry, targetAudience, country, budgetRange } = req.body;

  const prompt = `
    You are an expert pitch deck designer. Create structured presentation slides for a pitch deck.
    
    Startup Idea: ${idea}
    Industry: ${industry}
    Target Audience: ${targetAudience}
    
    Provide the response in JSON format with exactly the following keys:
    {
      "slides": {
        "problem": {
          "title": "The Problem",
          "bulletPoints": ["Problem bullet point 1", "Problem bullet point 2", "Problem bullet point 3"]
        },
        "solution": {
          "title": "The Solution",
          "bulletPoints": ["Solution bullet point 1", "Solution bullet point 2", "Solution bullet point 3"]
        },
        "market": {
          "title": "Market Opportunity",
          "bulletPoints": ["Market size and growth rate", "Target demographic details", "Under-served segments"]
        },
        "businessModel": {
          "title": "Business Model",
          "bulletPoints": ["Revenue stream 1", "Revenue stream 2", "Pricing details"]
        },
        "competition": {
          "title": "Competition & Defense",
          "bulletPoints": ["Key competitor categories", "Our unique advantage", "Defensibility factors"]
        },
        "financials": {
          "title": "Financial Projections",
          "bulletPoints": ["Year 1-3 projection summary", "Break-even target", "Margin expectation"]
        },
        "team": {
          "title": "The Team",
          "bulletPoints": ["Core roles needed", "Ecosystem support (e.g. HERLaunch AI Virtual Advisory)", "Diversity and vision description"]
        },
        "ask": {
          "title": "The Ask",
          "bulletPoints": ["Funding amount required", "Allocation of funds (product, growth, operations)", "Milestones to reach with capital"]
        }
      }
    }
  `;

  try {
    const data = await generateAIResponse(prompt, true);
    res.json(data);
  } catch (error) {
    console.error('Gemini error generating pitch deck, using mock data:', error);
    // Graceful Mock Fallback
    res.json({
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
    });
  }
});

// ----------------------------------------------------
// 7. AI CO-FOUNDER MODE CHAT
// ----------------------------------------------------
router.post('/cofounder/chat', async (req, res) => {
  const { idea, industry, targetAudience, country, budgetRange, messages } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Startup details are required' });
  }

  const prompt = `
    You are an AI Co-Founder for a startup. You are a business partner: supportive, challenging, brainstorming growth hacks, identifying operational bottlenecks, and helping refine strategies.
    
    Startup Idea: ${idea}
    Industry: ${industry}
    Target Audience: ${targetAudience}
    Country: ${country}
    Budget: ${budgetRange}
    
    Chat History:
    ${JSON.stringify(messages)}
    
    Respond in character as an energetic, smart, and detail-oriented startup co-founder. Suggest actionable next steps. Keep response relatively brief (2-4 sentences).
    
    Provide response in JSON format:
    {
      "text": "Your message as the co-founder here...",
      "suggestions": [
        "Growth hack suggestion or next step 1",
        "Growth hack suggestion or next step 2"
      ]
    }
  `;

  try {
    const data = await generateAIResponse(prompt, true);
    res.json(data);
  } catch (error) {
    console.error('Gemini error in Co-founder chat, using mock response:', error);
    // Graceful Mock Fallback
    res.json({
      text: "Hey! I think we are on the right track here, but let's make sure we double-down on testing our value proposition quickly. If we launch a quick landing page waitlist next week, we can gather email signups to prove demand before coding the entire dashboard. What do you think about that?",
      suggestions: [
        "Create a single-page signup page using a glassmorphic React template.",
        "Set up a free email campaign list (e.g., Mailchimp) to capture early interest.",
        "Run an organic campaign on LinkedIn/Twitter targeting early adopters."
      ]
    });
  }
});

// ----------------------------------------------------
// 8. FUNDING PROGRAM SUGGESTIONS
// ----------------------------------------------------
router.post('/funding/search', async (req, res) => {
  const { country, industry } = req.body;

  const prompt = `
    You are a funding database engine. Recommend specific, real startup schemes, programs, grants, and incubators for women entrepreneurs.
    
    Filters:
    - Country: ${country || 'Global'}
    - Industry: ${industry || 'Tech'}
    
    Provide the response in JSON format with exactly the following key:
    {
      "programs": [
        {
          "name": "Name of the grant, program, or accelerator",
          "provider": "Sponsor organization name",
          "description": "Brief 1-2 sentence description of what the grant offers and eligibility.",
          "type": "Grant / Accelerator / Scheme / Program / Venture Capital",
          "link": "Example URL or website name"
        }
      ]
    }
    Include at least 4 highly relevant items.
  `;

  try {
    const data = await generateAIResponse(prompt, true);
    res.json(data);
  } catch (error) {
    console.error('Gemini error searching funding programs, using mock data:', error);
    // Graceful Mock Fallback
    const mockPrograms = {
      programs: [
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
          name: "Female Founders Alliance (Alliance) Accelerator",
          provider: "The Alliance",
          description: "A venture accelerator focused specifically on helping female and non-binary founders raise early seed investment round.",
          type: "Accelerator",
          link: "https://thealliance.co"
        }
      ]
    };
    res.json(mockPrograms);
  }
});

module.exports = router;
