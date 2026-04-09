import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { patients, chatSuggestions, sampleChatResponses } from '../data/mockData';
import './PatientDetail.css';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const patient = patients.find((p) => p.id === id);
  const [interventions, setInterventions] = useState(patient?.interventions || {});
  const [showDischarge, setShowDischarge] = useState(false);

  if (!patient) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div style={{ padding: '120px 40px', textAlign: 'center' }}>
          <h2>Patient not found</h2>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const currentRisk = Object.entries(interventions).reduce((risk, [key, active]) => {
    return active ? risk + (patient.interventionEffects[key] || 0) : risk;
  }, patient.riskScore);

  const clampedRisk = Math.max(0, Math.min(100, currentRisk));

  const toggleIntervention = (key) => {
    setInterventions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="patient-main">
        {/* Header Panel */}
        <div className="patient-header card animate-fade-in-up">
          <div className="ph-left">
            <div className="ph-avatar" style={{
              background: patient.riskScore >= 70 ? 'var(--color-danger-soft)' : 'var(--accent-primary-glow)',
              color: patient.riskScore >= 70 ? 'var(--color-danger)' : 'var(--accent-primary)',
            }}>
              {patient.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <div>
              <h1 className="ph-name">{patient.name}</h1>
              <div className="ph-meta">
                <span>{patient.age}y • {patient.gender}</span>
                <span className="ph-divider">|</span>
                <span>Room {patient.room}</span>
                <span className="ph-divider">|</span>
                <span>🩸 {patient.bloodType}</span>
              </div>
            </div>
          </div>
          <div className="ph-right">
            <div className="ph-allergies">
              <span className="ph-allergy-label">Allergies:</span>
              {patient.allergies.length > 0
                ? patient.allergies.map((a) => <span key={a} className="pill pill-danger">{a}</span>)
                : <span className="pill pill-success">None</span>
              }
            </div>
            <div className="ph-vitals">
              <span>♥ {patient.vitals.hr} bpm</span>
              <span>BP {patient.vitals.bp}</span>
              <span>🌡 {patient.vitals.temp}</span>
              <span>SpO₂ {patient.vitals.spo2}</span>
            </div>
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="patient-grid">
          {/* LEFT COLUMN: Clinical History + Dictation */}
          <div className="pg-left animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <ClinicalHistory notes={patient.clinicalHistory} />
            <DictationHub />
          </div>

          {/* CENTER COLUMN: Risk Dial + SHAP + What-If */}
          <div className="pg-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <RiskDial risk={clampedRisk} originalRisk={patient.riskScore} />
            <SHAPChart
              factors={patient.shapFactors}
              interventions={interventions}
              interventionEffects={patient.interventionEffects}
              onToggle={toggleIntervention}
            />
            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button className="btn btn-success btn-lg" onClick={() => setShowDischarge(true)} id="discharge-btn">
                ✅ Confirm Discharge & Alert Patient
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: RAG Copilot */}
          <div className="pg-right animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <RAGCopilot patientName={patient.name} />
          </div>
        </div>
      </main>

      {showDischarge && (
        <DischargeModal patient={patient} onClose={() => setShowDischarge(false)} />
      )}
    </div>
  );
}

/* ============ Sub-Components ============ */

