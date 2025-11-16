# 치지직 시간표 확장 프로그램 - 설계 문서 v2.0

## 1. 프로젝트 개요

### 1.1 목적
치지직 방송의 시간표를 시청자들이 공동으로 관리하고 확인할 수 있는 위키 기반 크롬 확장 프로그램

### 1.2 핵심 가치
- 위키형 협업: 누구나 시간표를 등록/수정 가능
- 자율 관리: 좋아요/싫어요 시스템으로 품질 관리
- 접근성: 회원가입 없이 간편하게 사용

### 1.3 주요 변경사항 (v1 → v2)
- 로컬 스토리지 → 서버 기반 데이터 저장
- 단일 시간표 → 다중 시간표 지원
- 단순 제보 → 위키형 협업 시스템
- 품질 관리 시스템 추가 (좋아요/싫어요)

---

## 2. 기술 스택 선택

### 2.1 백엔드: Firebase (추천) vs MongoDB

#### Firebase 추천 이유:
✅ **Firestore**: 실시간 NoSQL 데이터베이스
✅ **Firebase Auth**: 익명 인증 기본 제공
✅ **Firebase Storage**: 이미지 호스팅 (선택사항)
✅ **실시간 동기화**: 시간표 업데이트 즉시 반영
✅ **무료 티어**: 소규모 프로젝트에 충분
✅ **빠른 개발**: 백엔드 서버 구축 불필요
✅ **보안 규칙**: 데이터베이스 접근 제어 간편

#### MongoDB를 선택하는 경우:
- 자체 서버 구축 필요 (Express.js 등)
- MongoDB Atlas 클라우드 사용 가능
- 복잡한 쿼리가 필요한 경우 유리
- 백엔드 API 개발 경험이 있는 경우

**→ 결론: Firebase 사용 권장**

### 2.2 인증 시스템 선택

#### 옵션 1: 치지직 계정 연동
- **장점**: 사용자 경험 우수, 신원 확인 가능
- **단점**: 치지직 공식 OAuth API 없음 (확인 필요)
- **대안**: 쿠키 기반 인증 (보안 문제 가능성)

#### 옵션 2: 이더리움 지갑
- **장점**: 탈중앙화, 익명성
- **단점**: 일반 사용자에게 복잡함, UX 나쁨, 지갑 관리 부담

#### 옵션 3: Firebase 익명 인증 + 디바이스 ID (추천)
- **장점**: 회원가입 불필요, 간편함, 디바이스별 고유 ID
- **단점**: 다른 브라우저/기기에서 다른 사용자로 인식
- **구현**: Firebase Anonymous Authentication

#### 옵션 4: 간단한 닉네임 시스템
- **장점**: 매우 간단함
- **단점**: 중복 방지, 남용 가능성

**→ 결론: Firebase 익명 인증 사용 권장**
- 필요시 추후 닉네임 설정 기능 추가 가능
- 관리자는 Firebase Console에서 UID로 관리

---

## 3. 데이터베이스 설계

### 3.1 Firestore 컬렉션 구조

```
firestore/
├── channels/                          # 채널 정보
│   └── {channelId}/
│       ├── channelId: string
│       ├── channelName: string
│       ├── createdAt: timestamp
│       └── lastUpdated: timestamp
│
├── timetables/                        # 시간표 정보
│   └── {timetableId}/                 # 자동 생성 ID
│       ├── channelId: string          # 어느 채널의 시간표인지
│       ├── imageUrl: string           # 시간표 이미지 URL
│       ├── thumbnailUrl: string       # 썸네일 URL (선택)
│       ├── weekStartDate: string      # 주 시작일 (YYYY-MM-DD)
│       ├── weekEndDate: string        # 주 종료일 (YYYY-MM-DD)
│       ├── uploadedBy: string         # 업로더 UID
│       ├── uploadedAt: timestamp
│       ├── likes: number              # 좋아요 수
│       ├── dislikes: number           # 싫어요 수
│       ├── isHidden: boolean          # 숨김 여부
│       ├── isRemoved: boolean         # 관리자 삭제 여부
│       └── reportCount: number        # 신고 횟수
│
├── votes/                             # 좋아요/싫어요 투표 기록
│   └── {userId}_{timetableId}/        # 복합 ID
│       ├── userId: string
│       ├── timetableId: string
│       ├── voteType: string           # 'like' or 'dislike'
│       └── votedAt: timestamp
│
├── reports/                           # 신고 내역
│   └── {reportId}/                    # 자동 생성 ID
│       ├── timetableId: string
│       ├── reportedBy: string         # 신고자 UID
│       ├── reason: string             # 신고 사유
│       ├── reportedAt: timestamp
│       └── status: string             # 'pending', 'resolved', 'dismissed'
│
└── users/                             # 사용자 정보 (선택)
    └── {userId}/
        ├── userId: string
        ├── nickname: string           # 선택적 닉네임
        ├── createdAt: timestamp
        ├── isAdmin: boolean
        └── isBanned: boolean
```

