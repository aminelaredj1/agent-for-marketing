// =====================================================
// Settings Component
// =====================================================
import { useState } from 'react';

export default function Settings({ settings, updateSettings }) {
  const [saved, setSaved] = useState(false);
  const [localSettings, setLocalSettings] = useState({ ...settings });

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div className="page-header">
        <h2>⚙️ الإعدادات</h2>
        <p>قم بإدارة جميع بيانات الاتصال والمفاتيح لتشغيل النظام</p>
      </div>

      {saved && (
        <div className="alert alert-success" style={{ marginBottom: 24 }}>
          ✅ تم حفظ الإعدادات بنجاح!
        </div>
      )}

      <div className="grid-2" style={{ gap: 24 }}>
        {/* Apify Settings */}
        <div className="card">
          <div className="section-title">🔑 إعدادات Apify</div>

          <div className="form-group">
            <label className="form-label">Apify API Token</label>
            <input
              id="apify-token"
              type="password"
              className="form-input"
              placeholder="apify_api_xxxxxxxxxxxx"
              value={localSettings.apifyToken}
              onChange={e => handleChange('apifyToken', e.target.value)}
            />
            <p className="form-hint">
              اذهب إلى Apify → Settings → Integrations للحصول على المفتاح
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">معرف السكرايبر (Actor ID)</label>
            <input
              id="apify-actor-id"
              type="text"
              className="form-input"
              placeholder="apify~facebook-groups-scraper"
              value={localSettings.apifyActorId}
              onChange={e => handleChange('apifyActorId', e.target.value)}
            />
            <p className="form-hint">مثال: apify~facebook-groups-scraper</p>
          </div>

          <div className="form-group">
            <label className="form-label">روابط مجموعات فيسبوك (كل رابط في سطر)</label>
            <textarea
              id="facebook-groups"
              className="form-textarea"
              placeholder={`https://web.facebook.com/groups/630941952075842\nhttps://web.facebook.com/groups/...`}
              value={localSettings.facebookGroupUrls}
              onChange={e => handleChange('facebookGroupUrls', e.target.value)}
              style={{ minHeight: 120 }}
            />
            <p className="form-hint">هذه هي المجموعات التي سيقوم Apify بسحب البيانات منها</p>
          </div>
        </div>

        {/* Facebook Session */}
        <div className="card">
          <div className="section-title">🔵 حساب فيسبوك (Cookies)</div>

          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            ⚠️ هذه المعلومات تبقى محلياً على حاسوبك فقط ولا تُرسل لأي مكان آخر
          </div>

          <div className="form-group">
            <label className="form-label">Facebook Cookies</label>
            <textarea
              id="facebook-cookies"
              className="form-textarea"
              placeholder={`c_user=xxxxxxxxxx; xs=xxxxxxxxxx; datr=xxxxxxxxxx`}
              value={localSettings.facebookCookies}
              onChange={e => handleChange('facebookCookies', e.target.value)}
              style={{ minHeight: 100, fontFamily: 'monospace', fontSize: 12 }}
            />
            <p className="form-hint">
              للحصول على الكوكيز: افتح فيسبوك في Chrome → F12 → Application → Cookies
            </p>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">كيفية الحصول على الكوكيز</label>
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              fontSize: 13,
              color: 'var(--text-secondary)',
              lineHeight: 2
            }}>
              <div>1️⃣ افتح <strong style={{ color: 'var(--text-accent)' }}>facebook.com</strong> في Chrome</div>
              <div>2️⃣ اضغط <strong style={{ color: 'var(--text-accent)' }}>F12</strong> لفتح Developer Tools</div>
              <div>3️⃣ اذهب إلى تبويب <strong style={{ color: 'var(--text-accent)' }}>Application</strong></div>
              <div>4️⃣ من القائمة الجانبية: <strong style={{ color: 'var(--text-accent)' }}>Cookies → facebook.com</strong></div>
              <div>5️⃣ انسخ قيم <strong style={{ color: 'var(--accent-green)' }}>c_user</strong> و <strong style={{ color: 'var(--accent-green)' }}>xs</strong></div>
            </div>
          </div>
        </div>

        {/* n8n & AI Settings */}
        <div className="card">
          <div className="section-title">🤖 إعدادات n8n والذكاء الاصطناعي</div>

          <div className="form-group">
            <label className="form-label">n8n Webhook URL</label>
            <input
              id="n8n-webhook"
              type="text"
              className="form-input"
              placeholder="http://localhost:5678/webhook/..."
              value={localSettings.n8nWebhookUrl}
              onChange={e => handleChange('n8nWebhookUrl', e.target.value)}
            />
            <p className="form-hint">رابط webhook الخاص بـ n8n لاستقبال طلبات التشغيل</p>
          </div>

          <div className="form-group">
            <label className="form-label">NVIDIA API Key</label>
            <input
              id="nvidia-key"
              type="password"
              className="form-input"
              placeholder="nvapi-xxxxxxxxxxxx"
              value={localSettings.nvidiaApiKey}
              onChange={e => handleChange('nvidiaApiKey', e.target.value)}
            />
            <p className="form-hint">مفتاح NVIDIA AI للتصنيف الذكي</p>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Google Sheet ID</label>
            <input
              id="sheet-id"
              type="text"
              className="form-input"
              placeholder="14kWKZPiFmSaE9_..."
              value={localSettings.googleSheetId}
              onChange={e => handleChange('googleSheetId', e.target.value)}
            />
            <p className="form-hint">معرف جدول Google الذي نحفظ فيه البيانات</p>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <div className="section-title">📡 حالة النظام</div>
          <SystemStatus settings={localSettings} />
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24, gap: 12 }}>
        <button className="btn btn-secondary" onClick={() => setLocalSettings({ ...settings })}>
          ↩️ إلغاء التغييرات
        </button>
        <button id="save-settings-btn" className="btn btn-success btn-xl" onClick={handleSave}>
          💾 حفظ الإعدادات
        </button>
      </div>
    </div>
  );
}

