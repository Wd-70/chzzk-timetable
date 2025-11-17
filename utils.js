// 유틸리티 함수 모음

/**
 * 현재 주차 정보 계산 (월요일 시작)
 * @returns {{start: string, end: string, startCompact: string, endCompact: string}}
 */
function getCurrentWeek() {
  const now = new Date();

  // 월요일 계산
  const monday = new Date(now);
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // 일요일은 -6, 나머지는 1-day
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  // 일요일 계산
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const result = {
    start: formatDate(monday),        // "2025-01-13"
    end: formatDate(sunday),          // "2025-01-19"
    startCompact: dateToCompact(monday), // "20250113"
    endCompact: dateToCompact(sunday)    // "20250119"
  };

  console.log('getCurrentWeek 호출:');
  console.log('  - 오늘:', now, `(${['일', '월', '화', '수', '목', '금', '토'][day]}요일)`);
  console.log('  - 계산된 월요일:', monday, `(요일번호: ${monday.getDay()})`);
  console.log('  - 결과:', result);

  return result;
}

/**
 * 특정 날짜가 속한 주차 정보 계산 (월요일 시작)
 * @param {Date} date
 * @returns {{start: string, end: string, startCompact: string, endCompact: string}}
 */
function getWeekFromDate(date) {
  // 월요일 계산
  const monday = new Date(date);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  monday.setDate(date.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  // 일요일 계산
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return {
    start: formatDate(monday),
    end: formatDate(sunday),
    startCompact: dateToCompact(monday),
    endCompact: dateToCompact(sunday)
  };
}

/**
 * 주차 이동 (offset: -1 = 이전 주, +1 = 다음 주)
 * @param {string} weekStartCompact "20250113"
 * @param {number} offset
 * @returns {{start: string, end: string, startCompact: string, endCompact: string}}
 */
function getOffsetWeek(weekStartCompact, offset) {
  const currentMonday = compactToDate(weekStartCompact);
  const newMonday = new Date(currentMonday);
  newMonday.setDate(currentMonday.getDate() + (offset * 7));

  const result = getWeekFromDate(newMonday);

  console.log('getOffsetWeek 호출:', {
    input: weekStartCompact,
    offset,
    currentMonday,
    newMonday,
    result
  });

  return result;
}

/**
 * Date 객체를 ISO 형식 문자열로 변환 (로컬 시간대 기준)
 * @param {Date} date
 * @returns {string} "2025-01-13"
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Date 객체를 압축 형식으로 변환 (저장소 절약, 로컬 시간대 기준)
 * @param {Date} date
 * @returns {string} "20250113"
 */
function dateToCompact(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 압축 형식을 Date 객체로 변환
 * @param {string} compact "20250113"
 * @returns {Date}
 */
function compactToDate(compact) {
  const year = compact.slice(0, 4);
  const month = compact.slice(4, 6);
  const day = compact.slice(6, 8);
  return new Date(year, month - 1, day);
}

/**
 * 압축 형식을 읽기 쉬운 형식으로 변환
 * @param {string} compact "20250113"
 * @returns {string} "2025-01-13"
 */
function compactToReadable(compact) {
  return compact.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3');
}

/**
 * uid를 짧은 해시로 변환 (공개 사용자 ID용)
 * @param {string} uid - 비밀키로 취급되는 원본 uid
 * @returns {string} - 8자리 해시 (익명xxx... 형태로 표시됨)
 */
function hashUid(uid) {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    const char = uid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 32bit 정수로 변환
  }
  // 양수로 변환 후 36진수(0-9a-z)로 인코딩, 8자리로 제한
  return Math.abs(hash).toString(36).padStart(8, '0').slice(0, 8);
}

/**
 * Firestore 문서를 UI 표시용으로 변환
 * @param {object} doc Firestore 문서
 * @returns {object} 변환된 데이터
 */
function expandTimetable(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    channelId: data.ch,
    imageUrl: data.img,
    weekStart: compactToReadable(data.ws),
    weekEnd: compactToReadable(data.we),
    weekStartCompact: data.ws,
    weekEndCompact: data.we,
    uploadedBy: data.uid, // 비밀키 (권한 체크용, UI에 절대 표시 금지!)
    uploadedByHash: hashUid(data.uid), // 공개 ID (UI 표시용)
    uploadedAt: new Date(data.at),
    likes: data.l || 0,
    dislikes: data.d || 0,
    isHidden: data.h || false,
    isRemoved: data.r || false,
    score: (data.l || 0) - (data.d || 0)
  };
}

/**
 * UI 데이터를 Firestore 저장용으로 변환
 * @param {object} timetable
 * @returns {object} 압축된 데이터
 */
