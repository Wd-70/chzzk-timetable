# 버전 1.1.0 업데이트 가이드

## 📋 변경 사항 요약

### ✨ 새로운 기능
1. **계정 ID 모달 UI**
   - 계정 ID를 모달 창으로 표시
   - 원클릭 복사 기능 추가
   - 깔끔한 다크 테마 디자인

2. **새 계정 생성 기능**
   - 사용자가 원할 때 새 계정 생성 가능
   - 2단계 확인 프로세스로 실수 방지
   - 명확한 경고 메시지 제공

### 🔧 개선 사항
1. **용어 변경**
   - "백업 코드" → "계정 ID"
   - 더 명확한 용어로 혼란 감소

2. **보안 및 투명성 강화**
   - UID 해시 시스템 제거 (불필요)
   - 계정 ID 노출 안전성 명시
   - 계정 복원 불가능함을 명확히 안내

### 🗑️ 제거된 기능
1. **계정 복원 기능 제거**
   - Firebase 인증 구조상 불가능한 기능이었음
   - 혼란을 줄이기 위해 완전 제거

2. **해시 시스템 제거**
   - UID 자체가 안전하므로 해시 불필요
   - 코드 단순화 및 성능 개선

---

## 📦 웹스토어 업데이트 절차

### 1. 확장 프로그램 패키징

#### 방법 A: Git에서 패키징 (권장)
```bash
# 최신 변경사항 커밋
git add .
git commit -m "v1.1.0: 계정 ID 모달 추가 및 계정 생성 기능 구현"
git push

# 필요한 파일만 zip으로 압축
# 제외할 파일: .git, node_modules, *.md, DESIGN_DOC.md 등
```

#### 방법 B: 수동 ZIP 생성
다음 파일들을 포함하여 ZIP 생성:
```
chzzk-timetable/
├── manifest.json (v1.1.0)
├── popup.html
├── popup.js
├── popup.css
├── admin.html
├── admin.js
├── admin.css
├── admin-config.js
├── background.js
├── content.js
├── content.css
├── utils.js
├── firebase-config.js
├── firebase-service.js
├── privacy.html
├── firebase-sdk/
│   ├── firebase-app-compat.js
│   ├── firebase-auth-compat.js
│   └── firebase-firestore-compat.js
└── images/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

**제외할 파일:**
- `.git/` 폴더
- `*.md` 파일 (README.md, STORE_LISTING.md 등)
- `.gitignore`
- `node_modules/` (있는 경우)

### 2. Chrome Web Store Developer Dashboard 접속

1. https://chrome.google.com/webstore/devconsole 접속
2. "치지직 시간표" 확장 프로그램 선택
3. 왼쪽 메뉴에서 **"패키지"** 클릭

### 3. 새 버전 업로드

1. **"새 패키지 업로드"** 버튼 클릭
2. 생성한 ZIP 파일 선택
3. 자동으로 manifest.json에서 버전 (1.1.0) 감지
4. "변경사항 저장" 클릭

### 4. 스토어 등록정보 수정

#### A. 상세 설명 업데이트 (선택사항)
현재 스토어 설명이 "백업 코드"를 언급하고 있다면 수정:

**한국어 (수정 전):**
```
- 백업 코드로 여러 기기에서 동일 계정 사용
```

**한국어 (수정 후):**
```
- 기기마다 자동으로 계정 생성
```

**영어 (수정 전):**
```
- Use backup code to sync across devices
```

**영어 (수정 후):**
```
- Automatic account creation per device
```

#### B. 버전 출시 노트 작성
"이 업데이트의 새로운 기능" 섹션에 입력:

**한국어:**
```
v1.1.0 업데이트:
• 계정 ID를 보기 쉽게 모달 창으로 표시
• 새 계정 생성 기능 추가
• "백업 코드" → "계정 ID"로 용어 변경
• 계정 ID 노출 안전성 안내 추가
• 불필요한 해시 시스템 제거로 성능 개선
```

**영어:**
```
v1.1.0 Update:
• Account ID now displayed in a modal window
• New account creation feature added
• Renamed "Backup Code" to "Account ID"
• Added safety information about Account ID exposure
• Performance improvements by removing unnecessary hash system
```

#### C. 개인정보 처리방침 URL 확인
privacy.html이 수정되었으므로, 이미 배포된 경우:
- URL: `https://wd-70.github.io/chzzk-timetable/privacy.html` (GitHub Pages 사용 시)
- 또는 웹스토어에 직접 호스팅한 경우 해당 URL 사용

### 5. 검토 제출

1. 모든 정보 확인 후 **"검토용으로 제출"** 클릭
2. 검토는 보통 **수 시간 ~ 수일** 소요
3. 승인되면 자동으로 사용자들에게 업데이트 배포

---

## ⚠️ 주의사항

### 검토 시 확인할 사항
- **manifest.json 버전**: 1.0.0 → 1.1.0으로 올라갔는지 확인
- **권한 변경 없음**: 기존과 동일한 권한 사용
- **개인정보 처리방침**: 최신 내용으로 업데이트됨

### 거부 방지 체크리스트
- ✅ ZIP 파일에 불필요한 파일 없음 (.git, .md 등)
- ✅ 모든 스크립트가 CSP 정책 준수
- ✅ 외부 코드 없음 (Firebase SDK는 로컬 포함)
- ✅ 개인정보 처리방침 URL 유효
- ✅ 스크린샷과 설명이 실제 기능과 일치

---

## 🔄 롤백 (필요시)

문제 발생 시 1.0.0으로 롤백:
1. Developer Dashboard에서 이전 버전 선택
2. "이전 버전으로 되돌리기" 클릭
3. 또는 1.0.0 버전의 ZIP 재업로드

---

## 📝 참고 문서

- **스토어 설명**: `STORE_LISTING.md` (이미 업데이트됨)
- **개인정보 처리방침**: `privacy.html` (이미 업데이트됨)
- **상세 변경사항**: 이 문서의 "변경 사항 요약" 참조

---

## ✅ 완료 체크리스트

배포 전 확인:
- [ ] manifest.json 버전 1.1.0 확인
- [ ] ZIP 파일 생성 (불필요 파일 제외)
- [ ] 로컬에서 테스트 완료
- [ ] 개인정보 처리방침 URL 유효성 확인
- [ ] 스토어 설명 업데이트 (필요시)
- [ ] 출시 노트 작성
- [ ] Chrome Web Store에 업로드
- [ ] 검토 제출
- [ ] Git 커밋 및 푸시

배포 후 모니터링:
- [ ] 검토 승인 대기
- [ ] 사용자 피드백 확인
- [ ] 오류 리포트 모니터링
