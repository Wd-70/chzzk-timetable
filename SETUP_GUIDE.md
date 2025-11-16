# Firebase 프로젝트 설정 가이드

## 1. Firebase 프로젝트 생성

### 1.1 Firebase Console 접속
1. https://console.firebase.google.com/ 접속
2. Google 계정으로 로그인
3. "프로젝트 추가" 클릭

### 1.2 프로젝트 생성
```
프로젝트 이름: chzzk-timetable (또는 원하는 이름)
프로젝트 ID: chzzk-timetable-xxxxx (자동 생성)
Google Analytics: 비활성화 (선택사항)
```

---

## 2. Firestore 데이터베이스 설정

### 2.1 Firestore 생성
1. 왼쪽 메뉴 → "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. 위치 선택: **asia-northeast3** (서울) 추천
4. 보안 규칙: **테스트 모드**로 시작 (나중에 변경)

### 2.2 보안 규칙 설정
Firebase Console → Firestore → 규칙 탭

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuth() {
      return request.auth != null;
    }

    match /timetables/{tid} {
      allow read: if true;
      allow create: if isAuth() &&
                       request.resource.data.uid == request.auth.uid &&
                       request.resource.data.l == 0 &&
                       request.resource.data.d == 0;
      allow update, delete: if false;
    }

    match /votes/{vid} {
      allow read: if isAuth() && vid.matches('^' + request.auth.uid + '_.*');
      allow write: if isAuth() && vid.matches('^' + request.auth.uid + '_.*');
    }

    match /reports/{rid} {
      allow create: if isAuth();
      allow read, update, delete: if false;
    }
  }
}
```

**규칙 게시** 클릭

### 2.3 인덱스 생성
Firebase Console → Firestore → 색인 탭 → "복합 색인 추가"

**인덱스 1: 채널별 주차 시간표 조회**
```
컬렉션 ID: timetables
필드:
  - ch (오름차순)
  - ws (내림차순)
  - h (오름차순)
  - r (오름차순)
상태: 자동 생성 대기
```

**인덱스 2: 채널별 좋아요 순 정렬**
```
컬렉션 ID: timetables
필드:
  - ch (오름차순)
  - ws (오름차순)
  - h (오름차순)
  - l (내림차순)
```

인덱스 생성은 5-10분 소요

---

## 3. Firebase Authentication 설정

### 3.1 익명 인증 활성화
1. 왼쪽 메뉴 → "Authentication" 클릭
2. "시작하기" 클릭
3. "Sign-in method" 탭
4. "익명" 제공업체 찾기
5. 사용 설정 ON
6. 저장

---

## 4. Firebase SDK 설정

### 4.1 웹 앱 등록
1. 프로젝트 개요 (왼쪽 상단 톱니바퀴 옆)
2. "앱 추가" → 웹 아이콘 (</>)
3. 앱 닉네임: "Chzzk Timetable Extension"
4. Firebase Hosting: 체크 해제
5. "앱 등록" 클릭

### 4.2 Firebase 구성 정보 복사
다음과 같은 코드가 표시됩니다:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "chzzk-timetable-xxxxx.firebaseapp.com",
  projectId: "chzzk-timetable-xxxxx",
  storageBucket: "chzzk-timetable-xxxxx.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

**이 정보를 복사해두세요!**

---

## 5. 프로젝트에 Firebase 통합

### 5.1 Firebase SDK 다운로드

**옵션 1: CDN 사용 (추천)**
```bash
# Firebase SDK 파일 다운로드 (오프라인용)
mkdir firebase-sdk
cd firebase-sdk

# 다음 파일들을 다운로드:
# https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js
# https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js
# https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js
```

웹에서 수동 다운로드하거나 curl 사용:
```bash
curl -o firebase-app-compat.js https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js
curl -o firebase-auth-compat.js https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js
curl -o firebase-firestore-compat.js https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js
```

**옵션 2: npm 사용** (빌드 필요)
```bash
npm install firebase
```

### 5.2 프로젝트 구조
```
chzzk-timetable/
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
├── background.js
├── content.js
├── content.css
├── firebase-config.js          ← 새로 생성
├── firebase-sdk/               ← 새로 생성
│   ├── firebase-app-compat.js
│   ├── firebase-auth-compat.js
│   └── firebase-firestore-compat.js
└── images/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

### 5.3 firebase-config.js 생성

```javascript
// firebase-config.js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Firebase 초기화
firebase.initializeApp(firebaseConfig);

// 서비스 내보내기
const auth = firebase.auth();
const db = firebase.firestore();

// Firestore 설정
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// 오프라인 지속성 활성화
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('Persistence failed: Multiple tabs open');
    } else if (err.code == 'unimplemented') {
      console.warn('Persistence not available');
    }
  });
```

### 5.4 manifest.json 업데이트

```json
{
  "manifest_version": 3,
  "name": "치지직 시간표",
  "version": "2.0.0",
  "description": "치지직 방송의 시간표를 확인할 수 있는 확장 프로그램",
  "icons": {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "images/icon16.png",
      "48": "images/icon48.png",
      "128": "images/icon128.png"
    }
  },
  "permissions": [
    "storage",
    "activeTab"
  ],
  "host_permissions": [
    "https://chzzk.naver.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["https://chzzk.naver.com/live/*"],
      "js": ["content.js"],
      "css": ["content.css"]
    }
  ],
  "content_security_policy": {
    "extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
  }
}
```

