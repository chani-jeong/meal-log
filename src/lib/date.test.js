import test from 'node:test';
import assert from 'node:assert/strict';
import { toDateKey, validateRecordDate } from './date.js';

test('날짜를 YYYY-MM-DD로 바꾼다', () => {
  assert.equal(toDateKey(new Date(2026, 0, 5)), '2026-01-05');
});

test('오늘과 과거 날짜는 허용하고 미래 날짜는 거절한다', () => {
  assert.equal(validateRecordDate('2026-11-24', '2026-11-24'), null);
  assert.equal(validateRecordDate('2026-11-20', '2026-11-24'), null);
  assert.ok(validateRecordDate('2026-11-25', '2026-11-24'));
});

test('형식이 잘못된 날짜를 거절한다', () => {
  assert.ok(validateRecordDate(''));
  assert.ok(validateRecordDate('2026/11/24'));
});
