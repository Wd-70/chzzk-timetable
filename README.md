# 치지직 시간표

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**치지직 스트리머의 방송 시간표를 커뮤니티와 함께 공유하고 확인하는 Chrome 확장 프로그램**

[설치하기](#설치-방법) • [사용 방법](#사용-방법) • [기능](#주요-기능) • [문의](#문의-및-지원)

</div>

---

## 📋 소개

치지직(Chzzk) 스트리머의 주간 방송 시간표를 커뮤니티 기반으로 공유하고 확인할 수 있는 확장 프로그램입니다. 누구나 시간표를 등록할 수 있고, 좋아요/싫어요 투표로 정확한 시간표를 검증할 수 있습니다.

---

## ✨ 주요 기능

### 📅 주간 시간표 확인
- 스트리머별 주간 방송 시간표를 한눈에 확인
- 이전/다음 주 시간표 탐색
- 여러 시간표가 있을 경우 썸네일로 비교

### 👍 커뮤니티 투표
- 좋아요/싫어요로 시간표 검증
- 점수가 높은 시간표가 우선 표시
- 정확한 정보 공유 유도

### ✨ 누구나 등록 가능
- 시간표 이미지 URL만 있으면 바로 등록
- 익명 인증으로 간편하게 사용
- 백업 코드로 여러 기기에서 동일 계정 사용

### 🔐 안전한 관리
- 잘못된 시간표 신고 기능
- 본인이 등록한 시간표 삭제 가능
- 관리자 시스템으로 부적절한 콘텐츠 관리

### 🎨 세련된 UI
- 치지직 스타일에 맞춘 다크 테마
- 직관적이고 사용하기 쉬운 인터페이스
- 반응형 디자인

---

## 🚀 설치 방법

### Chrome 웹스토어에서 설치 (권장)

곧 출시 예정!

### 개발자 모드로 설치

1. 이 저장소를 클론하거나 다운로드합니다:
   ```bash
   git clone https://github.com/Wd-70/chzzk-timetable.git
   ```

2. Chrome 브라우저에서 `chrome://extensions/` 페이지로 이동합니다.

3. 오른쪽 상단의 **개발자 모드**를 활성화합니다.

4. **압축해제된 확장 프로그램을 로드합니다** 버튼을 클릭합니다.

5. 다운로드한 폴더를 선택합니다.

---

## 📖 사용 방법

### 1️⃣ 시간표 확인하기

1. 치지직 스트리머 페이지로 이동합니다
   (예: `https://chzzk.naver.com/live/xxxxx`)

2. 브라우저 확장 프로그램 아이콘을 클릭합니다

3. 현재 주의 시간표를 확인하거나, 이전/다음 주로 이동할 수 있습니다

### 2️⃣ 시간표 등록하기

1. 확장 프로그램 팝업 하단의 **시간표 등록하기** 섹션으로 이동

2. 시간표 이미지 URL을 입력합니다
   (이미지는 온라인에 업로드되어 있어야 합니다)

3. **등록하기** 버튼을 클릭합니다

### 3️⃣ 투표하기

- **👍 좋아요**: 정확한 시간표에 투표
- **👎 싫어요**: 잘못된 시간표에 투표
- 한 번 더 클릭하면 투표 취소

### 4️⃣ 잘못된 시간표 신고하기

1. 잘못된 시간표를 발견하면 **🚨 잘못된 시간표 신고** 버튼 클릭

2. 신고 사유를 선택하거나 직접 입력

3. 관리자가 검토 후 조치합니다

---

## 🔧 기술 스택

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Google Firebase
  - Firestore (데이터베이스)
  - Firebase Authentication (익명 인증)
- **API**: Chzzk API (채널 정보 조회)
- **Manifest**: Chrome Extension Manifest V3

---

## 📁 프로젝트 구조

```
chzzk-timetable/
├── manifest.json          # Chrome 확장 프로그램 설정
├── popup.html/js/css      # 메인 팝업 UI
├── admin.html/js/css      # 관리자 페이지
├── content.js/css         # 콘텐츠 스크립트
├── background.js          # 백그라운드 스크립트
├── firebase-service.js    # Firebase 서비스 로직
├── firebase-config.js     # Firebase 설정
├── admin-config.js        # 관리자 설정
├── utils.js               # 유틸리티 함수
├── privacy.html           # 개인정보 처리방침
└── firebase-sdk/          # Firebase SDK 파일
```

---

## 🔐 개인정보 처리방침

이 확장 프로그램은 사용자의 개인정보를 보호합니다:

- ✅ **익명 인증 사용**: 이메일, 이름 등 개인 식별 정보 불필요
- ✅ **최소 데이터 수집**: 시간표 등록 및 투표 기록만 저장
- ✅ **암호화 저장**: 모든 데이터는 Firebase에 암호화되어 저장
- ✅ **제3자 미공유**: 수집된 정보는 제3자와 공유하지 않음

자세한 내용: [개인정보 처리방침](https://wd-70.github.io/chzzk-timetable/privacy.html)

---

## 🛠️ 개발 가이드

### 환경 설정

1. Firebase 프로젝트 생성:
   - [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
   - Firestore Database 활성화
   - Authentication > 익명 로그인 활성화

2. Firebase 설정 파일 업데이트:
   ```javascript
   // firebase-config.js
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     projectId: "YOUR_PROJECT_ID",
     // ...
   };
   ```

3. Firestore 보안 규칙 설정:
   - Firebase Console > Firestore Database > 규칙
   - `firestore.rules` 내용 복사

4. Firestore 인덱스 생성:
   - 앱을 사용하다가 발생하는 인덱스 필요 오류에서 자동 생성 링크 클릭

### 로컬 개발

```bash
# 저장소 클론
git clone https://github.com/Wd-70/chzzk-timetable.git

# Chrome에서 로드
# chrome://extensions/ → 개발자 모드 → 압축해제된 확장 프로그램 로드
```

---

## 🤝 기여하기

기여는 언제나 환영합니다! 다음과 같은 방법으로 기여할 수 있습니다:

1. **버그 리포트**: [Issues](https://github.com/Wd-70/chzzk-timetable/issues)에 버그를 등록해주세요
2. **기능 제안**: 새로운 기능 아이디어를 제안해주세요
3. **Pull Request**: 코드 개선사항을 PR로 제출해주세요

### PR 가이드라인

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 🐛 알려진 이슈

현재 알려진 이슈는 [Issues](https://github.com/Wd-70/chzzk-timetable/issues) 페이지에서 확인할 수 있습니다.

---

## 📝 변경 이력

### v1.0.0 (2025-03-16)
- 🎉 첫 공개 릴리스
- ✨ 주간 시간표 보기 기능
- ✨ 커뮤니티 투표 시스템
- ✨ 시간표 등록 및 신고 기능
- ✨ 관리자 페이지
- 🎨 다크 테마 UI

---

## 💡 FAQ

### Q: 시간표 이미지는 어디에 업로드하나요?
A: 이미지를 먼저 이미지 호스팅 서비스(Imgur, 디스코드 등)에 업로드한 후, 그 URL을 입력하면 됩니다.

### Q: 백업 코드는 무엇인가요?
A: 다른 기기에서 동일한 계정으로 사용하기 위한 코드입니다. 백업 코드를 다른 기기에서 복원하면 투표 기록과 업로드 기록이 동기화됩니다.

### Q: 관리자가 되려면 어떻게 하나요?
A: 이 프로젝트의 관리자는 개발자가 지정합니다. 일반 사용자는 신고 기능을 통해 부적절한 콘텐츠를 신고할 수 있습니다.

### Q: 내가 등록한 시간표를 삭제하려면?
A: 본인이 등록한 시간표는 **🗑️ 내가 등록한 시간표 삭제** 버튼으로 삭제할 수 있습니다.

---

## 📞 문의 및 지원

- **이메일**: kjk7052@gmail.com
- **GitHub Issues**: [https://github.com/Wd-70/chzzk-timetable/issues](https://github.com/Wd-70/chzzk-timetable/issues)
- **후원**: [Buy me a coffee](https://buymeacoffee.com/wd70)

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 🙏 감사의 말

- 치지직 플랫폼을 제공해주신 네이버
- Firebase를 제공해주신 Google
- 이 프로젝트에 기여해주신 모든 분들

---

<div align="center">

**Made with ❤️ for Chzzk Community**

⭐ 이 프로젝트가 유용하다면 Star를 눌러주세요!

</div>
