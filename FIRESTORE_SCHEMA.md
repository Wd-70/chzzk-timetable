# Firestore 최적화 데이터 스키마

## 무료 티어 제한사항
- 저장소: 1GB
- 읽기: 50,000회/일
- 쓰기: 20,000회/일
- 삭제: 20,000회/일

## 최적화 전략
1. ✅ 필드명 축약 (bytes 절약)
2. ✅ 불필요한 컬렉션 제거 (channels 제거)
3. ✅ 중복 데이터 최소화
4. ✅ 인덱스 최소화
5. ✅ 읽기 횟수 최적화 (복합 쿼리)

---

## 컬렉션 구조 (최적화)

### 1. timetables (시간표)
**단일 쿼리로 모든 정보 가져오기**

```javascript
timetables/{timetableId}
{
  ch: string,           // channelId (축약)
  img: string,          // imageUrl (축약)
  ws: string,           // weekStart (YYYYMMDD 형식, 8자)
  we: string,           // weekEnd (YYYYMMDD 형식, 8자)
  uid: string,          // uploadedBy (Firebase UID)
  at: number,           // uploadedAt (timestamp - 밀리초)
  l: number,            // likes (기본값: 0)
  d: number,            // dislikes (기본값: 0)
  h: boolean,           // isHidden (기본값: false)
  r: boolean            // isRemoved (기본값: false)
}
```

**예시 데이터:**
```json
{
  "ch": "c4be6dc106a0b885ea84cc",
  "img": "https://example.com/timetable.jpg",
  "ws": "20250113",
  "we": "20250119",
  "uid": "kF8xY2mN3pQrStUvWxYz",
  "at": 1736755200000,
  "l": 42,
  "d": 5,
  "h": false,
  "r": false
}
```

**크기 계산:**
- 필드명: ~40 bytes
- 데이터: ~200 bytes
- **총합: ~240 bytes/문서**

### 2. votes (투표 기록)
**중복 투표 방지용 - 사용자별 투표만 저장**

```javascript
votes/{userId}_{timetableId}  // 복합 Document ID
{
  v: string,           // voteType ('l' or 'd')
  t: number            // votedAt (timestamp)
}
```

**예시 데이터:**
```json
{
  "v": "l",
  "t": 1736755200000
}
```

**최적화 포인트:**
- Document ID에 userId와 timetableId 포함 → 별도 필드 불필요
- 단 2개 필드만 저장
- **크기: ~50 bytes/문서**

### 3. reports (신고 - 관리자용)
**관리자만 읽으므로 최적화 불필요**

```javascript
reports/{reportId}
{
  tid: string,         // timetableId
  uid: string,         // reportedBy
  rsn: string,         // reason
  at: number,          // reportedAt
  st: string           // status ('p'=pending, 'r'=resolved, 'd'=dismissed)
}
```

**크기: ~150 bytes/문서**

---

## 인덱스 설정 (최소화)

### 필수 복합 인덱스 2개만

```javascript
// 1. 채널별 주차 시간표 조회 (메인 쿼리)
Collection: timetables
Fields:
  - ch (Ascending)
  - ws (Descending)
  - h (Ascending)
  - r (Ascending)

// 2. 채널별 좋아요 순 정렬
Collection: timetables
Fields:
  - ch (Ascending)
  - ws (Ascending)
  - h (Ascending)
  - l (Descending)
```

---

## 쿼리 패턴 (읽기 최적화)

### 1. 시간표 조회 (메인 화면)

```javascript
// 단일 쿼리로 모든 시간표 가져오기
const q = query(
  collection(db, 'timetables'),
  where('ch', '==', channelId),
  where('ws', '==', '20250113'),
  where('h', '==', false),
  where('r', '==', false),
  orderBy('l', 'desc'),
  limit(10)
);

const snapshot = await getDocs(q);
// 읽기 횟수: 시간표 개수 (평균 3-5개)
```

### 2. 사용자 투표 확인 (로컬 캐싱)

