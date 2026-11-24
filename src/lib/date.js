// 날짜를 'YYYY-MM-DD' 문자열로 다룹니다. (Firestore 조회와 비교가 쉬움)
export function toDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// 서비스 규칙: 미래 날짜에는 식사를 기록할 수 없습니다.
export function validateRecordDate(dateKey, todayKey = toDateKey()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey ?? '')) return '날짜를 선택해 주세요.';
  if (dateKey > todayKey) return '미래 날짜에는 기록할 수 없습니다.';
  return null;
}

export function formatDateKey(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('ko-KR', {
    month: 'long', day: 'numeric', weekday: 'long',
  });
}
