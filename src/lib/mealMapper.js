// 화면에서 쓰는 식사 기록 ↔ Firestore 문서 변환 (Adapter 패턴)
// Firestore에 무엇을 저장할지, 읽어 온 값을 화면용으로 어떻게 바꿀지를 이 파일 한곳에서만 정합니다.
import { NUTRIENT_KEYS } from './nutrition.js';

function cleanNutrients(nutrients = {}) {
  return Object.fromEntries(
    NUTRIENT_KEYS.map((key) => {
      const n = Number(nutrients[key]);
      return [key, Number.isFinite(n) ? n : 0];
    }),
  );
}

// 화면 기록 → 저장할 데이터 (임시 id 같은 화면 전용 값은 저장하지 않음)
export function toMealData(item) {
  return {
    date: item.date,
    mealType: item.mealType,
    name: item.name,
    amount: Number(item.amount),
    nutrients: cleanNutrients(item.nutrients),
  };
}

// Firestore 문서 → 화면 기록 (빠진 영양값은 0으로 채움)
export function fromMealData(id, data = {}) {
  const createdAt = data.createdAt;
  return {
    id,
    date: data.date ?? '',
    mealType: data.mealType ?? 'snack',
    name: data.name ?? '',
    amount: Number(data.amount) || 0,
    nutrients: cleanNutrients(data.nutrients),
    createdAtMs: typeof createdAt?.toMillis === 'function' ? createdAt.toMillis() : 0,
  };
}
