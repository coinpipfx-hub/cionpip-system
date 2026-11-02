import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const admin = () => createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function guard(req) {
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
  const a = admin();
  const { data: { user } } = await a.auth.getUser(token);
  if (!user) return null;
  const { data: p } = await a.from('profiles').select('role,active').eq('id', user.id).single();
  return p && p.role === 'admin' && p.active ? { a, user } : null;
}
const fail = (m, s = 400) => NextResponse.json({ error: m }, { status: s });

export async function POST(req) {
  const g = await guard(req); if (!g) return fail('غير مصرّح', 403);
  const { email, password, full_name, role } = await req.json();
  if (!email || !password || password.length < 6) return fail('البريد وكلمة مرور (6 أحرف على الأقل) مطلوبان');
  const { data, error } = await g.a.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) return fail(error.message);
  const { error: e2 } = await g.a.from('profiles').upsert({ id: data.user.id, email, full_name: full_name || email.split('@')[0], role: role || 'viewer' });
  if (e2) return fail(e2.message);
  return NextResponse.json({ ok: true });
}

export async function PATCH(req) {
  const g = await guard(req); if (!g) return fail('غير مصرّح', 403);
  const { id, password, role, active } = await req.json();
  if (password) {
    if (password.length < 6) return fail('كلمة المرور قصيرة');
    const { error } = await g.a.auth.admin.updateUserById(id, { password });
    if (error) return fail(error.message);
  }
  const patch = {};
  if (role) patch.role = role;
  if (typeof active === 'boolean') patch.active = active;
  if (Object.keys(patch).length) {
    if (id === g.user.id) return fail('لا يمكنك تعديل صلاحية حسابك أو تعطيله');
    const { error } = await g.a.from('profiles').update(patch).eq('id', id);
    if (error) return fail(error.message);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const g = await guard(req); if (!g) return fail('غير مصرّح', 403);
  const { id } = await req.json();
  if (id === g.user.id) return fail('لا يمكنك حذف حسابك');
  const { error } = await g.a.auth.admin.deleteUser(id);
  if (error) return fail(error.message);
  return NextResponse.json({ ok: true });
}
