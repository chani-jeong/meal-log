import test from 'node:test';
import assert from 'node:assert/strict';
import { searchFoods } from './foodSearch.js';

const foods = [
  { name: '현미밥', per100g: {} },
  { name: '흰쌀밥', per100g: {} },
  { name: '밥버거', per100g: {} },
  { name: '닭가슴살', per100g: {} },
];

test('검색어가 비어 있으면 빈 목록을 돌려준다', () => {
  assert.deepEqual(searchFoods(foods, '   '), []);
});

test('이름에 검색어가 들어간 음식을 찾는다', () => {
  const names = searchFoods(foods, '밥').map((f) => f.name);
  assert.equal(names.length, 3);
  assert.ok(names.includes('현미밥'));
  assert.ok(names.includes('흰쌀밥'));
  assert.ok(!names.includes('닭가슴살'));
});

test('검색어로 시작하는 음식을 먼저 보여 준다', () => {
  const names = searchFoods(foods, '밥').map((f) => f.name);
  assert.equal(names[0], '밥버거');
});

test('결과 개수 제한을 지킨다', () => {
  assert.equal(searchFoods(foods, '밥', 2).length, 2);
});