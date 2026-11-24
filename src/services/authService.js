// 인증 기능을 한곳에 모은 파일 (Facade 패턴)
// 화면 컴포넌트는 Firebase 함수를 직접 부르지 않고 이 파일의 함수만 사용합니다.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from './firebase.js';

const ERROR_MESSAGES = {
  'auth/invalid-email': '이메일 형식이 올바르지 않습니다.',
  'auth/missing-password': '비밀번호를 입력해 주세요.',
  'auth/weak-password': '비밀번호는 6자 이상이어야 합니다.',
  'auth/email-already-in-use': '이미 가입된 이메일입니다. 로그인해 주세요.',
  'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'auth/too-many-requests': '시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  'auth/network-request-failed': '네트워크 연결을 확인해 주세요.',
};

export function toKoreanMessage(error) {
  return ERROR_MESSAGES[error?.code] ?? '요청을 처리하지 못했습니다. 다시 시도해 주세요.';
}

export async function signUp(email, password, nickname) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(user, { displayName: nickname });
  return user;
}

export function logIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function logOut() {
  return signOut(auth);
}

// 로그인 상태가 바뀔 때마다 callback을 호출합니다. 반환값은 구독 해제 함수입니다.
export function subscribeAuth(callback) {
  return onAuthStateChanged(auth, callback);
}