function SystemStatus({ settings }) {
  const [status, setStatus] = useState({ n8n: 'pending', apify: 'pending' });
  const [checking, setChecking] = useState(false);

  const checkAll = async () => {
    setChecking(true);
    const newStatus = { n8n: 'pending', apify: 'pending' };

    // Check n8n
    try {
      const res = await fetch('http://localhost:5678/healthz', { signal: AbortSignal.timeout(4000) });
      newStatus.n8n = res.ok ? 'online' : 'offline';
    } catch {
      newStatus.n8n = 'offline';
    }

    // Check Apify (just verify token format)
    newStatus.apify = settings.apifyToken?.startsWith('apify_api_') ? 'online' : 'offline';

    setStatus(newStatus);
    setChecking(false);
  };

  const StatusRow = ({ label, state, icon }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      </div>
      <span style={{
        fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20,
        background: state === 'online' ? 'rgba(16,185,129,0.15)' : state === 'offline' ? 'rgba(239,68,68,0.15)' : 'rgba(100,116,139,0.15)',
        color: state === 'online' ? '#10b981' : state === 'offline' ? '#ef4444' : '#94a3b8',
      }}>
        {state === 'online' ? '✅ متصل' : state === 'offline' ? '❌ غير متصل' : '⏳ لم يتحقق'}
      </span>
    </div>
  );

  return (
    <div>
      <StatusRow label="خادم n8n المحلي" state={status.n8n} icon="⚙️" />
      <StatusRow label="مفتاح Apify API" state={status.apify} icon="🔑" />
      <div style={{ paddingTop: 16 }}>
        <button className="btn btn-primary" onClick={checkAll} disabled={checking} id="check-status-btn">
          {checking ? <><span className="spinner" /> جاري الفحص...</> : '🔍 فحص الاتصال'}
        </button>
      </div>
    </div>
  );
}
