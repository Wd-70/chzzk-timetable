// 백그라운드 스크립트 로드
console.log("치지직 시간표 확장 프로그램 백그라운드 스크립트 로드됨");

// 확장 프로그램 설치 시 기본 설정 초기화
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.sync.set({
      showButtonOnPage: true,
      timetables: {},
      reports: {},
    });

    console.log("치지직 시간표 확장 프로그램 설치 완료: 기본 설정 초기화됨");
  }
});

// 서버 동기화 기능 예시 (향후 개발 시 구현)
// 실제 서버 구현이 필요한 경우 이 부분을 확장
async function syncWithServer() {
  try {
    // 여기에 서버 동기화 로직 추가
    console.log("서버와 시간표 데이터 동기화 시도 (예시)");

    /* 
    // 예시 코드:
    const response = await fetch('https://your-server.com/api/timetables', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const serverData = await response.json();
      
      // 현재 저장된 데이터 가져오기
      const result = await chrome.storage.sync.get('timetables');
      const localTimetables = result.timetables || {};
      
      // 서버 데이터 병합
      const mergedTimetables = { ...localTimetables };
      
      // 서버 데이터 중 더 최신 데이터만 병합
      for (const channelId in serverData) {
        if (!localTimetables[channelId] || 
            serverData[channelId].timestamp > localTimetables[channelId].timestamp) {
          mergedTimetables[channelId] = serverData[channelId];
        }
      }
      
      // 병합된 데이터 저장
      await chrome.storage.sync.set({ timetables: mergedTimetables });
      console.log('서버 데이터와 동기화 완료');
    }
    */
  } catch (error) {
    console.error("서버 동기화 중 오류 발생:", error);
  }
}

// chrome.alarms API를 사용한 주기적 동기화 예시
// 실제 서버 동기화 구현 시 이 부분 활성화
/*
// 1시간마다 동기화 알람 설정
chrome.alarms.create('syncTimetables', {
  periodInMinutes: 60
});

// 알람 이벤트 리스너
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'syncTimetables') {
    syncWithServer();
  }
});
*/
