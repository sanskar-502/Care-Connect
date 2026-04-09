import Navbar from '../components/Navbar';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import './AnalyticsPage.css';

const readmissionTrend = [
  { month: 'Oct', rate: 23.5 },
  { month: 'Nov', rate: 23.0 },
  { month: 'Dec', rate: 20.5 },
  { month: 'Jan', rate: 17.8 },
  { month: 'Feb', rate: 15.2 },
  { month: 'Mar', rate: 12.6 },
  { month: 'Apr', rate: 10.9 },
];

const savingsByDept = [
  { dept: 'Cardiology', savings: 480 },
  { dept: 'Pulmonology', savings: 320 },
  { dept: 'General Med', savings: 280 },
  { dept: 'Oncology', savings: 180 },
];

export default function AnalyticsPage() {
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="analytics-main">
        <div className="analytics-header animate-fade-in-up">
          <h1>Hospital ROI Dashboard</h1>
          <p className="analytics-sub">Business impact since CareConnect deployment — October 2025</p>
          <div className="last-updated">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
            </svg>
            Last updated 2 hours ago
          </div>
        </div>

        {/* Row 1: KPIs */}
        <div className="kpi-grid stagger">
          <div className="kpi-card banner-green">
            <div className="bg-dollar">$</div>
            <div className="kpi-title-green">ESTIMATED PENALTY AVOIDANCE</div>
            <div className="kpi-value-huge">$1.2M</div>
            <div className="kpi-sub-green">↘ Readmission penalties avoided YTD</div>
          </div>
          
          <div className="kpi-card standard-dark">
            <div className="kpi-title">READMISSION RATE</div>
            <div className="kpi-value">10.9%</div>
            <div className="kpi-sub-green">↘ Down from 22.4%</div>
          </div>

          <div className="kpi-card standard-dark">
            <div className="kpi-title">PATIENTS MONITORED</div>
            <div className="kpi-value">1,847</div>
            <div className="kpi-sub-cyan">Since deployment</div>
          </div>
        </div>

        {/* Row 2: Charts */}
        <div className="charts-grid animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div className="chart-card">
            <div className="chart-header">
              <h3>30-Day Readmission Rate Trend</h3>
              <p>Last 7 months since CareConnect deployment</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={readmissionTrend} margin={{ top: 20, right: 30, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip
                    contentStyle={{ background: '#1a1f35', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#06b6d4' }}
                  />
                  <Line type="monotone" dataKey="rate" stroke="#06b6d4" strokeWidth={3} dot={{ fill: '#06b6d4', r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>Savings by Department</h3>
              <p>Penalty avoidance breakdown</p>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={savingsByDept} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}k`} domain={[0, 600]} />
                  <YAxis dataKey="dept" type="category" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                    contentStyle={{ background: '#1a1f35', border: '1px solid #334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#22c55e' }}
                  />
                  <Bar dataKey="savings" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Row 3: Model Metrics */}
        <div className="model-panel animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <div className="model-header">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </svg>
            <h2>Databricks Model Performance</h2>
          </div>
          <div className="metrics-grid">
            <div className="metric-box">
              <div className="metric-title">XGBoost Accuracy</div>
              <div className="metric-value">94%</div>
              <div className="metric-sub">Model retrained 2 days ago</div>
            </div>
            <div className="metric-box">
              <div className="metric-title">Precision</div>
              <div className="metric-value">91%</div>
              <div className="metric-sub">High-risk detection rate</div>
            </div>
            <div className="metric-box">
              <div className="metric-title">Recall</div>
              <div className="metric-value">89%</div>
              <div className="metric-sub">True positive rate</div>
            </div>
            <div className="metric-box">
              <div className="metric-title">Data Drift Score</div>
              <div className="metric-value">0.04</div>
              <div className="metric-sub">Within acceptable range</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
