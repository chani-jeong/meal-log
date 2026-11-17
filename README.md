# MealLog - 식단 기록 & 영양성분 계산

끼니별로 먹은 음식을 기록하고, 열량과 영양성분을 계산하며, 목표 대비 달성률을 보여 주는 웹 서비스입니다.

## 주요 기능
- 음식 이름 검색 후 100g당 영양성분 자동 입력 (직접 수정 가능)
- 섭취량(g)에 따라 열량·단백질·지방·포화지방·콜레스테롤·나트륨 계산
- 하루 권장량 대비 비율(%) 표시
- 아침 / 점심 / 저녁 / 간식 구분 기록
- 같은 끼니에 같은 음식을 추가하면 섭취량 합산
- 목표 설정 (감량 / 유지 / 증량) 및 달성률 계산
- 목표 칼로리가 너무 낮으면 경고

## 기술 스택
- React + Vite
- Firebase Authentication, Firestore (진행 중)
- 순수 JavaScript 계산 로직 + Node.js 내장 테스트 러너

## 실행 방법
git checkout main
git pull
git checkout -b feature/readme-test
npm.cmd pkg set scripts.test='node --test src/lib/nutrition.test.js src/lib/foodSearch.test.js src/lib/mealLog.test.js src/lib/goal.test.js'
$readme = @'
# MealLog - 식단 기록 & 영양성분 계산

끼니별 음식 기록, 열량과 영양성분 계산, 목표 대비 달성률을 보여 주는 웹 서비스입니다.

## 실행 방법
npm install
npm run dev

## 테스트
npm test

## 폴더 구조
src/lib        계산 로직과 테스트
src/components 화면 컴포넌트
src/data       음식 영양성분 데이터 (예시 값)
src/App.jsx    메인 화면