### 3.2 인덱스 설정 (성능 최적화)

```javascript
// Firestore Indexes 필요
timetables:
  - channelId (ASC) + weekStartDate (DESC)
  - channelId (ASC) + isHidden (ASC) + isRemoved (ASC) + likes (DESC)
  - channelId (ASC) + weekStartDate (ASC) + isHidden (ASC)

reports:
  - timetableId (ASC) + status (ASC)
  - status (ASC) + reportedAt (DESC)
```

---

## 4. 시스템 아키텍처

### 4.1 컴포넌트 구조

```
Chrome Extension
├── Popup (UI)
│   ├── 시간표 뷰어
│   ├── 시간표 선택기 (썸네일)
│   ├── 시간표 업로드
│   └── 좋아요/싫어요 버튼
│
├── Content Script
│   └── 방송 페이지 버튼 (선택)
│
├── Background Service Worker
│   └── Firebase 통신 관리
│
└── Firebase SDK
    ├── Firestore (데이터)
    ├── Auth (인증)
    └── Storage (선택)
```

### 4.2 데이터 흐름

```
1. 사용자 인증:
   사용자 → Firebase Auth → 익명 UID 발급

2. 시간표 조회:
   Popup → Firestore Query (channelId + weekStartDate) → 시간표 목록 표시

3. 시간표 등록:
   사용자 → 이미지 URL 입력 → Firestore Create → 실시간 업데이트

4. 좋아요/싫어요:
   사용자 → votes 컬렉션 체크 → 투표 기록 → timetable 카운트 업데이트

5. 자동 숨김:
   dislikes > likes + threshold → isHidden = true

6. 관리자 검토:
   관리자 → reports 조회 → isRemoved 설정 또는 isHidden 해제
```

---

## 5. 주요 기능 상세 설계

### 5.1 시간표 등록/수정

#### 등록 프로세스:
1. 사용자가 이미지 URL 입력
2. 현재 주차 자동 계산 (월요일 기준)
3. Firestore에 새 문서 생성
4. 실시간으로 다른 사용자에게 표시

#### 주차 계산 로직:
```javascript
function getCurrentWeek() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - (now.getDay() + 6) % 7);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0]
  };
}
```

### 5.2 시간표 선택 UI

#### 썸네일 뷰:
```
┌─────────────────────────────────────┐
│  현재 주차: 2025-01-13 ~ 01-19     │
├─────────────────────────────────────┤
│  ┌────┐  ┌────┐  ┌────┐           │
│  │ 👍 │  │ 👍 │  │ ⚠️│           │
│  │ 42 │  │ 15 │  │ -3│           │
│  └────┘  └────┘  └────┘           │
│   활성     선택    숨김            │
└─────────────────────────────────────┘
```

#### 정렬 순서:
1. isHidden = false 우선
2. likes - dislikes 높은 순
3. uploadedAt 최신순

### 5.3 좋아요/싫어요 시스템

#### 투표 로직:
```javascript
async function vote(userId, timetableId, voteType) {
  const voteDocId = `${userId}_${timetableId}`;
  const voteRef = db.collection('votes').doc(voteDocId);
  const timetableRef = db.collection('timetables').doc(timetableId);

  // Transaction으로 동시성 문제 해결
  await db.runTransaction(async (transaction) => {
    const voteDoc = await transaction.get(voteRef);
    const timetableDoc = await transaction.get(timetableRef);

    const currentData = timetableDoc.data();
    const oldVote = voteDoc.exists ? voteDoc.data().voteType : null;

    // 기존 투표 취소
    if (oldVote === 'like') currentData.likes--;
    if (oldVote === 'dislike') currentData.dislikes--;

    // 새 투표 적용
    if (voteType === 'like') currentData.likes++;
    if (voteType === 'dislike') currentData.dislikes++;

    // 자동 숨김 체크
    if (currentData.dislikes > currentData.likes + 5) {
      currentData.isHidden = true;
    }

    transaction.set(voteRef, { userId, timetableId, voteType, votedAt: new Date() });
    transaction.update(timetableRef, currentData);
  });
}
```

