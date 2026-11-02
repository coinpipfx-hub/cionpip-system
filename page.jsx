'use client';
import { useEffect, useState } from 'react';
import { sb } from '@/lib/supabase';

const fmt = n => '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dt = d => new Date(d).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
const todayStr = () => new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
const ROLES = { admin: 'مدير', accountant: 'محاسب', viewer: 'مشاهد' };
const TYPES = { income: 'دخل', expense: 'مصروف', liability: 'التزام' };
const TABS = { dash: 'لوحة التحكم', tx: 'الحركات المالية', inv: 'الفواتير', rep: 'التقارير', act: 'سجل النشاط', users: 'المستخدمون', me: 'حسابي' };
const ALLOWED = { admin: Object.keys(TABS), accountant: ['dash', 'tx', 'inv', 'rep', 'act', 'me'], viewer: ['dash', 'tx', 'inv', 'me'] };

async function api(method, body) {
  const { data: { session } } = await sb.auth.getSession();
  const r = await fetch('/api/users', { method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + session.access_token }, body: JSON.stringify(body) });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'حدث خطأ');
  return j;
}

function Avatar({ p }) {
  return p?.avatar_url ? <img className="av" src={p.avatar_url} alt="" /> : <span className="av">{(p?.full_name || '؟')[0]}</span>;
}

function PrintDoc({ title, sub, by, onClose, children }) {
  return (
    <div className="overlay">
      <div className="paper print-area">
        <div className="bar2 noprint">
          <button onClick={() => window.print()}>طباعة / حفظ PDF</button>
          <button className="ghost" style={{ color: '#111', borderColor: '#bbb' }} onClick={onClose}>إغلاق</button>
        </div>
        <header className="ph">
          <img src="/logo.png" alt="Cionpip" />
          <div><h1>Cionpip</h1><p>Forex &amp; Crypto Trading</p></div>
          <div className="pt"><h2>{title}</h2><p>{sub}</p></div>
        </header>
        {children}
        <footer>أصدرها: {by} — {dt(new Date())}</footer>
      </div>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  async function go(e) {
    e.preventDefault(); setBusy(true); setErr('');
    const { error } = await sb.auth.signInWithPassword({ email, password: pw });
    if (error) setErr('البريد أو كلمة المرور غير صحيحة');
    setBusy(false);
  }
  return (
    <div className="center">
      <form className="card login" onSubmit={go}>
        <img className="biglogo" src="/logo.png" alt="Cionpip" />
        <h2>تسجيل الدخول</h2>
        <input type="email" dir="ltr" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" dir="ltr" placeholder="كلمة المرور" value={pw} onChange={e => setPw(e.target.value)} required />
        {err && <div className="neg">{err}</div>}
        <button disabled={busy}>{busy ? 'جارٍ الدخول…' : 'دخول'}</button>
      </form>
    </div>
  );
}

function Dash() {
  const [rows, setRows] = useState([]); const [s, setS] = useState({});
  useEffect(() => {
    sb.from('transactions').select('*').order('date', { ascending: false }).limit(1000).then(({ data }) => setRows(data || []));
    sb.from('settings').select('*').eq('id', 1).single().then(({ data }) => setS(data || {}));
  }, []);
  const sum = (t, p = () => true) => rows.filter(r => r.type === t && p(r)).reduce((a, r) => a + Number(r.amount), 0);
  const inc = sum('income'), exp = sum('expense'), liab = sum('liability', r => !r.paid), net = inc - exp;
  const goal = +s.reserve_goal || 0, reserve = Math.min(Math.max(net, 0), goal), dist = Math.max(net - goal, 0);
  const mg = dist * (+s.management_share_pct || 0) / 100, pt = dist * (+s.partner_share_pct || 0) / 100;
  const C = ({ t, v, c }) => <div className="card"><small>{t}</small><div className={'big ' + (c || '')}>{fmt(v)}</div></div>;
  return (
    <>
      <div className="grid">
        <C t="رأس المال" v={s.capital} /><C t="إجمالي الدخل" v={inc} c="pos" /><C t="المصروفات" v={exp} c="neg" />
        <C t="الالتزامات المستحقة" v={liab} c="neg" /><C t="صافي الربح" v={net} c={net >= 0 ? 'pos' : 'neg'} />
      </div>
      <div className="card">
        <b>صندوق الاحتياطي</b>
        <div className="big">{fmt(reserve)} <small>/ {fmt(goal)}</small></div>
        <div className="bar"><i style={{ width: (goal ? Math.min(100, reserve / goal * 100) : 0) + '%' }} /></div>
        <small>{goal ? Math.round(reserve / goal * 100) : 0}% من الهدف</small>
      </div>
      <h3>توزيع الأرباح بعد اكتمال الاحتياطي</h3>
      <div className="grid"><C t="حصة الإدارة" v={mg} c="pos" /><C t="حصة الشريك" v={pt} c="pos" /><C t="الربح القابل للتوزيع" v={dist} /></div>
      <h3>آخر الحركات</h3>
      <TxTable rows={rows.slice(0, 8)} />
    </>
  );
}

function TxTable({ rows, actions }) {
  return (
    <div className="card tw"><table>
      <thead><tr><th>التاريخ</th><th>النوع</th><th>البند</th><th>المبلغ</th><th>ملاحظة</th><th>بواسطة</th>{actions && <th></th>}</tr></thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td>{dt(r.date)}</td><td>{TYPES[r.type] || r.type}</td><td>{r.title}</td>
            <td className={r.type === 'income' ? 'pos' : 'neg'}>{fmt(r.amount)}</td><td>{r.note || '—'}</td><td>{r.created_by_name || '—'}</td>
            {actions && <td>{actions(r)}</td>}
          </tr>
        ))}
        {!rows.length && <tr><td colSpan="7">لا توجد حركات بعد. أضف أول حركة من النموذج أعلاه.</td></tr>}
      </tbody>
    </table></div>
  );
}

