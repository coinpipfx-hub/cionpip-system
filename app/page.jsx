"use client";

import React, { useState } from 'react';

export default function CionpipMasterSystem() {
  // حالة تسجيل الدخول (تجريبي: افتراضي المدير)
  const [user, setUser] = useState({ name: 'حسام (المدير / الطرف الأول)', role: 'admin' });
  const [activeTab, setActiveTab] = useState('dashboard');

  // بيانات العملاء والاشتراكات
  const [clients, setClients] = useState([
    { id: 1, name: 'أحمد خالد', phone: '+966500000000', service: 'قناة التداول الخاصة', status: 'نشط', expiry: '2026-12-01', amount: 1500 },
    { id: 2, name: 'سارة محمد', phone: '+966511111111', service: 'إدارة محافظ', status: 'منتهي', expiry: '2026-10-15', amount: 3000 },
  ]);

  // صفقات وحركات المبالغ (لتوزيع النسب)
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'تداول', amount: 10000, desc: 'أرباح تداول سحب الذهب', date: '2026-11-02' },
    { id: 2, type: 'أرباح أخرى', amount: 4000, desc: 'عمولة استشارات', date: '2026-11-01' },
  ]);

  // حساب توزيع النسب المتفق عليها
  // الطرف الأول (المدير): 70% من التداول، 50% من الأرباح الأخرى
  // الطرف الثاني: 30% من التداول، 50% من الأرباح الأخرى
  const totalTrading = transactions.filter(t => t.type === 'تداول').reduce((acc, t) => acc + t.amount, 0);
  const totalOther = transactions.filter(t => t.type === 'أرباح أخرى').reduce((acc, t) => acc + t.amount, 0);

  const p1TradingShare = totalTrading * 0.70;
  const p2TradingShare = totalTrading * 0.30;
  
  const p1OtherShare = totalOther * 0.50;
  const p2OtherShare = totalOther * 0.50;

  const p1Total = p1TradingShare + p1OtherShare;
  const p2Total = p2TradingShare + p2OtherShare;

  return (
    <div style={styles.container}>
      {/* الشريط العلوي ومعلومات المستخدم */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>نظام Cionpip المالي المتكامل</h1>
          <p style={styles.subtitle}>مسجل كـ: {user.name} ({user.role === 'admin' ? 'صلاحيات كاملة - المدير' : 'موظف'})</p>
        </div>
        <div style={styles.navButtons}>
          <button style={activeTab === 'dashboard' ? styles.activeBtn : styles.btn} onClick={() => setActiveTab('dashboard')}>الرئيسية</button>
          <button style={activeTab === 'shares' ? styles.activeBtn : styles.btn} onClick={() => setActiveTab('shares')}>العقود والنسب</button>
          <button style={activeTab === 'clients' ? styles.activeBtn : styles.btn} onClick={() => setActiveTab('clients')}>العملاء والاشتراكات</button>
          <button style={activeTab === 'invoices' ? styles.activeBtn : styles.btn} onClick={() => setActiveTab('invoices')}>الفواتير والتقارير</button>
          <button style={activeTab === 'settings' ? styles.activeBtn : styles.btn} onClick={() => setActiveTab('settings')}>الإعدادات واليوزرات</button>
        </div>
      </header>

      {/* المحتوى حسب التبويب */}
      {activeTab === 'dashboard' && (
        <div>
          <div style={styles.statsGrid}>
            <div style={styles.card}>
              <span style={styles.cardTitle}>إجمالي أرباح التداول</span>
              <h2 style={styles.cardValue}>${totalTrading.toLocaleString()}</h2>
              <span style={{color: '#38bdf8'}}>الطرف الأول (70%): ${p1TradingShare.toLocaleString()} | الطرف الثاني (30%): ${p2TradingShare.toLocaleString()}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardTitle}>الأرباح الأخرى (50/50)</span>
              <h2 style={styles.cardValue}>${totalOther.toLocaleString()}</h2>
              <span style={{color: '#38bdf8'}}>لكل طرف: ${(totalOther * 0.5).toLocaleString()}</span>
            </div>
            <div style={styles.card}>
              <span style={styles.cardTitle}>إجمالي صافي أرباح النظام</span>
              <h2 style={styles.cardValue}>${(totalTrading + totalOther).toLocaleString()}</h2>
              <span style={{color: '#10b981'}}>موزعة بدقة حسب العقد المعتمد</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'shares' && (
        <div style={styles.section}>
          <h3 style={styles.secTitle}>📋 اتفاقية الشراكة وتوزيع النسب المعتمدة</h3>
          <div style={styles.contractBox}>
            <p><strong>بنود العقد المتفق بين الطرف الأول والثاني:</strong></p>
            <ul>
              <li><strong>أرباح التداول:</strong> 70% للطرف الأول (حسام - المدير) مقابل 30% للطرف الثاني.</li>
              <li><strong>الأرباح الأخرى:</strong> 50% للطرف الأول و 50% للطرف الثاني.</li>
            </ul>
            <hr style={{borderColor: '#334155', margin: '1rem 0'}} />
            <p><strong>مستحقات الطرف الأول الحالية:</strong> <span style={{color: '#10b981', fontWeight: 'bold'}}>${p1Total.toLocaleString()}</span></p>
            <p><strong>مستحقات الطرف الثاني الحالية:</strong> <span style={{color: '#f59e0b', fontWeight: 'bold'}}>${p2Total.toLocaleString()}</span></p>
          </div>
        </div>
      )}

      {activeTab === 'clients' && (
        <div style={styles.section}>
          <h3 style={styles.secTitle}>👥 إدارة العملاء واشتراكات قناة التداول الخاصة</h3>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>اسم العميل</th>
                <th style={styles.th}>الجوال</th>
                <th style={styles.th}>نوع الاشتراك</th>
                <th style={styles.th}>تاريخ الانتهاء</th>
                <th style={styles.th}>الحالة</th>
                <th style={styles.th}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}>{c.name}</td>
                  <td style={styles.td}>{c.phone}</td>
                  <td style={styles.td}>{c.service}</td>
                  <td style={styles.td}>{c.expiry}</td>
                  <td style={styles.td}>
                    <span style={{padding: '0.2rem 0.5rem', borderRadius: '4px', background: c.status === 'نشط' ? '#064e3b' : '#7f1d1d', color: '#fff'}}>
                      {c.status}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button style={styles.actionBtn} onClick={() => alert(`تم إرسال رسالة تذكير/انتهاء الاشتراك إلى العميل: ${c.name} (${c.phone})`)}>
                      إرسال رسالة انتهاء
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div style={styles.section}>
          <h3 style={styles.secTitle}>🧾 الفواتير وحركة المبالغ والتقارير</h3>
          <p style={{color: '#94a3b8', marginBottom: '1rem'}}>سجل الحركات المالية المعتمدة وإصدار التقارير اليومية والشهرية.</p>
          <div style={styles.contractBox}>
            {transactions.map(t => (
              <div key={t.id} style={{display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #334155'}}>
                <span>{t.desc} ({t.type})</span>
                <span style={{color: '#10b981', fontWeight: 'bold'}}>+${t.amount.toLocaleString()} ({t.date})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div style={styles.section}>
          <h3 style={styles.secTitle}>⚙️ إعدادات النظام وصلاحيات المستخدمين واليوزرات</h3>
          <div style={styles.contractBox}>
            <p><strong>المستخدمين الحاليين:</strong></p>
            <ul style={{listStyle: 'none', padding: 0}}>
              <li style={{padding: '0.5rem 0'}}>👑 حسام (المدير / الطرف الأول) - صلاحيات كاملة</li>
              <li style={{padding: '0.5rem 0'}}>💼 الشريك (الطرف الثاني) - صلاحيات التقارير والنسب</li>
              <li style={{padding: '0.5rem 0'}}>👤 موظف خدمة العملاء - صلاحيات إضافة العملاء والمتابعة</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

// الأنماط والتصميم البصري المتناسق
const styles = {
  container: { fontFamily: 'system-ui, sans-serif', backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh', padding: '2rem', direction: 'rtl' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #334155', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' },
  title: { fontSize: '1.75rem', fontWeight: '700', color: '#38bdf8', margin: 0 },
  subtitle: { color: '#94a3b8', marginTop: '0.25rem' },
  navButtons: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  btn: { backgroundColor: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' },
  activeBtn: { backgroundColor: '#0284c7', color: '#fff', border: '1px solid #0284c7', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' },
  card: { backgroundColor: '#1e293b', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155' },
  cardTitle: { color: '#94a3b8', fontSize: '0.875rem' },
  cardValue: { fontSize: '2rem', fontWeight: '700', margin: '0.5rem 0' },
  section: { backgroundColor: '#1e293b', borderRadius: '0.75rem', padding: '1.5rem', border: '1px solid #334155' },
  secTitle: { fontSize: '1.25rem', marginBottom: '1rem', color: '#f8fafc' },
  contractBox: { backgroundColor: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155', lineHeight: '1.8' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'right' },
  thRow: { borderBottom: '1px solid #334155' },
  th: { padding: '0.75rem', color: '#94a3b8' },
  tr: { borderBottom: '1px solid #334155' },
  td: { padding: '0.75rem' },
  actionBtn: { backgroundColor: '#0369a1', color: '#fff', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }
};
