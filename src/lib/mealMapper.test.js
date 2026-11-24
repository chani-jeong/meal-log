import test from 'node:test';
import assert from 'node:assert/strict';
import { toMealData, fromMealData } from './mealMapper.js';

test('저장할 때 화면 전용 id는 빼고 필요한 필드만 남긴다', () => {
  const data = toMealData({
    id: 'temp-1', date: '2026-11-24', mealType: 'lunch', name: '닭가슴살', amount: '150',
    nutrients: { kcal: 247.5, protein: 46.5 },
  });
  assert.equal('id' in data, false);
  assert.equal(data.amount, 150);
  assert.equal(data.nutrients.kcal, 247.5);
  assert.equal(data.nutrients.sodium, 0);
});

test('읽을 때 빠진 값을 기본값으로 채운다', () => {
  const item = fromMealData('abc', { date: '2026-11-24', name: '현미밥', amount: 210 });
  assert.equal(item.id, 'abc');
  assert.equal(item.mealType, 'snack');
  assert.equal(item.nutrients.kcal, 0);
  assert.equal(item.createdAtMs, 0);
});

test('Firestore 시간 값을 밀리초로 바꾼다', () => {
  const item = fromMealData('x', { createdAt: { toMillis: () => 1234 } });
  assert.equal(item.createdAtMs, 1234);
});