function Tx({ me, log, notify, canEdit }) {
  const [rows, setRows] = useState([]); const [f, setF] = useState({ type: 'income', title: '', amount: '', note: '' });
  const load = async () => {
    const { data, error } = await sb.from('transactions').select('*').order('date', { ascending: false }).limit(300);
    if (error) notify('تعذر تحميل الحركات'); setRows(data || []);
  };
  useEffect(() => { load(); }, []);
  async function add(e) {
    e.preventDefault();
    const { error } = await sb.from('transactions').insert({ type: f.type, title: f.title, amount: +f.amount, note: f.note, user_id: me.id, created_by: me.id, created_by_name: me.full_name });
    if (error) return notify('تعذر حفظ الحركة');
    log('إضافة', 'حركة مالية', { title: f.title, amount: f.amount, type: f.type });
    setF({ ...f, title: '', amount: '', note: '' }); notify('تمت إضافة الحركة'); load();
  }
  async function del(r) {
    if (!confirm('حذف هذه الحركة؟')) return;
    const { error } = await sb.from('transactions').delete().eq('id', r.id);
    if (error) return notify('تعذر الحذف'); log('حذف', 'حركة مالية', { title: r.title, amount: r.amount }); load();
  }
  async function pay(r) {
    await sb.from('transactions').update({ paid: !r.paid }).eq('id', r.id);
    log(r.paid ? 'إلغاء السداد' : 'تسديد', 'حركة مالية', { title: r.title }); load();
  }
  return (
    <>
      {canEdit && (
        <form className="card row" onSubmit={add}>
          <select value={f.type} onChange={e => setF({ ...f, type: e.target.value })}>{Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <input placeholder="البند" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} required />
          <input type="number" step="0.01" min="0" placeholder="المبلغ" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} required />
          <input placeholder="ملاحظة (اختياري)" value={f.note} onChange={e => setF({ ...f, note: e.target.value })} />
          <button>إضافة حركة</button>
        </form>
      )}
      <TxTable rows={rows} actions={canEdit && (r => (
        <>
          {r.type === 'liability' && <button className="ghost" onClick={() => pay(r)}>{r.paid ? 'مسدد ✓' : 'تسديد'}</button>}{' '}
          {me.role === 'admin' && <button className="danger" onClick={() => del(r)}>حذف</button>}
        </>
      ))} />
    </>
  );
}

