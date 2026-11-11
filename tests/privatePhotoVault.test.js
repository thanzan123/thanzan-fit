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
