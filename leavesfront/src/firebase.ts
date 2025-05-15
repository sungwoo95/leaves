// firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD6-QJbBThrpo0CqOAZsYD0rw-Zr-TQLGI",
  authDomain: "endless-apogee-459708-c4.firebaseapp.com",
};

const app = initializeApp(firebaseConfig); // modular 방식
const auth = getAuth(app); //Firebase 모듈 방식에서 제공하는 인증 객체로, 현재 로그인된 사용자 정보 확인 및 인증 관련 기능 수행

firebase.initializeApp(firebaseConfig); // compat 방식의 Firebase 객체로, react-firebaseui처럼 compat API를 요구하는 라이브러리와의 호환을 위해 사용

export { auth, firebase };
