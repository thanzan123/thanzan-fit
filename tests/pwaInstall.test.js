import test from 'node:test';
import assert from 'node:assert/strict';
import { isStandaloneMode, shouldShowIosInstallGuide } from '../src/pwaInstall.js';

test('recognizes installed standalone PWAs across browser modes', () => {
  assert.equal(isStandaloneMode(true, false), true);
  assert.equal(isStandaloneMode(false, true), true);
  assert.equal(isStandaloneMode(false, false), false);
});

test('shows manual install guidance only for an uninstalled iOS device', () => {
  assert.equal(shouldShowIosInstallGuide(true, false), true);
  assert.equal(shouldShowIosInstallGuide(true, true), false);
  assert.equal(shouldShowIosInstallGuide(false, false), false);
});