```javascript
// 앱 시작 시 1회만 조회 → 로컬 저장
const userVotes = {};

const votesQuery = query(
  collection(db, 'votes'),
  where(documentId(), '>=', userId + '_'),
  where(documentId(), '<=', userId + '_\uf8ff'),
  limit(100)
);

const votesSnapshot = await getDocs(votesQuery);
votesSnapshot.forEach(doc => {
  const timetableId = doc.id.split('_')[1];
  userVotes[timetableId] = doc.data().v;
});

// 로컬 스토리지에 캐싱
chrome.storage.local.set({ userVotes });
// 이후 투표 여부는 로컬에서 확인 → 추가 읽기 0회
```

### 3. 투표하기 (쓰기 최적화)

```javascript
// Transaction으로 원자적 처리
await runTransaction(db, async (transaction) => {
  const voteRef = doc(db, 'votes', `${userId}_${timetableId}`);
  const timetableRef = doc(db, 'timetables', timetableId);

  const voteDoc = await transaction.get(voteRef);
  const timetableDoc = await transaction.get(timetableRef);

  // ... 투표 로직

  transaction.set(voteRef, { v: newVote, t: Date.now() });
  transaction.update(timetableRef, { l: newLikes, d: newDislikes });
});
// 읽기: 2회, 쓰기: 2회
```

---

## 일일 사용량 예측

### 시나리오: 1,000 활성 사용자/일

#### 읽기:
- 앱 실행 (시간표 조회): 1,000명 × 5개 = 5,000 reads
- 투표 확인 (초기 로드): 1,000명 × 1회 = 1,000 reads
- 투표 시 (Transaction): 100건 × 2회 = 200 reads
- **총 읽기: ~6,200 reads/일**

#### 쓰기:
- 시간표 등록: 50건 = 50 writes
- 투표: 100건 × 2회 = 200 writes
- 신고: 5건 = 5 writes
- **총 쓰기: ~255 writes/일**

#### 저장소:
- 시간표: 1,000개 × 240 bytes = 240 KB
- 투표: 10,000개 × 50 bytes = 500 KB
- 신고: 100개 × 150 bytes = 15 KB
- **총 저장소: ~755 KB (1GB의 0.07%)**

### 무료 티어 대비:
- ✅ 읽기: 6,200 / 50,000 = **12.4% 사용**
- ✅ 쓰기: 255 / 20,000 = **1.3% 사용**
- ✅ 저장소: 755KB / 1GB = **0.07% 사용**

**→ 10,000명 이상까지 무료 운영 가능!**

---

## 추가 최적화 기법

### 1. 실시간 리스너 최소화

```javascript
// ❌ 나쁜 예: 실시간 리스너 (읽기 무한 증가)
onSnapshot(q, snapshot => { ... });

// ✅ 좋은 예: 필요할 때만 조회
const snapshot = await getDocs(q);
```

### 2. 로컬 캐싱 적극 활용

```javascript
// 시간표는 주 단위로 변경 → 1시간 캐싱
const CACHE_DURATION = 60 * 60 * 1000; // 1시간

async function getTimetables(channelId, weekStart) {
  const cacheKey = `timetables_${channelId}_${weekStart}`;
  const cached = await chrome.storage.local.get(cacheKey);

  if (cached[cacheKey] && Date.now() - cached[cacheKey].timestamp < CACHE_DURATION) {
    return cached[cacheKey].data; // 캐시 사용 → 읽기 0회
  }

  // Firestore에서 조회
  const data = await fetchFromFirestore(channelId, weekStart);

  // 캐시 저장
  chrome.storage.local.set({
    [cacheKey]: { data, timestamp: Date.now() }
  });

  return data;
}
```

### 3. 배치 작업

```javascript
// 여러 문서를 한 번에 읽기
const timetableIds = ['id1', 'id2', 'id3'];
const refs = timetableIds.map(id => doc(db, 'timetables', id));

// 단일 배치로 조회 (읽기 3회, 네트워크 1회)
const docs = await Promise.all(refs.map(ref => getDoc(ref)));
```

### 4. 주차 형식 최적화

```javascript
// ISO 형식 (10 bytes): "2025-01-13"
// 축약 형식 (8 bytes): "20250113"

function dateToCompact(date) {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

function compactToDate(compact) {
  return new Date(
    compact.slice(0, 4),
    compact.slice(4, 6) - 1,
    compact.slice(6, 8)
  );
}

// 20% 저장소 절약
```

---

