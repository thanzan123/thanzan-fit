import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
globalThis.crypto ??= webcrypto;
import { derivePhotoVaultKey, encryptPhotoPayload, decryptPhotoPayload, isValidPhotoDate } from '../src/privatePhotoVault.js';

const payload = { date: '2026-11-11', note: 'front view', type: 'image/jpeg', bytes: 'c2Vuc2l0aXZlLXBob3RvLWJ5dGVz' };

test('photo vault encryption round-trips metadata and image bytes', async () => {
  const key = await derivePhotoVaultKey('correct horse battery staple', new Uint8Array(16).fill(7));
  const record = await encryptPhotoPayload(key, payload, new Uint8Array(12).fill(9));
  assert.deepEqual(await decryptPhotoPayload(key, record), payload);
  assert.equal(new TextDecoder().decode(record.ciphertext).includes('front view'), false);
});

test('photo vault ciphertext cannot be decrypted with a different key', async () => {
  const salt = new Uint8Array(16).fill(3);
  const key = await derivePhotoVaultKey('first passphrase', salt);
  const otherKey = await derivePhotoVaultKey('different passphrase', salt);
  const record = await encryptPhotoPayload(key, payload);
  await assert.rejects(() => decryptPhotoPayload(otherKey, record));
});

test('photo vault authentication rejects modified ciphertext', async () => {
  const key = await derivePhotoVaultKey('correct horse battery staple', new Uint8Array(16).fill(4));
  const record = await encryptPhotoPayload(key, payload);
  const altered = record.ciphertext.slice(0);
  new Uint8Array(altered)[0] ^= 1;
  await assert.rejects(() => decryptPhotoPayload(key, { ...record, ciphertext: altered }));
});

test('photo dates reject impossible calendar days', () => {
  assert.equal(isValidPhotoDate('2026-02-28'), true);
  assert.equal(isValidPhotoDate('2024-02-29'), true);
  assert.equal(isValidPhotoDate('2026-02-29'), false);
  assert.equal(isValidPhotoDate('2026-04-31'), false);
  assert.equal(isValidPhotoDate('2026-13-01'), false);
});

test('encrypted photo-vault backups preserve ciphertext and restore metadata through the passphrase', async () => {
  const { serializePhotoVaultBackup, parsePhotoVaultBackup } = await import('../src/privatePhotoVault.js');
  const salt = new Uint8Array(16).fill(11);
  const key = await derivePhotoVaultKey('private backup phrase', salt);
  const config = { id: 'config', salt: Buffer.from(salt).toString('base64'), ...await encryptPhotoPayload(key, { check: 'thanzan-fit-photo-vault-check-v1' }, new Uint8Array(12).fill(12)), iterations: 250000 };
  const photo = { date: '2026-11-12', note: 'front', type: 'image/jpeg', bytes: Buffer.from([1, 2, 3, 4]).toString('base64') };
  const encrypted = await encryptPhotoPayload(key, photo, new Uint8Array(12).fill(13));
  const json = serializePhotoVaultBackup(config, [{ id: 'photo-1', ...encrypted }]);
  const restored = parsePhotoVaultBackup(json);
  const restoredKey = await derivePhotoVaultKey('private backup phrase', Buffer.from(restored.config.salt, 'base64'));
  assert.deepEqual(await decryptPhotoPayload(restoredKey, restored.config), { check: 'thanzan-fit-photo-vault-check-v1' });
  assert.deepEqual(await decryptPhotoPayload(restoredKey, restored.photos[0]), photo);
  assert.equal(JSON.stringify(restored).includes('front'), false);
});

test('photo-vault backup parser rejects unsupported and malformed data', async () => {
  const { parsePhotoVaultBackup } = await import('../src/privatePhotoVault.js');
  assert.throws(() => parsePhotoVaultBackup('{bad json'), /not a readable photo-vault backup/);
  assert.throws(() => parsePhotoVaultBackup({ format: 'other', version: 1, config: {}, photos: [] }), /not a supported/);
  assert.throws(() => parsePhotoVaultBackup({ format: 'thanzan-fit-encrypted-photo-vault', version: 1, config: { id: 'config', salt: 'x', iv: 'x', iterations: 1, ciphertext: 'x' }, photos: [] }), /invalid vault settings/);
  assert.throws(() => parsePhotoVaultBackup({ format: 'thanzan-fit-encrypted-photo-vault', version: 1, config: { id: 'config', salt: 'c2FsdA==', iv: 'aXY=', iterations: 250000, ciphertext: 'Y2lwaGVydGV4dA==' }, photos: [{ id: 'same', iv: 'aXY=', ciphertext: 'YQ==' }, { id: 'same', iv: 'aXY=', ciphertext: 'Yg==' }] }), /invalid photo record/);
});