function ClinicalHistory({ notes }) {
  const typeColors = { admission: 'info', dictation: 'warning', discharge: 'success' };
  return (
    <div className="card ch-card">
      <h3 className="section-label">📋 Clinical History</h3>
      <div className="ch-timeline">
        {notes.map((note, i) => (
          <div key={i} className="ch-item">
            <div className="ch-dot-line">
              <div className={`ch-dot pill-${typeColors[note.type]}`} />
              {i < notes.length - 1 && <div className="ch-line" />}
            </div>
            <div className="ch-content">
              <div className="ch-meta">
                <span className={`pill pill-${typeColors[note.type]}`}>{note.type}</span>
                <span className="ch-date">{note.date}</span>
              </div>
              <p>{note.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DictationHub() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const recognitionRef = useRef(null);

  const toggleRecording = () => {
    if (recording) {
      recognitionRef.current?.stop();
      setRecording(false);
      if (transcript.trim()) {
        setAnalyzing(true);
        setTimeout(() => setAnalyzing(false), 2000);
      }
    } else {
      try {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = (e) => {
          let text = '';
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          setTranscript(text);
        };
        recognition.onerror = () => setRecording(false);
        recognition.onend = () => setRecording(false);
        recognitionRef.current = recognition;
        recognition.start();
        setRecording(true);
        setTranscript('');
      } catch {
        setTranscript('Speech recognition not available in this browser. Try Chrome.');
      }
    }
  };

  return (
    <div className="card dictation-card">
      <h3 className="section-label">🎤 Ambient Dictation Hub</h3>
      <div className="dic-center">
        <button
          className={`dic-mic ${recording ? 'recording' : ''}`}
          onClick={toggleRecording}
          id="dictation-mic-btn"
        >
          {recording && <span className="dic-pulse" />}
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <p className="dic-hint">{recording ? 'Listening... Click to stop' : 'Click to start dictation'}</p>
      </div>
      {transcript && (
        <div className="dic-transcript">
          <p>{transcript}</p>
        </div>
      )}
      {analyzing && (
        <div className="dic-analyzing">
          <span className="spinner" style={{ width: 14, height: 14 }} />
          Analyzing intent... Updating status tag
        </div>
      )}
    </div>
  );
}

function RiskDial({ risk, originalRisk }) {
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(risk), 100);
    return () => clearTimeout(timer);
  }, [risk]);

  const angle = (animated / 100) * 180;
  const riskColor = risk >= 70 ? '#ef4444' : risk >= 40 ? '#f59e0b' : '#22c55e';
  const changed = risk !== originalRisk;

  return (
    <div className="card risk-dial-card">
      <h3 className="section-label">🎯 Readmission Risk Score</h3>
      <div className="dial-container">
        <svg viewBox="0 0 200 120" className="dial-svg">
          {/* Background arc */}
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="var(--bg-elevated)" strokeWidth="12" strokeLinecap="round" />
          {/* Colored arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={riskColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={`${(angle / 180) * 251.2} 251.2`}
            style={{ transition: 'stroke-dasharray 1s ease-out, stroke 0.5s ease' }}
            className="dial-progress"
          />
          {/* Needle */}
          <line
            x1="100" y1="100" x2="100" y2="30"
            stroke={riskColor}
            strokeWidth="2"
            strokeLinecap="round"
            style={{
              transform: `rotate(${angle - 90}deg)`,
              transformOrigin: '100px 100px',
              transition: 'transform 1s ease-out',
            }}
          />
          <circle cx="100" cy="100" r="5" fill={riskColor} style={{ transition: 'fill 0.5s ease' }} />
        </svg>
        <div className="dial-value" style={{ color: riskColor }}>
          {animated}%
        </div>
        {changed && (
          <div className="dial-delta" style={{
            color: risk < originalRisk ? 'var(--color-success)' : 'var(--color-danger)'
          }}>
            {risk < originalRisk ? '↓' : '↑'} {Math.abs(risk - originalRisk)}% from baseline
          </div>
        )}
      </div>
    </div>
  );
}

function SHAPChart({ factors, interventions, interventionEffects, onToggle }) {
  const maxImpact = Math.max(...factors.map((f) => Math.abs(f.impact)));
  const interventionLabels = {
    homeNurse: 'Assign Home Nurse',
    telehealth: 'Schedule Telehealth',
    medicationReminder: 'Medication Reminders',
    dietPlan: 'Personalized Diet Plan',
  };

  return (
    <div className="card shap-card">
      <h3 className="section-label">📊 SHAP What-If Simulator</h3>
      <p className="shap-sub">Toggle interventions to simulate risk reduction</p>

      {/* SHAP Bars */}
      <div className="shap-bars">
        {factors.map((f, i) => {
          const width = (Math.abs(f.impact) / maxImpact) * 100;
          const isPositive = f.direction === 'up';
          return (
            <div key={i} className="shap-row">
              <span className="shap-label">{f.feature}</span>
              <div className="shap-bar-container">
                {isPositive ? (
                  <div className="shap-bar-right">
                    <div className="shap-bar shap-positive" style={{ width: `${width}%` }} />
                  </div>
                ) : (
                  <div className="shap-bar-left">
                    <div className="shap-bar shap-negative" style={{ width: `${width}%` }} />
                  </div>
                )}
              </div>
              <span className={`shap-impact ${isPositive ? 'positive' : 'negative'}`}>
                {isPositive ? '+' : ''}{f.impact}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Intervention Toggles */}
      <div className="interventions">
        <h4 className="intervention-title">Interventions</h4>
        {Object.entries(interventionLabels).map(([key, label]) => (
          <div key={key} className="intervention-row">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={interventions[key] || false}
                onChange={() => onToggle(key)}
              />
              <span className="toggle-slider" />
            </label>
            <span className="intervention-label">{label}</span>
            <span className="intervention-effect">
              {interventionEffects[key]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RAGCopilot({ patientName }) {
  const [messages, setMessages] = useState([
    { role: 'ai', text: `Hello! I'm your AI copilot for **${patientName}**. Ask me anything about this patient's history, medications, or care plan.` },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = (text) => {
    const query = text || input;
    if (!query.trim()) return;
    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setInput('');
    setTyping(true);

    setTimeout(() => {
      const response = sampleChatResponses[query] ||
        `Based on the clinical records for ${patientName}, I've analyzed the relevant data. This is a simulated response — in production, this would query the RAG pipeline with the patient's full history from MongoDB and return contextualized medical insights.`;
      setMessages((prev) => [...prev, { role: 'ai', text: response }]);
      setTyping(false);
    }, 1500);
  };

  return (
    <div className="card rag-card">
      <h3 className="section-label">🤖 RAG Medical Copilot</h3>

      {/* Suggested prompts */}
      <div className="rag-suggestions">
        {chatSuggestions.map((s) => (
          <button key={s} className="rag-pill" onClick={() => sendMessage(s)}>{s}</button>
        ))}
      </div>

      {/* Chat messages */}
      <div className="rag-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`rag-msg ${msg.role}`}>
            <div className="rag-msg-avatar">
              {msg.role === 'ai' ? '🤖' : '👨‍⚕️'}
            </div>
            <div className="rag-msg-content">{msg.text}</div>
          </div>
        ))}
        {typing && (
          <div className="rag-msg ai">
            <div className="rag-msg-avatar">🤖</div>
            <div className="rag-msg-content rag-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="rag-input-row">
        <input
          className="input rag-input"
          placeholder="Ask about this patient..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          id="rag-chat-input"
        />
        <button className="btn btn-primary btn-icon" onClick={() => sendMessage()} id="rag-send-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ---- Discharge Modal ---- */
function DischargeModal({ patient, onClose }) {
  const [cadence, setCadence] = useState('Daily');
  const [approved, setApproved] = useState(false);

  const dischargeSummary = `DISCHARGE SUMMARY — ${patient.name}
Date: ${new Date().toLocaleDateString()}
Diagnosis: ${patient.primaryDiagnosis}

Hospital Course:
Patient was admitted on ${patient.admittedDate} with ${patient.primaryDiagnosis}. During the hospital stay, vital signs were monitored closely. Treatment included pharmacological management and supportive care.

Medications at Discharge:
1. Lisinopril 10mg — Once daily
2. Carvedilol 12.5mg — Twice daily
3. Furosemide 40mg — Twice daily

Follow-up:
- Cardiology appointment in 7 days
- Lab work (BMP, BNP) in 3 days
- Daily weight and blood pressure monitoring

Instructions:
- Low sodium diet (<2g/day)
- Fluid restriction 1.5L/day
- Report weight gain >2 lbs in 24 hours

Attending Physician: Dr. Arjun Smith, MD`;

  const whatsappPreview = `Hello ${patient.name.split(' ')[0]}! 👋

This is Care Connect from City Hospital. You were discharged today after treatment for ${patient.primaryDiagnosis}.

Your care team has set up automated check-ins to help your recovery. 

Tomorrow at 8:00 AM, I'll send you a simple checklist. Just reply YES or NO.

Take your medications as prescribed. If you feel unwell, reply HELP anytime. 💙`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content discharge-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admit-header">
          <h2>📋 Discharge Review & Handoff</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        <div className="discharge-body">
          <div className="discharge-grid">
            {/* Left: Generated Summary */}
            <div className="discharge-left">
              <h3 className="section-label">AI-Generated Discharge Summary</h3>
              <p className="discharge-edit-hint">Review and edit before finalizing</p>
              <textarea className="textarea discharge-textarea" defaultValue={dischargeSummary} rows="16" />
            </div>

            {/* Right: WhatsApp Preview + Cadence */}
            <div className="discharge-right">
              <h3 className="section-label">WhatsApp Preview</h3>

              <div className="whatsapp-phone">
                <div className="wa-header">
                  <span className="wa-name">Care Connect Bot</span>
                  <span className="wa-status">Online</span>
                </div>
                <div className="wa-body">
                  <div className="wa-msg bot">{whatsappPreview}</div>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label>Follow-up Cadence</label>
                <select className="select" value={cadence} onChange={(e) => setCadence(e.target.value)}>
                  <option>Daily</option>
                  <option>Weekly</option>
                  <option>Once after 48 hours</option>
                </select>
              </div>
            </div>
          </div>

          <div className="admit-footer">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className={`btn ${approved ? 'btn-success' : 'btn-primary'} btn-lg`}
              onClick={() => {
                if (!approved) setApproved(true);
                else onClose();
              }}
              id="approve-discharge-btn"
            >
              {approved ? '✅ Discharge Initiated — Patient Notified' : '🚀 Approve and Initiate Auto-Care'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
