import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getPatients } from '../services/api';
import { io } from 'socket.io-client';
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
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch patients on mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const data = await getPatients();
        // Sort highest risk first
        setPatients(data.sort((a, b) => b.currentRiskScore - a.currentRiskScore));
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();

    // Socket.io for Real-time Dashboard Updates
    const socket = io('http://localhost:5000');
    
    socket.on('vitals_updated', (payload) => {
      console.log('Real-time update:', payload);
      setPatients(prev => {
        const newPatients = prev.map(p => {
          if (p._id === payload.patientId) {
            return { ...p, currentRiskScore: payload.newRiskScore };
          }
          return p;
        });
        return newPatients.sort((a, b) => b.currentRiskScore - a.currentRiskScore);
      });
    });

    return () => socket.disconnect();
  }, []);

  const highRisk = patients.filter((p) => p.currentRiskScore >= 70).length;
  const pending = patients.filter((p) => p.currentRiskScore < 70).length;

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
          {loading ? (
             <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
               Loading patient records from Backend API...
             </div>
          ) : (
            <table className="data-table" id="triage-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Contact</th>
                  <th>Condition Status</th>
                  <th>Readmission Risk</th>
                  <th>Status</th>
                  <th>Medications</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="stagger">
                {patients.map((patient) => {
                  const riskColor = getRiskColor(patient.currentRiskScore);
                  // Determine status string based on risk
                  const statusStr = patient.currentRiskScore >= 70 ? 'Declining' : 'Stable';
                  const statusInfo = getStatusInfo(statusStr);
                  return (
                    <tr key={patient._id} className="triage-row">
                      <td>
                        <div className="patient-cell">
                          <div className="patient-avatar" style={{
                            background: patient.currentRiskScore >= 70 ? 'var(--color-danger-soft)' : 'var(--accent-primary-glow)',
                            color: patient.currentRiskScore >= 70 ? 'var(--color-danger)' : 'var(--accent-primary)'
                          }}>
                            {patient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <div className="patient-name">{patient.name}</div>
                            <div className="patient-meta">{patient.age}y</div>
                          </div>
                        </div>
                      </td>
                      <td><span className="room-tag">{patient.phone}</span></td>
                      <td className="diagnosis-cell">Admitted</td>
                      <td>
                        <div className="risk-cell">
                          <div className="risk-bar-bg">
                            <div className={`risk-bar risk-${riskColor}`} style={{ width: `${patient.currentRiskScore}%` }} />
                          </div>
                          <span className={`risk-score risk-${riskColor}`}>{patient.currentRiskScore}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={`pill pill-${statusInfo.color}`}>
                          {statusInfo.icon} {statusStr}
                        </span>
                      </td>
                      <td>
                        <div className="vitals-mini">
                          <span>{patient.currentMedications?.length || 0} Meds</span>
                        </div>
                      </td>
                      <td>
                        <button
                          className="btn btn-ghost view-xai-btn"
                          onClick={() => navigate(`/patient/${patient._id}`)}
                          id={`view-xai-${patient._id}`}
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
          )}
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
               <p style={{color: 'white', marginBottom: '1rem'}}>
                 Admitting new patients via UI takes data and sends it to `POST /api/patients`. 
                 (Wired in future sprints, currently using seed data).
               </p>
               <div className="form-group">
                 <label>Patient Name</label>
                 <input className="input" placeholder="Full name" defaultValue="John Doe" />
               </div>
            </div>

            {/* Right: Unstructured Data */}
            <div className="admit-right">
              <h3 className="admit-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Unstructured Data
              </h3>
              <div className="form-group">
                <label>Admitting Physician&apos;s Notes</label>
                <textarea
                  className="textarea"
                  rows="8"
                  placeholder="Paste clinical notes here..."
                  defaultValue="Patient presents with worsening dyspnea."
                />
              </div>
            </div>
          </div>

          <div className="admit-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} id="run-assessment-btn">
              {loading ? <span className="spinner" /> : "Run Initial Assessment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