#### 숨김 정책:
- `dislikes > likes + 5`: 자동 숨김
- 숨긴 시간표는 UI에서 기본적으로 표시 안 함
- "숨겨진 시간표 보기" 옵션으로 확인 가능

### 5.4 신고 시스템

#### 신고 사유:
- 잘못된 시간표
- 부적절한 이미지
- 광고/스팸
- 기타 (직접 입력)

#### 신고 처리:
1. 사용자가 신고 → reports 컬렉션에 기록
2. 같은 시간표에 대한 신고가 3건 이상 → 관리자 알림
3. 관리자가 Firebase Console에서 검토
4. isRemoved = true 설정 또는 정상으로 복구

---

## 6. Firebase 보안 규칙

### 6.1 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 인증된 사용자만 읽기/쓰기 가능
    function isAuthenticated() {
      return request.auth != null;
    }

    // 관리자 체크
    function isAdmin() {
      return isAuthenticated() &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // 채널 정보: 모두 읽기, 인증된 사용자만 생성
    match /channels/{channelId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // 시간표: 모두 읽기, 인증된 사용자만 생성
    match /timetables/{timetableId} {
      allow read: if true;
      allow create: if isAuthenticated() &&
                       request.resource.data.uploadedBy == request.auth.uid;
      allow update: if isAdmin() ||
                       (isAuthenticated() &&
                        resource.data.uploadedBy == request.auth.uid &&
                        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['imageUrl', 'weekStartDate', 'weekEndDate']));
      allow delete: if isAdmin();
    }

    // 투표: 본인 투표만 수정 가능
    match /votes/{voteId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() &&
                      request.resource.data.userId == request.auth.uid;
    }

    // 신고: 인증된 사용자만 생성
    match /reports/{reportId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // 사용자 정보
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && userId == request.auth.uid;
    }
  }
}
```

---

## 7. UI/UX 설계

### 7.1 팝업 화면 구성

```
┌─────────────────────────────────────┐
│  치지직 시간표                      │
├─────────────────────────────────────┤
│  📺 채널: 우왁굳                    │
│  🆔 ID: c4be6dc106a0b885ea84cc...  │
├─────────────────────────────────────┤
│  📅 이번 주 (01/13 ~ 01/19)        │
│                                     │
│  ┌──────────────────────┐          │
│  │                       │          │
│  │   [시간표 이미지]     │          │
│  │                       │          │
│  └──────────────────────┘          │
│                                     │
│  👍 42  👎 5   업로더: 익명123     │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐             │
│  │ 📊 │ │ 📊 │ │ 📊 │  다른 시간표│
│  └────┘ └────┘ └────┘             │
├─────────────────────────────────────┤
│  ➕ 새 시간표 등록                 │
│  [이미지 URL 입력창]                │
│  [등록하기]                         │
├─────────────────────────────────────┤
│  ⚙️ 설정                            │
│  □ 방송 페이지에 버튼 표시          │
│  □ 숨겨진 시간표 보기               │
└─────────────────────────────────────┘
```

### 7.2 반응형 디자인
- 팝업 크기: 400px × 600px
- 썸네일 크기: 100px × 100px
- 메인 이미지: 최대 360px 너비

---

## 8. 개발 로드맵

### Phase 1: 기본 인프라 구축 (1-2주)
- [ ] Firebase 프로젝트 생성
- [ ] Firestore 컬렉션 구조 설정
- [ ] Firebase Auth 익명 인증 설정
- [ ] 보안 규칙 작성 및 테스트
- [ ] Firebase SDK를 확장 프로그램에 통합

### Phase 2: 핵심 기능 구현 (2-3주)
- [ ] 시간표 조회 기능
- [ ] 시간표 등록 기능
- [ ] 주차 계산 로직
- [ ] 실시간 업데이트 리스너
- [ ] 다중 시간표 UI (썸네일)

### Phase 3: 품질 관리 시스템 (1-2주)
- [ ] 좋아요/싫어요 기능
- [ ] 투표 중복 방지
- [ ] 자동 숨김 로직
- [ ] 신고 기능
- [ ] 관리자 대시보드 (Firebase Console 활용)

### Phase 4: UX 개선 (1주)
- [ ] 로딩 상태 표시
- [ ] 에러 처리
- [ ] 오프라인 대응
- [ ] 이미지 URL 유효성 검사
- [ ] 미리보기 기능

### Phase 5: 테스트 및 배포 (1주)
- [ ] 단위 테스트
- [ ] 통합 테스트
- [ ] 베타 테스트
- [ ] Chrome Web Store 등록
- [ ] 사용자 피드백 수집

---

## 9. 비용 예상 (Firebase 무료 티어)

### Firebase Spark Plan (무료):
- **Firestore**: 1GB 저장소, 50K 읽기/일, 20K 쓰기/일
- **Auth**: 무제한 익명 인증
- **Hosting**: 10GB 전송/월 (필요시)

### 예상 사용량 (가정: 1,000 활성 사용자/일):
- 읽기: 5,000 reads/day (시간표 조회)
- 쓰기: 500 writes/day (등록, 투표)
- 저장소: < 100MB

**→ 무료 티어로 충분히 운영 가능**

초과 시 Blaze Plan (종량제):
- $0.036/100K reads
- $0.108/100K writes

---

## 10. 고려사항 및 리스크

### 10.1 기술적 고려사항
- **이미지 호스팅**: 외부 URL 의존 → 링크 깨짐 가능성
  - 해결: Firebase Storage에 이미지 직접 업로드 옵션 제공
- **URL 유효성**: 악의적인 URL 입력 가능
  - 해결: URL 유효성 검사, HTTPS만 허용
- **스팸/남용**: 무분별한 등록
  - 해결: Rate limiting, 익명 UID 기반 제한

### 10.2 법적 고려사항
- **저작권**: 시간표 이미지 저작권 문제
  - 해결: 업로더 책임 명시, 신고 시스템
- **개인정보**: 익명 UID만 저장, GDPR 준수
  - 해결: Firebase Auth의 익명 인증 활용

### 10.3 확장 가능성
- 주차별 히스토리 보기
- 방송 알림 기능 (시간표 기반)
- 다른 플랫폼 지원 (트위치, 유튜브)
- 시간표 자동 생성 AI

---

## 11. 대안 시나리오: 이더리움 지갑 인증

만약 이더리움 지갑을 사용한다면:

### 11.1 구현 방법
```javascript
// 지갑 생성
import { ethers } from 'ethers';

