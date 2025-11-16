# Chrome 웹스토어 업로드 빠른 시작 가이드

이 문서는 가장 빠르게 Chrome 웹스토어에 확장 프로그램을 업로드하는 방법을 안내합니다.

---

## 📦 준비된 파일

✅ **확장 프로그램 패키지**
- `chzzk-timetable-v1.0.0.zip` (177KB)

✅ **문서**
- `STORE_LISTING.md` - 웹스토어 설명 (한국어/영어)
- `PRIVACY_POLICY.md` - 개인정보 처리방침
- `privacy.html` - 개인정보 처리방침 웹페이지
- `SCREENSHOT_GUIDE.md` - 스크린샷 가이드
- `WEBSTORE_UPLOAD_GUIDE.md` - 상세 업로드 가이드

---

## 🚀 5단계로 빠르게 업로드하기

### 1단계: 개발자 계정 등록 (5분)

1. https://chrome.google.com/webstore/devconsole 접속
2. Google 계정 로그인
3. **개발자 등록비 $5 결제** (일회성)

---

### 2단계: 개인정보 처리방침 호스팅 (10분)

**가장 쉬운 방법: GitHub Pages**

```bash
# 1. GitHub에서 새 저장소 생성 (예: chzzk-timetable)

# 2. 로컬에서 Git 초기화 및 푸시
cd /mnt/f/Data/Git/ChromeExtension/chzzk-timetable
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Wd-70/chzzk-timetable.git
git push -u origin master

# 3. GitHub 저장소 → Settings → Pages 활성화
# - Source: Deploy from a branch
# - Branch: master / (root)
# - Save
```

**개인정보 처리방침 URL**:
```
https://wd-70.github.io/chzzk-timetable/privacy.html
```

이 URL을 복사해두세요! (나중에 사용)

---

### 3단계: 스크린샷 준비 (15분)

**최소 요구사항**: 1개 (권장: 3-5개)

**빠른 스크린샷 방법**:

1. 치지직 스트리머 페이지로 이동
2. 확장 프로그램 팝업 열기
3. Windows: Win+Shift+S / Mac: Cmd+Shift+4
4. 팝업 전체 캡처

**크기 조정**: https://www.iloveimg.com/resize-image
- 1280x800 또는 640x400으로 리사이즈

**권장 스크린샷**:
- 메인 화면 (시간표 보기)
- 투표 시스템 (좋아요/싫어요)
- 시간표 등록 화면

---

### 4단계: 웹스토어에 업로드 (20분)

#### A. 확장 프로그램 업로드

1. https://chrome.google.com/webstore/devconsole 접속
2. **"새 항목"** 클릭
3. `chzzk-timetable-v1.0.0.zip` 업로드

#### B. 기본 정보 입력

**제품 이름**:
```
치지직 시간표
```

**요약** (132자 이내):
```
치지직 스트리머의 방송 시간표를 커뮤니티와 함께 공유하고 확인할 수 있는 확장 프로그램입니다.
```

**설명**:
- `STORE_LISTING.md` 파일 열기
- "한국어 상세 설명" 섹션 전체 복사
- 웹스토어 설명란에 붙여넣기

**카테고리**:
```
생산성
```

#### C. 아이콘 및 스크린샷 업로드

**아이콘**:
- `images/icon128.png` 업로드

**스크린샷**:
- 준비한 스크린샷 3-5개 업로드
- 각 스크린샷에 간단한 설명 추가

#### D. 개인정보 설정

**개인정보 처리방침 URL**:
```
https://wd-70.github.io/chzzk-timetable/privacy.html
```
(2단계에서 복사한 URL)

**단일 용도 설명**:
```
치지직 스트리머의 주간 방송 시간표를 커뮤니티와 공유하고 확인합니다.
```

**권한 사용 설명**:

- **storage**:
  ```
  사용자의 투표 기록과 인증 정보를 로컬에 저장하기 위해 필요합니다.
  ```

- **activeTab**:
  ```
  현재 탭의 치지직 채널 정보를 확인하기 위해 필요합니다.
  ```

