"use client";

import React, { useState } from 'react';

export default function FinancialDashboard() {
  const [balance, setBalance] = useState(124500.00);
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'ربح', description: 'تداول EUR/USD', amount: '+1,250.00$', date: '2026-11-02', status: 'مكتمل' },
    { id: 2, type: 'سحب', description: 'تحويل محفظة خارجية', amount: '-450.00$', date: '2026-11-01', status: 'مكتمل' },
    { id: 3, type: 'ربح', description: 'صفقة XAU/USD (ذهب)', amount: '+2,100.00$', date: '2026-10-30', status: 'مكتمل' },
    { id: 4, type: 'إيداع', description: 'إيداع رصيد جديد', amount: '+5,000.00$', date: '2026-10-28', status: 'مكتمل' },
  ]);

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>نظام Cionpip المالي</h1>
          <p style={styles.subtitle}>لوحة التحكم والتداول المباشر</p>
        </div>
        <div style={styles.userBadge}>حساب موثق Live</div>
      </header>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.card}>
          <span style={styles.cardTitle}>إجمالي الرصيد</span>
          <h2 style={styles.cardValue}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h2>
          <span style={{ ...styles.cardTag, color: '#10b981' }}>+12.5% هذا الشهر</span>
        </div>

        <div style={styles.card}>
          <span style={styles.cardTitle}>الأرباح المحققة</span>
          <h2 style={styles.cardValue}>$18,920.00</h2>
          <span style={{ ...styles.cardTag, color: '#10b981' }}>+8.4% صافي العائد</span>
        </div>

        <div style={styles.card}>
          <span style={styles.cardTitle}>الصفقات النشطة</span>
          <h2 style={styles.cardValue}>3 صفقات</h2>
          <span style={{ ...styles.cardTag, color: '#f59e0b' }}>مخاطرة متوازنة</span>
        </div>
      </div>

      {/* Transactions Table */}
      <div style={styles.tableContainer}>
        <h3 style={styles.sectionTitle}>سجل المعاملات الأخيرة</h3>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeader}>
              <th style={styles.th}>الوصف</th>
              <th style={styles.th}>النوع</th>
              <th style={styles.th}>التاريخ</th>
              <th style={styles.th}>المبلغ</th>
              <th style={styles.th}>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} style={styles.tableRow}>
                <td style={styles.td}>{tx.description}</td>
                <td style={styles.td}>{tx.type}</td>
                <td style={styles.td}>{tx.date}</td>
                <td style={{ ...styles.td, color: tx.amount.startsWith('+') ? '#10b981' : '#ef4444', fontWeight: 'bold' }}>
                  {tx.amount}
                </td>
                <td style={styles.td}>
                  <span style={styles.statusBadge}>{tx.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Inline Styles
const styles = {
  container: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    minHeight: '100vh',
    padding: '2rem',
    direction: 'rtl',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    borderBottom: '1px solid #334155',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    margin: 0,
    color: '#38bdf8',
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: '0.25rem',
  },
  userBadge: {
    backgroundColor: '#0369a1',
    color: '#e0f2fe',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    border: '1px solid #334155',
  },
  cardTitle: {
    color: '#94a3b8',
    fontSize: '0.875rem',
  },
  cardValue: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0.5rem 0',
  },
  cardTag: {
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  tableContainer: {
    backgroundColor: '#1e293b',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    border: '1px solid #334155',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    marginBottom: '1rem',
    color: '#f8fafc',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'right',
  },
  tableHeader: {
    borderBottom: '1px solid #334155',
  },
  th: {
    padding: '0.75rem 1rem',
    color: '#94a3b8',
    fontWeight: '600',
  },
  tableRow: {
    borderBottom: '1px solid #334155',
  },
  td: {
    padding: '1rem',
  },
  statusBadge: {
    backgroundColor: '#064e3b',
    color: '#6ee7b7',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
  },
};
