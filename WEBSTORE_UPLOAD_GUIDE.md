# Chrome 웹스토어 업로드 가이드

## 📋 목차
1. [사전 준비](#사전-준비)
2. [개발자 계정 등록](#개발자-계정-등록)
3. [개인정보 처리방침 호스팅](#개인정보-처리방침-호스팅)
4. [확장 프로그램 업로드](#확장-프로그램-업로드)
5. [스토어 등록 정보 작성](#스토어-등록-정보-작성)
6. [검토 및 게시](#검토-및-게시)
7. [문제 해결](#문제-해결)

---

## 사전 준비

### ✅ 준비물 체크리스트

- [ ] **확장 프로그램 ZIP 파일**
  - 파일: `chzzk-timetable-v1.0.0.zip`
  - 크기: 약 177KB
  - 위치: 프로젝트 루트 폴더

- [ ] **스크린샷** (최소 1개, 권장 3-5개)
  - 크기: 1280x800 또는 640x400
  - 형식: PNG 또는 JPG
  - 가이드: `SCREENSHOT_GUIDE.md` 참조

- [ ] **아이콘 이미지**
  - 128x128: `images/icon128.png`
  - 48x48: `images/icon48.png`
  - 16x16: `images/icon16.png`

- [ ] **개인정보 처리방침 URL**
  - 문서: `PRIVACY_POLICY.md`
  - 호스팅 필요 (아래 참조)

- [ ] **스토어 설명**
  - 문서: `STORE_LISTING.md`
  - 한국어 + 영어 버전

- [ ] **결제 수단**
  - 개발자 등록비: $5 (일회성)

---

## 개발자 계정 등록

### 1단계: Chrome Web Store 개발자 대시보드 접속

1. https://chrome.google.com/webstore/devconsole 방문
2. Google 계정으로 로그인
3. 약관 동의 및 계정 생성

### 2단계: 개발자 등록비 결제

1. **금액**: $5 (USD) - 일회성 결제
2. **결제 수단**: 신용카드 또는 체크카드
3. 결제 완료 후 개발자 계정 활성화 (보통 즉시)

### 3단계: 개발자 정보 입력

필수 입력 정보:
- 개발자 이름 (공개됨)
- 이메일 주소 (공개됨)
- 웹사이트 URL (선택사항)

**팁**:
- 이메일은 지원 문의를 받을 주소
- GitHub 프로필 URL을 웹사이트로 사용 가능

---

## 개인정보 처리방침 호스팅

Chrome 웹스토어는 개인정보 처리방침 **URL**을 요구합니다.

### 옵션 1: GitHub Pages (추천)

**장점**: 무료, 간단, 버전 관리

**단계**:

1. **GitHub 저장소 생성** (이미 있다면 스킵)
   ```bash
   # 로컬에서
   cd /mnt/f/Data/Git/ChromeExtension/chzzk-timetable
   git init
   git add .
   git commit -m "Initial commit"

   # GitHub에서 저장소 생성 후
   git remote add origin https://github.com/Wd-70/chzzk-timetable.git
   git push -u origin master
   ```

2. **GitHub Pages 활성화**
   - GitHub 저장소 → Settings → Pages
   - Source: Deploy from a branch
   - Branch: master / (root)
   - Save

3. **PRIVACY_POLICY.md를 index.html로 변환** (선택)

   또는 직접 링크 사용:
   ```
   https://wd-70.github.io/chzzk-timetable/PRIVACY_POLICY.md
   ```

   더 나은 방법: HTML 파일 생성
   ```bash
   # privacy.html 파일 생성
   ```

4. **개인정보 처리방침 URL**:
   ```
   https://wd-70.github.io/chzzk-timetable/privacy.html
   ```

### 옵션 2: 기타 무료 호스팅

- **Netlify**: https://www.netlify.com/
- **Vercel**: https://vercel.com/
- **Notion**: 공개 페이지로 작성

**중요**: URL은 HTTPS여야 하고, 누구나 접근 가능해야 합니다.

---

## 확장 프로그램 업로드

### 1단계: 새 항목 만들기

1. Chrome Web Store 개발자 대시보드 접속
2. **"새 항목"** 버튼 클릭

### 2단계: ZIP 파일 업로드

1. `chzzk-timetable-v2.0.0.zip` 파일 선택
2. 업로드 대기 (약 10-30초)
3. 자동 검증 진행

**가능한 오류**:
- ❌ "Manifest file is missing or unreadable"
  - manifest.json이 루트에 있는지 확인
- ❌ "Permission warnings"
  - 정상 (다음 단계에서 설명 추가)

### 3단계: 스토어 등록 정보 입력

업로드 성공 후 자동으로 다음 페이지로 이동합니다.

---

## 스토어 등록 정보 작성

`STORE_LISTING.md` 파일을 참조하여 작성하세요.

### 🌐 언어 선택

1. **기본 언어**: 한국어
2. **추가 언어**: 영어 (권장)

각 언어별로 다음 정보를 입력합니다.

---

### 📝 제품 세부정보 (한국어)

#### 1. 제품 이름
```
치지직 시간표
```

#### 2. 요약
*최대 132자*
```
치지직 스트리머의 방송 시간표를 커뮤니티와 함께 공유하고 확인할 수 있는 확장 프로그램입니다.
```

#### 3. 설명
*`STORE_LISTING.md`의 한국어 상세 설명 복사*

주요 내용:
- 주요 기능 (아이콘 포함)
- 사용 방법
- 개인정보 보호
- 문의 방법

#### 4. 카테고리
```
생산성
```

#### 5. 언어
```
한국어
```

---

### 📝 제품 세부정보 (영어)

영어 번역 추가:
1. 좌측 메뉴에서 **"언어 추가"** 클릭
2. **영어 (English)** 선택
3. `STORE_LISTING.md`의 영어 섹션 내용 입력

---

### 🖼️ 그래픽 에셋

#### 아이콘 (필수)
- **128x128 아이콘**: `images/icon128.png` 업로드

#### 스크린샷 (최소 1개 필수)
1. **"스크린샷 추가"** 클릭
2. 준비한 스크린샷 업로드 (3-5개 권장)
3. 각 스크린샷에 설명 추가:
   ```
   예시:
   - 스트리머의 주간 방송 시간표를 한눈에 확인하세요
   - 커뮤니티 투표로 정확한 시간표를 검증하세요
   ```

#### 프로모션 타일 (선택사항)
- Small tile (440x280)
- Large tile (920x680)
- Marquee (1400x560)

**참고**: `SCREENSHOT_GUIDE.md` 참조

---

### 🔒 개인정보

#### 1. 개인정보 처리방침 URL
```
https://wd-70.github.io/chzzk-timetable/privacy.html
```

#### 2. 단일 용도 설명
*확장 프로그램의 주요 기능을 한 문장으로*
```
한국어: 치지직 스트리머의 주간 방송 시간표를 커뮤니티와 공유하고 확인합니다.

영어: Share and view weekly broadcast schedules for Chzzk streamers with the community.
```

#### 3. 권한 사용 설명

**storage**
```
한국어: 사용자의 투표 기록과 인증 정보를 로컬에 저장하기 위해 필요합니다.
영어: Required to store user voting records and authentication data locally.
```

**activeTab**
```
한국어: 현재 탭의 치지직 채널 정보를 확인하기 위해 필요합니다.
영어: Required to identify the current Chzzk channel information.
```

**host_permissions (chzzk.naver.com)**
```
한국어: 치지직 웹사이트의 채널 정보에 접근하기 위해 필요합니다.
영어: Required to access Chzzk website channel information.
```

**host_permissions (api.chzzk.naver.com)**
```
한국어: 치지직 API를 통해 채널 이름을 가져오기 위해 필요합니다.
영어: Required to fetch channel names through the Chzzk API.
```

#### 4. 원격 코드 사용 여부
```
아니요
```

#### 5. 데이터 수집
Firebase를 사용하므로 다음 정보 선택:
- [ ] 개인 식별 정보 수집하지 않음
- [x] 인증 정보 (익명 ID)
- [x] 사용자 활동 (투표, 업로드)

**데이터 사용 목적**:
- [x] 앱 기능
- [ ] 분석
- [ ] 광고

**데이터 처리 방식**:
- [x] 암호화되어 전송
- [x] 삭제 요청 가능

---

### 💰 가격 및 배포

#### 1. 가격
```
무료
```

#### 2. 배포 지역
```
모든 지역
```

또는 특정 국가만 선택:
- 대한민국
- 기타 원하는 국가

#### 3. 공개 범위
```
공개 (누구나 검색 및 설치 가능)
```

---

### 📧 지원 및 연락처

#### 1. 지원 이메일 (필수)
```
kjk7052@gmail.com
```

#### 2. 웹사이트 URL (선택)
```
https://github.com/Wd-70/chzzk-timetable
```

#### 3. 지원 URL (선택)
```
https://github.com/Wd-70/chzzk-timetable/issues
```

---

## 검토 및 게시

### 1단계: 미리보기

1. **"미리보기"** 버튼 클릭
2. 스토어 등록 페이지가 어떻게 보이는지 확인
3. 오타나 누락된 정보 수정

### 2단계: 게시 제출

1. 모든 정보 입력 완료 확인
2. **"검토용으로 제출"** 버튼 클릭
3. 확인 메시지 읽고 동의

### 3단계: 검토 대기

- **예상 시간**: 1-3일 (영업일 기준)
- **이메일 알림**: 검토 결과 발송
- **상태 확인**: 개발자 대시보드에서 확인 가능

**검토 상태**:
- 🟡 **심사 대기중** (Pending Review)
- 🟢 **승인됨** (Published) → 웹스토어에 공개!
- 🔴 **거부됨** (Rejected) → 거부 사유 확인 및 수정

### 4단계: 게시 완료

승인되면:
- Chrome 웹스토어에서 검색 가능
- 확장 프로그램 URL 생성:
  ```
  https://chrome.google.com/webstore/detail/[extension-id]
  ```
- 이 URL을 README.md나 홍보 자료에 추가

---

## 문제 해결

### ❌ 자주 발생하는 거부 사유

#### 1. "개인정보 처리방침 URL이 작동하지 않음"
**해결**:
- URL이 HTTPS인지 확인
- 누구나 접근 가능한지 확인 (로그인 불필요)
- GitHub Pages가 활성화되었는지 확인

#### 2. "권한 설명이 불충분함"
**해결**:
- 각 권한에 대한 명확한 설명 추가
- 왜 필요한지 구체적으로 작성
- 사용자 데이터를 어떻게 보호하는지 명시

#### 3. "스크린샷 품질이 낮음"
**해결**:
- 1280x800 크기로 다시 캡처
- 선명하고 가독성 좋은 이미지 사용
- 개인정보 포함 여부 확인

#### 4. "메타데이터와 기능이 일치하지 않음"
**해결**:
- 설명과 실제 기능이 일치하는지 확인
- 과장된 표현 제거
- 스크린샷이 최신 버전인지 확인

#### 5. "원격 코드 사용 감지"
**해결**:
- Firebase SDK가 로컬에 포함되어 있는지 확인
- CDN 링크 사용하지 않기
- manifest.json의 CSP 확인

---

### 🔄 업데이트 프로세스

이미 게시된 확장 프로그램을 업데이트하려면:

1. **manifest.json 버전 업데이트**
   ```json
   {
     "version": "1.0.1"
   }
   ```

2. **새 ZIP 파일 생성**
   ```bash
   # Python 스크립트 재실행
   ```

3. **개발자 대시보드에서 업로드**
   - 기존 항목 선택
   - 패키지 탭 → 새 패키지 업로드
   - 변경 사항 설명 추가

4. **검토 제출**
   - 일반적으로 업데이트는 더 빨리 승인됨

---

### 📊 게시 후 확인사항

#### 1. 설치 테스트
```
자신의 확장 프로그램을 웹스토어에서 설치하여 테스트
```

#### 2. 리뷰 모니터링
```
사용자 리뷰에 정기적으로 응답
```

#### 3. 통계 확인
```
개발자 대시보드 → 통계
- 설치 수
- 사용자 수
- 평점
- 리뷰
```

#### 4. 문제 보고 처리
```
GitHub Issues로 들어오는 문제 해결
```

---

## ✅ 최종 체크리스트

업로드 전 마지막 확인:

- [ ] manifest.json의 name, description, version 확인
- [ ] Firebase 설정 파일에 실제 프로젝트 정보 입력됨
- [ ] 관리자 UID 목록 비어있음 (또는 본인 UID만)
- [ ] 테스트 코드나 console.log 제거
- [ ] PRIVACY_POLICY.md의 이메일/GitHub URL 업데이트
- [ ] STORE_LISTING.md의 GitHub URL 업데이트
- [ ] 스크린샷 3-5개 준비 완료
- [ ] 개인정보 처리방침 URL 호스팅 완료
- [ ] 개발자 계정 등록 및 $5 결제 완료

---

## 🎉 성공!

축하합니다! 확장 프로그램이 Chrome 웹스토어에 게시되었습니다.

### 다음 단계:
1. **README.md 업데이트**: 웹스토어 링크 추가
2. **SNS 공유**: 치지직 커뮤니티에 홍보
3. **피드백 수집**: 사용자 의견 청취
4. **지속적 개선**: 업데이트 계획 수립

---

## 📚 참고 자료

- [Chrome Web Store 개발자 문서](https://developer.chrome.com/docs/webstore/)
- [확장 프로그램 품질 가이드라인](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Web Store 개발자 계약](https://developer.chrome.com/docs/webstore/terms/)
- [Firebase 문서](https://firebase.google.com/docs)

---

## 💬 도움이 필요하신가요?

- **GitHub Issues**: https://github.com/Wd-70/chzzk-timetable/issues
- **Chrome Web Store 지원**: https://support.google.com/chrome_webstore/

행운을 빕니다! 🚀
