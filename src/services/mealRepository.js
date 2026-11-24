// 식사 기록의 Firestore 읽기·쓰기를 전담하는 저장소 (Repository 패턴)
// 화면(App)은 Firestore 경로나 함수를 몰라도 이 파일의 함수만 부르면 됩니다.
// 저장 위치: users/{uid}/meals/{mealId}
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase.js';
import { fromMealData, toMealData } from '../lib/mealMapper.js';

// Firestore 변환기: 저장·조회할 때 mealMapper(Adapter)를 거치게 함
const mealConverter = {
  toFirestore: (item) => ({ ...toMealData(item), createdAt: serverTimestamp() }),
  fromFirestore: (snapshot) => fromMealData(snapshot.id, snapshot.data()),
};

function mealsCollection(uid) {
  return collection(db, 'users', uid, 'meals').withConverter(mealConverter);
}

function mealDoc(uid, id) {
  return doc(db, 'users', uid, 'meals', id);
}

// 해당 날짜의 기록을 실시간으로 받아 옵니다. 반환값은 구독 해제 함수입니다.
export function subscribeMealsByDate(uid, dateKey, onChange, onError) {
  const q = query(mealsCollection(uid), where('date', '==', dateKey));
  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map((d) => d.data())),
    onError,
  );
}

export function addMeal(uid, item) {
  return addDoc(mealsCollection(uid), item);
}

export function updateMealAmount(uid, item) {
  const { amount, nutrients } = toMealData(item);
  return updateDoc(mealDoc(uid, item.id), { amount, nutrients, updatedAt: serverTimestamp() });
}

export function deleteMeal(uid, id) {
  return deleteDoc(mealDoc(uid, id));
}
