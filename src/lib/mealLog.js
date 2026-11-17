import { sumNutrients } from './nutrition.js';

export const MEAL_TYPES = [
  { key: 'breakfast', label: '아침' },
  { key: 'lunch', label: '점심' },
  { key: 'dinner', label: '저녁' },
  { key: 'snack', label: '간식' },
];

// 끼니별로 기록을 나눕니다. 모든 끼니 키를 항상 포함하며, 알 수 없는 끼니는 무시합니다.
export function groupByMealType(items) {
  const groups = Object.fromEntries(MEAL_TYPES.map((meal) => [meal.key, []]));
  for (const item of items) {
    if (groups[item.mealType]) {
      groups[item.mealType].push(item);
    }
  }
  return groups;
}

// 한 끼니(또는 여러 기록)의 영양 합계
export function mealTotal(items) {
  return sumNutrients(items.map((item) => item.nutrients));
}