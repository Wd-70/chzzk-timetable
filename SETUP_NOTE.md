# ⚠️ 중요: Firebase 설정 필요

이 프로젝트를 사용하려면 Firebase 설정이 필요합니다.

## 🔧 설정 방법

### 1. Firebase 프로젝트 생성

1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. **Firestore Database** 활성화
4. **Authentication > 익명 로그인** 활성화

### 2. Firebase 설정 파일 생성

```bash
# 템플릿 파일을 복사하여 실제 설정 파일 생성
cp firebase-config.example.js firebase-config.js
```

### 3. Firebase Console에서 설정값 복사

1. Firebase Console → 프로젝트 설정 → 웹 앱 추가
2. 앱 등록 후 제공되는 설정 정보를 복사
3. `firebase-config.js` 파일에 붙여넣기

```javascript
const firebaseConfig = {
  apiKey: "실제 API 키",
  authDomain: "프로젝트ID.firebaseapp.com",
  projectId: "프로젝트ID",
  storageBucket: "프로젝트ID.firebasestorage.app",
  messagingSenderId: "메시징 ID",
  appId: "앱 ID",
  measurementId: "측정 ID",
};
```

### 4. Firestore 보안 규칙 설정

Firebase Console → Firestore Database → 규칙에서 다음 규칙 적용:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 관리자 권한 체크 함수
    function isAdmin() {
      return request.auth != null &&
             request.auth.uid in get(/databases/$(database)/documents/admin/config).data.adminUids;
    }

    // 시간표
    match /timetables/{timetableId} {
      allow read: if resource.data.r == false && resource.data.h == false;
      allow read: if isAdmin(); // 관리자는 삭제/숨김 포함 모두 조회
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
                      (request.auth.uid == resource.data.uid || isAdmin());
      allow delete: if isAdmin();
    }

    // 투표
    match /votes/{voteId} {
      allow read, write: if request.auth != null;
    }

    // 신고
    match /reports/{reportId} {
      allow create: if request.auth != null;
      allow read, update: if isAdmin();
    }
  }
}
```

### 5. Firestore 인덱스 생성

앱을 처음 사용하면 "인덱스 필요" 오류가 발생합니다.
오류 메시지의 자동 생성 링크를 클릭하여 필요한 인덱스를 생성하세요.

## 🔒 보안 주의사항

- ⚠️ **절대로 `firebase-config.js` 파일을 Git에 커밋하지 마세요!**
- ✅ `.gitignore`에 이미 추가되어 있습니다
- ✅ 대신 `firebase-config.example.js` 템플릿을 제공합니다

## 📝 참고

- Firebase API 키가 클라이언트 코드에 포함되는 것은 정상입니다
- Firebase 보안 규칙으로 실제 보안이 유지됩니다
- 그러나 프로젝트 ID와 설정을 공개하지 않는 것이 좋습니다

## 💡 도움이 필요하신가요?

자세한 설정 방법은 다음 문서를 참조하세요:
- [README.md](README.md) - 개발 가이드 섹션
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Firebase 상세 설정 가이드
