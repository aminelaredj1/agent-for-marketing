// =====================================================
// LeadsDashboard Component
// =====================================================
import { useState, useEffect } from 'react';

const NICHES = [
  { id: 'عمرة', label: '🕋 عمرة', color: 'green' },
  { id: 'حج', label: '🌙 حج', color: 'orange' },
  { id: 'سياحة داخلية', label: '🏔️ سياحة داخلية', color: 'blue' },
  { id: 'سيارات', label: '🚗 بيع سيارات', color: 'purple' },
  { id: 'عقارات', label: '🏠 عقارات', color: 'purple' },
  { id: 'تأشيرات', label: '✈️ تأشيرات وسفر', color: 'blue' },
  { id: 'مخصص', label: '⚙️ مخصص', color: 'gray' },
];

function getIntentBadge(intent) {
  const map = {
    'عمرة': { cls: 'badge-umrah', icon: '🕋' },
    'حج': { cls: 'badge-hajj', icon: '🌙' },
    'سياحة داخلية': { cls: 'badge-other', icon: '🏔️' },
    'أخرى': { cls: 'badge-other', icon: '💬' },
  };
  const b = map[intent] || { cls: 'badge-custom', icon: '🎯' };
  return (
    <span className={`badge ${b.cls}`}>
      {b.icon} {intent || 'غير مصنف'}
    </span>
  );
}

