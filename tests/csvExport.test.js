import test from 'node:test';
import assert from 'node:assert/strict';
import { serializeCsv } from '../src/csvExport.js';

test('serializes values with headers, escaping quotes, commas and newlines', () => {
  assert.equal(serializeCsv([{ name: 'rice, "red"', details: 'first\nsecond' }], ['name', 'details']), '"rice, ""red""","first\nsecond"');
});

test('neutralizes spreadsheet formula markers at the start of user text', () => {
  const rows = ['=1+1', '+cmd', '-cmd', '@SUM(A1:A2)'].map(value => ({ note: value }));
  assert.equal(serializeCsv(rows, ['note']), '"\'=1+1"\n"\'+cmd"\n"\'-cmd"\n"\'@SUM(A1:A2)"');
});

test('recognizes leading whitespace and control characters before formula markers', () => {
  const rows = [' =1+1', '\t+cmd', '\r\n@SUM(A1:A2)', '\uFEFF-cmd'].map(value => ({ note: value }));
  assert.equal(serializeCsv(rows, ['note']), '"\' =1+1"\n"\'\t+cmd"\n"\'\r\n@SUM(A1:A2)"\n"\'\uFEFF-cmd"');
});

test('leaves numeric values numeric while protecting text that looks negative', () => {
  assert.equal(serializeCsv([{ number: -12.5, text: '-12.5' }], ['number', 'text']), '"-12.5","\'-12.5"');
});

test('serializes missing values as empty quoted cells', () => {
  assert.equal(serializeCsv([{ present: null }, {}], ['present', 'missing']), '"",""\n"",""');
});