async function createWallet() {
  const wallet = ethers.Wallet.createRandom();

  // 로컬 스토리지에 암호화 저장
  const encryptedWallet = await wallet.encrypt('user-password');
  chrome.storage.local.set({ wallet: encryptedWallet });

  return wallet.address;
}

// 서명 기반 인증
async function signAuth(wallet) {
  const message = `Sign in to Chzzk Timetable\nTimestamp: ${Date.now()}`;
  const signature = await wallet.signMessage(message);

  // 서버에서 검증
  return { address: wallet.address, signature, message };
}
```

### 11.2 장단점
- 👍 탈중앙화, 익명성
- 👍 지갑 주소로 기여 추적 가능
- 👎 일반 사용자에게 복잡함
- 👎 비밀키 분실 시 복구 불가
- 👎 백엔드에서 서명 검증 필요

**→ 결론: 치지직 확장 프로그램에는 과도하게 복잡함**

---

## 12. 결론 및 권장사항

### 최종 추천 스택:
- **백엔드**: Firebase (Firestore + Auth)
- **인증**: Firebase 익명 인증
- **프론트엔드**: 기존 HTML/CSS/JS (또는 React 리팩토링)
- **배포**: Chrome Web Store

### 개발 시작 순서:
1. Firebase 프로젝트 생성 및 설정
2. Firestore 데이터 모델 구현
3. 익명 인증 통합
4. 기본 CRUD 기능 구현
5. UI 개선 및 UX 최적화
6. 품질 관리 시스템 추가
7. 테스트 및 배포

### 예상 개발 기간:
- 최소: 4-6주 (기본 기능)
- 권장: 6-8주 (품질 관리 포함)

---

## 13. 참고 자료

### Firebase 문서:
- Firestore 시작하기: https://firebase.google.com/docs/firestore
- Firebase Auth 익명 인증: https://firebase.google.com/docs/auth/web/anonymous-auth
- 보안 규칙: https://firebase.google.com/docs/firestore/security/get-started

### Chrome Extension:
- Manifest V3: https://developer.chrome.com/docs/extensions/mv3/
- Firebase in Extension: https://firebase.google.com/docs/web/setup

### 디자인 참고:
- Chrome Extension 디자인 가이드: https://developer.chrome.com/docs/extensions/mv3/user_interface/
- Material Design: https://material.io/design
