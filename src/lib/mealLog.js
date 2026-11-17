import { NUTRIENT_KEYS, sumNutrients } from './nutrition.js';

export const MEAL_TYPES = [
  { key: 'breakfast', label: '아침' },
  { key: 'lunch', label: '점심' },
  { key: 'dinner', label: '저녁' },
  { key: 'snack', label: '간식' },
];

export const MAX_AMOUNT = 2000;

export function groupByMealType(items) {
  const groups = Object.fromEntries(MEAL_TYPES.map((meal) => [meal.key, []]));
  for (const item of items) {
    if (groups[item.mealType]) {
      groups[item.mealType].push(item);
    }
  }
  return groups;
}

export function mealTotal(items) {
  return sumNutrients(items.map((item) => item.nutrients));
}

export function addOrMergeItem(items, newItem) {
  const index = items.findIndex(
    (item) => item.mealType === newItem.mealType && item.name === newItem.name,
  );

  if (index === -1) {
    return { items: [...items, newItem], merged: false, error: null };
  }

  const existing = items[index];
  const amount = existing.amount + newItem.amount;
  if (amount > MAX_AMOUNT) {
    return {
      items,
      merged: false,
      error: `같은 끼니의 섭취량 합계는 ${MAX_AMOUNT}g을 넘을 수 없습니다. (현재 ${existing.amount}g)`,
    };
  }

  const merged = {
    ...existing,
    amount,
    nutrients: Object.fromEntries(
      NUTRIENT_KEYS.map((key) => [key, existing.nutrients[key] + newItem.nutrients[key]]),
    ),
  };

  return {
    items: items.map((item, i) => (i === index ? merged : item)),
    merged: true,
    error: null,
  };
}

export function removeItem(items, id) {
  return items.filter((item) => item.id !== id);
}