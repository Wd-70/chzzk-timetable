document.addEventListener("DOMContentLoaded", async () => {
  // 현재 활성화된 탭의 URL 가져오기
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentTab = tabs[0];
  const url = currentTab.url;

  // 채널 ID 추출 (URL 패턴: https://chzzk.naver.com/live/[채널ID])
  const channelIdMatch = url.match(/chzzk\.naver\.com\/live\/([a-zA-Z0-9]+)/);
  let channelId = null;

  if (channelIdMatch && channelIdMatch[1]) {
    channelId = channelIdMatch[1];
    document.getElementById("channelId").textContent = channelId;

    // 채널 정보 가져오기
    try {
      // 채널 정보를 가져오는 메시지를 content script에 보냄
      chrome.tabs.sendMessage(
        currentTab.id,
        { action: "getChannelInfo" },
        (response) => {
          if (response && response.channelName) {
            document.getElementById("channelName").textContent =
              response.channelName;
          } else {
            document.getElementById("channelName").textContent = "알 수 없음";
          }
        }
      );
    } catch (error) {
      document.getElementById("channelName").textContent = "알 수 없음";
      console.error("채널 정보를 가져오는 중 오류 발생:", error);
    }

    // 시간표 정보 가져오기
    loadTimetable(channelId);
  } else {
    document.getElementById("channelId").textContent = "알 수 없음";
    document.getElementById("channelName").textContent = "알 수 없음";
    document.getElementById("timetableLoading").style.display = "none";
    document.getElementById("timetableNotFound").style.display = "block";
  }

  // 시간표 URL 제출 이벤트 리스너
  document
    .getElementById("submitTimetableUrl")
    .addEventListener("click", () => {
      const timetableUrl = document
        .getElementById("timetableUrlInput")
        .value.trim();
      if (timetableUrl && channelId) {
        saveTimetable(channelId, timetableUrl);
      }
    });

  // 잘못된 시간표 신고 이벤트 리스너
  document
    .getElementById("reportWrongTimetable")
    .addEventListener("click", () => {
      if (channelId) {
        reportWrongTimetable(channelId);
      }
    });

  // 방송 페이지 버튼 표시 옵션 이벤트 리스너
  const showButtonCheckbox = document.getElementById("showButtonOnPage");

  // 저장된 설정 불러오기
  chrome.storage.sync.get("showButtonOnPage", (data) => {
    showButtonCheckbox.checked = data.showButtonOnPage || false;
  });

  // 설정 변경 시 저장
  showButtonCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({ showButtonOnPage: showButtonCheckbox.checked });

    // content script에 설정 변경 알림
    chrome.tabs.sendMessage(currentTab.id, {
      action: "updateShowButton",
      show: showButtonCheckbox.checked,
    });
  });

  // 방송인 안내 링크
  document.getElementById("broadcasterLink").addEventListener("click", (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: chrome.runtime.getURL("broadcaster.html") });
  });
});

// 시간표 정보 로드
async function loadTimetable(channelId) {
  try {
    // 스토리지에서 시간표 데이터 가져오기
    const result = await chrome.storage.sync.get("timetables");
    const timetables = result.timetables || {};

    document.getElementById("timetableLoading").style.display = "none";

    if (timetables[channelId]) {
      // 시간표 있음
      document.getElementById("timetableFound").style.display = "block";
      document.getElementById("timetableImage").src = timetables[channelId].url;
      document.getElementById("timetableSourceName").textContent =
        timetables[channelId].source || "제보자";
    } else {
      // 시간표 없음
      document.getElementById("timetableNotFound").style.display = "block";
    }
  } catch (error) {
    console.error("시간표 로드 중 오류 발생:", error);
    document.getElementById("timetableLoading").style.display = "none";
    document.getElementById("timetableNotFound").style.display = "block";
  }
}

// 시간표 정보 저장
async function saveTimetable(channelId, url) {
  try {
    // 기존 데이터 가져오기
    const result = await chrome.storage.sync.get("timetables");
    const timetables = result.timetables || {};

    // 새 시간표 정보 추가
    timetables[channelId] = {
      url: url,
      source: "사용자 제보",
      timestamp: Date.now(),
    };

    // 저장
    await chrome.storage.sync.set({ timetables });

    // UI 업데이트
    document.getElementById("timetableNotFound").style.display = "none";
    document.getElementById("timetableFound").style.display = "block";
    document.getElementById("timetableImage").src = url;
    document.getElementById("timetableSourceName").textContent = "사용자 제보";

    // 입력 필드 초기화
    document.getElementById("timetableUrlInput").value = "";

    alert("시간표가 성공적으로 저장되었습니다!");
  } catch (error) {
    console.error("시간표 저장 중 오류 발생:", error);
    alert("시간표 저장 중 오류가 발생했습니다.");
  }
}

// 잘못된 시간표 신고
async function reportWrongTimetable(channelId) {
  if (
    confirm(
      "이 시간표를 신고하시겠습니까? 신고된 시간표는 검토 후 삭제될 수 있습니다."
    )
  ) {
    try {
      // 기존 데이터 가져오기
      const result = await chrome.storage.sync.get(["timetables", "reports"]);
      const timetables = result.timetables || {};
      const reports = result.reports || {};

      // 신고 정보 추가
      if (!reports[channelId]) {
        reports[channelId] = [];
      }

      reports[channelId].push({
        timestamp: Date.now(),
        timetableUrl: timetables[channelId]?.url,
      });

      // 저장
      await chrome.storage.sync.set({ reports });

      alert("신고가 접수되었습니다. 검토 후 조치하겠습니다.");
    } catch (error) {
      console.error("시간표 신고 중 오류 발생:", error);
      alert("신고 처리 중 오류가 발생했습니다.");
    }
  }
}
