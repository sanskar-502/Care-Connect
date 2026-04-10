import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { patients } from '../data/mockData';
import './Dashboard.css';

const getRiskColor = (score) => {
  if (score >= 70) return 'danger';
  if (score >= 40) return 'warning';
  return 'success';
};

const getStatusInfo = (status) => {
  const map = {
    Declining: { color: 'danger', icon: '↓' },
    Stable: { color: 'info', icon: '→' },
    Improving: { color: 'success', icon: '↑' },
  };
  return map[status] || map.Stable;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [showAdmit, setShowAdmit] = useState(false);
  const [sortedPatients] = useState(
    [...patients].sort((a, b) => b.riskScore - a.riskScore)
  );

  const highRisk = patients.filter((p) => p.riskScore >= 70).length;
  const pending = patients.filter((p) => p.status === 'Stable').length;

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="dashboard-main">
        {/* KPI Banner */}
        <div className="kpi-banner stagger">
          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: 'var(--color-info-soft)', color: 'var(--color-info)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
            </div>
            <div className="kpi-data">
              <span className="kpi-number">{patients.length}</span>
              <span className="kpi-label">Active Patients</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: 'var(--color-danger-soft)', color: 'var(--color-danger)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <div className="kpi-data">
              <span className="kpi-number kpi-danger">{highRisk}</span>
              <span className="kpi-label">High Risk Readmissions</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon" style={{ background: 'var(--color-warning-soft)', color: 'var(--color-warning)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div className="kpi-data">
              <span className="kpi-number kpi-warning">{pending}</span>
              <span className="kpi-label">Pending Follow-ups</span>
            </div>
          </div>
        </div>

        {/* Triage Header */}
        <div className="triage-header">
          <div>
            <h1 className="triage-title">Triage Board</h1>
            <p className="triage-sub">Sorted by highest readmission risk</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdmit(true)} id="admit-patient-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Admit Patient
          </button>
        </div>

        {/* Triage Table */}
        <div className="triage-table-container card">
          <table className="data-table" id="triage-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Room</th>
                <th>Primary Diagnosis</th>
                <th>Readmission Risk</th>
                <th>Status</th>
                <th>Vitals</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody className="stagger">
              {sortedPatients.map((patient) => {
                const riskColor = getRiskColor(patient.riskScore);
                const statusInfo = getStatusInfo(patient.status);
                return (
                  <tr key={patient.id} className="triage-row">
                    <td>
                      <div className="patient-cell">
                        <div className="patient-avatar" style={{
                          background: patient.riskScore >= 70 ? 'var(--color-danger-soft)' : 'var(--accent-primary-glow)',
                          color: patient.riskScore >= 70 ? 'var(--color-danger)' : 'var(--accent-primary)'
                        }}>
                          {patient.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="patient-name">{patient.name}</div>
                          <div className="patient-meta">{patient.age}y • {patient.gender}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="room-tag">{patient.room}</span></td>
                    <td className="diagnosis-cell">{patient.primaryDiagnosis}</td>
                    <td>
                      <div className="risk-cell">
                        <div className="risk-bar-bg">
                          <div className={`risk-bar risk-${riskColor}`} style={{ width: `${patient.riskScore}%` }} />
                        </div>
                        <span className={`risk-score risk-${riskColor}`}>{patient.riskScore}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`pill pill-${statusInfo.color}`}>
                        {statusInfo.icon} {patient.status}
                      </span>
                    </td>
                    <td>
                      <div className="vitals-mini">
                        <span>♥ {patient.vitals.hr}</span>
                        <span>BP {patient.vitals.bp}</span>
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-ghost view-xai-btn"
                        onClick={() => navigate(`/patient/${patient.id}`)}
                        id={`view-xai-${patient.id}`}
                      >
                        View XAI
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Admit Patient Modal */}
      {showAdmit && <AdmitModal onClose={() => setShowAdmit(false)} />}
    </div>
  );
}

/* ---- Admit Patient Modal ---- */
function AdmitModal({ onClose }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content admit-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admit-header">
          <h2>➕ New Patient Admission</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form className="admit-form" onSubmit={handleSubmit}>
          <div className="admit-split">
            {/* Left: Structured Data */}
            <div className="admit-left">
              <h3 className="admit-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
                Structured Data
              </h3>

              <div className="form-row">
                <div className="form-group">
                  <label>Patient Name</label>
                  <input className="input" placeholder="Full name" defaultValue="John Doe" />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input className="input" type="number" placeholder="Age" defaultValue="67" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input className="input" type="tel" placeholder="(555) 000-0000" defaultValue="(555) 123-4567" />
                </div>
                <div className="form-group">
                  <label>Emergency Contact</label>
                  <input className="input" type="tel" placeholder="(555) 000-0000" defaultValue="(555) 987-6543" />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select className="select" defaultValue="Male">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Blood Type</label>
                  <select className="select" defaultValue="A+">
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                    <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Blood Pressure</label>
                  <input className="input" placeholder="e.g. 140/90" defaultValue="142/88" />
                </div>
                <div className="form-group">
                  <label>Heart Rate</label>
                  <input className="input" type="number" placeholder="BPM" defaultValue="88" />
                </div>
              </div>

              <div className="form-group">
                <label>Primary Diagnosis</label>
                <select className="select" defaultValue="Congestive Heart Failure">
                  <option>Congestive Heart Failure</option>
                  <option>Type 2 Diabetes</option>
                  <option>COPD</option>
                  <option>Pneumonia</option>
                  <option>Acute Pancreatitis</option>
                  <option>Atrial Fibrillation</option>
                  <option>Post-Surgical Recovery</option>
                </select>
              </div>
            </div>

            {/* Right: Unstructured Data */}
            <div className="admit-right">
              <h3 className="admit-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Unstructured Data
              </h3>

              {/* Upload Zone */}
              <div className="upload-zone">
                <div className="upload-icon">📄</div>
                <p><strong>Drop lab reports here</strong></p>
                <p className="upload-hint">PDF, PNG, JPG — OCR extraction enabled</p>
                <button type="button" className="btn btn-ghost" style={{ marginTop: '8px' }}>Browse Files</button>
              </div>

              {/* Physician Notes */}
              <div className="form-group">
                <label>Admitting Physician&apos;s Notes</label>
                <textarea
                  className="textarea"
                  rows="8"
                  placeholder="Paste clinical notes here..."
                  defaultValue="Patient presents with worsening dyspnea over last 3 days. Reports non-compliance with prescribed diuretics. Living alone, limited family support. Previously hospitalized Nov 2025 for same condition. Notable confusion during initial assessment — possible early cognitive decline. Recommend social work consult."
                />
              </div>
            </div>
          </div>

          <div className="admit-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="run-assessment-btn">
              {loading ? (
                <>
                  <span className="spinner" />
                  Running AI Assessment...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                  Run Initial Assessment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
