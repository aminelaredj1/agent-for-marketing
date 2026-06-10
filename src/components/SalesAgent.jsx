// =====================================================
// SalesAgent Component - Hormozi AI Sales Interface
// =====================================================
import { useState, useRef, useEffect } from 'react';

const HORMOZI_SYSTEM_PROMPT = `أنت مندوب مبيعات خبير تعمل لوكالة سياحية جزائرية متخصصة في العمرة والحج والسياحة.
أسلوبك مستوحى من Alex Hormozi: مباشر، واثق، يركز على القيمة الحقيقية، يستخدم الأرقام والإحصائيات، ويخلق الإلحاح بشكل طبيعي.

مبادئك في البيع:
1. ابدأ بإظهار أنك فهمت مشكلة العميل تماماً
2. قدم العرض كحل لا كمنتج (Offer not Product)
3. استخدم الدليل الاجتماعي: "لقد ساعدنا أكثر من 500 عائلة جزائرية"
4. أزل المخاوف قبل أن يذكرها العميل
5. اخلق إلحاحاً حقيقياً (مقاعد محدودة، سعر خاص لفترة محدودة)
6. اطلب الالتزام بشكل طبيعي في نهاية كل رسالة

لهجتك: عربية واضحة مع لمسة جزائرية محترمة.
طول الرسالة: قصيرة وقوية (3-5 جمل كحد أقصى).
لا تستخدم كلمات مبتذلة مثل "رائع" أو "ممتاز" - كن مختلفاً.`;

const WELCOME_MESSAGES = {
  'عمرة': 'أهلاً، رأيت اهتمامك بأداء العمرة. لدينا عرض خاص جداً لهذا الموسم - هل أنت متاح للحديث؟',
  'حج': 'السلام عليكم، تواصلت معك بخصوص موسم الحج القادم. لدينا باقة مميزة بأماكن محدودة جداً.',
  'سياحة داخلية': 'مرحباً! رأيت اهتمامك بالسياحة الداخلية. لدينا عروض حصرية لهذا الموسم.',
  'default': 'السلام عليكم، أتواصل معك من وكالتنا السياحية بخصوص عرض خاص قد يناسبك تماماً.',
};

