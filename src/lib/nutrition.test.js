import test from 'node:test';
import assert from 'node:assert/strict';
import {
  nutrientsForAmount,
  sumNutrients,
  percentOfDaily,
  validateAmount,
} from './nutrition.js';

const chicken = { kcal: 165, protein: 31, fat: 3.6, saturatedFat: 1, cholesterol: 85, sodium: 74 };

test('섭취량에 비례해 영양값을 계산한다', () => {
  const n = nutrientsForAmount(chicken, 150);
  assert.equal(n.protein, 46.5);
  assert.equal(n.kcal, 247.5);
  assert.equal(n.sodium, 111);
});

test('100g이면 100g당 값과 같다', () => {
  const n = nutrientsForAmount(chicken, 100);
  assert.equal(n.protein, 31);
});

test('여러 항목을 합산한다', () => {
  const total = sumNutrients([
    { kcal: 100, protein: 10, fat: 1, saturatedFat: 0, cholesterol: 0, sodium: 50 },
    { kcal: 200, protein: 20, fat: 2, saturatedFat: 1, cholesterol: 10, sodium: 100 },
  ]);
  assert.equal(total.kcal, 300);
  assert.equal(total.protein, 30);
  assert.equal(total.cholesterol, 10);
  assert.equal(total.sodium, 150);
});

test('기준치 대비 퍼센트를 계산한다', () => {
  const percent = percentOfDaily({
    kcal: 1000, protein: 55, fat: 0, saturatedFat: 0, cholesterol: 0, sodium: 2400,
  });
  assert.equal(percent.kcal, 50);
  assert.equal(percent.protein, 100);
  assert.equal(percent.sodium, 120);
});

test('섭취량 검사: 범위 밖과 숫자가 아닌 값을 거절한다', () => {
  assert.ok(validateAmount(0));
  assert.ok(validateAmount(2001));
  assert.ok(validateAmount(NaN));
  assert.equal(validateAmount(150), null);
});