function compressTimetable(timetable) {
  const week = getCurrentWeek();
  return {
    ch: timetable.channelId,
    img: timetable.imageUrl,
    ws: week.startCompact,
    we: week.endCompact,
    uid: auth.currentUser.uid,
    at: Date.now(),
    l: 0,
    d: 0,
    h: false,
    r: false
  };
}

/**
 * URL이 유효한 이미지 URL인지 검증
 * @param {string} url
 * @returns {boolean}
 */
function isValidImageUrl(url) {
  try {
    const urlObj = new URL(url);

    // HTTPS만 허용
    if (urlObj.protocol !== 'https:') {
      return false;
    }

    // 이미지 확장자 확인 (선택사항)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const hasImageExt = imageExtensions.some(ext =>
      urlObj.pathname.toLowerCase().endsWith(ext)
    );

    // 확장자가 없어도 허용 (일부 CDN은 확장자 없음)
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 로컬 스토리지에서 캐시 가져오기
 * @param {string} key
 * @param {number} maxAge 최대 유효 시간 (밀리초)
 * @returns {Promise<any|null>}
 */
async function getCache(key, maxAge = 60 * 60 * 1000) {
  const result = await chrome.storage.local.get(key);
  const cached = result[key];

  if (!cached) return null;

  const age = Date.now() - cached.timestamp;
  if (age > maxAge) {
    // 캐시 만료
    await chrome.storage.local.remove(key);
    return null;
  }

  return cached.data;
}

/**
 * 로컬 스토리지에 캐시 저장
 * @param {string} key
 * @param {any} data
 */
async function setCache(key, data) {
  await chrome.storage.local.set({
    [key]: {
      data: data,
      timestamp: Date.now()
    }
  });
}

/**
 * 채널 ID 추출 (URL에서)
 * @param {string} url
 * @returns {string|null}
 */
function extractChannelId(url) {
  // 라이브 페이지: https://chzzk.naver.com/live/[채널ID]
  let match = url.match(/chzzk\.naver\.com\/live\/([a-zA-Z0-9]+)/);
  if (match) return match[1];

  // 채널 페이지: https://chzzk.naver.com/[채널ID]
  // 32자리 16진수 형식 (예: bd07973b6021d72512240c01a386d5c9)
  // 또는 영숫자 혼합 (예: c0d9723cbb75dc223c6aa8a9d4f56002)
  match = url.match(/chzzk\.naver\.com\/([a-zA-Z0-9]{8,})(\/|$|\?)/);
  if (match) {
    const channelId = match[1];
    // 특수 경로 제외 (live, search, category 등)
    const excludedPaths = ['live', 'search', 'category', 'video', 'clip', 'vod'];
    if (!excludedPaths.includes(channelId)) {
      return channelId;
    }
  }

  return null;
}

/**
 * 상대 시간 표시 (예: "3시간 전")
 * @param {Date|number|string} date - Date 객체, 타임스탬프, 또는 날짜 문자열
 * @returns {string}
 */
function getRelativeTime(date) {
  const now = Date.now();

  // Date 객체가 아닌 경우 변환
  let timestamp;
  if (date instanceof Date) {
    timestamp = date.getTime();
  } else if (typeof date === 'number') {
    timestamp = date;
  } else if (typeof date === 'string') {
    timestamp = new Date(date).getTime();
  } else {
    return '알 수 없음';
  }

  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}일 전`;
  if (hours > 0) return `${hours}시간 전`;
  if (minutes > 0) return `${minutes}분 전`;
  return '방금 전';
}

/**
 * 주차 표시 형식 (예: "01/13 ~ 01/19")
 * @param {string} startCompact
 * @param {string} endCompact
 * @returns {string}
 */
function formatWeekRange(startCompact, endCompact) {
  const start = compactToDate(startCompact);
  const end = compactToDate(endCompact);

  const startStr = `${String(start.getMonth() + 1).padStart(2, '0')}/${String(start.getDate()).padStart(2, '0')}`;
  const endStr = `${String(end.getMonth() + 1).padStart(2, '0')}/${String(end.getDate()).padStart(2, '0')}`;

  return `${startStr} ~ ${endStr}`;
}

/**
 * 에러 메시지를 사용자 친화적으로 변환
 * @param {Error} error
 * @returns {string}
 */
function getFriendlyErrorMessage(error) {
  const errorMessages = {
    'permission-denied': '권한이 없습니다.',
    'not-found': '데이터를 찾을 수 없습니다.',
    'already-exists': '이미 존재합니다.',
    'failed-precondition': '작업을 수행할 수 없습니다.',
    'unauthenticated': '로그인이 필요합니다.',
    'unavailable': '서버에 연결할 수 없습니다. 인터넷 연결을 확인해주세요.'
  };

  const code = error.code?.replace('firestore/', '').replace('auth/', '');
  return errorMessages[code] || `오류가 발생했습니다: ${error.message}`;
}

console.log('✅ Utils loaded');
