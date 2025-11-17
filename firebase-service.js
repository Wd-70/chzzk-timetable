// Firebase 서비스 레이어
// Firestore와의 모든 통신을 담당

/**
 * 익명 로그인 (자동으로 UID 유지)
 * @returns {Promise<firebase.User>}
 */
async function ensureAuthenticated() {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(
      (user) => {
        unsubscribe();
        if (user) {
          console.log('✅ 기존 사용자 로그인:', user.uid);
          resolve(user);
        } else {
          console.log('🔄 새 사용자 익명 로그인 중...');
          auth.signInAnonymously()
            .then((result) => {
              console.log('✅ 익명 로그인 성공:', result.user.uid);
              resolve(result.user);
            })
            .catch(reject);
        }
      },
      reject
    );
  });
}

/**
 * 특정 채널의 특정 주차 시간표 조회
 * @param {string} channelId
 * @param {string} weekStartCompact "20250113"
 * @returns {Promise<Array>}
 */
async function getTimetables(channelId, weekStartCompact) {
  // 캐시 확인
  const cacheKey = `timetables_${channelId}_${weekStartCompact}`;
  const cached = await getCache(cacheKey, 60 * 60 * 1000); // 1시간 캐시

  if (cached) {
    console.log('📦 캐시에서 시간표 로드:', cached.length, '개');
    return cached;
  }

  console.log('🔍 Firestore에서 시간표 조회...');

  const q = firebase.firestore().collection('timetables')
    .where('ch', '==', channelId)
    .where('ws', '==', weekStartCompact)
    .where('h', '==', false)
    .where('r', '==', false)
    .orderBy('l', 'desc')
    .limit(20);

  const snapshot = await q.get();

  const timetables = [];
  snapshot.forEach(doc => {
    timetables.push(expandTimetable(doc));
  });

  console.log('✅ 시간표 조회 완료:', timetables.length, '개');

  // 캐시 저장
  await setCache(cacheKey, timetables);

  return timetables;
}

/**
 * 시간표 등록
 * @param {string} channelId
 * @param {string} imageUrl
 * @param {string} weekStartCompact (선택사항) 주차 시작일, 없으면 현재 주
 * @param {string} weekEndCompact (선택사항) 주차 종료일, 없으면 현재 주
 * @returns {Promise<string>} 생성된 문서 ID
 */
async function createTimetable(channelId, imageUrl, weekStartCompact, weekEndCompact) {
  await ensureAuthenticated();

  // 주차 정보가 제공되지 않으면 현재 주 사용
  let ws, we;
  if (weekStartCompact && weekEndCompact) {
    ws = weekStartCompact;
    we = weekEndCompact;
  } else {
    const week = getCurrentWeek();
    ws = week.startCompact;
    we = week.endCompact;
  }

  const data = {
    ch: channelId,
    img: imageUrl,
    ws: ws,
    we: we,
    uid: auth.currentUser.uid,
    at: Date.now(),
    l: 0,
    d: 0,
    h: false,
    r: false
  };

  console.log('📝 시간표 등록 중...', data);

  const docRef = await db.collection('timetables').add(data);

  console.log('✅ 시간표 등록 완료:', docRef.id);

  // 캐시 무효화
  const cacheKey = `timetables_${channelId}_${ws}`;
  await chrome.storage.local.remove(cacheKey);

  return docRef.id;
}

/**
 * 사용자의 모든 투표 기록 조회 (앱 시작 시 1회만)
 * @returns {Promise<Object>} {timetableId: voteType}
 */
async function getUserVotes() {
  await ensureAuthenticated();

  const userId = auth.currentUser.uid;

  // 캐시 확인
  const cacheKey = `user_votes_${userId}`;
  const cached = await getCache(cacheKey, 24 * 60 * 60 * 1000); // 24시간 캐시

  if (cached) {
    console.log('📦 캐시에서 투표 기록 로드');
    return cached;
  }

  console.log('🔍 Firestore에서 투표 기록 조회...');

  const votesSnapshot = await db.collection('votes')
    .where(firebase.firestore.FieldPath.documentId(), '>=', `${userId}_`)
    .where(firebase.firestore.FieldPath.documentId(), '<=', `${userId}_\uf8ff`)
    .get();

  const votes = {};
  votesSnapshot.forEach(doc => {
    const timetableId = doc.id.split('_')[1];
    votes[timetableId] = doc.data().v;
  });

  console.log('✅ 투표 기록 조회 완료:', Object.keys(votes).length, '개');

  // 캐시 저장
  await setCache(cacheKey, votes);

  return votes;
}

