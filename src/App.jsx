import { useState } from 'react';
import './index.css';
import { useSettings } from './hooks/useSettings';
import Overview from './components/Overview';
import LeadsDashboard from './components/LeadsDashboard';
import Settings from './components/Settings';
import SalesAgent from './components/SalesAgent';

const NAV_ITEMS = [
  { id: 'overview', icon: '🏠', label: 'الرئيسية' },
  { id: 'leads', icon: '🎯', label: 'صيد العملاء', badge: 'NEW' },
  { id: 'sales', icon: '🤖', label: 'المندوب الذكي', badge: 'AI' },
  { id: 'settings', icon: '⚙️', label: 'الإعدادات' },
];

export default function App() {
  const [activePage, setActivePage] = useState('overview');
  const { settings, updateSettings, resetSettings } = useSettings();

  const renderPage = () => {
    switch (activePage) {
      case 'overview': return <Overview settings={settings} />;
      case 'leads': return <LeadsDashboard settings={settings} updateSettings={updateSettings} />;
      case 'sales': return <SalesAgent settings={settings} />;
      case 'settings': return <Settings settings={settings} updateSettings={updateSettings} />;
      default: return <Overview settings={settings} />;
    }
  };

  const isConfigured = settings.apifyToken && settings.nvidiaApiKey;

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="logo-icon">🤖</div>
          <h1>AI Lead Hunter</h1>
          <p>نظام صيد العملاء الذكي</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(item => (
            <div
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => setActivePage(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </nav>

        {/* Footer status */}
        <div className="sidebar-footer">
          <div className="status-indicator">
            <div className="status-dot" style={{ background: isConfigured ? 'var(--accent-green)' : 'var(--accent-orange)' }} />
            <span>{isConfigured ? 'النظام جاهز' : 'يحتاج إعداد'}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
            {settings.selectedNiche ? `🎯 المجال: ${settings.selectedNiche}` : 'لم يُختر مجال'}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {!isConfigured && activePage !== 'settings' && (
          <div className="alert alert-warning" style={{ marginBottom: 24, cursor: 'pointer' }} onClick={() => setActivePage('settings')}>
            ⚠️ النظام يحتاج إعداد! اضغط هنا لإضافة مفتاح Apify ومعلومات الاتصال →
          </div>
        )}
        {renderPage()}
      </main>
    </div>
  );
}
