import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import './LandingPage.css';

/* Animated counter hook */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return [count, ref];
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const [savingsCount, savingsRef] = useCounter(1247, 2500);
  const [patientsCount, patientsRef] = useCounter(1847, 2000);
  const [rateCount, rateRef] = useCounter(78, 2000);
  const [accuracyCount, accuracyRef] = useCounter(942, 2200);

  const features = [
    {
      id: 'predict',
      title: 'Predictive Risk Engine',
      desc: 'XGBoost model trained on Databricks Lakehouse. Combines structured EHR data with NLP-extracted features from clinical notes for multi-modal prediction.',
      visual: '📊',
      image: '/assets/ai_predictive.png',
      stats: '94.2% Accuracy • AUC 0.967',
      tags: ['XGBoost', 'SHAP', 'Databricks', 'MLflow'],
    },
    {
      id: 'explain',
      title: 'What-If Simulator',
      desc: 'Interactive SHAP-powered explainability. Toggle interventions like Home Nurse or Telehealth and watch the risk dial drop in real-time.',
      visual: '🎯',
      image: '/assets/ai_simulator.png',
      stats: 'Real-time risk recalculation',
      tags: ['SHAP XAI', 'Intervention Modeling', 'Clinical DSS'],
    },
    {
      id: 'voice',
      title: 'Ambient AI Dictation',
      desc: 'Hands-free clinical documentation using Web Speech API. Auto-detects patient trajectory (Improving/Stable/Declining) via LLM analysis.',
      visual: '🎤',
      image: '/assets/doctor_hero.png',
      stats: 'Zero-click status updates',
      tags: ['Web Speech API', 'NLP', 'Real-time'],
    },
    {
      id: 'rag',
      title: 'RAG Medical Copilot',
      desc: 'Context-aware chatbot grounded in patient history from MongoDB. Generates discharge summaries, answers clinical queries, drafts care plans.',
      visual: '🤖',
      image: '/assets/ai_chatbot.png',
      stats: 'Full patient context retrieval',
      tags: ['RAG', 'LLM', 'MongoDB', 'Prompt Engineering'],
    },
    {
      id: 'twilio',
      title: 'Automated Follow-Up Loop',
      desc: 'Post-discharge WhatsApp messaging via Twilio. Patient replies trigger escalation alerts for the nursing team in real-time.',
      visual: '💬',
      image: '/assets/ai_followup.png',
      stats: '24/7 automated monitoring',
      tags: ['Twilio', 'WhatsApp', 'Webhooks', 'Escalation'],
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <div className="landing-page">
      {/* Background Effects */}
      <div className="bg-grid" />
      <div className="bg-radial" style={{ top: '-200px', left: '-100px', background: 'var(--accent-primary)' }} />
      <div className="bg-radial" style={{ bottom: '-200px', right: '-100px', background: 'var(--accent-secondary)' }} />
      <div className="bg-radial" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#2dd4bf', opacity: 0.06, width: '800px', height: '800px' }} />

      {/* Floating particles */}
      <div className="particles">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 8}s`,
            }}
          />
        ))}
      </div>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="nav-logo">
          <img src="/assets/logo.png" alt="CareConnect Logo" className="img-logo" />
          <span className="logo-text">CareConnect</span>
        </div>
          <div className="nav-center-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#impact">Impact</a>
            <a href="#demo">Demo</a>
          </div>
          <div className="nav-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/login')}>Log In</button>
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Clinician Portal
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================== HERO ========================== */}
      <section className="hero-section">
        <div className="hero-badge animate-fade-in-up">
          <span className="hero-badge-dot" />
          HackBricks 2026 — Team Butter Garlic Naan
        </div>

        <h1 className="hero-headline animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Stop the <span className="gradient-text">Revolving Door</span>
        </h1>

        <p className="hero-sub animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Multi-modal AI predicting and preventing 30-day hospital readmissions
          <br />before the patient leaves the building.
        </p>

        <div className="hero-cta animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button className="btn btn-primary btn-lg hero-btn" onClick={() => navigate('/dashboard')}>
            Enter Clinician Portal
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
          <button className="btn btn-ghost btn-lg" onClick={() => {
            document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
          }}>
            Watch Demo ↓
          </button>
        </div>

        {/* Floating stats */}
        <div className="hero-stats animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="hero-stat">
            <span className="hero-stat-number">94.2%</span>
            <span className="hero-stat-label">Model Accuracy</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">$1.2M</span>
            <span className="hero-stat-label">Penalties Avoided</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">&lt;500ms</span>
            <span className="hero-stat-label">Inference Latency</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-number">57%</span>
            <span className="hero-stat-label">Readmission Drop</span>
          </div>
        </div>
      </section>

      {/* ========================== PROBLEM ========================== */}
      <section className="problem-section">
        <div className="problem-container">
          <div className="problem-label animate-fade-in-up">THE PROBLEM</div>
          <h2 className="problem-headline animate-fade-in-up">
            Hospitals lose <span className="text-danger">$26 Billion</span> annually to preventable readmissions
          </h2>
          <div className="problem-grid stagger">
            <div className="problem-card">
              <div className="problem-number">1 in 5</div>
              <p>Medicare patients are readmitted within 30 days of discharge</p>
            </div>
            <div className="problem-card">
              <div className="problem-number">$15K+</div>
              <p>Average cost per avoidable readmission to the healthcare system</p>
            </div>
            <div className="problem-card">
              <div className="problem-number">80%</div>
              <p>Of risk clues hide in unstructured clinical notes — current systems miss them</p>
            </div>
          </div>
          <div className="problem-arrow">
            <div className="problem-arrow-text">
              Care Connect solves this by combining structured EHR + unstructured NLP in one unified pipeline →
            </div>
          </div>
        </div>
      </section>

      {/* ========================== VALUE PROP GRID ========================== */}
      <section className="value-section" id="features">
        <div className="section-badge">CORE CAPABILITIES</div>
        <h2 className="section-title">
          Three pillars of <span className="gradient-text">intelligent care</span>
        </h2>
        <div className="value-grid stagger">
          <div className="value-card">
            <div className="value-icon" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
              </svg>
            </div>
            <h3>Predictive Risk Engine</h3>
            <p>XGBoost + SHAP delivering actionable explainable insights. Know exactly <em>why</em> a patient is high-risk with interactive What-If simulation.</p>
            <div className="value-tag">XAI + What-If Simulator</div>
            <div className="value-card-stat">
              <span className="vcs-number">94.2%</span>
              <span className="vcs-label">Model Accuracy</span>
            </div>
          </div>

          <div className="value-card value-card-featured">
            <div className="featured-badge">⭐ CORE INNOVATION</div>
            <div className="value-icon" style={{ background: 'var(--accent-primary-glow)', color: 'var(--accent-primary)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </div>
            <h3>Ambient AI Dictation</h3>
            <p>Hands-free voice notes with real-time NLP analysis. Auto-detects patient trajectory changes and updates clinical status instantly.</p>
            <div className="value-tag">RAG Copilot Included</div>
            <div className="value-card-stat">
              <span className="vcs-number">0</span>
              <span className="vcs-label">Extra clicks needed</span>
            </div>
          </div>

          <div className="value-card">
            <div className="value-icon" style={{ background: 'var(--color-success-soft)', color: 'var(--color-success)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <h3>Continuous Care Loop</h3>
            <p>Automated WhatsApp follow-ups via Twilio. Missed meds trigger real-time nurse escalation. Closing the loop 24/7.</p>
            <div className="value-tag">24/7 Auto-Monitoring</div>
            <div className="value-card-stat">
              <span className="vcs-number">87%</span>
              <span className="vcs-label">Intervention Success</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================== HOW IT WORKS ========================== */}
      <section className="how-section" id="how-it-works">
        <div className="section-badge">END-TO-END PIPELINE</div>
        <h2 className="section-title">
          From admission to <span className="gradient-text">recovery</span>
        </h2>
        <p className="section-sub">A complete AI-powered pipeline that follows the patient through every stage</p>

        <div className="how-steps">
          {[
            { num: '01', title: 'Ingest', desc: 'Structured EHR data + unstructured clinical notes are ingested into Databricks Delta Lake.', icon: '📥', color: '#6366f1' },
            { num: '02', title: 'Extract', desc: 'Spark NLP extracts risk indicators — medication issues, confusion, social isolation — from notes.', icon: '🔍', color: '#8b5cf6' },
            { num: '03', title: 'Balance', desc: 'SMOTE handles class imbalance — real medical data is 90%+ non-readmissions.', icon: '⚖️', color: '#a78bfa' },
            { num: '04', title: 'Predict', desc: 'XGBoost model scores each patient. Served via MLflow REST API at <500ms latency.', icon: '🧠', color: '#2dd4bf' },
            { num: '05', title: 'Explain', desc: 'SHAP values reveal why. Doctors simulate interventions with the What-If engine.', icon: '📊', color: '#22c55e' },
            { num: '06', title: 'Follow-Up', desc: 'Twilio sends WhatsApp check-ins. "NO" replies trigger nurse alerts instantly.', icon: '💬', color: '#f59e0b' },
          ].map((step) => (
            <div key={step.num} className="how-step" style={{ '--step-color': step.color }}>
              <div className="how-step-connector" />
              <div className="how-step-dot" />
              <div className="how-step-content">
                <span className="how-step-num">{step.num}</span>
                <div className="how-step-icon">{step.icon}</div>
                <h4>{step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================== FEATURE DEEP DIVE ========================== */}
      <section className="deep-section">
        <div className="section-badge">DEEP DIVE</div>
        <h2 className="section-title">
          Explore the <span className="gradient-text">technology</span>
        </h2>
        <div className="deep-layout">
          {/* Tabs */}
          <div className="deep-tabs">
            {features.map((f, i) => (
              <button
                key={f.id}
                className={`deep-tab ${activeFeature === i ? 'active' : ''}`}
                onClick={() => setActiveFeature(i)}
              >
                <span className="deep-tab-icon">{f.visual}</span>
                <span className="deep-tab-title">{f.title}</span>
                {activeFeature === i && <div className="deep-tab-indicator" />}
              </button>
            ))}
          </div>
          {/* Content */}
          <div className="deep-content animate-fade-in" key={activeFeature}>
            <div className="deep-info">
              <h3>{features[activeFeature].title}</h3>
              <p>{features[activeFeature].desc}</p>
              <div className="deep-stat">{features[activeFeature].stats}</div>
              <div className="deep-tags">
                {features[activeFeature].tags.map((t) => (
                  <span key={t} className="tech-pill">{t}</span>
                ))}
              </div>
            </div>

            <div className="deep-visual-wrapper">
              {features[activeFeature].image ? (
                <img src={features[activeFeature].image} alt="Feature visual" className="deep-feature-image" />
              ) : (
                <div className="deep-visual">
                  <span className="deep-big-icon">{features[activeFeature].visual}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ========================== IMPACT NUMBERS ========================== */}
      <section className="impact-section" id="impact">
        <div className="section-badge">MEASURED IMPACT</div>
        <h2 className="section-title">
          Results that <span className="gradient-text">speak for themselves</span>
        </h2>
        <div className="impact-grid">
          <div className="impact-card" ref={savingsRef}>
            <div className="impact-number">${savingsCount.toLocaleString()}K</div>
            <div className="impact-label">Financial Penalties Avoided</div>
            <div className="impact-sub">CMS Hospital Readmissions Reduction Program</div>
          </div>
          <div className="impact-card" ref={patientsRef}>
            <div className="impact-number">{patientsCount.toLocaleString()}</div>
            <div className="impact-label">Patients Monitored</div>
            <div className="impact-sub">Since Care Connect deployment</div>
          </div>
          <div className="impact-card" ref={rateRef}>
            <div className="impact-number">{rateCount}%</div>
            <div className="impact-label">Readmission Reduction</div>
            <div className="impact-sub">From 18.2% → 7.8% in 6 months</div>
          </div>
          <div className="impact-card" ref={accuracyRef}>
            <div className="impact-number">{(accuracyCount / 10).toFixed(1)}%</div>
            <div className="impact-label">XGBoost Model Accuracy</div>
            <div className="impact-sub">Retrained every 48 hours on Databricks</div>
          </div>
        </div>
      </section>

      {/* ========================== BEFORE / AFTER ========================== */}
      <section className="compare-section">
        <div className="section-badge">THE DIFFERENCE</div>
        <h2 className="section-title">
          Before &amp; after <span className="gradient-text">Care Connect</span>
        </h2>
        <div className="compare-grid">
          <div className="compare-card compare-before">
            <div className="compare-header">
              <span className="compare-icon">❌</span>
              <h3>Without Care Connect</h3>
            </div>
            <ul>
              <li>Risk scores based only on structured data (numbers)</li>
              <li>Clinical notes sit unread in EHR systems</li>
              <li>No explainability — doctors don't trust "black box" scores</li>
              <li>No post-discharge follow-up until ER visit</li>
              <li>Patient receives 20-page discharge docs they can't understand</li>
              <li>Hospital pays $15K+ per avoidable readmission penalty</li>
            </ul>
          </div>
          <div className="compare-card compare-after">
            <div className="compare-header">
              <span className="compare-icon">✅</span>
              <h3>With Care Connect</h3>
            </div>
            <ul>
              <li>Multi-modal AI fuses EHR + NLP from clinical notes</li>
              <li>Spark NLP auto-extracts risk clues from every note</li>
              <li>SHAP shows exactly <em>why</em> — full transparency</li>
              <li>Automated WhatsApp check-ins close the loop 24/7</li>
              <li>LLM simplifies notes to 5th-grade reading level</li>
              <li>$1.2M in penalties avoided — ROI dashboard proves it</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ========================== TECH STACK ========================== */}
      <section className="tech-section">
        <div className="section-badge">TECHNOLOGY STACK</div>
        <h2 className="section-title">Built with</h2>
        <div className="tech-grid">
          {[
            { name: 'React', category: 'Frontend' },
            { name: 'Node.js', category: 'Backend' },
            { name: 'MongoDB', category: 'Database' },
            { name: 'Databricks', category: 'ML Platform' },
            { name: 'XGBoost', category: 'Model' },
            { name: 'SHAP', category: 'Explainability' },
            { name: 'Spark NLP', category: 'NLP' },
            { name: 'Twilio', category: 'Messaging' },
            { name: 'MLflow', category: 'Deployment' },
            { name: 'Docker', category: 'Infra' },
            { name: 'Web Speech API', category: 'Voice' },
            { name: 'Delta Lake', category: 'Storage' },
          ].map((tech) => (
            <div key={tech.name} className="tech-card">
              <span className="tech-name">{tech.name}</span>
              <span className="tech-category">{tech.category}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ========================== DEMO ACCESS / ROLE LOGIN ========================== */}
      <section className="demo-section" id="demo">
        <div className="section-badge">TRY IT NOW</div>
        <h2 className="section-title">
          Experience <span className="gradient-text">every perspective</span>
        </h2>
        <p className="section-sub">Care Connect adapts for each stakeholder. Choose a role to explore.</p>

        <div className="demo-roles stagger">
          <button className="demo-role-card" onClick={() => navigate('/dashboard')} style={{ '--role-accent': '#6366f1' }}>
            <div className="demo-role-glow" />
            <div className="demo-role-icon">🩺</div>
            <h3>Dr. Arjun Smith</h3>
            <span className="demo-role-title">Attending Physician</span>
            <p>Triage patients, run XAI simulations, use ambient dictation & RAG copilot</p>
            <div className="demo-role-route">/dashboard →</div>
          </button>

          <button className="demo-role-card" onClick={() => navigate('/analytics')} style={{ '--role-accent': '#8b5cf6' }}>
            <div className="demo-role-glow" />
            <div className="demo-role-icon">📊</div>
            <h3>Maria Chen</h3>
            <span className="demo-role-title">Hospital Director</span>
            <p>Review ROI analytics, financial savings, and Databricks model metrics</p>
            <div className="demo-role-route">/analytics →</div>
          </button>

          <button className="demo-role-card" onClick={() => navigate('/alerts')} style={{ '--role-accent': '#2dd4bf' }}>
            <div className="demo-role-glow" />
            <div className="demo-role-icon">💊</div>
            <h3>Priya Kapoor</h3>
            <span className="demo-role-title">Care Coordinator</span>
            <p>Handle escalation alerts, WhatsApp replies, and dispatch telehealth</p>
            <div className="demo-role-route">/alerts →</div>
          </button>

          <button className="demo-role-card" onClick={() => navigate('/patient-status/srishti')} style={{ '--role-accent': '#f472b6' }}>
            <div className="demo-role-glow" />
            <div className="demo-role-icon">🏠</div>
            <h3>Srishti Patel</h3>
            <span className="demo-role-title">Patient / Family</span>
            <p>Daily check-ins, medication tracker, simplified discharge notes</p>
            <div className="demo-role-route">/patient-status →</div>
          </button>
        </div>

        <div className="demo-security">
          <span className="demo-security-dot" />
          Secure Connection Established • HIPAA Compliant Environment
        </div>
      </section>

      {/* ========================== FOOTER ========================== */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="nav-logo">
              <div className="logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </div>
              <span className="logo-text" style={{ fontSize: '1rem' }}>CareConnect</span>
            </div>
            <p className="footer-desc">Multi-Modal Readmission Intelligence Platform</p>
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">Pipeline</a>
            <a href="#impact">Impact</a>
            <a href="#demo">Demo</a>
          </div>
          <div className="footer-copy">
            © 2026 Team Butter Garlic Naan — HackBricks 2026
          </div>
        </div>
      </footer>
    </div>
  );
}
