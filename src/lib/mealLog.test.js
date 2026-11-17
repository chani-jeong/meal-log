import test from 'node:test';
import assert from 'node:assert/strict';
import { MEAL_TYPES, groupByMealType, mealTotal } from './mealLog.js';

const zero = { kcal: 0, protein: 0, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 0 };
const item = (mealType, kcal) => ({ mealType, name: '음식', amount: 100, nutrients: { ...zero, kcal } });

test('끼니별로 기록을 나눈다', () => {
  const groups = groupByMealType([item('breakfast', 100), item('lunch', 200), item('breakfast', 50)]);
  assert.equal(groups.breakfast.length, 2);
  assert.equal(groups.lunch.length, 1);
  assert.equal(groups.dinner.length, 0);
});

test('모든 끼니 키를 항상 포함한다', () => {
  const groups = groupByMealType([]);
  assert.deepEqual(Object.keys(groups).sort(), MEAL_TYPES.map((m) => m.key).sort());
});

test('끼니 합계를 계산한다', () => {
  const total = mealTotal([item('lunch', 100), item('lunch', 250)]);
  assert.equal(total.kcal, 350);
});

test('알 수 없는 끼니 종류는 무시한다', () => {
  const groups = groupByMealType([item('brunch', 100)]);
  assert.equal(Object.values(groups).flat().length, 0);
});