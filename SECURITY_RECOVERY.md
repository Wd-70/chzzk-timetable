# 🚨 보안 복구 가이드

Firebase API 키가 공개되었으므로 다음 단계를 **반드시** 수행해야 합니다.

---

## ✅ 1단계: Git 히스토리 정리 (완료!)

Git 히스토리에서 `firebase-config.js`가 완전히 제거되었습니다.

**확인 방법:**
```bash
# 파일이 히스토리에 없는지 확인 (아무것도 출력되지 않아야 함)
git log --all -- firebase-config.js
```

---

## ⚠️ 2단계: GitHub에 강제 푸시 (필수!)

**중요**: 이 작업은 GitHub의 전체 커밋 히스토리를 덮어씁니다.

```bash
cd /mnt/f/Data/Git/ChromeExtension/chzzk-timetable

# 강제 푸시로 GitHub 히스토리도 재작성
git push origin master --force
```

**주의사항:**
- 다른 사람이 이 저장소를 클론했다면, 그들도 새로 클론해야 합니다
- Fork한 저장소가 있다면 별도로 처리 필요

---

## 🔐 3단계: Firebase 보안 조치 (매우 중요!)

API 키가 이미 공개되었으므로 **반드시** 다음 중 하나를 선택하세요:

### 옵션 A: 새 Firebase 프로젝트 생성 (강력 권장!)

**장점**: 완전히 새로운 시작, 가장 안전
**단점**: 기존 데이터 마이그레이션 필요

#### 단계:
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. **새 프로젝트 생성**
3. Firestore Database 활성화
4. Authentication > 익명 로그인 활성화
5. 새 웹 앱 등록 → 설정 정보 복사
6. `firebase-config.js`에 새 설정 정보 붙여넣기

#### 기존 데이터가 있다면:
```javascript
// 데이터가 많지 않다면 수동으로 복사하거나
// Firebase Console에서 Export/Import 기능 사용
```

### 옵션 B: 기존 프로젝트 보안 강화 (차선책)

**장점**: 기존 데이터 유지
**단점**: 노출된 API 키는 여전히 유효

#### 3-1. Web API Key 재생성

1. Firebase Console → 프로젝트 설정
2. 일반 탭 → 앱에서 설정 복사
3. 새 API 키로 `firebase-config.js` 업데이트

⚠️ **참고**: Firebase Web API 키는 공개되어도 Firestore 보안 규칙으로 보호됩니다. 하지만 재생성하는 것이 좋습니다.

#### 3-2. Firebase App Check 활성화 (필수!)

Firebase App Check는 승인된 앱에서만 접근하도록 보호합니다:

1. Firebase Console → App Check
2. **reCAPTCHA Enterprise** 또는 **reCAPTCHA v3** 선택
3. 웹 앱 등록
4. 코드에 App Check 추가:

```javascript
// firebase-config.js에 추가
const appCheck = firebase.appCheck();
appCheck.activate(
  'YOUR_RECAPTCHA_SITE_KEY',
  true // 자동 새로고침
);
```

#### 3-3. Firestore 보안 규칙 강화

Firebase Console → Firestore Database → 규칙:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // App Check 통과한 요청만 허용 (선택)
    // function isAppCheckValid() {
    //   return request.auth.token.firebase.sign_in_provider != null;
    // }

    function isAdmin() {
      return request.auth != null &&
             request.auth.uid in get(/databases/$(database)/documents/admin/config).data.adminUids;
    }

    match /timetables/{timetableId} {
      // 읽기: 삭제/숨김되지 않은 것만
      allow read: if resource.data.r == false && resource.data.h == false;
      // 관리자는 모두 조회 가능
      allow read: if isAdmin();
      // 생성: 인증된 사용자만
      allow create: if request.auth != null;
      // 수정/삭제: 본인 또는 관리자만
      allow update, delete: if request.auth != null &&
                              (request.auth.uid == resource.data.uid || isAdmin());
    }

    match /votes/{voteId} {
      allow read, write: if request.auth != null;
    }

    match /reports/{reportId} {
      allow create: if request.auth != null;
      allow read, update: if isAdmin();
    }

    // 관리자 설정은 읽기만 허용
    match /admin/config {
      allow read: if true;
      allow write: if false; // 콘솔에서만 수정
    }
  }
}
```

#### 3-4. Firebase Authentication 도메인 제한

Firebase Console → Authentication → Settings → Authorized domains:
- `localhost` (개발용)
- `chrome-extension://*` (확장 프로그램)
- 필요한 도메인만 추가