- **host_permissions (chzzk.naver.com)**:
  ```
  치지직 웹사이트의 채널 정보에 접근하기 위해 필요합니다.
  ```

- **host_permissions (api.chzzk.naver.com)**:
  ```
  치지직 API를 통해 채널 이름을 가져오기 위해 필요합니다.
  ```

**원격 코드 사용**:
```
아니요
```

#### E. 가격 및 배포

**가격**:
```
무료
```

**배포 지역**:
```
모든 지역
```

**공개 범위**:
```
공개
```

#### F. 지원 정보

**지원 이메일** (필수):
```
kjk7052@gmail.com
```

**웹사이트**:
```
https://github.com/Wd-70/chzzk-timetable
```

---

### 5단계: 검토 제출 (1분)

1. 모든 정보 입력 확인
2. **"미리보기"**로 확인
3. **"검토용으로 제출"** 클릭
4. 이메일 알림 대기 (1-3일)

---

## ✅ 체크리스트

업로드 전 필수 확인:

- [ ] 개발자 계정 등록 완료 ($5 결제)
- [ ] GitHub Pages로 개인정보 처리방침 호스팅
- [ ] 스크린샷 3개 이상 준비 (1280x800 또는 640x400)
- [ ] STORE_LISTING.md에서 설명 복사 준비
- [ ] 본인 이메일 주소 준비
- [ ] GitHub 저장소 URL 준비

---

## ✅ 모든 준비 완료!

모든 필요한 정보가 업데이트되었습니다:
- ✅ GitHub URL: https://github.com/Wd-70/chzzk-timetable
- ✅ 이메일: kjk7052@gmail.com
- ✅ 개인정보 처리방침 URL: https://wd-70.github.io/chzzk-timetable/privacy.html

---

## 🎯 다음 단계

검토 승인 후:

1. **README.md 업데이트**
   ```markdown
   ## 설치

   [Chrome 웹스토어에서 설치](https://chrome.google.com/webstore/detail/[extension-id])
   ```

2. **커뮤니티 홍보**
   - 치지직 관련 커뮤니티에 공유
   - SNS에 홍보

3. **피드백 수집**
   - GitHub Issues 모니터링
   - 사용자 리뷰 응답

---

## ❓ 자주 묻는 질문

**Q: 검토에 얼마나 걸리나요?**
A: 보통 1-3 영업일 소요됩니다.

**Q: 거부되면 어떻게 하나요?**
A: 거부 사유를 확인하고 수정 후 재제출하면 됩니다.

**Q: 개인정보 처리방침이 꼭 필요한가요?**
A: 네, Firebase를 사용하므로 필수입니다.

**Q: 스크린샷 크기가 정확해야 하나요?**
A: 1280x800 또는 640x400을 권장하지만, 비슷한 비율이면 자동 조정됩니다.

**Q: 영어 버전도 꼭 필요한가요?**
A: 필수는 아니지만, 더 많은 사용자에게 노출되려면 권장합니다.

---

## 📚 상세 가이드

더 자세한 내용은 다음 문서를 참조하세요:

- **WEBSTORE_UPLOAD_GUIDE.md** - 전체 과정 상세 설명
- **SCREENSHOT_GUIDE.md** - 스크린샷 촬영 가이드
- **STORE_LISTING.md** - 스토어 등록 정보

---

## 💡 팁

1. **시간 절약**: 개인정보 처리방침은 GitHub Pages가 가장 빠름
2. **스크린샷**: 실제 사용 화면을 보여주는 것이 효과적
3. **설명**: 간결하고 명확하게, 주요 기능 강조
4. **권한**: 왜 필요한지 명확히 설명
5. **검토**: 한 번에 통과하려면 체크리스트 꼼꼼히 확인

---

## 🎉 성공하셨나요?

축하합니다! 이제 치지직 커뮤니티와 시간표를 공유할 수 있습니다.

문제가 있으시면 GitHub Issues로 문의해 주세요.

행운을 빕니다! 🚀