/**
 * 투표하기 (좋아요/싫어요)
 * @param {string} timetableId
 * @param {string} voteType 'l' (like) or 'd' (dislike)
 * @returns {Promise<void>}
 */
async function vote(timetableId, voteType) {
  await ensureAuthenticated();

  const userId = auth.currentUser.uid;
  const voteId = `${userId}_${timetableId}`;

  console.log('👍 투표 중...', voteType, timetableId);

  await db.runTransaction(async (transaction) => {
    const voteRef = db.collection('votes').doc(voteId);
    const timetableRef = db.collection('timetables').doc(timetableId);

    const voteDoc = await transaction.get(voteRef);
    const timetableDoc = await transaction.get(timetableRef);

    if (!timetableDoc.exists) {
      throw new Error('시간표를 찾을 수 없습니다.');
    }

    const timetableData = timetableDoc.data();
    let likes = timetableData.l || 0;
    let dislikes = timetableData.d || 0;

    // 기존 투표 취소
    if (voteDoc.exists) {
      const oldVote = voteDoc.data().v;
      if (oldVote === 'l') likes--;
      if (oldVote === 'd') dislikes--;

      // 같은 투표면 취소
      if (oldVote === voteType) {
        transaction.delete(voteRef);
        transaction.update(timetableRef, { l: likes, d: dislikes });
        console.log('✅ 투표 취소:', voteType);
        return;
      }
    }

    // 새 투표 적용
    if (voteType === 'l') likes++;
    if (voteType === 'd') dislikes++;

    // 자동 숨김 체크
    const shouldHide = dislikes > likes + 5;

    transaction.set(voteRef, { v: voteType, t: Date.now() });
    transaction.update(timetableRef, {
      l: likes,
      d: dislikes,
      h: shouldHide
    });

    console.log('✅ 투표 완료:', voteType, `좋아요:${likes} 싫어요:${dislikes}`);
  });

  // 캐시 무효화 (투표 기록 + 시간표 데이터)
  await chrome.storage.local.clear();
}

/**
 * 시간표 삭제 (자신이 등록한 것만)
 * @param {string} timetableId
 * @returns {Promise<void>}
 */
async function deleteTimetable(timetableId) {
  await ensureAuthenticated();

  const userId = auth.currentUser.uid;

  console.log('🗑️ 시간표 삭제 중...', timetableId);

  await db.runTransaction(async (transaction) => {
    const timetableRef = db.collection('timetables').doc(timetableId);
    const timetableDoc = await transaction.get(timetableRef);

    if (!timetableDoc.exists) {
      throw new Error('시간표를 찾을 수 없습니다.');
    }

    const timetableData = timetableDoc.data();

    // 자신이 등록한 것인지 확인
    if (timetableData.uid !== userId) {
      throw new Error('자신이 등록한 시간표만 삭제할 수 있습니다.');
    }

    // DB에서 완전히 제거하지 않고 r 플래그만 true로 설정
    transaction.update(timetableRef, { r: true });

    console.log('✅ 시간표 삭제 완료 (r=true)');
  });

  // 캐시 무효화
  await chrome.storage.local.clear();
}

/**
 * 신고하기
 * @param {string} timetableId
 * @param {string} reason
 * @returns {Promise<string>} 신고 ID
 */
async function reportTimetable(timetableId, reason) {
  await ensureAuthenticated();

  const data = {
    tid: timetableId,
    uid: auth.currentUser.uid,
    rsn: reason,
    at: Date.now(),
    st: 'p' // pending
  };

  console.log('🚨 신고 접수 중...', data);

  const docRef = await db.collection('reports').add(data);

  console.log('✅ 신고 접수 완료:', docRef.id);

  return docRef.id;
}

