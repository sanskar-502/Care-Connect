import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const roles = [
  {
    id: 'doctor',
    icon: '🩺',
    title: 'Dr. Arjun Smith',
    subtitle: 'Attending Physician',
    desc: 'Access patient triage, XAI risk engine, ambient dictation & RAG copilot.',
    route: '/dashboard',
    color: '#6366f1',
  },
  {
    id: 'admin',
    icon: '📊',
    title: 'Maria Chen',
    subtitle: 'Hospital Director',
    desc: 'Review hospital analytics, ROI dashboard & model performance metrics.',
    route: '/analytics',
    color: '#8b5cf6',
  },
  {
    id: 'nurse',
    icon: '💊',
    title: 'Priya Kapoor',
    subtitle: 'Care Coordinator',
    desc: 'Manage patient escalations, WhatsApp alerts & post-discharge follow-ups.',
    route: '/alerts',
    color: '#2dd4bf',
  },
  {
    id: 'patient',
    icon: '🏠',
    title: 'Srishti Patel',
    subtitle: 'Patient / Family',
    desc: 'View daily check-ins, simplified discharge notes, medication tracker & contact care team.',
    route: '/patient-status/srishti',
    color: '#f472b6',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="login-page">
      <div className="bg-grid" />
      <div className="bg-radial" style={{ top: '-300px', right: '-200px', background: '#6366f1' }} />
      <div className="bg-radial" style={{ bottom: '-300px', left: '-200px', background: '#8b5cf6' }} />

      <div className="login-container animate-fade-in-up">
        {/* Header */}
        <div className="login-header">
          <div className="login-logo" onClick={() => navigate('/')}>
            <img src="/assets/logo.png" alt="CareConnect Logo" className="img-logo" />
            <span className="logo-text">CareConnect</span>
          </div>
          <h1 className="login-title">Select Your Role</h1>
          <p className="login-desc">Choose a demo persona to explore the platform</p>
        </div>

        {/* Role Cards */}
        <div className="role-grid stagger">
          {roles.map((role) => (
            <button
              key={role.id}
              className="role-card"
              onClick={() => navigate(role.route)}
              style={{ '--role-color': role.color }}
              id={`login-role-${role.id}`}
            >
              <div className="role-glow" />
              <div className="role-icon">{role.icon}</div>
              <div className="role-info">
                <h3>{role.title}</h3>
                <span className="role-subtitle">{role.subtitle}</span>
                <p>{role.desc}</p>
              </div>
              <div className="role-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </button>
          ))}
        </div>

        <p className="login-hint">
          💡 <strong>Demo Tip:</strong> Switch between roles to see how Care Connect adapts for each stakeholder.
        </p>
      </div>
    </div>
  );
}
