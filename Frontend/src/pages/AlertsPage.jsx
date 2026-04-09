import { useState } from 'react';
import Navbar from '../components/Navbar';
import { alerts } from '../data/mockData';
import './AlertsPage.css';

export default function AlertsPage() {
  const [alertList, setAlertList] = useState(alerts);
  const [expandedId, setExpandedId] = useState('alert-1'); // Default expand first one

  const activeCount = alertList.filter((a) => !a.resolved).length;
  const resolvedCount = alertList.filter((a) => a.resolved).length;

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const resolveAlert = (id, e) => {
    e.stopPropagation(); // prevent accordion toggle
    setAlertList((prev) => prev.map((a) => a.id === id ? { ...a, resolved: true } : a));
    // Optionally close it or leave it open
  };

  return (
    <div className="page-wrapper">
      <Navbar alertCount={activeCount} />
      <main className="alerts-main">
        {/* Header matching image exactly */}
        <div className="alerts-header-img">
          <div className="ah-titles">
            <h1>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="alert-header-icon">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Escalation Center
            </h1>
            <p>Patient alerts requiring care team action</p>
          </div>
          <div className="ah-filters">
            <button className="ah-count active-count">{activeCount} Active</button>
            <button className="ah-count resolved-count">{resolvedCount} Resolved</button>
          </div>
        </div>

        {/* Accordion List */}
        <div className="alerts-accordion-list stagger">
          {alertList.map((alert) => {
            const isExpanded = expandedId === alert.id;
            const isResolved = alert.resolved;

            return (
              <div 
                key={alert.id} 
                className={`acc-card ${isExpanded ? 'expanded' : ''} ${isResolved ? 'is-resolved' : 'is-active'}`}
              >
                {/* Card Header (always visible) */}
                <div className="acc-header" onClick={() => toggleExpand(alert.id)}>
                  <div className="acc-h-main">
                    <div className={`acc-dot ${isResolved ? 'dot-gray' : 'dot-red'}`} />
                    <div className="acc-h-content">
                      <div className="acc-name-row">
                        <span className="acc-name">{alert.patientName}</span>
                        {isResolved && <span className="acc-resolved-pill">Resolved</span>}
                      </div>
                      <div className="acc-msg">{alert.message}</div>
                      <div className="acc-time">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {formatTimeAgo(alert.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="acc-chevron">
                    {isExpanded ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isExpanded && (
                  <div className="acc-body animate-fade-in">
                    <div className="acc-body-title">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      WHATSAPP CHAT HISTORY
                    </div>
                    
                    <div className="acc-chat-container">
                      {alert.whatsappHistory.map((msg, i) => (
                        <div key={i} className={`acc-bubble-wrapper ${msg.from === 'bot' ? 'bot' : 'patient'}`}>
                          <div className="acc-bubble">
                            <span className="acc-bubble-sender">
                              {msg.from === 'bot' ? 'CareConnect Bot' : alert.patientName}
                            </span>
                            <div className="acc-bubble-text">{msg.text}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="acc-phone">
                      Patient phone: <span>{alert.phone}</span>
                    </div>

                    {!isResolved && (
                      <div className="acc-actions">
                        <button className="btn-alert btn-mark-resolved" onClick={(e) => resolveAlert(alert.id, e)}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                          Mark Resolved
                        </button>
                        <button className="btn-alert btn-telehealth">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                          Dispatch Telehealth
                        </button>
                        <button className="btn-alert btn-call">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          Call Patient
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// Helper to fake a readable relative time from mock timestamp
function formatTimeAgo(ts) {
  const d = new Date(ts);
  const now = new Date();
  const diffHours = (now - d) / (1000 * 60 * 60);
  if (diffHours < 1) return '14 minutes ago'; // Force match the image for the demo
  if (diffHours < 5) return '2 hours ago';
  if (diffHours < 24) return '5 hours ago';
  return '1 day ago';
}