---

## 🔍 4단계: 모니터링 설정

### Firebase 사용량 확인

1. Firebase Console → 사용량 및 결제
2. **일일 사용량 모니터링**
3. **알림 설정** (무료 할당량 80% 도달 시 알림)

### 비정상적인 활동 감지

다음과 같은 징후가 있다면 즉시 조치:
- ✅ 예상치 못한 대량의 읽기/쓰기
- ✅ 알 수 없는 IP에서의 접근
- ✅ 할당량 초과

**대응 방법:**
1. 즉시 Firebase 프로젝트 비활성화
2. 새 프로젝트로 마이그레이션
3. 로그 분석

---

## 📋 체크리스트

완료 여부를 확인하세요:

### 필수 작업
- [ ] Git 히스토리 정리 완료
- [ ] GitHub 강제 푸시 완료 (`git push --force`)
- [ ] 새 Firebase 프로젝트 생성 **또는** 기존 프로젝트 보안 강화
- [ ] `firebase-config.js`에 새 설정 적용
- [ ] 앱 테스트 (정상 작동 확인)

### 권장 작업
- [ ] Firebase App Check 활성화
- [ ] Firestore 보안 규칙 검토 및 강화
- [ ] Firebase 사용량 알림 설정
- [ ] 인증된 도메인 제한 설정

### 추가 보안
- [ ] GitHub Security 탭에서 "Secret scanning alerts" 확인
- [ ] `.gitignore`가 올바르게 설정되었는지 재확인
- [ ] 팀원에게 보안 사고 공유 (해당되는 경우)

---

## 💡 앞으로 예방법

### 개발 시 주의사항

1. **환경 변수 사용**
   ```javascript
   // 대신 환경 변수를 사용하는 것을 고려
   // (하지만 Chrome Extension에서는 제한적)
   ```

2. **커밋 전 확인**
   ```bash
   # 커밋 전에 항상 확인
   git status
   git diff
   ```

3. **Pre-commit Hook 사용**
   ```bash
   # .git/hooks/pre-commit 파일 생성
   #!/bin/sh
   if git diff --cached --name-only | grep -q "firebase-config.js"; then
     echo "❌ Error: firebase-config.js는 커밋할 수 없습니다!"
     exit 1
   fi
   ```

4. **GitHub Secret Scanning**
   - GitHub가 자동으로 API 키를 감지
   - 알림 받으면 즉시 대응

---

## 🆘 문제 발생 시

### Q: 강제 푸시 후 "rejected" 오류가 발생합니다

```bash
# 원격 저장소를 완전히 덮어쓰기
git push origin master --force-with-lease

# 그래도 안 되면
git push origin master --force
```

### Q: 다른 기기에서 클론한 저장소는 어떻게 하나요?

```bash
# 기존 저장소 삭제하고 다시 클론
rm -rf chzzk-timetable
git clone https://github.com/Wd-70/chzzk-timetable.git
```

### Q: Firebase 프로젝트를 완전히 삭제하려면?

1. Firebase Console → 프로젝트 설정
2. 아래로 스크롤 → "프로젝트 삭제"
3. 프로젝트 ID 입력하여 확인

---

## 📞 추가 도움

- **Firebase 지원**: https://firebase.google.com/support
- **GitHub 보안**: https://docs.github.com/en/code-security
- **Google Cloud 보안**: https://cloud.google.com/security

---

## ✅ 완료 후 다음 단계

보안 조치가 완료되면:

1. 📸 스크린샷 준비
2. 🚀 Chrome 웹스토어 업로드
3. 🎉 공개 릴리스!

**이제 안전합니다!** 🔐
