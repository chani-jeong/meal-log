import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateGoal,
  validateTargetKcal,
  lowCalorieWarning,
  getGoalLabel,
} from './goal.js';

test('감량: 목표 이내면 달성으로 판정한다', () => {
  assert.equal(evaluateGoal('lose', 1500, 2000).ok, true);
  assert.equal(evaluateGoal('lose', 2200, 2000).ok, false);
});

test('유지: 목표의 ±10% 이내면 유지 범위로 판정한다', () => {
  assert.equal(evaluateGoal('maintain', 1900, 2000).ok, true);
  assert.equal(evaluateGoal('maintain', 2300, 2000).ok, false);
});

test('증량: 목표 이상이면 달성으로 판정한다', () => {
  assert.equal(evaluateGoal('gain', 2500, 2500).ok, true);
  assert.equal(evaluateGoal('gain', 2000, 2500).ok, false);
});

test('목표 칼로리가 기준보다 낮으면 경고한다', () => {
  assert.ok(lowCalorieWarning(1000));
  assert.equal(lowCalorieWarning(1500), null);
});

test('목표 칼로리 입력값을 검사하고 목표 유형 이름을 돌려준다', () => {
  assert.ok(validateTargetKcal(''));
  assert.ok(validateTargetKcal(100));
  assert.equal(validateTargetKcal(2000), null);
  assert.equal(getGoalLabel('lose'), '감량');
});