**주요 변경사항:**
- `content_security_policy`: Firebase SDK 실행을 위해 필요

### 5.5 popup.html 업데이트

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>치지직 시간표</title>
    <link rel="stylesheet" href="popup.css" />
  </head>
  <body>
    <div class="container">
      <h1>치지직 시간표</h1>
      <!-- UI 내용... -->
    </div>

    <!-- Firebase SDK 로드 (순서 중요!) -->
    <script src="firebase-sdk/firebase-app-compat.js"></script>
    <script src="firebase-sdk/firebase-auth-compat.js"></script>
    <script src="firebase-sdk/firebase-firestore-compat.js"></script>

    <!-- Firebase 설정 -->
    <script src="firebase-config.js"></script>

    <!-- 앱 로직 -->
    <script src="popup.js"></script>
  </body>
</html>
```

---

## 6. 테스트

### 6.1 로컬 테스트
1. `chrome://extensions/` 접속
2. 개발자 모드 활성화
3. "압축해제된 확장 프로그램을 로드합니다" 클릭
4. 프로젝트 폴더 선택

### 6.2 Firebase 연결 확인

콘솔에서 확인:
```javascript
// popup.js 또는 개발자 도구 콘솔
console.log('Firebase initialized:', firebase.apps.length > 0);
console.log('Auth:', auth);
console.log('Firestore:', db);
```

### 6.3 익명 로그인 테스트

```javascript
auth.signInAnonymously()
  .then((result) => {
    console.log('✅ 익명 로그인 성공');
    console.log('UID:', result.user.uid);
  })
  .catch((error) => {
    console.error('❌ 로그인 실패:', error);
  });
```

Firebase Console → Authentication → Users 탭에서 사용자 확인

### 6.4 Firestore 쓰기 테스트

```javascript
db.collection('timetables').add({
  ch: 'test_channel',
  img: 'https://example.com/test.jpg',
  ws: '20250113',
  we: '20250119',
  uid: auth.currentUser.uid,
  at: Date.now(),
  l: 0,
  d: 0,
  h: false,
  r: false
})
.then((docRef) => {
  console.log('✅ 문서 작성 성공:', docRef.id);
})
.catch((error) => {
  console.error('❌ 작성 실패:', error);
});
```

Firebase Console → Firestore → timetables 컬렉션에서 데이터 확인

---

## 7. 배포 전 체크리스트

- [ ] Firebase 프로젝트 생성 완료
- [ ] Firestore 데이터베이스 생성 (서울 리전)
- [ ] 보안 규칙 설정 완료
- [ ] 복합 인덱스 2개 생성 완료 (상태: 사용 설정됨)
- [ ] 익명 인증 활성화
- [ ] Firebase SDK 다운로드 및 프로젝트 통합
- [ ] firebase-config.js에 실제 설정값 입력
- [ ] manifest.json 업데이트
- [ ] 익명 로그인 테스트 성공
- [ ] Firestore 읽기/쓰기 테스트 성공

---

## 8. 문제 해결

### 문제: "Missing or insufficient permissions"
**원인:** 보안 규칙이 잘못 설정됨
**해결:** Firebase Console → Firestore → 규칙에서 보안 규칙 재확인

### 문제: "The query requires an index"
**원인:** 복합 인덱스 미생성
**해결:** 에러 메시지의 링크 클릭 → 자동으로 인덱스 생성 페이지 이동

### 문제: "Firebase: Error (auth/operation-not-allowed)"
**원인:** 익명 인증이 비활성화됨
**해결:** Authentication → Sign-in method → 익명 활성화

### 문제: CSP 오류
**원인:** Content Security Policy 설정 문제
**해결:** manifest.json의 `content_security_policy` 확인

### 문제: "firebase is not defined"
**원인:** SDK 로드 순서 문제
**해결:** popup.html에서 firebase-app-compat.js가 가장 먼저 로드되는지 확인

---

## 9. 모니터링

### 9.1 사용량 확인
Firebase Console → 사용량 탭

확인 항목:
- Firestore 읽기/쓰기/삭제 횟수
- 저장된 데이터 크기
- Authentication 활성 사용자 수

### 9.2 무료 티어 제한 알림 설정
Firebase Console → 프로젝트 설정 → 사용량 및 결제

"알림 설정" → 무료 할당량 80% 도달 시 이메일 알림

---

## 10. 다음 단계

설정이 완료되면:
1. ✅ Firebase 통합 테스트
2. 📝 익명 인증 구현 (popup.js)
3. 📝 시간표 CRUD 기능 구현
4. 📝 좋아요/싫어요 시스템 구현
5. 🎨 UI 개선
6. 🧪 베타 테스트
7. 🚀 Chrome Web Store 배포

FIREBASE_SCHEMA.md를 참고하여 최적화된 쿼리 작성!