## 보안 규칙 (최적화)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // 인증 함수
    function isAuth() {
      return request.auth != null;
    }

    // 시간표: 읽기는 모두, 쓰기는 인증된 사용자
    match /timetables/{tid} {
      allow read: if true;
      allow create: if isAuth() &&
                       request.resource.data.uid == request.auth.uid &&
                       request.resource.data.keys().hasOnly(['ch','img','ws','we','uid','at','l','d','h','r']) &&
                       request.resource.data.l == 0 &&
                       request.resource.data.d == 0 &&
                       request.resource.data.h == false &&
                       request.resource.data.r == false;
      allow update: if false; // 투표는 votes 컬렉션에서만
      allow delete: if false; // 삭제 불가 (관리자는 Console에서)
    }

    // 투표: 본인 투표만
    match /votes/{voteId} {
      allow read: if isAuth() && voteId.matches('^' + request.auth.uid + '_.*');
      allow write: if isAuth() && voteId.matches('^' + request.auth.uid + '_.*');
    }

    // 신고: 인증된 사용자만 생성
    match /reports/{rid} {
      allow read: if false; // 관리자만 Console에서
      allow create: if isAuth();
      allow update, delete: if false;
    }
  }
}
```

**보안 규칙 최적화:**
- 불필요한 읽기 차단
- 필드 검증으로 잘못된 데이터 방지
- 관리자 기능은 Firebase Console 활용 (별도 코드 불필요)

---

## 데이터 클린업 (선택사항)

### 오래된 시간표 자동 삭제 (Cloud Functions - 무료 티어 범위 내)

```javascript
// 매주 일요일 자동 실행
exports.cleanupOldTimetables = functions.pubsub
  .schedule('0 0 * * 0') // 매주 일요일 00:00
  .onRun(async (context) => {
    // 8주 이전 시간표 삭제
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);
    const cutoffDate = dateToCompact(eightWeeksAgo);

    const oldTimetables = await db.collection('timetables')
      .where('we', '<', cutoffDate)
      .get();

    const batch = db.batch();
    oldTimetables.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${oldTimetables.size} old timetables`);
  });
```

**무료 티어 제한:**
- Cloud Scheduler: 3개/월 (충분)
- Cloud Functions 호출: 200만회/월 (주 1회면 문제없음)

---

## 마이그레이션 가이드

기존 설계 → 최적화 설계 변환:

```javascript
// 변환 함수
function optimizeDocument(oldDoc) {
  return {
    ch: oldDoc.channelId,
    img: oldDoc.imageUrl,
    ws: oldDoc.weekStartDate.replace(/-/g, ''),
    we: oldDoc.weekEndDate.replace(/-/g, ''),
    uid: oldDoc.uploadedBy,
    at: oldDoc.uploadedAt.toMillis(),
    l: oldDoc.likes || 0,
    d: oldDoc.dislikes || 0,
    h: oldDoc.isHidden || false,
    r: oldDoc.isRemoved || false
  };
}

function expandDocument(optimizedDoc) {
  return {
    channelId: optimizedDoc.ch,
    imageUrl: optimizedDoc.img,
    weekStartDate: optimizedDoc.ws.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
    weekEndDate: optimizedDoc.we.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'),
    uploadedBy: optimizedDoc.uid,
    uploadedAt: new Date(optimizedDoc.at),
    likes: optimizedDoc.l,
    dislikes: optimizedDoc.d,
    isHidden: optimizedDoc.h,
    isRemoved: optimizedDoc.r
  };
}
```

---

## 요약

### 최적화 효과:
- 📉 **문서 크기 40% 감소** (400 → 240 bytes)
- 📉 **필드 수 50% 감소** (20 → 10개)
- 📉 **컬렉션 수 40% 감소** (5 → 3개)
- 📉 **읽기 횟수 70% 감소** (캐싱 적용 시)

### 무료 티어 한계:
- **10,000+ 활성 사용자/일** 까지 가능
- 저장소는 거의 무제한 (1GB는 수백만 건)

### 확장 가능성:
- 무료 티어 초과 시 Blaze 플랜 전환
- 비용: 읽기 $0.036/100K, 쓰기 $0.108/100K
- 10,000 사용자 기준 월 $3-5 예상