/**
 * 현재 로그인된 사용자 UID 가져오기
 * @returns {string|null}
 */
function getCurrentUserId() {
  return auth.currentUser?.uid || null;
}

/**
 * 백업 코드 (UID) 가져오기
 * @returns {Promise<string>}
 */
async function getBackupCode() {
  await ensureAuthenticated();
  return auth.currentUser.uid;
}

// ==================== 관리자 전용 함수 ====================

/**
 * 관리자 대시보드 통계 조회
 * @returns {Promise<Object>} 통계 데이터
 */
async function getAdminStats() {
  await ensureAuthenticated();

  console.log('📊 관리자 통계 조회 중...');

  const [total, removed, hidden, pendingReports] = await Promise.all([
    // 전체 시간표 (활성)
    db.collection('timetables')
      .where('r', '==', false)
      .where('h', '==', false)
      .get()
      .then(snap => snap.size),

    // 삭제된 시간표
    db.collection('timetables')
      .where('r', '==', true)
      .get()
      .then(snap => snap.size),

    // 숨겨진 시간표
    db.collection('timetables')
      .where('h', '==', true)
      .where('r', '==', false)
      .get()
      .then(snap => snap.size),

    // 대기 중 신고
    db.collection('reports')
      .where('st', '==', 'p')
      .get()
      .then(snap => snap.size)
  ]);

  return { total, removed, hidden, pendingReports };
}

/**
 * 신고 목록 조회
 * @param {string} status 'p' (pending), 'a' (approved), 'r' (rejected)
 * @returns {Promise<Array>}
 */
async function getReports(status) {
  await ensureAuthenticated();

  console.log('🚨 신고 조회:', status);

  const snapshot = await db.collection('reports')
    .where('st', '==', status)
    .orderBy('at', 'desc')
    .limit(50)
    .get();

  const reports = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    reports.push({
      id: doc.id,
      timetableId: data.tid,
      reportedBy: data.uid,
      reason: data.rsn,
      reportedAt: new Date(data.at),
      status: data.st
    });
  });

  console.log('✅ 신고 조회 완료:', reports.length, '개');
  return reports;
}

/**
 * 신고 승인 (시간표 삭제)
 * @param {string} reportId
 * @param {string} timetableId
 */
async function approveReportAdmin(reportId, timetableId) {
  await ensureAuthenticated();

  console.log('✅ 신고 승인:', reportId, timetableId);

  await db.runTransaction(async (transaction) => {
    const reportRef = db.collection('reports').doc(reportId);
    const timetableRef = db.collection('timetables').doc(timetableId);

    // 신고 상태 업데이트
    transaction.update(reportRef, { st: 'a' });

    // 시간표 삭제 (r=true)
    transaction.update(timetableRef, { r: true });
  });

  console.log('✅ 신고 승인 완료');
}

/**
 * 신고 거부
 * @param {string} reportId
 */
async function rejectReportAdmin(reportId) {
  await ensureAuthenticated();

  console.log('❌ 신고 거부:', reportId);

  await db.collection('reports').doc(reportId).update({ st: 'r' });

  console.log('✅ 신고 거부 완료');
}

/**
 * 삭제된 시간표 목록 조회
 * @returns {Promise<Array>}
 */
async function getRemovedTimetables() {
  await ensureAuthenticated();

  console.log('🗑️ 삭제된 시간표 조회 중...');

  const snapshot = await db.collection('timetables')
    .where('r', '==', true)
    .orderBy('at', 'desc')
    .limit(50)
    .get();

  const timetables = [];
  snapshot.forEach(doc => {
    timetables.push(expandTimetable(doc));
  });

  console.log('✅ 삭제된 시간표 조회 완료:', timetables.length, '개');
  return timetables;
}

/**
 * 시간표 복구 (관리자 ID로 변경)
 * @param {string} timetableId
 */
async function restoreTimetableAdmin(timetableId) {
  await ensureAuthenticated();

  const adminUid = auth.currentUser.uid;

  console.log('♻️ 시간표 복구 (관리자 ID로):', timetableId);

  await db.collection('timetables').doc(timetableId).update({
    r: false,
    uid: adminUid // 관리자 ID로 변경
  });

  console.log('✅ 시간표 복구 완료');
}

