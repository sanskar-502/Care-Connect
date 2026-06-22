import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { getPatients, admitPatient } from '../services/api';
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
      {showAdmit && <AdmitModal onClose={() => setShowAdmit(false)} onSuccess={() => {
        getPatients().then(data => {
          setPatients(data.sort((a, b) => b.currentRiskScore - a.currentRiskScore));
        });
      }} />}
    </div>
  );
}

/* ---- Admit Patient Modal ---- */
function AdmitModal({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe', age: 50, gender: 'Male', phone: '+15550000000',
    address: '123 Health St', bloodGroup: 'O+', emergencyContact: 'Jane Doe',
    systolicBP: 120, diastolicBP: 80, bloodSugar: 100,
    pulseRate: 80, spo2: 98, temperature: 98.6, weight: 70, height: 170,
    notes: 'Patient presents with worsening dyspnea.'
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newPatient = await admitPatient(formData);
      
      if (file && newPatient && newPatient._id) {
        const fileData = new FormData();
        fileData.append('patientId', newPatient._id);
        fileData.append('document', file);
        await fetch('http://localhost:5000/api/data/upload', {
          method: 'POST',
          body: fileData
        });
      }

      if (onSuccess) onSuccess();
      onClose();
      if (newPatient && newPatient._id) {
        navigate(`/patient/${newPatient._id}`);
      }
    } catch (error) {
      console.error("Admission failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', overflowY: 'auto' }}>
      <div className="modal-content admit-modal" onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-surface)', padding: '2rem', borderRadius: '12px', maxWidth: '800px', margin: '40px auto', position: 'relative' }}>
        <div className="admit-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'white' }}>➕ New Patient Admission</h2>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
          <div>
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>Basic Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input name="name" className="input" placeholder="Patient Name" value={formData.name} onChange={handleChange} required />
              <input name="age" className="input" type="number" placeholder="Age" value={formData.age} onChange={handleChange} required />
              <input name="gender" className="input" placeholder="Gender" value={formData.gender} onChange={handleChange} />
              <input name="phone" className="input" placeholder="Contact Number" value={formData.phone} onChange={handleChange} required />
              <input name="address" className="input" placeholder="Address" value={formData.address} onChange={handleChange} />
              <input name="bloodGroup" className="input" placeholder="Blood Group" value={formData.bloodGroup} onChange={handleChange} />
              <input name="emergencyContact" className="input" placeholder="Emergency Contact" value={formData.emergencyContact} onChange={handleChange} />
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>Initial Health Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <input name="systolicBP" className="input" type="number" placeholder="Systolic BP" value={formData.systolicBP} onChange={handleChange} />
              <input name="diastolicBP" className="input" type="number" placeholder="Diastolic BP" value={formData.diastolicBP} onChange={handleChange} />
              <input name="bloodSugar" className="input" type="number" placeholder="Blood Sugar" value={formData.bloodSugar} onChange={handleChange} />
              <input name="pulseRate" className="input" type="number" placeholder="Pulse Rate" value={formData.pulseRate} onChange={handleChange} />
              <input name="spo2" className="input" type="number" placeholder="SpO2 (%)" value={formData.spo2} onChange={handleChange} />
              <input name="temperature" className="input" type="number" placeholder="Temperature (°F)" value={formData.temperature} onChange={handleChange} />
              <input name="weight" className="input" type="number" placeholder="Weight (kg)" value={formData.weight} onChange={handleChange} />
              <input name="height" className="input" type="number" placeholder="Height (cm)" value={formData.height} onChange={handleChange} />
            </div>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>Clinical Notes (for AI Extraction)</h3>
            <textarea name="notes" className="input" placeholder="Enter clinical dictation..." value={formData.notes} onChange={handleChange} rows="3" style={{ width: '100%' }}></textarea>
          </div>

          <div>
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '10px' }}>Document Upload (Optional)</h3>
            <input type="file" onChange={handleFileChange} accept=".pdf,.png,.jpg,.jpeg,.webp" className="input" style={{ width: '100%', padding: '6px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Admitting...' : 'Admit Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
