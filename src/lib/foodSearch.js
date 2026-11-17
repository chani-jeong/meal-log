// 음식 이름 검색. 이름이 검색어로 시작하는 음식을 먼저 보여 줍니다.
export function searchFoods(foods, query, limit = 10) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const matched = foods.filter((food) => food.name.toLowerCase().includes(q));
  const rank = (food) => (food.name.toLowerCase().startsWith(q) ? 0 : 1);

  return matched
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name, 'ko'))
    .slice(0, limit);
}