/**
 * 시간표 영구 삭제
 * @param {string} timetableId
 */
async function permanentlyDeleteTimetableAdmin(timetableId) {
  await ensureAuthenticated();

  console.log('🗑️ 시간표 영구 삭제:', timetableId);

  await db.collection('timetables').doc(timetableId).delete();

  console.log('✅ 시간표 영구 삭제 완료');
}

/**
 * 숨겨진 시간표 목록 조회
 * @returns {Promise<Array>}
 */
async function getHiddenTimetables() {
  await ensureAuthenticated();

  console.log('👁️ 숨겨진 시간표 조회 중...');

  const snapshot = await db.collection('timetables')
    .where('h', '==', true)
    .where('r', '==', false)
    .orderBy('at', 'desc')
    .limit(50)
    .get();

  const timetables = [];
  snapshot.forEach(doc => {
    timetables.push(expandTimetable(doc));
  });

  console.log('✅ 숨겨진 시간표 조회 완료:', timetables.length, '개');
  return timetables;
}

/**
 * 시간표 숨김 해제
 * @param {string} timetableId
 */
async function unhideTimetableAdmin(timetableId) {
  await ensureAuthenticated();

  console.log('👁️ 시간표 숨김 해제:', timetableId);

  await db.collection('timetables').doc(timetableId).update({ h: false });

  console.log('✅ 시간표 숨김 해제 완료');
}

/**
 * 시간표 삭제 (관리자용)
 * @param {string} timetableId
 */
async function deleteTimetableAdmin(timetableId) {
  await ensureAuthenticated();

  console.log('🗑️ 시간표 삭제 (관리자):', timetableId);

  await db.collection('timetables').doc(timetableId).update({ r: true });

  console.log('✅ 시간표 삭제 완료');
}

/**
 * ID로 시간표 조회
 * @param {string} timetableId
 * @returns {Promise<Object|null>}
 */
async function getTimetableById(timetableId) {
  await ensureAuthenticated();

  console.log('🔍 시간표 조회:', timetableId);

  const doc = await db.collection('timetables').doc(timetableId).get();

  if (!doc.exists) {
    return null;
  }

  return expandTimetable(doc);
}

/**
 * 전체 시간표 조회 (관리자용)
 * @param {string} channelId 선택적 채널 ID 필터
 * @param {number} limit 조회할 최대 개수
 * @returns {Promise<Array>}
 */
async function getAllTimetables(channelId = null, limit = 100) {
  await ensureAuthenticated();

  console.log('📋 전체 시간표 조회:', channelId || '전체');

  let query = db.collection('timetables')
    .where('r', '==', false)
    .where('h', '==', false)
    .orderBy('at', 'desc')
    .limit(limit);

  // 채널 ID 필터
  if (channelId) {
    query = db.collection('timetables')
      .where('cid', '==', channelId)
      .where('r', '==', false)
      .where('h', '==', false)
      .orderBy('at', 'desc')
      .limit(limit);
  }

  const snapshot = await query.get();

  const timetables = [];
  snapshot.forEach(doc => {
    timetables.push(expandTimetable(doc));
  });

  console.log('✅ 전체 시간표 조회 완료:', timetables.length, '개');
  return timetables;
}

/**
 * 시간표 이미지 URL 수정 (관리자용)
 * @param {string} timetableId
 * @param {string} newImageUrl
 * @returns {Promise<void>}
 */
async function updateTimetableImageUrl(timetableId, newImageUrl) {
  await ensureAuthenticated();

  console.log('🖼️ 시간표 이미지 URL 수정:', timetableId, newImageUrl);

  // URL 검증
  if (!newImageUrl.startsWith('http://') && !newImageUrl.startsWith('https://')) {
    throw new Error('유효한 이미지 URL이 아닙니다. (http:// 또는 https://로 시작해야 합니다)');
  }

  await db.collection('timetables').doc(timetableId).update({
    img: newImageUrl
  });

  console.log('✅ 시간표 이미지 URL 수정 완료');

  // 캐시 무효화
  await chrome.storage.local.clear();
}

console.log('✅ Firebase Service loaded');
