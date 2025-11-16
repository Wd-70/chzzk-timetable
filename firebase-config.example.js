// Firebase 설정 파일 템플릿
// 이 파일을 복사하여 firebase-config.js로 이름을 변경하고
// Firebase Console에서 실제 설정값으로 교체하세요

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID",
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// 서비스 내보내기
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore 설정
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
});

// 오프라인 지속성 활성화
db.enablePersistence().catch((err) => {
  if (err.code == "failed-precondition") {
    console.warn("Persistence failed: Multiple tabs open");
  } else if (err.code == "unimplemented") {
    console.warn("Persistence not available");
  }
});

console.log("✅ Firebase initialized");
