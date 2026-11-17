// 목표 유형별 달성 판정 (Strategy 패턴: 유형마다 평가 방식이 다름)
const strategies = {
  lose: {
    label: '감량',
    evaluate(actual, target) {
      const percent = Math.round((actual / target) * 1000) / 10;
      const ok = actual <= target;
      return { percent, ok, status: ok ? '목표 이내' : '목표 초과' };
    },
  },
  maintain: {
    label: '유지',
    evaluate(actual, target) {
      const percent = Math.round((actual / target) * 1000) / 10;
      const ok = Math.abs(actual - target) / target <= 0.1;
      let status = '유지 범위 (±10%)';
      if (!ok) status = actual > target ? '초과' : '부족';
      return { percent, ok, status };
    },
  },
  gain: {
    label: '증량',
    evaluate(actual, target) {
      const percent = Math.round((actual / target) * 1000) / 10;
      const ok = actual >= target;
      return { percent, ok, status: ok ? '목표 달성' : '섭취 부족' };
    },
  },
};

export const GOAL_OPTIONS = Object.entries(strategies).map(([key, s]) => ({
  key,
  label: s.label,
}));

export const MIN_SAFE_KCAL = 1200;

export function evaluateGoal(type, actualKcal, targetKcal) {
  const strategy = strategies[type];
  if (!strategy) throw new Error('알 수 없는 목표 유형입니다.');
  return strategy.evaluate(actualKcal, targetKcal);
}

export function getGoalLabel(type) {
  return strategies[type]?.label ?? '';
}

export function validateTargetKcal(value) {
  const n = Number(value);
  if (value === '' || Number.isNaN(n)) return '목표 칼로리를 숫자로 입력해 주세요.';
  if (n < 500 || n > 5000) return '목표 칼로리는 500 이상 5000 이하로 입력해 주세요.';
  return null;
}

// 건강 관련 서비스 규칙: 목표가 기준보다 지나치게 낮으면 경고합니다.
export function lowCalorieWarning(targetKcal) {
  if (targetKcal < MIN_SAFE_KCAL) {
    return `목표 칼로리가 ${MIN_SAFE_KCAL}kcal보다 낮습니다. 무리한 감량은 건강에 해로울 수 있으니 전문가와 상담하세요.`;
  }
  return null;
}