function Inv({ me, log, notify, canEdit }) {
  const [list, setList] = useState([]); const [client, setClient] = useState(''); const [items, setItems] = useState([{ d: '', q: 1, p: '' }]); const [view, setView] = useState(null);
  const load = async () => { const { data } = await sb.from('invoices').select('*').order('created_at', { ascending: false }).limit(200); setList(data || []); };
  useEffect(() => { load(); }, []);
  const total = items.reduce((a, i) => a + (+i.q || 0) * (+i.p || 0), 0);
  const setItem = (i, k, v) => setItems(items.map((x, j) => j === i ? { ...x, [k]: v } : x));
  async function add(e) {
    e.preventDefault();
    const { data, error } = await sb.from('invoices').insert({ client_name: client, items, total, created_by: me.id, created_by_name: me.full_name }).select().single();
    if (error) return notify('تعذر إصدار الفاتورة');
    log('إصدار', 'فاتورة', { number: data.number, client, total });
    setClient(''); setItems([{ d: '', q: 1, p: '' }]); notify('تم إصدار الفاتورة'); load(); setView(data);
  }
  return (
    <>
      {canEdit && (
        <form className="card" onSubmit={add}>
          <input placeholder="اسم العميل" value={client} onChange={e => setClient(e.target.value)} required />
          {items.map((it, i) => (
            <div className="row" key={i}>
              <input placeholder="الوصف" value={it.d} onChange={e => setItem(i, 'd', e.target.value)} required />
              <input type="number" min="1" placeholder="الكمية" value={it.q} onChange={e => setItem(i, 'q', e.target.value)} />
              <input type="number" step="0.01" min="0" placeholder="السعر" value={it.p} onChange={e => setItem(i, 'p', e.target.value)} required />
            </div>
          ))}
          <div className="row"><button type="button" className="ghost" onClick={() => setItems([...items, { d: '', q: 1, p: '' }])}>+ بند</button><b>الإجمالي: {fmt(total)}</b><button>إصدار الفاتورة</button></div>
        </form>
      )}
      <div className="card tw"><table>
        <thead><tr><th>الرقم</th><th>العميل</th><th>الإجمالي</th><th>التاريخ</th><th>بواسطة</th><th></th></tr></thead>
        <tbody>
          {list.map(v => <tr key={v.id}><td>#{v.number}</td><td>{v.client_name}</td><td>{fmt(v.total)}</td><td>{dt(v.created_at)}</td><td>{v.created_by_name || '—'}</td><td><button className="ghost" onClick={() => setView(v)}>عرض / طباعة</button></td></tr>)}
          {!list.length && <tr><td colSpan="6">لا توجد فواتير بعد.</td></tr>}
        </tbody>
      </table></div>
      {view && (
        <PrintDoc title={'فاتورة رقم ' + view.number} sub={dt(view.created_at)} by={view.created_by_name || me.full_name} onClose={() => setView(null)}>
          <p><b>العميل:</b> {view.client_name}</p>
          <table>
            <thead><tr><th>الوصف</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead>
            <tbody>{(view.items || []).map((i, k) => <tr key={k}><td>{i.d}</td><td>{i.q}</td><td>{fmt(i.p)}</td><td>{fmt(i.q * i.p)}</td></tr>)}</tbody>
          </table>
          <div className="tot">الإجمالي: {fmt(view.total)}</div>
        </PrintDoc>
      )}
    </>
  );
}

function Rep({ me, notify }) {
  const m = new Date(); const [from, setFrom] = useState(new Date(m.getFullYear(), m.getMonth(), 1).toISOString().slice(0, 10)); const [to, setTo] = useState(m.toISOString().slice(0, 10));
  const [rows, setRows] = useState(null);
  async function run() {
    const { data, error } = await sb.from('transactions').select('*').gte('date', from).lte('date', to + 'T23:59:59').order('date');
    if (error) return notify('تعذر تحميل التقرير'); setRows(data || []);
  }
  const sum = t => (rows || []).filter(r => r.type === t).reduce((a, r) => a + Number(r.amount), 0);
  return (
    <>
      <div className="card row">
        <label>من<input type="date" value={from} onChange={e => setFrom(e.target.value)} /></label>
        <label>إلى<input type="date" value={to} onChange={e => setTo(e.target.value)} /></label>
        <button onClick={run}>إنشاء التقرير</button>
      </div>
      {rows && (
        <PrintDoc title="تقرير مالي" sub={from + ' → ' + to} by={me.full_name} onClose={() => setRows(null)}>
          <p>الدخل: <b>{fmt(sum('income'))}</b> — المصروفات: <b>{fmt(sum('expense'))}</b> — الالتزامات: <b>{fmt(sum('liability'))}</b> — الصافي: <b>{fmt(sum('income') - sum('expense'))}</b></p>
          <table>
            <thead><tr><th>التاريخ</th><th>النوع</th><th>البند</th><th>المبلغ</th><th>بواسطة</th></tr></thead>
            <tbody>{rows.map(r => <tr key={r.id}><td>{dt(r.date)}</td><td>{TYPES[r.type]}</td><td>{r.title}</td><td>{fmt(r.amount)}</td><td>{r.created_by_name || '—'}</td></tr>)}</tbody>
          </table>
        </PrintDoc>
      )}
    </>
  );
}

function Act() {
  const [rows, setRows] = useState([]); const [q, setQ] = useState('');
  useEffect(() => { sb.from('activity_log').select('*').order('created_at', { ascending: false }).limit(300).then(({ data }) => setRows(data || [])); }, []);
  const list = rows.filter(r => !q || (r.user_name || '').includes(q) || (r.entity || '').includes(q) || (r.action || '').includes(q));
  return (
    <>
      <input placeholder="بحث بالموظف أو نوع العملية…" value={q} onChange={e => setQ(e.target.value)} />
      <div className="card tw"><table>
        <thead><tr><th>الوقت</th><th>الموظف</th><th>العملية</th><th>القسم</th><th>التفاصيل</th></tr></thead>
        <tbody>{list.map(r => <tr key={r.id}><td>{dt(r.created_at)}</td><td>{r.user_name}</td><td>{r.action}</td><td>{r.entity}</td><td>{r.details ? Object.values(r.details).join(' • ') : ''}</td></tr>)}
          {!list.length && <tr><td colSpan="5">لا يوجد نشاط مطابق.</td></tr>}</tbody>
      </table></div>
    </>
  );
}

function Users({ me, log, notify }) {
  const [list, setList] = useState([]); const [f, setF] = useState({ full_name: '', email: '', password: '', role: 'viewer' }); const [busy, setBusy] = useState(false);
  const load = async () => { const { data } = await sb.from('profiles').select('*').order('created_at'); setList(data || []); };
  useEffect(() => { load(); }, []);
  const run = async (fn, ok, logArgs) => { try { await fn(); if (logArgs) log(...logArgs); notify(ok); load(); } catch (e) { notify(e.message); } };
  async function add(e) {
    e.preventDefault(); setBusy(true);
    await run(() => api('POST', f), 'تمت إضافة المستخدم', ['إضافة', 'مستخدم', { name: f.full_name, role: ROLES[f.role] }]);
    setF({ full_name: '', email: '', password: '', role: 'viewer' }); setBusy(false);
  }
  return (
    <>
      <form className="card row" onSubmit={add}>
        <input placeholder="الاسم" value={f.full_name} onChange={e => setF({ ...f, full_name: e.target.value })} required />
        <input type="email" dir="ltr" placeholder="البريد" value={f.email} onChange={e => setF({ ...f, email: e.target.value })} required />
        <input type="text" dir="ltr" placeholder="كلمة المرور (6+)" value={f.password} onChange={e => setF({ ...f, password: e.target.value })} required />
        <select value={f.role} onChange={e => setF({ ...f, role: e.target.value })}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <button disabled={busy}>إضافة مستخدم</button>
      </form>
      <div className="card tw"><table>
        <thead><tr><th>المستخدم</th><th>البريد</th><th>الدور</th><th>الحالة</th><th></th></tr></thead>
        <tbody>{list.map(u => (
          <tr key={u.id}>
            <td><Avatar p={u} /> {u.full_name}</td><td dir="ltr">{u.email}</td>
            <td><select value={u.role} disabled={u.id === me.id} onChange={e => run(() => api('PATCH', { id: u.id, role: e.target.value }), 'تم تغيير الدور', ['تغيير دور', 'مستخدم', { name: u.full_name, role: ROLES[e.target.value] }])}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
            <td>{u.active ? 'نشط' : 'معطّل'}</td>
            <td>
              <button className="ghost" onClick={() => { const p = prompt('كلمة المرور الجديدة (6 أحرف على الأقل):'); if (p) run(() => api('PATCH', { id: u.id, password: p }), 'تم تغيير كلمة المرور', ['تغيير كلمة مرور', 'مستخدم', { name: u.full_name }]); }}>كلمة المرور</button>{' '}
              {u.id !== me.id && <>
                <button className="ghost" onClick={() => run(() => api('PATCH', { id: u.id, active: !u.active }), 'تم تحديث الحالة', [u.active ? 'تعطيل' : 'تفعيل', 'مستخدم', { name: u.full_name }])}>{u.active ? 'تعطيل' : 'تفعيل'}</button>{' '}
                <button className="danger" onClick={() => { if (confirm('حذف ' + u.full_name + ' نهائياً؟')) run(() => api('DELETE', { id: u.id }), 'تم حذف المستخدم', ['حذف', 'مستخدم', { name: u.full_name }]); }}>حذف</button>
              </>}
            </td>
          </tr>))}</tbody>
      </table></div>
    </>
  );
}

function Me({ me, setMe, log, notify }) {
  const [name, setName] = useState(me.full_name || ''); const [pw, setPw] = useState('');
  async function saveName() {
    const { error } = await sb.from('profiles').update({ full_name: name }).eq('id', me.id);
    if (error) return notify('تعذر الحفظ'); setMe({ ...me, full_name: name }); log('تعديل الاسم', 'الملف الشخصي', {}); notify('تم حفظ الاسم');
  }
  async function upload(e) {
    const file = e.target.files[0]; if (!file) return;
    const path = me.id + '-' + Date.now();
    const { error } = await sb.storage.from('avatars').upload(path, file);
    if (error) return notify('تعذر رفع الصورة');
    const url = sb.storage.from('avatars').getPublicUrl(path).data.publicUrl;
    await sb.from('profiles').update({ avatar_url: url }).eq('id', me.id); setMe({ ...me, avatar_url: url }); notify('تم تحديث الصورة');
  }
  async function savePw() {
    if (pw.length < 6) return notify('كلمة المرور 6 أحرف على الأقل');
    const { error } = await sb.auth.updateUser({ password: pw });
    if (error) return notify('تعذر تغيير كلمة المرور'); setPw(''); log('تغيير كلمة المرور', 'الملف الشخصي', {}); notify('تم تغيير كلمة المرور');
  }
  return (
    <div className="grid">
      <div className="card"><Avatar p={me} /><p>صورتي الشخصية</p><input type="file" accept="image/*" onChange={upload} /></div>
      <div className="card"><p>الاسم</p><input value={name} onChange={e => setName(e.target.value)} /><p><button onClick={saveName}>حفظ الاسم</button></p></div>
      <div className="card"><p>كلمة مرور جديدة</p><input type="password" dir="ltr" value={pw} onChange={e => setPw(e.target.value)} /><p><button onClick={savePw}>تغيير كلمة المرور</button></p></div>
    </div>
  );
}

export default function Page() {
  const [session, setSession] = useState(undefined); const [me, setMe] = useState(null); const [tab, setTab] = useState('dash'); const [welcome, setWelcome] = useState(false); const [toast, setToast] = useState('');
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: l } = sb.auth.onAuthStateChange((_, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!session) { setMe(null); return; }
    sb.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => {
      const p = data || { id: session.user.id, email: session.user.email, full_name: session.user.email, role: 'viewer', active: true };
      if (!p.active) { sb.auth.signOut(); return; }
      setMe(p); setWelcome(true);
    });
  }, [session?.user?.id]);
  const notify = m => { setToast(m); setTimeout(() => setToast(''), 3200); };
  const log = (action, entity, details = {}) => sb.from('activity_log').insert({ user_id: me.id, user_name: me.full_name, action, entity, details });

  if (session === undefined) return <div className="center">جارٍ التحميل…</div>;
  if (!session) return <Login />;
  if (!me) return <div className="center">جارٍ التحميل…</div>;
  const allowed = ALLOWED[me.role] || ALLOWED.viewer; const canEdit = me.role !== 'viewer';
  const P = { me, log, notify, canEdit };
  return (
    <div className="wrap">
      <div className="top">
        <div className="brand"><img src="/favicon-512.png" alt="" /><div><b>Cionpip</b><small>Forex &amp; Crypto Trading</small></div></div>
        <div className="who"><span>{todayStr()}</span><Avatar p={me} /><span>{me.full_name} ({ROLES[me.role]})</span><button className="ghost" onClick={() => sb.auth.signOut()}>خروج</button></div>
      </div>
      <div className="tabs">{allowed.map(k => <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{TABS[k]}</button>)}</div>
      {tab === 'dash' && <Dash />}
      {tab === 'tx' && <Tx {...P} />}
      {tab === 'inv' && <Inv {...P} />}
      {tab === 'rep' && <Rep {...P} />}
      {tab === 'act' && <Act />}
      {tab === 'users' && <Users {...P} />}
      {tab === 'me' && <Me {...P} setMe={setMe} />}
      {welcome && (
        <div className="overlay"><div className="card modal">
          <Avatar p={me} /><h2>مرحباً {me.full_name}</h2><p>أهلاً بعودتك إلى نظام Cionpip المالي</p><p><small>{todayStr()}</small></p>
          <button onClick={() => setWelcome(false)}>ابدأ</button>
        </div></div>
      )}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
