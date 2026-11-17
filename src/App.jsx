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
  removeItem,
} from './lib/mealLog.js';
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

export default function App() {
  const [query, setQuery] = useState('');
  const [values, setValues] = useState(EMPTY_VALUES);
  const [filledFrom, setFilledFrom] = useState(null);
  const [mealType, setMealType] = useState('breakfast');
  const [amountInput, setAmountInput] = useState('100');
  const [meal, setMeal] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const today = new Date().toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const trimmedQuery = query.trim();
  const isExactMatch = foods.some((food) => food.name === trimmedQuery);
  const results = isExactMatch ? [] : searchFoods(foods, query);

  const groups = groupByMealType(meal);
  const total = sumNutrients(meal.map((item) => item.nutrients));
  const percent = percentOfDaily(total);

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

  function addItem() {
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

    setMeal(result.items);
    setQuery('');
    setValues(EMPTY_VALUES);
    setFilledFrom(null);
    setError('');
    setMessage(
      result.merged ? `같은 끼니에 있던 "${trimmedQuery}"의 섭취량을 합쳤습니다.` : '',
    );
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
      </header>

      <div className="layout">
        <section className="panel">
          <h2 className="panel-title">음식 추가</h2>

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
            <button className="btn-primary" onClick={addItem}>추가</button>
          </div>

          {message && <p className="hint">{message}</p>}
          {error && <p role="alert" className="error">{error}</p>}
        </section>

        <section className="panel">
          <h2 className="panel-title">
            오늘 요약
            <span className="count">{meal.length}건</span>
          </h2>

          {meal.length === 0 ? (
            <div className="empty">
              아직 기록된 식사가 없습니다.
              <br />
              왼쪽에서 음식을 추가해 보세요.
            </div>
          ) : (
            <>
              <DailySummary total={total} percent={percent} />

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
                            <span>{item.name} {item.amount}g</span>
                            <span className="meal-actions">
                              <span className="meal-meta">{Math.round(item.nutrients.kcal)} kcal</span>
                              <button
                                type="button"
                                className="remove-btn"
                                aria-label={`${item.name} 삭제`}
                                onClick={() => setMeal((prev) => removeItem(prev, item.id))}
                              >
                                ×
                              </button>
                            </span>
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