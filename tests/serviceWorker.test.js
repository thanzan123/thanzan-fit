import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

async function loadWorker({ fetchImpl, matchImpl }) {
  const source = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
  const listeners = {};
  const put = [];
  const self = {
    location: { href: 'https://example.test/thanzan-fit/sw.js', origin: 'https://example.test' },
    clients: { claim: async () => {} },
    skipWaiting: async () => {},
    addEventListener: (name, callback) => { listeners[name] = callback; },
  };
  const caches = {
    open: async () => ({ addAll: async () => {}, put: async (...args) => put.push(args) }),
    match: matchImpl,
    keys: async () => ['thanzan-fit-v1', 'thanzan-fit-v2'],
    delete: async () => true,
  };
  vm.runInNewContext(source, { self, caches, fetch: fetchImpl, URL, Promise });
  return { listeners, put };
}

function navigationEvent() {
  let response;
  return { request: { method: 'GET', mode: 'navigate', url: 'https://example.test/thanzan-fit/' }, respondWith: promise => { response = promise; }, get response() { return response; } };
}

test('service worker fetches navigations before using cached app shell', async () => {
  const fresh = { ok: true, marker: 'fresh index', clone() { return this; } };
  let fetched = false;
  const { listeners, put } = await loadWorker({ fetchImpl: async () => { fetched = true; return fresh; }, matchImpl: async () => ({ marker: 'stale cached index' }) });
  const event = navigationEvent();
  listeners.fetch(event);
  const response = await event.response;
  assert.equal(fetched, true);
  assert.equal(response.marker, 'fresh index');
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(put.length, 1);
});

test('service worker falls back to the cached app shell when a navigation is offline', async () => {
  const cached = { marker: 'cached app shell' };
  const { listeners } = await loadWorker({ fetchImpl: async () => { throw new Error('offline'); }, matchImpl: async key => typeof key === 'string' ? cached : null });
  const event = navigationEvent();
  listeners.fetch(event);
  assert.equal((await event.response).marker, 'cached app shell');
});
