import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientStatusData } from '../data/mockData';
import './PatientStatus.css';

export default function PatientStatus() {
  const navigate = useNavigate();
  const { patientName, medications, tasks, dischargeNoteSimplified } = patientStatusData;
  const [meds, setMeds] = useState(medications);
  const [taskList, setTaskList] = useState(tasks);
  const [bpInput, setBpInput] = useState('');
  const [sugarInput, setSugarInput] = useState('');
  const [showBpPad, setShowBpPad] = useState(false);
  const [showSugarPad, setShowSugarPad] = useState(false);

  const allDone = meds.every((m) => m.done) && taskList.every((t) => t.done);
  const progress = [...meds, ...taskList].filter((i) => i.done).length;
  const total = meds.length + taskList.length;

  const toggleMed = (idx) => {
    setMeds((prev) => prev.map((m, i) => (i === idx ? { ...m, done: !m.done } : m)));
  };
  const toggleTask = (idx) => {
    const task = taskList[idx];
    if (task.type === 'input' && !task.done) {
      if (task.text.includes('blood pressure')) {
        setShowBpPad(true);
        return;
      }
      if (task.text.includes('blood sugar')) {
        setShowSugarPad(true);
        return;
      }
    }
    setTaskList((prev) => prev.map((t, i) => (i === idx ? { ...t, done: !t.done } : t)));
  };

  const submitBp = () => {
    if (bpInput) {
      setTaskList((prev) =>
        prev.map((t) => (t.text.includes('blood pressure') ? { ...t, done: true } : t))
      );
      setShowBpPad(false);
    }
  };
  const submitSugar = () => {
    if (sugarInput) {
      setTaskList((prev) =>
        prev.map((t) => (t.text.includes('blood sugar') ? { ...t, done: true } : t))
      );
      setShowSugarPad(false);
    }
  };

  return (
    <div className="ps-page">
      <div className="ps-container">
        {/* Top Bar Navigation */}
        <div className="ps-top-bar">
          <button className="back-btn-subtle" onClick={() => navigate('/')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Demo
          </button>
        </div>

        {/* Header */}
        <div className="ps-header">
          <div className="ps-logo-row">
            <img src="/assets/logo.png" alt="CareConnect Logo" className="img-logo-small" />
            <span className="ps-logo-text">CareConnect</span>
          </div>
          <h1 className="ps-greeting">
            Welcome back, <span className="gradient-text">{patientName}</span>. 👋
          </h1>
          <p className="ps-greeting-sub">Here is your daily check-in.</p>
        </div>

        {/* Status Banner */}
        <div className={`ps-status-banner ${allDone ? 'all-done' : 'in-progress'}`}>
          <div className="ps-status-icon">
            {allDone ? '✅' : '⏳'}
          </div>
          <div style={{ flex: 1 }}>
            <div className="ps-status-text">
              {allDone ? 'Great job! All tasks complete!' : `${progress} of ${total} tasks done`}
            </div>
            <div className="ps-progress-bar">
              <div className="ps-progress-fill" style={{ width: `${(progress / total) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Responsive Grid Layout for Content */}
        <div className="ps-content-grid">

          {/* Left Column */}
          <div className="ps-col-left">
            {/* Medications */}
            <div className="ps-section">
              <h2 className="ps-section-title">💊 Today&apos;s Medications</h2>
              <div className="ps-checklist">
                {meds.map((med, i) => (
                  <button
                    key={i}
                    className={`ps-check-item ${med.done ? 'done' : ''}`}
                    onClick={() => toggleMed(i)}
                  >
                    <div className={`ps-checkbox ${med.done ? 'checked' : ''}`}>
                      {med.done && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="ps-check-info">
                      <span className="ps-check-name">{med.name}</span>
                      <span className="ps-check-time">{med.time}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Plan */}
            <div className="ps-section">
              <h2 className="ps-section-title">📋 Today&apos;s Action Plan</h2>
              <div className="ps-checklist">
                {taskList.map((task, i) => (
                  <button
                    key={i}
                    className={`ps-check-item ${task.done ? 'done' : ''}`}
                    onClick={() => toggleTask(i)}
                  >
                    <div className={`ps-checkbox ${task.done ? 'checked' : ''}`}>
                      {task.done && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="ps-check-info">
                      <span className="ps-check-name">{task.text}</span>
                      {task.type === 'input' && !task.done && (
                        <span className="ps-check-action">Tap to log →</span>
                      )}
                      {task.done && task.type === 'input' && (
                        <span className="ps-check-action ps-logged">Logged ✓</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Progress Button */}
            <div style={{ marginTop: 'var(--space-xl)' }}>
              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => alert('Your daily check-in has been securely submitted to your care team!')}
              >
                Submit Check-in
              </button>
            </div>

          </div>

          {/* Right Column */}
          <div className="ps-col-right">
            {/* Discharge Notes Simplified */}
            <div className="ps-section">
              <h2 className="ps-section-title">📖 Your Discharge Notes, Simplified</h2>
              <div className="ps-notes-card">
                <div className="ps-notes-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Written in simple language by AI
                </div>
                <div className="ps-notes-text">{dischargeNoteSimplified}</div>
              </div>
            </div>

            {/* In-layout CTA for Desktop */}
            <div className="ps-desktop-cta">
              <button className="ps-emergency-btn">
                📞 Contact Care Team
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sticky CTA */}
        <div className="ps-emergency">
          <button className="ps-emergency-btn" id="contact-care-team-btn">
            📞 Contact Care Team
          </button>
        </div>

        <div className="ps-footer">
          Powered by Care Connect AI · City Hospital
        </div>
      </div>

      {/* BP Input Pad */}
      {showBpPad && (
        <div className="modal-overlay" onClick={() => setShowBpPad(false)}>
          <div className="ps-input-modal" onClick={(e) => e.stopPropagation()}>
            <h3>📏 Log Blood Pressure</h3>
            <p>Enter your reading (e.g., 120/80)</p>
            <input
              className="ps-big-input"
              type="text"
              placeholder="120/80"
              value={bpInput}
              onChange={(e) => setBpInput(e.target.value)}
              autoFocus
            />
            <div className="ps-input-actions">
              <button className="btn btn-ghost" onClick={() => setShowBpPad(false)}>Cancel</button>
              <button className="btn btn-primary btn-lg" onClick={submitBp}>Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Sugar Input Pad */}
      {showSugarPad && (
        <div className="modal-overlay" onClick={() => setShowSugarPad(false)}>
          <div className="ps-input-modal" onClick={(e) => e.stopPropagation()}>
            <h3>🩸 Check Blood Sugar</h3>
            <p>Enter your reading (mg/dL)</p>
            <input
              className="ps-big-input"
              type="number"
              placeholder="120"
              value={sugarInput}
              onChange={(e) => setSugarInput(e.target.value)}
              autoFocus
            />
            <div className="ps-input-actions">
              <button className="btn btn-ghost" onClick={() => setShowSugarPad(false)}>Cancel</button>
              <button className="btn btn-primary btn-lg" onClick={submitSugar}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
