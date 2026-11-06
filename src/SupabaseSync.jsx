import React, { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function SupabaseSync({ data, theme, onLoadCloud }) {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState('');
  const [cloudRecord, setCloudRecord] = useState(null);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!supabase) return undefined;
    let alive = true;
    supabase.auth.getSession().then(({ data: result, error }) => {
      if (!alive) return;
      if (error) setMessage(error.message);
      setSession(result?.session ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCloudRecord(null);
      setChecked(false);
      setMessage('');
    });
    return () => { alive = false; listener.subscription.unsubscribe(); };
  }, []);

  const sendSignInLink = async (event) => {
    event.preventDefault();
    if (!supabase || !email.trim()) return;
    setBusy(true); setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.href.split('#')[0] },
    });
    setBusy(false);
    setMessage(error ? error.message : 'Sign-in link sent. Open it on this device to continue.');
  };

  const inspectCloud = async () => {
    if (!supabase || !session) return;
    setBusy(true); setMessage('');
    const { data: row, error } = await supabase.from('fitness_records')
      .select('payload,updated_at').eq('user_id', session.user.id).maybeSingle();
    setBusy(false);
    if (error) { setMessage(`Could not read cloud data: ${error.message}`); return; }
    setCloudRecord(row || null); setChecked(true);
    setMessage(row ? `Cloud copy found · updated ${new Date(row.updated_at).toLocaleString()}.` : 'No cloud copy yet.');
  };

  const saveToCloud = async () => {
    if (!supabase || !session || !checked) return;
    const verb = cloudRecord ? 'Replace the existing cloud copy' : 'Save this browser’s records to your cloud account';
    const detail = cloudRecord ? 'This replaces the full cloud record. It does not merge with this browser’s data.' : 'This uploads the full fitness record from this browser. It does not delete local data.';
    if (!window.confirm(`${verb}?\n\n${detail}`)) return;
    setBusy(true); setMessage('');
    const payload = { ...data, theme };
    const { error } = await supabase.from('fitness_records').upsert({
      user_id: session.user.id, payload, updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setBusy(false);
    if (error) { setMessage(`Cloud save failed: ${error.message}`); return; }
    const row = { payload, updated_at: new Date().toISOString() };
    setCloudRecord(row); setChecked(true);
    setMessage('Saved to your Supabase account.');
  };

  const loadFromCloud = () => {
    if (!cloudRecord?.payload || typeof cloudRecord.payload !== 'object' || Array.isArray(cloudRecord.payload)) return;
    if (!window.confirm('Replace the records in this browser with the cloud copy? This does not merge records.')) return;
    onLoadCloud(cloudRecord.payload);
    setMessage('Cloud copy loaded into this browser.');
  };

  const signOut = async () => {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.signOut();
    setBusy(false);
    setCloudRecord(null); setChecked(false);
    setMessage(error ? `Sign out failed: ${error.message}` : 'Signed out. Local records remain on this device.');
  };

  if (!supabase) return <section className="card"><div className="card-head"><div><h2>Supabase sync · setup needed</h2><p className="muted">Cloud sync is not active yet. Your records remain in this browser.</p></div></div><p className="method-note">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the build environment, then create the table with the included supabase/schema.sql. Never use a service-role key in this browser app.</p></section>;

  return <section className="card"><div className="card-head"><div><h2>Supabase cloud copy</h2><p className="muted">Manual, account-only backup. Nothing uploads unless you choose Save.</p></div><span className="date-pill">{session ? 'Signed in' : 'Not signed in'}</span></div>
    {!session ? <form className="quick-inline" onSubmit={sendSignInLink}><label className="field"><span>Email for Supabase sign-in</span><input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" /></label><button className="button primary" disabled={busy} type="submit">{busy?'Sending…':'Email sign-in link'}</button></form> : <>
      <p className="muted">Signed in as {session.user.email || 'your Supabase account'}.</p>
      <div className="button-row"><button className="button soft" disabled={busy} onClick={inspectCloud}>Check cloud copy</button>{checked&&<button className="button primary" disabled={busy} onClick={saveToCloud}>{cloudRecord?'Replace cloud copy':'Save this browser to cloud'}</button>}{cloudRecord&&<button className="button soft" disabled={busy} onClick={loadFromCloud}>Load cloud copy here</button>}<button className="button ghost" disabled={busy} onClick={signOut}>Sign out</button></div>
      <p className="method-note">Upload and download replace one whole copy; they never merge automatically. Keep a JSON backup before replacing data. Cloud storage is protected by Supabase row-level security, but this app does not encrypt records end-to-end.</p>
    </>}
    {message&&<p className="method-note" role="status">{message}</p>}
  </section>;
}
