// =====================================================
// Overview/Home Component
// =====================================================
export default function Overview({ settings }) {
  return (
    <div>
      <div className="page-header">
        <h2>🏠 نظرة عامة</h2>
        <p>مرحباً بك في نظام صيد العملاء الذكي</p>
      </div>

      {/* Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1a1040 0%, #0d2060 50%, #1a1040 100%)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px 32px',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        boxShadow: '0 0 60px rgba(99, 102, 241, 0.1)',
        marginBottom: 32,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.08)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: 100,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.08)',
          pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🤖</div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, marginBottom: 12,
            background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>
            AI Lead Hunter
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, maxWidth: 600, lineHeight: 1.8 }}>
            نظام متكامل يستخدم الذكاء الاصطناعي لصيد العملاء المحتملين من مجموعات فيسبوك،
            تصنيفهم، وكتابة رسائل مبيعات مخصصة لكل عميل تلقائياً.
          </p>
        </div>
      </div>

      {/* How it Works */}
      <div style={{ marginBottom: 32 }}>
        <div className="section-title">🔄 كيف يعمل النظام؟</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {[
            { step: '01', icon: '🕵️', title: 'السحب', desc: 'Apify يسحب المنشورات من مجموعات فيسبوك المحددة' },
            { step: '02', icon: '🧠', title: 'التصنيف', desc: 'NVIDIA AI يصنف كل منشور ويحدد اهتمام العميل' },
            { step: '03', icon: '🎯', title: 'الفلترة', desc: 'يتم فلترة العملاء المهتمين بمجالك فقط' },
            { step: '04', icon: '✍️', title: 'الرسائل', desc: 'الذكاء الاصطناعي يكتب رسالة بيع مخصصة لكل عميل' },
            { step: '05', icon: '📊', title: 'Google Sheets', desc: 'حفظ كل شيء في جدول Google Sheets' },
          ].map(item => (
            <div key={item.step} className="stat-card blue" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 2, marginBottom: 8 }}>
                STEP {item.step}
              </div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Config Check */}
      <div className="card">
        <div className="section-title">✅ حالة الإعداد</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <ConfigItem label="مفتاح Apify API" ok={!!settings.apifyToken} hint="أضف مفتاح Apify في الإعدادات" />
          <ConfigItem label="رابط n8n Webhook" ok={!!settings.n8nWebhookUrl} hint="تحقق من إعدادات n8n" />
          <ConfigItem label="مفتاح NVIDIA AI" ok={!!settings.nvidiaApiKey} hint="أضف مفتاح NVIDIA في الإعدادات" />
          <ConfigItem label="روابط المجموعات" ok={!!settings.facebookGroupUrls} hint="أضف روابط مجموعات فيسبوك في الإعدادات" />
        </div>
      </div>
    </div>
  );
}

function ConfigItem({ label, ok, hint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 20 }}>{ok ? '✅' : '⚠️'}</span>
        <span style={{ fontSize: 14, fontWeight: 500 }}>{label}</span>
      </div>
      {!ok && <span style={{ fontSize: 12, color: 'var(--accent-orange)' }}>{hint}</span>}
      {ok && <span style={{ fontSize: 12, color: 'var(--accent-green)' }}>مضبوط</span>}
    </div>
  );
}
