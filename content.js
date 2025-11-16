// 치지직 페이지에서 채널 정보 추출
// 새 버전에서는 버튼 삽입 없이 채널명만 추출

/**
 * 채널명 추출
 * 치지직 페이지의 DOM 구조를 분석하여 채널명을 가져옴
 */
function getChannelName() {
  try {
    // 방법 1: 페이지 타이틀에서 추출
    const title = document.title;
    if (title && title.includes('치지직')) {
      // "채널명 - 치지직" 형식에서 채널명 추출
      const match = title.match(/^(.+?)\s*[-–]\s*치지직/);
      if (match) {
        return match[1].trim();
      }
    }

    // 방법 2: 다양한 선택자로 시도
    const selectors = [
      '[class*="channel_name"]',
      '[class*="streamer_name"]',
      '[class*="broadcaster_name"]',
      '[class*="live_information_user_name"]',
      'h1[class*="name"]',
      'a[href*="/live/"] > span',
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }

    // 방법 3: 타이틀의 첫 부분 사용
    if (title) {
      return title.split(/[-–|]/)[0].trim();
    }

    return null;
  } catch (error) {
    console.error('채널명 추출 오류:', error);
    return null;
  }
}

/**
 * 이미지 모달 생성 및 표시
 */
function showImageModal(imageUrl) {
  // 기존 모달이 있으면 제거
  const existingModal = document.getElementById('chzzk-timetable-image-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // 모달 생성
  const modal = document.createElement('div');
  modal.id = 'chzzk-timetable-image-modal';
  modal.innerHTML = `
    <div class="chzzk-modal-overlay"></div>
    <div class="chzzk-modal-content">
      <button class="chzzk-modal-close">&times;</button>
      <img src="${imageUrl}" alt="시간표 확대" class="chzzk-modal-image">
    </div>
  `;

  document.body.appendChild(modal);

  // 닫기 이벤트
  const closeModal = () => {
    modal.remove();
  };

  modal.querySelector('.chzzk-modal-close').addEventListener('click', closeModal);
  modal.querySelector('.chzzk-modal-overlay').addEventListener('click', closeModal);

  // ESC 키로 닫기
  const handleKeydown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  document.addEventListener('keydown', handleKeydown);
}

/**
 * 메시지 리스너
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getChannelInfo') {
    const channelName = getChannelName();
    sendResponse({ channelName });
  } else if (message.action === 'openImageModal') {
    showImageModal(message.imageUrl);
    sendResponse({ success: true });
  }
  return true;
});

console.log('✅ Chzzk Timetable Content Script loaded');
