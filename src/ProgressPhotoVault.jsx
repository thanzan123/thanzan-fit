import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, LockKeyhole, UnlockKeyhole, X } from 'lucide-react';
import { addVaultPhoto, clearPhotoVault, deleteVaultPhoto, inspectPhotoVault, photoVaultSupported, readVaultPhotos, unlockPhotoVault, createPhotoVault } from './privatePhotoVault.js';

const localDate = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

async function prepareImage(file) {
  if (!file || !file.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (file.size > 20 * 1024 * 1024) throw new Error('Choose a photo under 20 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('This browser could not prepare the photo.');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve, reject) => canvas.toBlob(value => value ? resolve(value) : reject(new Error('This browser could not prepare the photo.')), 'image/jpeg', 0.82));
    if (blob.size > 8 * 1024 * 1024) throw new Error('This photo is still too large after resizing. Choose a smaller image.');
    return blob;
  } finally {
    bitmap.close?.();
  }
}

export default function ProgressPhotoVault({ onNotify }) {
  const [vault, setVault] = useState({ loading: true, exists: false, count: 0 });
  const [key, setKey] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [urls, setUrls] = useState({});
  const [passphrase, setPassphrase] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [date, setDate] = useState(localDate());
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [beforeId, setBeforeId] = useState('');
  const [afterId, setAfterId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const urlsRef = useRef([]);

  useEffect(() => {
    let active = true;
    inspectPhotoVault().then(result => active && setVault({ loading: false, ...result }))
      .catch(err => active && setVault({ loading: false, exists: false, count: 0, error: err.message }));
    return () => { active = false; urlsRef.current.forEach(URL.revokeObjectURL); };
  }, []);

  const refreshPhotos = async secretKey => {
    const rows = await readVaultPhotos(secretKey);
    urlsRef.current.forEach(URL.revokeObjectURL);
    const nextUrls = {};
    for (const row of rows) nextUrls[row.id] = URL.createObjectURL(row.blob);
    urlsRef.current = Object.values(nextUrls);
    setPhotos(rows);
    setUrls(nextUrls);
    setBeforeId(previous => rows.some(row => row.id === previous) ? previous : rows[0]?.id || '');
    setAfterId(previous => rows.some(row => row.id === previous) ? previous : rows.at(-1)?.id || '');
  };

  const retryInspect = async () => {
    setVault(current => ({ ...current, loading: true, error: undefined }));
    try { setVault({ loading: false, ...(await inspectPhotoVault()) }); }
    catch (err) { setVault({ loading: false, exists: false, count: 0, error: err.message || 'Could not check this browser.' }); }
  };

  const submitPassphrase = async event => {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const unlockedKey = vault.exists ? await unlockPhotoVault(passphrase) : await createPhotoVault(passphrase);
      setKey(unlockedKey);
      setPassphrase(''); setConfirmPassphrase('');
      await refreshPhotos(unlockedKey);
      setVault(current => ({ ...current, loading: false, exists: true }));
      onNotify(vault.exists ? 'Private photo vault unlocked' : 'Private photo vault created');
    } catch (err) { setError(err.message || 'Could not open the photo vault.'); }
    finally { setBusy(false); }
  };

  const savePhoto = async event => {
    event.preventDefault();
    if (!key || !file) return;
    setBusy(true); setError('');
    try {
      const image = await prepareImage(file);
      await addVaultPhoto(key, { blob: image, date, note });
      await refreshPhotos(key);
      const status = await inspectPhotoVault();
      setVault(current => ({ ...current, ...status }));
      setFile(null); setNote('');
      const input = document.getElementById('progress-photo-file'); if (input) input.value = '';
      onNotify('Encrypted progress photo saved');
    } catch (err) { setError(err.message || 'Could not save this photo.'); }
    finally { setBusy(false); }
  };

  const removePhoto = async item => {
    if (!window.confirm(`Delete the private photo dated ${item.date}? This cannot be undone.`)) return;
    setBusy(true); setError('');
    try {
      await deleteVaultPhoto(item.id);
      await refreshPhotos(key);
      const status = await inspectPhotoVault();
      setVault(current => ({ ...current, ...status }));
      onNotify('Private photo deleted');
    } catch (err) { setError(err.message || 'Could not delete this photo.'); }
    finally { setBusy(false); }
  };

  const lockVault = () => {
    urlsRef.current.forEach(URL.revokeObjectURL);
    urlsRef.current = [];
    setUrls({}); setPhotos([]); setKey(null); setError('');
  };

  const eraseVault = async () => {
    if (!window.confirm('Delete the photo vault and every encrypted photo from this browser? This cannot be undone.')) return;
    setBusy(true); setError('');
    try {
      await clearPhotoVault(); lockVault(); setVault({ loading: false, exists: false, count: 0 });
      onNotify('Photo vault and its photos deleted');
    } catch (err) { setError(err.message || 'Could not delete the photo vault.'); }
    finally { setBusy(false); }
  };

  const before = photos.find(item => item.id === beforeId);
  const after = photos.find(item => item.id === afterId);

  return <section className="card private-photo-vault">
    <div className="card-head"><div><span className="eyebrow">PRIVATE PROGRESS</span><h2>Photo vault</h2><p className="muted">Compare dated photos over time, encrypted on this browser.</p></div><LockKeyhole size={19}/></div>
    <p className="method-note photo-privacy-note">Your photos are encrypted with a passphrase before they’re saved in this browser. They aren’t uploaded, synced, included in app backups, or recoverable if you forget the passphrase. This is local encrypted storage—not cloud photo storage.</p>
    {vault.loading ? <p className="empty-state">Checking this browser for a photo vault…</p> : !photoVaultSupported() ? <p className="empty-state">This browser does not support secure local photo storage.</p> : vault.error && !key ? <div className="photo-vault-error-state"><p className="photo-vault-error" role="alert">Could not check local photo storage: {vault.error}</p><button type="button" className="button ghost" onClick={retryInspect}>Try again</button></div> : !key ? <form className="photo-vault-unlock" onSubmit={submitPassphrase}>
      {vault.error && <p className="method-note">{vault.error}</p>}
      <label className="field"><span>{vault.exists ? 'Vault passphrase' : 'Create a vault passphrase'}</span><input type="password" autoComplete="new-password" minLength="8" value={passphrase} onChange={event=>setPassphrase(event.target.value)} required placeholder={vault.exists ? 'Enter your passphrase' : 'At least 8 characters'} /></label>
      {!vault.exists && <label className="field"><span>Confirm passphrase</span><input type="password" autoComplete="new-password" minLength="8" value={confirmPassphrase} onChange={event=>setConfirmPassphrase(event.target.value)} required placeholder="Re-enter passphrase" /></label>}
      {error && <p className="photo-vault-error" role="alert">{error}</p>}
      <button className="button primary" type="submit" disabled={busy || (!vault.exists && passphrase !== confirmPassphrase)}>{busy ? 'Opening…' : vault.exists ? <><UnlockKeyhole size={15}/>Unlock vault</> : <><LockKeyhole size={15}/>Create private vault</>}</button>
      {!vault.exists&&<p className="method-note">Choose a passphrase you can keep safely; the app cannot reset or recover it.</p>}
    </form> : <>
      <div className="photo-vault-status"><span>{photos.length} {photos.length===1?'photo':'photos'} · unlocked for this screen</span><button type="button" className="text-button" onClick={lockVault}>Lock vault</button></div>
      <form className="photo-add-form" onSubmit={savePhoto}>
        <label className="field photo-file-field"><span>Choose a photo</span><input id="progress-photo-file" type="file" accept="image/*" capture="environment" required onChange={event=>setFile(event.target.files?.[0]||null)}/></label>
        <label className="field"><span>Date taken</span><input type="date" value={date} onChange={event=>setDate(event.target.value)} required/></label>
        <label className="field"><span>Note · optional</span><input type="text" maxLength="160" value={note} onChange={event=>setNote(event.target.value)} placeholder="e.g. front, relaxed"/></label>
        <button className="button primary photo-save-button" type="submit" disabled={!file||busy}><ImagePlus size={15}/>{busy?'Saving…':'Encrypt & save'}</button>
      </form>
      {error&&<p className="photo-vault-error" role="alert">{error}</p>}
      {photos.length>1&&<div className="photo-comparison">
        <div className="card-head"><div><h3>Compare two dates</h3><p className="muted">Photos are shown at their original proportions.</p></div></div>
        <div className="photo-compare-controls">
          <label className="field"><span>Earlier</span><select value={beforeId} onChange={event=>setBeforeId(event.target.value)}>{photos.map(item=><option key={item.id} value={item.id} disabled={item.id===afterId}>{item.date}{item.note?` · ${item.note}`:''}</option>)}</select></label>
          <label className="field"><span>Later</span><select value={afterId} onChange={event=>setAfterId(event.target.value)}>{photos.map(item=><option key={item.id} value={item.id} disabled={item.id===beforeId}>{item.date}{item.note?` · ${item.note}`:''}</option>)}</select></label>
        </div>
        <div className="photo-compare-grid">{[before,after].map((item,index)=>item&&<figure key={`${index}-${item.id}`}><img src={urls[item.id]} alt={`${index===0?'Earlier':'Later'} progress photo${item.note?`: ${item.note}`:''}`} /><figcaption><strong>{index===0?'Earlier':'Later'} · {item.date}</strong>{item.note&&<span>{item.note}</span>}</figcaption></figure>)}</div>
      </div>}
      {photos.length>0 ? <div className="photo-library"><div className="photo-library-heading"><strong>Saved photos</strong><span>Newest first</span></div>{photos.slice().reverse().map(item=><div className="photo-row" key={item.id}><img src={urls[item.id]} alt={`Progress photo from ${item.date}`} /><div><strong>{item.date}</strong>{item.note&&<small>{item.note}</small>}</div><button type="button" className="icon-button" aria-label={`Delete progress photo ${item.date}`} disabled={busy} onClick={()=>removePhoto(item)}><X size={16}/></button></div>)}</div> : <p className="empty-state">No photos saved yet. Choose a photo and date to start your private comparison history.</p>}
      <button type="button" className="button ghost danger" disabled={busy} onClick={eraseVault}>Delete photo vault</button>
    </>}
  </section>;
}
