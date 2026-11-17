import { DAILY_REFERENCE, NUTRIENT_KEYS } from '../lib/nutrition.js';

export default function NutritionSummary({ total, percent }) {
  return (
    <table>
      <thead>
        <tr>
          <th>영양소</th>
          <th>섭취량</th>
          <th>기준치 대비</th>
        </tr>
      </thead>
      <tbody>
        {NUTRIENT_KEYS.map((key) => {
          const { label, unit } = DAILY_REFERENCE[key];
          const over = percent[key] > 100;
          return (
            <tr key={key} style={over ? { color: 'crimson' } : undefined}>
              <td>{label}</td>
              <td>{total[key].toFixed(1)} {unit}</td>
              <td>
                {percent[key]}%{over && ' ⚠ 기준 초과'}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}