export default function LeadsDashboard({ settings, updateSettings }) {
  const [leads, setLeads] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState('');
  const [alert, setAlert] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState({ total: 0, umrah: 0, hajj: 0, other: 0 });
  const [currentNiche, setCurrentNiche] = useState(settings.selectedNiche || 'عمرة');
  const [customNiche, setCustomNiche] = useState(settings.customNiche || '');

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleNicheSelect = (niche) => {
    setCurrentNiche(niche);
    updateSettings({ selectedNiche: niche });
  };

  const fetchLeadsFromApify = async () => {
    if (!settings.apifyToken) {
      showAlert('error', 'يرجى إدخال مفتاح Apify API أولاً في الإعدادات!');
      return;
    }

    setIsRunning(true);
    setProgress(10);
    setRunStatus('جاري الاتصال بـ Apify...');
    setLeads([]);

    const activeNiche = currentNiche === 'مخصص' ? customNiche : currentNiche;

    try {
      // Step 1: Trigger n8n webhook with niche
      setRunStatus('إرسال إعدادات المجال إلى n8n...');
      setProgress(25);

      let n8nResponse;
      try {
        n8nResponse = await fetch(settings.n8nWebhookUrl, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Bypass-Tunnel-Reminder': 'true'
          },
          body: JSON.stringify({ niche: activeNiche, trigger: 'manual', timestamp: new Date().toISOString() }),
          signal: AbortSignal.timeout(10000),
        });
      } catch {
        // n8n might not be reachable, try direct Apify fetch
      }

      setProgress(40);
      setRunStatus('جلب أحدث البيانات من Apify...');

      // Step 2: Fetch latest dataset from Apify
      const datasetRes = await fetch(
        `https://api.apify.com/v2/acts/${encodeURIComponent(settings.apifyActorId)}/runs/last/dataset/items?token=${settings.apifyToken}&limit=50`,
        { signal: AbortSignal.timeout(30000) }
      );

      if (!datasetRes.ok) {
        throw new Error(`خطأ من Apify: ${datasetRes.status} ${datasetRes.statusText}`);
      }

      const rawData = await datasetRes.json();
      setProgress(70);
      setRunStatus('معالجة وتصنيف البيانات...');

      // Process the raw posts
      const processed = [];
      const items = Array.isArray(rawData) ? rawData : [rawData];

      for (const item of items) {
        const text = item.text || item.post_text || item.message || '';
        if (!text) continue;

        const userObj = item.user || {};
        processed.push({
          id: item.postId || item.id || Math.random().toString(36).slice(2),
          post_text: text,
          user_name: userObj.name || item.user_name || 'مجهول',
          profile_link: userObj.profileUrl || item.facebookUrl || item.postUrl || '',
          post_url: item.facebookUrl || item.postUrl || '',
          post_time: item.time || item.date || '',
          likes_count: item.likesCount || 0,
          comments_count: item.commentsCount || 0,
          intent: item.intent || 'غير مصنف',
        });
      }

      setLeads(processed);
      // Save to localStorage so SalesAgent can access them
      try { localStorage.setItem('aiLeadHunter_leads', JSON.stringify(processed)); } catch {}
      setProgress(100);

      // Compute stats
      const newStats = {
        total: processed.length,
        umrah: processed.filter(l => l.intent === 'عمرة').length,
        hajj: processed.filter(l => l.intent === 'حج').length,
        other: processed.filter(l => !['عمرة', 'حج'].includes(l.intent)).length,
      };
      setStats(newStats);

      setRunStatus(`✅ تم جلب ${processed.length} منشور بنجاح!`);
      showAlert('success', `تم جلب ${processed.length} منشور من Apify بنجاح!`);
    } catch (err) {
      console.error(err);
      setRunStatus('❌ حدث خطأ أثناء الجلب');
      showAlert('error', `خطأ: ${err.message}`);
      setProgress(0);
    } finally {
      setIsRunning(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2>🎯 لوحة صيد العملاء</h2>
        <p>اختر المجال وابدأ في صيد العملاء المحتملين من فيسبوك</p>
      </div>

      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: 20 }}>
          <span>{alert.type === 'success' ? '✅' : alert.type === 'error' ? '❌' : 'ℹ️'}</span>
          {alert.msg}
        </div>
      )}

      {/* Niche Selector */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">🏷️ اختر مجال العملاء المستهدفين</div>
        <div className="niche-tags">
          {NICHES.map(n => (
            <button
              key={n.id}
              className={`niche-tag ${currentNiche === n.id ? 'selected' : ''}`}
              onClick={() => handleNicheSelect(n.id)}
            >
              {n.label}
            </button>
          ))}
        </div>
        {currentNiche === 'مخصص' && (
          <div className="form-group" style={{ marginTop: 16, marginBottom: 0 }}>
            <input
              className="form-input"
              placeholder="مثال: مستلزمات طبية، دروس خصوصية، تصميم..."
              value={customNiche}
              onChange={e => { setCustomNiche(e.target.value); updateSettings({ customNiche: e.target.value }); }}
            />
            <p className="form-hint">أدخل المجال الذي تريد استهدافه بالعربية</p>
          </div>
        )}
      </div>

      {/* Hunt Button */}
      <div className="hunt-button-container">
        <button className="btn-hunt" onClick={fetchLeadsFromApify} disabled={isRunning} id="hunt-button">
          <span style={{ fontSize: 28, position: 'relative', zIndex: 1 }}>
            {isRunning ? '⏳' : '🎯'}
          </span>
          <span>{isRunning ? 'جاري الصيد...' : 'ابدأ صيد العملاء!'}</span>
          {isRunning && <span className="spinner" style={{ position: 'relative', zIndex: 1 }} />}
        </button>
      </div>

      {/* Progress */}
      {isRunning && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{runStatus}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent-primary)' }}>{progress}%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Stats */}
      {stats.total > 0 && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className="stat-card blue">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">إجمالي المنشورات</div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon">🕋</div>
            <div className="stat-value">{stats.umrah}</div>
            <div className="stat-label">مهتمون بالعمرة</div>
          </div>
          <div className="stat-card orange">
            <div className="stat-icon">🌙</div>
            <div className="stat-value">{stats.hajj}</div>
            <div className="stat-label">مهتمون بالحج</div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon">💬</div>
            <div className="stat-value">{stats.other}</div>
            <div className="stat-label">أخرى</div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="card">
        <div className="section-title">📋 قائمة العملاء المحتملين</div>
        {leads.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎯</div>
            <h3>لا توجد بيانات بعد</h3>
            <p>اضغط على زر "ابدأ صيد العملاء" لجلب أحدث البيانات من Apify</p>
          </div>
        ) : (
          <div className="leads-table-container">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الاسم</th>
                  <th>المنشور</th>
                  <th>التصنيف</th>
                  <th>الإعجابات</th>
                  <th>التاريخ</th>
                  <th>الرابط</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, idx) => (
                  <tr key={lead.id || idx}>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{idx + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{lead.user_name || 'مجهول'}</div>
                    </td>
                    <td>
                      <div className="truncate" title={lead.post_text}>{lead.post_text}</div>
                    </td>
                    <td>{getIntentBadge(lead.intent)}</td>
                    <td>
                      <span style={{ color: 'var(--accent-orange)', fontWeight: 700 }}>
                        ❤️ {lead.likes_count}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      {lead.post_time ? new Date(lead.post_time).toLocaleDateString('ar-DZ') : '—'}
                    </td>
                    <td>
                      {lead.profile_link ? (
                        <a className="profile-link" href={lead.profile_link} target="_blank" rel="noreferrer">
                          🔗 الملف الشخصي
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
