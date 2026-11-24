import { useState } from 'react';
import foods from './data/foods.json';
import {
  DAILY_REFERENCE,
  NUTRIENT_KEYS,
  nutrientsForAmount,
  sumNutrients,
  percentOfDaily,
  validateAmount,
} from './lib/nutrition.js';
import { searchFoods } from './lib/foodSearch.js';
import {
  MEAL_TYPES,
  groupByMealType,
  mealTotal,
  addOrMergeItem,
  changeAmount,
} from './lib/mealLog.js';
import { toDateKey, validateRecordDate, formatDateKey } from './lib/date.js';
import { useMeals } from './hooks/useMeals.js';
import { addMeal, updateMealAmount, deleteMeal } from './services/mealRepository.js';
import {
  GOAL_OPTIONS,
  evaluateGoal,
  getGoalLabel,
  validateTargetKcal,
  lowCalorieWarning,
} from './lib/goal.js';
import UserBadge from './components/UserBadge.jsx';
import './App.css';

const EMPTY_VALUES = Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, '']));
const SUB_KEYS = NUTRIENT_KEYS.filter((key) => key !== 'kcal');

function parseNutrients(values) {
  const result = {};
  for (const key of NUTRIENT_KEYS) {
    if (values[key] === '') return null;
    const n = Number(values[key]);
    if (Number.isNaN(n) || n < 0) return null;
    result[key] = n;
  }
  return result;
}

