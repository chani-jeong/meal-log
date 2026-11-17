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
import './App.css';

const EMPTY_VALUES = Object.fromEntries(NUTRIENT_KEYS.map((key) => [key, '']));
const SUB_KEYS = NUTRIENT_KEYS.filter((key) => key !== 'kcal');

// 입력한 영양값을 숫자로 바꿉니다. 빈 칸이나 잘못된 값이 있으면 null을 돌려줍니다.
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

// 오늘 요약: 열량을 크게 보여 주고, 나머지 영양소는 기준치 대비 막대로 표시
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
  const [values, setValues] = useState(EMPTY_VALUES); // 100g당 값 (입력 중에는 문자열)
  const [filledFrom, setFilledFrom] = useState(null); // 목록에서 골라 자동으로 채운 음식 이름
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

  // 음식 이름이 바뀌면 이전에 채워진 영양값을 지웁니다.
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
    setMeal((prev) => [
      ...prev,
      { name: trimmedQuery, amount, nutrients: nutrientsForAmount(per100g, amount) },
    ]);
    // 추가가 끝나면 다음 음식을 바로 입력할 수 있도록 입력값을 비웁니다.
    setQuery('');
    setValues(EMPTY_VALUES);
    setFilledFrom(null);
    setError('');
    setMessage('');
  }

  const total = sumNutrients(meal.map((item) => item.nutrients));
  const percent = percentOfDaily(total);

  return (
    <div className="page">
      <header className="header">
        <div>
          <p className="eyebrow">{today}</p>
          <h1 className="brand">
  <svg width="36" height="36" viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="16" fill="#0b0b0d" />
    <circle cx="32" cy="32" r="20" fill="none" stroke="#26262c" strokeWidth="5" />
    <circle cx="32" cy="32" r="20" fill="none" stroke="#d4bc8f" strokeWidth="5" strokeLinecap="round" strokeDasharray="87.96 125.66" transform="rotate(-90 32 32)" />
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

              <h3 className="sub-title">기록</h3>
              <ul className="meal-list">
                {meal.map((item, i) => (
                  <li key={i}>
                    <span>{item.name} {item.amount}g</span>
                    <span className="meal-meta">{Math.round(item.nutrients.kcal)} kcal</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
}