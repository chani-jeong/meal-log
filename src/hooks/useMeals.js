// 선택한 날짜의 식사 기록을 불러오는 커스텀 훅
// 저장소(Repository)를 구독해서, 데이터가 바뀌면 화면이 자동으로 다시 그려집니다.
import { useEffect, useState } from 'react';
import { subscribeMealsByDate } from '../services/mealRepository.js';

export function useMeals(uid, dateKey) {
  const [state, setState] = useState({ meals: [], loading: true, error: '' });

  useEffect(() => {
    if (!uid) return undefined;
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    const unsubscribe = subscribeMealsByDate(
      uid,
      dateKey,
      (items) => {
        const sorted = [...items].sort((a, b) => a.createdAtMs - b.createdAtMs);
        setState({ meals: sorted, loading: false, error: '' });
      },
      () => {
        setState({ meals: [], loading: false, error: '기록을 불러오지 못했습니다. 로그인 상태와 네트워크를 확인해 주세요.' });
      },
    );
    return unsubscribe;
  }, [uid, dateKey]);

  return state;
}
