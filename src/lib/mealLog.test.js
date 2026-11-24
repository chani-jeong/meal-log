import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MEAL_TYPES,
  groupByMealType,
  mealTotal,
  addOrMergeItem,
  removeItem,
  changeAmount,
} from './mealLog.js';

const zero = { kcal: 0, protein: 0, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 0 };

const make = (overrides = {}) => ({
  id: Math.random().toString(),
  mealType: 'lunch',
  name: '닭가슴살',
  amount: 100,
  nutrients: { ...zero, kcal: 165, protein: 31 },
  ...overrides,
});

test('끼니별로 기록을 나눈다', () => {
  const groups = groupByMealType([
    make({ mealType: 'breakfast' }),
    make({ mealType: 'lunch' }),
    make({ mealType: 'breakfast' }),
  ]);
  assert.equal(groups.breakfast.length, 2);
  assert.equal(groups.lunch.length, 1);
  assert.equal(groups.dinner.length, 0);
});

test('모든 끼니 키를 항상 포함한다', () => {
  const groups = groupByMealType([]);
  assert.deepEqual(Object.keys(groups).sort(), MEAL_TYPES.map((m) => m.key).sort());
});

test('끼니 합계를 계산한다', () => {
  const total = mealTotal([
    make({ nutrients: { ...zero, kcal: 100 } }),
    make({ nutrients: { ...zero, kcal: 250 } }),
  ]);
  assert.equal(total.kcal, 350);
});

test('알 수 없는 끼니 종류는 무시한다', () => {
  const groups = groupByMealType([make({ mealType: 'brunch' })]);
  assert.equal(Object.values(groups).flat().length, 0);
});

test('같은 끼니의 같은 음식은 수량과 영양값을 합친다', () => {
  const first = make({ amount: 100, nutrients: { ...zero, kcal: 165, protein: 31 } });
  const second = make({ amount: 50, nutrients: { ...zero, kcal: 82.5, protein: 15.5 } });
  const result = addOrMergeItem([first], second);

  assert.equal(result.items.length, 1);
  assert.equal(result.merged, true);
  assert.equal(result.items[0].id, first.id);
  assert.equal(result.items[0].amount, 150);
  assert.equal(result.items[0].nutrients.kcal, 247.5);
  assert.equal(result.items[0].nutrients.protein, 46.5);
});

test('다른 끼니에 같은 음식이면 합치지 않고 새 기록으로 추가한다', () => {
  const result = addOrMergeItem([make({ mealType: 'lunch' })], make({ mealType: 'dinner' }));
  assert.equal(result.items.length, 2);
  assert.equal(result.merged, false);
});

test('합계가 2000g을 넘으면 거절한다', () => {
  const result = addOrMergeItem([make({ amount: 1500 })], make({ amount: 600 }));
  assert.ok(result.error);
  assert.equal(result.items.length, 1);
  assert.equal(result.items[0].amount, 1500);
});

test('id로 기록을 삭제한다', () => {
  const a = make();
  const b = make();
  assert.deepEqual(removeItem([a, b], a.id), [b]);
});

test('섭취량을 바꾸면 영양값을 같은 비율로 다시 계산한다', () => {
  const item = make({ amount: 100, nutrients: { ...zero, kcal: 165, protein: 31 } });
  const changed = changeAmount(item, 150);
  assert.equal(changed.amount, 150);
  assert.equal(changed.nutrients.kcal, 247.5);
  assert.equal(changed.nutrients.protein, 46.5);
  assert.equal(changed.id, item.id);
});
