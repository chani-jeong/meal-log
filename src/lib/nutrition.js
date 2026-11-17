// 1일 영양성분 기준치 (식품 표시 기준). 구현 전 식약처 자료로 재확인하세요.
export const DAILY_REFERENCE = {
  kcal: { label: '열량', unit: 'kcal', value: 2000 },
  protein: { label: '단백질', unit: 'g', value: 55 },
  fat: { label: '지방', unit: 'g', value: 51 },
  saturatedFat: { label: '포화지방', unit: 'g', value: 15 },
  cholesterol: { label: '콜레스테롤', unit: 'mg', value: 300 },
  sodium: { label: '나트륨', unit: 'mg', value: 2000 },
};

export const NUTRIENT_KEYS = Object.keys(DAILY_REFERENCE);

// 섭취량 입력 검사
export function validateAmount(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    return '섭취량을 숫자로 입력해 주세요.';
  }
  if (amount < 1 || amount > 2000) {
    return '섭취량은 1g 이상 2000g 이하여야 합니다.';
  }
  return null;
}

// 100g당 값 × 섭취량 / 100
export function nutrientsForAmount(per100g, amount) {
  const result = {};
  for (const key of NUTRIENT_KEYS) {
    result[key] = ((per100g[key] ?? 0) * amount) / 100;
  }
  return result;
}

// 여러 항목의 영양값 합계
export function sumNutrients(list) {
  const total = Object.fromEntries(NUTRIENT_KEYS.map((k) => [k, 0]));
  for (const nutrients of list) {
    for (const key of NUTRIENT_KEYS) {
      total[key] += nutrients[key] ?? 0;
    }
  }
  return total;
}

// 기준치 대비 % (소수 첫째 자리까지)
export function percentOfDaily(total) {
  return Object.fromEntries(
    NUTRIENT_KEYS.map((key) => [
      key,
      Math.round((total[key] / DAILY_REFERENCE[key].value) * 1000) / 10,
    ]),
  );
}