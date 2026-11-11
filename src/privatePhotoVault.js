const DB_NAME = 'thanzan-fit-private-photos-v1';
const DB_VERSION = 1;
const CONFIG_KEY = 'config';
const CHECK_TEXT = 'thanzan-fit-photo-vault-check-v1';
const ITERATIONS = 250000;

const bytesToBase64 = bytes => {
  let binary = '';
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < data.length; i += 0x8000) binary += String.fromCharCode(...data.subarray(i, i + 0x8000));
  return btoa(binary);
};
const base64ToBytes = value => Uint8Array.from(atob(value), char => char.charCodeAt(0));

export function photoVaultSupported() {
  return !!(globalThis.crypto?.subtle && globalThis.indexedDB);
}

export async function derivePhotoVaultKey(passphrase, salt, usages = ['encrypt', 'decrypt']) {
  if (!globalThis.crypto?.subtle) throw new Error('Secure encryption is not available in this browser.');
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, usages);
}

export async function encryptPhotoPayload(key, payload, iv = crypto.getRandomValues(new Uint8Array(12))) {
  const plaintext = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);
  return { iv: bytesToBase64(iv), ciphertext };
}

export async function decryptPhotoPayload(key, record) {
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base64ToBytes(record.iv) }, key, record.ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext));
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (!photoVaultSupported()) return reject(new Error('Secure local storage is not available in this browser.'));
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('config')) db.createObjectStore('config', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open the photo vault.'));
    request.onblocked = () => reject(new Error('The photo vault is busy in another tab. Close the other tab and try again.'));
  });
}

function requestResult(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('The photo vault could not complete that action.'));
  });
}
function transactionDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onabort = () => reject(tx.error || new Error('The photo vault could not save that change.'));
    tx.onerror = () => reject(tx.error || new Error('The photo vault could not save that change.'));
  });
}
async function withDb(action) {
  const db = await openDb();
  try { return await action(db); } finally { db.close(); }
}

export async function inspectPhotoVault() {
  return withDb(async db => {
    const tx = db.transaction(['config', 'photos'], 'readonly');
    const done = transactionDone(tx);
    const [config, count] = await Promise.all([
      requestResult(tx.objectStore('config').get(CONFIG_KEY)),
      requestResult(tx.objectStore('photos').count()),
    ]);
    await done;
    return { exists: !!config, count };
  });
}

export async function createPhotoVault(passphrase) {
  if (typeof passphrase !== 'string' || passphrase.length < 8) throw new Error('Use at least 8 characters for the vault passphrase.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await derivePhotoVaultKey(passphrase, salt);
  const check = await encryptPhotoPayload(key, { check: CHECK_TEXT });
  await withDb(async db => {
    const tx = db.transaction('config', 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore('config').add({ id: CONFIG_KEY, salt: bytesToBase64(salt), ...check, iterations: ITERATIONS });
    await done;
  });
  return key;
}

export async function unlockPhotoVault(passphrase) {
  return withDb(async db => {
    const tx = db.transaction('config', 'readonly');
    const done = transactionDone(tx);
    const config = await requestResult(tx.objectStore('config').get(CONFIG_KEY));
    await done;
    if (!config) throw new Error('Create a photo vault first.');
    const key = await derivePhotoVaultKey(passphrase, base64ToBytes(config.salt));
    try {
      const result = await decryptPhotoPayload(key, config);
      if (result.check !== CHECK_TEXT) throw new Error('That passphrase did not unlock the photo vault.');
    } catch {
      throw new Error('That passphrase did not unlock the photo vault.');
    }
    return key;
  });
}

export function isValidPhotoDate(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export async function addVaultPhoto(key, { blob, date, note = '' }) {
  if (!(blob instanceof Blob) || !blob.type.startsWith('image/')) throw new Error('Choose an image file.');
  if (!isValidPhotoDate(date)) throw new Error('Choose a valid photo date.');
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const encrypted = await encryptPhotoPayload(key, { date, note: String(note).slice(0, 160), type: blob.type, bytes: bytesToBase64(bytes) });
  const row = { id: crypto.randomUUID(), ...encrypted };
  await withDb(async db => {
    const tx = db.transaction('photos', 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore('photos').add(row);
    await done;
  });
  return row.id;
}

export async function readVaultPhotos(key) {
  return withDb(async db => {
    const tx = db.transaction('photos', 'readonly');
    const done = transactionDone(tx);
    const rows = await requestResult(tx.objectStore('photos').getAll());
    await done;
    const photos = await Promise.all(rows.map(async row => {
      const payload = await decryptPhotoPayload(key, row);
      const blob = new Blob([base64ToBytes(payload.bytes)], { type: payload.type || 'image/jpeg' });
      return { id: row.id, date: payload.date, note: payload.note, blob };
    }));
    return photos.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
  });
}

export async function deleteVaultPhoto(id) {
  await withDb(async db => {
    const tx = db.transaction('photos', 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore('photos').delete(id);
    await done;
  });
}

export async function clearPhotoVault() {
  if (!globalThis.indexedDB) return;
  await withDb(async db => {
    const tx = db.transaction(['config', 'photos'], 'readwrite');
    const done = transactionDone(tx);
    tx.objectStore('config').clear();
    tx.objectStore('photos').clear();
    await done;
  });
}
