# Git 저장소 설정 가이드

이 문서는 코드를 GitHub에 푸시하고 GitHub Pages를 활성화하는 방법을 안내합니다.

---

## 📋 사전 확인

✅ GitHub 저장소: https://github.com/Wd-70/chzzk-timetable.git

---

## 🚀 1단계: Git 초기화 및 푸시

### A. Git 상태 확인

```bash
cd /mnt/f/Data/Git/ChromeExtension/chzzk-timetable
git status
```

### B. 기존 변경사항 커밋

```bash
# 모든 파일 추가
git add .

# 커밋 메시지 작성
git commit -m "Initial release v1.0.0

- Chrome 웹스토어 업로드 준비
- 개인정보 처리방침 및 문서 추가
- GitHub Pages용 privacy.html 추가"
```

### C. GitHub 원격 저장소 추가 (이미 되어있다면 스킵)

```bash
# 원격 저장소가 이미 설정되어 있는지 확인
git remote -v

# 없으면 추가 (이미 추가했다면 스킵)
git remote add origin https://github.com/Wd-70/chzzk-timetable.git
```

### D. 푸시

```bash
# master 브랜치로 푸시
git push -u origin master
```

**주의**: 현재 브랜치 이름이 `main`인 경우:
```bash
git branch -M master  # main을 master로 이름 변경
git push -u origin master
```

또는 main 브랜치 그대로 사용:
```bash
git push -u origin main
```

---

## 🌐 2단계: GitHub Pages 활성화

### A. GitHub 웹사이트 접속

1. https://github.com/Wd-70/chzzk-timetable 접속
2. 상단 메뉴에서 **Settings** 클릭
3. 왼쪽 사이드바에서 **Pages** 클릭

### B. GitHub Pages 설정

1. **Source** 섹션:
   - Branch: `master` (또는 `main`) 선택
   - Folder: `/ (root)` 선택
   - **Save** 클릭

2. 설정 완료 후 몇 분 기다리기 (보통 1-3분)

3. 페이지 새로고침하면 상단에 URL 표시:
   ```
   Your site is live at https://wd-70.github.io/chzzk-timetable/
   ```

### C. 개인정보 처리방침 URL 확인

브라우저에서 다음 URL 접속하여 확인:
```
https://wd-70.github.io/chzzk-timetable/privacy.html
```

✅ 정상적으로 페이지가 표시되면 성공!

---

## 📝 3단계: 개인정보 처리방침 URL 메모

Chrome 웹스토어 업로드 시 사용할 URL:
```
https://wd-70.github.io/chzzk-timetable/privacy.html
```

이 URL을 복사해서 안전한 곳에 저장해두세요!

---

## 🔄 향후 업데이트 방법

코드를 수정한 후:

```bash
# 변경사항 확인
git status

# 파일 추가
git add .

# 커밋
git commit -m "업데이트 내용 설명"

# 푸시
git push
```

GitHub Pages는 자동으로 업데이트됩니다 (1-3분 소요).

---

## ❓ 문제 해결

### 문제 1: "remote origin already exists"

```bash
# 기존 origin 제거
git remote remove origin

# 다시 추가
git remote add origin https://github.com/Wd-70/chzzk-timetable.git
```

### 문제 2: "permission denied"

GitHub 인증이 필요합니다:
- **Personal Access Token** 사용 권장
- Settings → Developer settings → Personal access tokens
- Generate new token (repo 권한 필요)

```bash
# 푸시할 때 username과 token 입력
# Username: Wd-70
# Password: [생성한 Personal Access Token]
```

### 문제 3: GitHub Pages가 활성화되지 않음

1. 저장소가 public인지 확인
2. Settings → Pages에서 다시 설정
3. 브랜치 이름이 올바른지 확인 (master vs main)
4. 캐시 문제일 수 있으니 5-10분 기다려보기

### 문제 4: privacy.html이 404 오류

1. 파일이 저장소 루트에 있는지 확인:
   ```bash
   ls -la privacy.html
   ```

2. 파일이 커밋되고 푸시되었는지 확인:
   ```bash
   git log --oneline
   ```

3. GitHub 웹사이트에서 파일 확인:
   https://github.com/Wd-70/chzzk-timetable/blob/master/privacy.html

---

## ✅ 완료 체크리스트

- [ ] 코드를 GitHub에 푸시 완료
- [ ] GitHub Pages 활성화 완료
- [ ] privacy.html URL 접속 확인
- [ ] URL 메모 완료: `https://wd-70.github.io/chzzk-timetable/privacy.html`

---

## 🎯 다음 단계

GitHub 설정이 완료되었으면:

1. **WEBSTORE_QUICKSTART.md** 파일 열기
2. 3단계(스크린샷 준비)부터 진행
3. Chrome 웹스토어 업로드!

행운을 빕니다! 🚀