function DailySummary({ total, percent }) {
  const kcalOver = percent.kcal > 100;
  return (
    <>
      <div className="kcal-block">
        <div className="kcal-label">오늘 열량</div>
        <div className={kcalOver ? 'kcal-value over' : 'kcal-value'}>
          {Math.round(total.kcal).toLocaleString('ko-KR')}
          <span>kcal</span>
        </div>
        <div className="kcal-sub">
          권장 {DAILY_REFERENCE.kcal.value.toLocaleString('ko-KR')} kcal 대비 {percent.kcal}%
        </div>
      </div>

      <div className="metrics">
        {SUB_KEYS.map((key) => {
          const { label, unit } = DAILY_REFERENCE[key];
          const p = percent[key];
          const over = p > 100;
          return (
            <div className="metric" key={key}>
              <div className="metric-head">
                <span>{label}</span>
                <span className={over ? 'metric-value over' : 'metric-value'}>
                  {total[key].toFixed(1)} {unit}
                  <em>{p}%</em>
                </span>
              </div>
              <div className="track">
                <div
                  className={over ? 'fill over' : 'fill'}
                  style={{ width: `${Math.min(p, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function App({ user = null, onLogout }) {
  const [query, setQuery] = useState('');
  const [values, setValues] = useState(EMPTY_VALUES);
  const [filledFrom, setFilledFrom] = useState(null);
  const [mealType, setMealType] = useState('breakfast');
  const [amountInput, setAmountInput] = useState('100');
  const [goalType, setGoalType] = useState('lose');
  const [targetInput, setTargetInput] = useState('2000');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  const todayKey = toDateKey();
  const [dateKey, setDateKey] = useState(todayKey);
  const uid = user?.uid;
  const { meals: meal, loading, error: loadError } = useMeals(uid, dateKey);
  const today = formatDateKey(dateKey);

  const trimmedQuery = query.trim();
  const isExactMatch = foods.some((food) => food.name === trimmedQuery);
  const results = isExactMatch ? [] : searchFoods(foods, query);

  const groups = groupByMealType(meal);
  const total = sumNutrients(meal.map((item) => item.nutrients));
  const percent = percentOfDaily(total);

  const targetError = validateTargetKcal(targetInput);
  const target = Number(targetInput);
  const evaluation = targetError ? null : evaluateGoal(goalType, total.kcal, target);
  const warning = targetError ? null : lowCalorieWarning(target);

  function handleQueryChange(value) {
    setQuery(value);
    setMessage('');
    if (filledFrom !== null && value.trim() !== filledFrom) {
      setValues(EMPTY_VALUES);
      setFilledFrom(null);
    }
  }

  function selectFood(food) {
    setQuery(food.name);
    setValues(
      Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, String(food.per100g[key])])),
    );
    setFilledFrom(food.name);
    setError('');
    setMessage(`"${food.name}"의 100g당 값을 채웠습니다. 필요하면 수정하세요.`);
  }

  async function addItem() {
    const dateError = validateRecordDate(dateKey, todayKey);
    if (dateError) {
      setError(dateError);
      setMessage('');
      return;
    }
    if (!trimmedQuery) {
      setError('음식 이름을 입력해 주세요.');
      setMessage('');
      return;
    }
    const amount = Number(amountInput);
    const amountError = validateAmount(amount);
    if (amountError) {
      setError(amountError);
      setMessage('');
      return;
    }
    const per100g = parseNutrients(values);
    if (!per100g) {
      setError('영양성분 값은 0 이상의 숫자로 모두 입력해 주세요.');
      setMessage('');
      return;
    }

    const newItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      date: dateKey,
      mealType,
      name: trimmedQuery,
      amount,
      nutrients: nutrientsForAmount(per100g, amount),
    };
    const result = addOrMergeItem(meal, newItem);
    if (result.error) {
      setError(result.error);
      setMessage('');
      return;
    }

    setSaving(true);
    try {
      if (result.merged) {
        const mergedItem = result.items.find(
          (item) => item.mealType === newItem.mealType && item.name === newItem.name,
        );
        await updateMealAmount(uid, mergedItem);
      } else {
        await addMeal(uid, newItem);
      }
    } catch {
      // 저장 실패 시 입력값을 지우지 않고 다시 시도할 수 있게 둡니다.
      setError('저장하지 못했습니다. 네트워크를 확인하고 다시 시도해 주세요.');
      setMessage('');
      setSaving(false);
      return;
    }
    setSaving(false);

    setQuery('');
    setValues(EMPTY_VALUES);
    setFilledFrom(null);
    setError('');
    setMessage(
      result.merged ? `같은 끼니에 있던 "${trimmedQuery}"의 섭취량을 합쳤습니다.` : '',
    );
  }

  async function handleDelete(item) {
    try {
      await deleteMeal(uid, item.id);
      setError('');
    } catch {
      setError(`"${item.name}"을(를) 삭제하지 못했습니다. 다시 시도해 주세요.`);
    }
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditAmount(String(item.amount));
    setError('');
  }

  async function saveEdit(item) {
    const amount = Number(editAmount);
    const amountError = validateAmount(amount);
    if (amountError) {
      setError(amountError);
      return;
    }
    try {
      await updateMealAmount(uid, changeAmount(item, amount));
      setEditingId(null);
      setError('');
    } catch {
      setError('수정하지 못했습니다. 다시 시도해 주세요.');
    }
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">{today}</p>
          <h1 className="brand">
            <svg width="36" height="36" viewBox="0 0 64 64" aria-hidden="true">
              <rect width="64" height="64" rx="16" fill="#0b0b0d" />
              <circle cx="32" cy="32" r="20" fill="none" stroke="#26262c" strokeWidth="5" />
              <circle
                cx="32"
                cy="32"
                r="20"
                fill="none"
                stroke="#d4bc8f"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="87.96 125.66"
                transform="rotate(-90 32 32)"
              />
              <path d="M32 22 C40 26 42 36 32 43 C22 36 24 26 32 22 Z" fill="#d4bc8f" />
              <path d="M32 43 L32 28" stroke="#0b0b0d" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="wordmark">Meal<strong>Log</strong></span>
          </h1>
        </div>
        <div className="header-actions">
          <UserBadge user={user} />
          {onLogout && (
            <button type="button" className="logout-btn" onClick={onLogout}>로그아웃</button>
          )}
        </div>
      </header>

      <div className="layout">
        <section className="panel">
          <h2 className="panel-title">음식 추가</h2>

          <label className="field-label" htmlFor="record-date">기록 날짜</label>
          <input
            id="record-date"
            className="input date-input"
            type="date"
            value={dateKey}
            max={todayKey}
            onChange={(e) => setDateKey(e.target.value || todayKey)}
          />

          <label className="field-label">끼니</label>
          <div className="segmented">
            {MEAL_TYPES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={mealType === key ? 'active' : ''}
                onClick={() => setMealType(key)}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="field-label" htmlFor="food-search">음식 이름</label>
          <input
            id="food-search"
            className="input search"
            placeholder="예: 닭가슴살, 현미밥"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
          />

          {results.length > 0 && (
            <ul className="search-results">
              {results.map((food) => (
                <li key={food.name}>
                  <button type="button" onClick={() => selectFood(food)}>
                    {food.name}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {trimmedQuery && !isExactMatch && results.length === 0 && (
            <p className="muted">검색 결과가 없습니다. 아래에서 영양값을 직접 입력해 추가할 수 있습니다.</p>
          )}

          <h3 className="sub-title">100g당 영양성분</h3>
          <div className="nutrient-grid">
            {NUTRIENT_KEYS.map((key) => (
              <div key={key}>
                <label className="field-label">
                  {DAILY_REFERENCE[key].label} ({DAILY_REFERENCE[key].unit})
                </label>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={values[key]}
                  onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </div>
            ))}
          </div>

          <div className="amount-row">
            <input
              className="input"
              type="number"
              aria-label="섭취량 (g)"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
            <span className="unit">g</span>
            <button className="btn-primary" onClick={addItem} disabled={saving}>
              {saving ? '저장 중…' : '추가'}
            </button>
          </div>

          {message && <p className="hint">{message}</p>}
          {error && <p role="alert" className="error">{error}</p>}
        </section>

        <section className="panel">
          <h2 className="panel-title">
            오늘 요약
            <span className="count">{meal.length}건</span>
          </h2>

          <h3 className="sub-title sub-title-first">목표</h3>
          <div className="segmented">
            {GOAL_OPTIONS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={goalType === key ? 'active' : ''}
                onClick={() => setGoalType(key)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="field-row">
            <input
              className="input goal-input"
              type="number"
              aria-label="목표 칼로리 (kcal)"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
            />
            <span className="unit">kcal</span>
          </div>
          {targetError && <p role="alert" className="error">{targetError}</p>}
          {warning && <p className="warn">{warning}</p>}

          {loadError && <p role="alert" className="error">{loadError}</p>}

          {loading ? (
            <div className="empty">기록을 불러오는 중입니다…</div>
          ) : meal.length === 0 ? (
            <div className="empty">
              아직 기록된 식사가 없습니다.
              <br />
              왼쪽에서 음식을 추가해 보세요.
            </div>
          ) : (
            <>
              <DailySummary total={total} percent={percent} />

              {evaluation && (
                <p className={evaluation.ok ? 'goal-status ok' : 'goal-status'}>
                  {getGoalLabel(goalType)} 목표 · {evaluation.status} · 목표 대비 {evaluation.percent}%
                </p>
              )}

              <h3 className="sub-title">끼니별 기록</h3>
              {MEAL_TYPES.map(({ key, label }) => {
                const items = groups[key];
                const kcal = Math.round(mealTotal(items).kcal);
                return (
                  <div className="meal-group" key={key}>
                    <div className="meal-group-head">
                      <span>{label}</span>
                      <span className="meta">
                        {items.length === 0 ? '기록 없음' : `${items.length}개 · ${kcal} kcal`}
                      </span>
                    </div>
                    {items.length > 0 && (
                      <ul className="meal-list">
                        {items.map((item) => (
                          <li key={item.id}>
                            {editingId === item.id ? (
                              <span className="edit-row">
                                <span>{item.name}</span>
                                <input
                                  className="input edit-input"
                                  type="number"
                                  aria-label={`${item.name} 섭취량 (g)`}
                                  value={editAmount}
                                  onChange={(e) => setEditAmount(e.target.value)}
                                />
                                <span className="unit">g</span>
                                <button type="button" className="text-btn" onClick={() => saveEdit(item)}>저장</button>
                                <button type="button" className="text-btn" onClick={() => setEditingId(null)}>취소</button>
                              </span>
                            ) : (
                              <>
                                <span>{item.name} {item.amount}g</span>
                                <span className="meal-actions">
                                  <span className="meal-meta">{Math.round(item.nutrients.kcal)} kcal</span>
                                  <button
                                    type="button"
                                    className="text-btn"
                                    aria-label={`${item.name} 수정`}
                                    onClick={() => startEdit(item)}
                                  >
                                    수정
                                  </button>
                                  <button
                                    type="button"
                                    className="remove-btn"
                                    aria-label={`${item.name} 삭제`}
                                    onClick={() => handleDelete(item)}
                                  >
                                    ×
                                  </button>
                                </span>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </section>
      </div>
    </div>
  );
}