export default function SalesAgent({ settings }) {
  const [selectedLead, setSelectedLead] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [leads] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aiLeadHunter_leads') || '[]'); } catch { return []; }
  });
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 3500);
  };

  const selectLead = async (lead) => {
    setSelectedLead(lead);
    setConversation([]);
    setIsLoading(true);

    // Generate opening message based on lead's intent
    const welcome = WELCOME_MESSAGES[lead.intent] || WELCOME_MESSAGES['default'];
    const openingMsg = await generateAIResponse([
      { role: 'system', content: HORMOZI_SYSTEM_PROMPT },
      {
        role: 'user',
        content: `قم بكتابة رسالة افتتاحية مخصصة لهذا الشخص:
الاسم: ${lead.user_name}
اهتمامه: ${lead.intent}
منشوره الأصلي: "${lead.post_text}"

اكتب رسالة أولى قوية وشخصية بأسلوب Hormozi.`
      }
    ]);

    setConversation([
      { role: 'ai', content: openingMsg, timestamp: new Date() }
    ]);
    setIsLoading(false);
  };

  const generateAIResponse = async (messages) => {
    const apiKey = settings.nvidiaApiKey || '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';
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta/llama-3.1-70b-instruct',
          messages,
          temperature: 0.8,
          max_tokens: 200,
        }),
      });
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || 'عذراً، حدث خطأ. حاول مجدداً.';
    } catch (err) {
      return 'تعذر الاتصال بالذكاء الاصطناعي. تحقق من مفتاح NVIDIA.';
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    const customerMsg = userInput.trim();
    setUserInput('');

    const newConversation = [
      ...conversation,
      { role: 'customer', content: customerMsg, timestamp: new Date() }
    ];
    setConversation(newConversation);
    setIsLoading(true);

    // Build messages history for AI
    const messages = [
      { role: 'system', content: HORMOZI_SYSTEM_PROMPT + `\n\nأنت تتحدث مع: ${selectedLead.user_name}\nاهتمامه: ${selectedLead.intent}` },
      ...newConversation.map(m => ({
        role: m.role === 'ai' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const aiReply = await generateAIResponse(messages);
    setConversation(prev => [...prev, { role: 'ai', content: aiReply, timestamp: new Date() }]);
    setIsLoading(false);
  };

  const copyMessage = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    showAlert('success', 'تم نسخ الرسالة! الصقها الآن في فيسبوك ماسنجر 📋');
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const copyAll = () => {
    const allAI = conversation.filter(m => m.role === 'ai').map(m => m.content).join('\n\n---\n\n');
    navigator.clipboard.writeText(allAI);
    showAlert('success', 'تم نسخ كل رسائل الذكاء الاصطناعي!');
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString('ar-DZ', { hour: '2-digit', minute: '2-digit' });

  return (
    <div>
      <div className="page-header">
        <h2>🤖 مندوب المبيعات الذكي</h2>
        <p>اختر زبوناً وسيتولى الذكاء الاصطناعي كتابة رسائل البيع بأسلوب Alex Hormozi</p>
      </div>

      {alert && (
        <div className={`alert alert-${alert.type}`} style={{ marginBottom: 20 }}>
          {alert.msg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 24, height: 'calc(100vh - 200px)' }}>

        {/* === LEFT: Lead List === */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '20px 20px 12px', borderBottom: '1px solid var(--border-color)' }}>
            <div className="section-title" style={{ marginBottom: 0 }}>👥 العملاء المحتملون</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
            {leads.length === 0 ? (
              <div className="empty-state" style={{ padding: '40px 16px' }}>
                <div className="empty-icon">📭</div>
                <h3 style={{ fontSize: 14 }}>لا يوجد عملاء</h3>
                <p style={{ fontSize: 12 }}>اذهب إلى "صيد العملاء" أولاً</p>
              </div>
            ) : (
              leads.map((lead, idx) => (
                <div
                  key={idx}
                  onClick={() => selectLead(lead)}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    marginBottom: 6,
                    border: `1px solid ${selectedLead?.post_id === lead.post_id ? 'var(--accent-primary)' : 'transparent'}`,
                    background: selectedLead?.post_id === lead.post_id ? 'rgba(59,130,246,0.1)' : 'var(--bg-input)',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'var(--gradient-primary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, flexShrink: 0,
                    }}>
                      {(lead.user_name || '?')[0]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>
                        {lead.user_name || 'مجهول'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {lead.post_text}
                      </div>
                    </div>
                    <span className={`badge ${lead.intent === 'عمرة' ? 'badge-umrah' : lead.intent === 'حج' ? 'badge-hajj' : 'badge-other'}`}
                      style={{ fontSize: 10, padding: '2px 8px', flexShrink: 0 }}>
                      {lead.intent || '؟'}
                    </span>
                  </div>
                </div>
              ))
            )}

            {/* Demo leads if none */}
            {leads.length === 0 && (
              <div style={{ padding: '0 8px' }}>
                {[
                  { user_name: 'أحمد بن علي', post_text: 'نبي نعمل عمرة هذا الموسم', intent: 'عمرة' },
                  { user_name: 'فاطمة خالدي', post_text: 'عندي رغبة في الحج هذا العام', intent: 'حج' },
                  { user_name: 'محمد درارجي', post_text: 'نحوس على باكيج عمرة مع فندق قريب', intent: 'عمرة' },
                ].map((demo, idx) => (
                  <div
                    key={`demo-${idx}`}
                    onClick={() => selectLead({ ...demo, post_id: `demo-${idx}` })}
                    style={{
                      padding: '14px 16px', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                      marginBottom: 6, border: `1px solid ${selectedLead?.post_id === `demo-${idx}` ? 'var(--accent-primary)' : 'rgba(59,130,246,0.2)'}`,
                      background: 'var(--bg-input)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>
                        {demo.user_name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{demo.user_name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{demo.post_text}</div>
                      </div>
                      <span className="badge badge-umrah" style={{ fontSize: 10 }}>{demo.intent}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--accent-orange)', marginTop: 6 }}>⭐ زبون تجريبي</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === RIGHT: Chat Area === */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
          {!selectedLead ? (
            <div className="empty-state" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="empty-icon">🤖</div>
              <h3>اختر زبوناً لبدء المحادثة</h3>
              <p>سيقوم الذكاء الاصطناعي بكتابة رسائل البيع بأسلوب Alex Hormozi</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: 'var(--shadow-glow)' }}>
                    {(selectedLead.user_name || '?')[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{selectedLead.user_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-green)', display: 'inline-block' }} />
                      محادثة مباشرة • {selectedLead.intent}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-secondary" onClick={copyAll} style={{ fontSize: 12, padding: '8px 14px' }}>
                    📋 نسخ الكل
                  </button>
                  <button className="btn btn-primary" onClick={() => selectLead(selectedLead)} style={{ fontSize: 12, padding: '8px 14px' }}>
                    🔄 إعادة بدء
                  </button>
                </div>
              </div>

              {/* Hormozi Banner */}
              <div style={{ padding: '10px 20px', background: 'rgba(139,92,246,0.08)', borderBottom: '1px solid rgba(139,92,246,0.2)' }}>
                <div style={{ fontSize: 12, color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚡</span>
                  <span>أسلوب Alex Hormozi: مباشر • قيمة عالية • إلحاح حقيقي • لا مجاملات فارغة</span>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {conversation.map((msg, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: msg.role === 'ai' ? 'row' : 'row-reverse', gap: 10, alignItems: 'flex-start' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: msg.role === 'ai' ? 'var(--gradient-primary)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                    }}>
                      {msg.role === 'ai' ? '🤖' : '👤'}
                    </div>

                    {/* Bubble */}
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: msg.role === 'ai' ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                        background: msg.role === 'ai' ? 'var(--bg-card)' : 'rgba(245,158,11,0.1)',
                        border: `1px solid ${msg.role === 'ai' ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)'}`,
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: 'var(--text-primary)',
                      }}>
                        {msg.role === 'ai' && (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                            🤖 الذكاء الاصطناعي (أسلوب Hormozi)
                          </div>
                        )}
                        {msg.content}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, justifyContent: msg.role === 'ai' ? 'flex-start' : 'flex-end' }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{formatTime(msg.timestamp)}</span>
                        {msg.role === 'ai' && (
                          <button
                            onClick={() => copyMessage(msg.content, idx)}
                            style={{
                              fontSize: 11, padding: '3px 10px', borderRadius: 20,
                              border: '1px solid var(--border-color)',
                              background: copiedIndex === idx ? 'rgba(16,185,129,0.15)' : 'transparent',
                              color: copiedIndex === idx ? 'var(--accent-green)' : 'var(--text-muted)',
                              cursor: 'pointer', transition: 'var(--transition)',
                            }}
                          >
                            {copiedIndex === idx ? '✅ تم النسخ' : '📋 نسخ'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🤖</div>
                    <div style={{ padding: '14px 18px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '4px 16px 16px 16px' }}>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{
                            width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-primary)',
                            animation: `bounce-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area - Simulate customer reply */}
              <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  💬 اكتب رد الزبون هنا لمحاكاة المحادثة وتوليد رد الذكاء الاصطناعي:
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <input
                    className="form-input"
                    placeholder='مثال: "كم يكلف باكيج العمرة؟" أو "هل الفندق قريب من الحرم؟"'
                    value={userInput}
                    onChange={e => setUserInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    style={{ flex: 1 }}
                  />
                  <button className="btn btn-primary" onClick={sendMessage} disabled={isLoading || !userInput.trim()} style={{ flexShrink: 0, padding: '12px 20px' }}>
                    {isLoading ? <span className="spinner" /> : '⚡ رد'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes bounce-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
