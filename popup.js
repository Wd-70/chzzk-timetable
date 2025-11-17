// 팝업 메인 로직
let currentChannelId = null;
let currentWeek = null; // 현재 주차 (오늘 기준)
let selectedWeek = null; // 선택된 주차 (사용자가 화살표로 변경 가능)
let timetables = [];
let selectedIndex = 0;
let userVotes = {};

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 Popup 초기화 시작');

  try {
    // 1. 인증 먼저 처리
    await ensureAuthenticated();

    // 2. 현재 탭 정보 가져오기
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const currentTab = tabs[0];
    const url = currentTab.url;

    currentChannelId = extractChannelId(url);

    if (!currentChannelId) {
      showError('치지직 방송 페이지에서만 사용할 수 있습니다.');
      return;
    }

    // 3. 채널 정보 표시
    document.getElementById('channelId').textContent = currentChannelId;

    // content script에서 채널명 가져오기
    try {
      chrome.tabs.sendMessage(
        currentTab.id,
        { action: 'getChannelInfo' },
        (response) => {
          // runtime.lastError 체크 (content script가 준비되지 않은 경우)
          if (chrome.runtime.lastError) {
            console.log('채널명 가져오기 실패:', chrome.runtime.lastError.message);
            document.getElementById('channelName').textContent = '알 수 없음';
            return;
          }

          if (response && response.channelName) {
            document.getElementById('channelName').textContent = response.channelName;
          } else {
            document.getElementById('channelName').textContent = '알 수 없음';
          }
        }
      );
    } catch (error) {
      document.getElementById('channelName').textContent = '알 수 없음';
    }

    // 4. 현재 주차 계산
    currentWeek = getCurrentWeek();
    selectedWeek = currentWeek; // 초기에는 현재 주차 선택
    updateWeekDisplay();
    updateWeekButtons();

    // 5. 사용자 투표 기록 로드
    userVotes = await getUserVotes();

    // 6. 시간표 로드
    await loadTimetables();

    // 7. 이벤트 리스너 설정
    setupEventListeners();

    // 8. 관리자 링크 표시 (관리자인 경우)
    const currentUserId = getCurrentUserId();
    if (currentUserId && isAdmin(currentUserId)) {
      document.getElementById('adminPageLink').style.display = 'inline';
      document.getElementById('adminLinkSeparator').style.display = 'inline';
    }

  } catch (error) {
    console.error('초기화 오류:', error);
    showError(getFriendlyErrorMessage(error));
  }
});

// 시간표 로드
async function loadTimetables() {
  try {
    document.getElementById('loadingState').style.display = 'block';
    document.getElementById('timetableView').style.display = 'none';
    document.getElementById('emptyState').style.display = 'none';

    timetables = await getTimetables(currentChannelId, selectedWeek.startCompact);

    if (timetables.length === 0) {
      // 빈 상태 표시
      document.getElementById('loadingState').style.display = 'none';
      document.getElementById('emptyState').style.display = 'block';
      return;
    }

    // 시간표 표시
    selectedIndex = 0;
    displayTimetable(selectedIndex);
    renderThumbnails();

    document.getElementById('loadingState').style.display = 'none';
    document.getElementById('timetableView').style.display = 'block';

  } catch (error) {
    console.error('시간표 로드 오류:', error);
    showError(getFriendlyErrorMessage(error));
  }
}

// 선택된 시간표 표시
function displayTimetable(index) {
  if (index < 0 || index >= timetables.length) return;

  const timetable = timetables[index];
  selectedIndex = index;

  // 메인 이미지
  document.getElementById('mainTimetable').src = timetable.imageUrl;

  // 좋아요/싫어요 수
  document.getElementById('likeCount').textContent = timetable.likes;
  document.getElementById('dislikeCount').textContent = timetable.dislikes;

  // 투표 상태 표시
  const userVote = userVotes[timetable.id];
  updateVoteButtons(userVote);

  // 업로더 정보
  const uploaderText = timetable.uploadedBy.slice(0, 8) + '...';
  document.getElementById('uploaderInfo').textContent = `업로더: 익명${uploaderText}`;
  document.getElementById('uploadTime').textContent = getRelativeTime(timetable.uploadedAt);

  // 삭제 버튼 표시 (자신이 등록한 것만)
  const deleteBtn = document.getElementById('deleteBtn');
  const currentUserId = getCurrentUserId();
  if (currentUserId && timetable.uploadedBy === currentUserId) {
    deleteBtn.style.display = 'inline-block';
  } else {
    deleteBtn.style.display = 'none';
  }
}

// 투표 버튼 상태 업데이트
function updateVoteButtons(voteType) {
  const likeBtn = document.getElementById('likeBtn');
  const dislikeBtn = document.getElementById('dislikeBtn');

  likeBtn.classList.remove('active-like');
  dislikeBtn.classList.remove('active-dislike');

  if (voteType === 'l') {
    likeBtn.classList.add('active-like');
  } else if (voteType === 'd') {
    dislikeBtn.classList.add('active-dislike');
  }
}

// 썸네일 렌더링
function renderThumbnails() {
  const container = document.getElementById('thumbnails');
  const section = document.getElementById('thumbnailsSection');

  if (timetables.length <= 1) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  document.getElementById('thumbnailCount').textContent = timetables.length;

  container.innerHTML = '';

  timetables.forEach((timetable, index) => {
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'thumbnail-container';

    const img = document.createElement('img');
    img.src = timetable.imageUrl;
    img.className = 'thumbnail';
    if (index === selectedIndex) {
      img.classList.add('active');
    }

    img.addEventListener('click', (e) => {
      // 일반 클릭: 썸네일 선택
      displayTimetable(index);
      updateThumbnailActive(index);
    });

    // 더블클릭: 이미지 확대
    img.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      openImageModal(timetable.imageUrl);
    });

    const score = document.createElement('div');
    score.className = 'thumbnail-score';
    const scoreValue = timetable.likes - timetable.dislikes;
    score.textContent = scoreValue >= 0 ? `+${scoreValue}` : scoreValue;

    thumbnailContainer.appendChild(img);
    thumbnailContainer.appendChild(score);
    container.appendChild(thumbnailContainer);
  });
}

// 썸네일 활성 상태 업데이트
function updateThumbnailActive(index) {
  const thumbnails = document.querySelectorAll('.thumbnail');
  thumbnails.forEach((thumb, i) => {
    if (i === index) {
      thumb.classList.add('active');
    } else {
      thumb.classList.remove('active');
    }
  });
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 좋아요 버튼
  document.getElementById('likeBtn').addEventListener('click', async () => {
    await handleVote('l');
  });

  // 싫어요 버튼
  document.getElementById('dislikeBtn').addEventListener('click', async () => {
    await handleVote('d');
  });

  // 시간표 등록
  document.getElementById('uploadBtn').addEventListener('click', async () => {
    await handleUpload();
  });

  // 신고 버튼
  document.getElementById('reportBtn').addEventListener('click', async () => {
    await handleReport();
  });

  // 삭제 버튼
  document.getElementById('deleteBtn').addEventListener('click', async () => {
    await handleDelete();
  });

  // 백업 코드
  document.getElementById('backupCodeLink').addEventListener('click', async (e) => {
    e.preventDefault();
    await showBackupCode();
  });

  // 메인 이미지 클릭 - 확대
  document.getElementById('mainTimetable').addEventListener('click', () => {
    openImageModal(document.getElementById('mainTimetable').src);
  });

  // 이전 주 버튼
  document.getElementById('prevWeekBtn').addEventListener('click', async () => {
    selectedWeek = getOffsetWeek(selectedWeek.startCompact, -1);
    updateWeekDisplay();
    updateWeekButtons();
    await loadTimetables();
  });

  // 다음 주 버튼
  document.getElementById('nextWeekBtn').addEventListener('click', async () => {
    selectedWeek = getOffsetWeek(selectedWeek.startCompact, 1);
    updateWeekDisplay();
    updateWeekButtons();
    await loadTimetables();
  });

  // 관리자 페이지 링크
  document.getElementById('adminPageLink').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
}

// 투표 처리
async function handleVote(voteType) {
  if (timetables.length === 0) return;

  const timetable = timetables[selectedIndex];

  try {
    await vote(timetable.id, voteType);

    // UI 업데이트
    const oldVote = userVotes[timetable.id];

    // 카운트 업데이트
    if (oldVote === 'l') timetable.likes--;
    if (oldVote === 'd') timetable.dislikes--;

    if (oldVote !== voteType) {
      // 새로운 투표
      if (voteType === 'l') timetable.likes++;
      if (voteType === 'd') timetable.dislikes++;
      userVotes[timetable.id] = voteType;
    } else {
      // 투표 취소
      delete userVotes[timetable.id];
    }

    // 화면 갱신
    displayTimetable(selectedIndex);
    renderThumbnails();

  } catch (error) {
    console.error('투표 오류:', error);
    alert(getFriendlyErrorMessage(error));
  }
}

// 시간표 등록 처리
async function handleUpload() {
  const input = document.getElementById('imageUrlInput');
  const url = input.value.trim();

  if (!url) {
    alert('이미지 URL을 입력해주세요.');
    return;
  }

  if (!isValidImageUrl(url)) {
    alert('올바른 HTTPS 이미지 URL을 입력해주세요.');
    return;
  }

  try {
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = true;
    uploadBtn.textContent = '등록 중...';

    // 선택된 주차로 등록
    await createTimetable(
      currentChannelId,
      url,
      selectedWeek.startCompact,
      selectedWeek.endCompact
    );

    alert('✅ 시간표가 등록되었습니다!');

    // 입력 필드 초기화
    input.value = '';

    // 시간표 다시 로드 (선택된 주차 유지)
    await loadTimetables();

  } catch (error) {
    console.error('등록 오류:', error);
    alert(getFriendlyErrorMessage(error));
  } finally {
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn.disabled = false;
    uploadBtn.textContent = '등록하기';
  }
}

// 삭제 처리
async function handleDelete() {
  if (timetables.length === 0) return;

  const confirmed = confirm(
    '정말로 이 시간표를 삭제하시겠습니까?\n\n' +
    '삭제된 시간표는 관리자가 복구하거나 완전히 제거할 수 있습니다.'
  );

  if (!confirmed) return;

  try {
    const timetable = timetables[selectedIndex];
    await deleteTimetable(timetable.id);

    alert('✅ 시간표가 삭제되었습니다.');

    // 시간표 다시 로드
    await loadTimetables();

  } catch (error) {
    console.error('삭제 오류:', error);
    alert(getFriendlyErrorMessage(error));
  }
}

// 신고 처리
async function handleReport() {
  if (timetables.length === 0) return;

  const reasons = [
    '잘못된 시간표',
    '부적절한 이미지',
    '광고/스팸',
    '기타'
  ];

  const reason = prompt(
    '신고 사유를 선택해주세요:\n\n' +
    '1. 잘못된 시간표\n' +
    '2. 부적절한 이미지\n' +
    '3. 광고/스팸\n' +
    '4. 기타 (직접 입력)\n\n' +
    '번호를 입력하세요 (1-4):'
  );

  if (!reason) return;

  let selectedReason;
  const num = parseInt(reason);

  if (num >= 1 && num <= 3) {
    selectedReason = reasons[num - 1];
  } else if (num === 4) {
    selectedReason = prompt('신고 사유를 입력해주세요:');
    if (!selectedReason) return;
  } else {
    alert('잘못된 입력입니다.');
    return;
  }

  try {
    const timetable = timetables[selectedIndex];
    await reportTimetable(timetable.id, selectedReason);

    alert('✅ 신고가 접수되었습니다. 검토 후 조치하겠습니다.');

  } catch (error) {
    console.error('신고 오류:', error);
    alert(getFriendlyErrorMessage(error));
  }
}

// 백업 코드 표시
async function showBackupCode() {
  try {
    const code = await getBackupCode();

    const message = `
🔑 계정 백업 코드

${code}

⚠️ 이 코드를 안전하게 보관하세요!
다른 기기에서 같은 계정을 사용하려면 이 코드가 필요합니다.

복사되었습니다.
    `.trim();

    navigator.clipboard.writeText(code);
    alert(message);

  } catch (error) {
    console.error('백업 코드 오류:', error);
    alert(getFriendlyErrorMessage(error));
  }
}

// 에러 표시 (안내 화면 표시)
function showError(message) {
  // 불필요한 섹션 숨기기
  document.getElementById('channelInfo').style.display = 'none';
  document.querySelector('.week-info').style.display = 'none';
  document.getElementById('loadingState').style.display = 'none';
  document.getElementById('timetableView').style.display = 'none';
  document.getElementById('emptyState').style.display = 'none';
  document.querySelector('.upload-section').style.display = 'none';

  // 백업 코드 및 관리자 링크 숨기기
  const footerLinks = document.querySelector('.footer-links p');
  if (footerLinks) {
    footerLinks.style.display = 'none';
  }

  // 안내 화면 표시
  document.getElementById('guideScreen').style.display = 'block';
}

// 주차 표시 업데이트
function updateWeekDisplay() {
  document.getElementById('weekRange').textContent =
    formatWeekRange(selectedWeek.startCompact, selectedWeek.endCompact);
}

// 주차 버튼 활성화/비활성화
function updateWeekButtons() {
  const prevWeekBtn = document.getElementById('prevWeekBtn');
  const nextWeekBtn = document.getElementById('nextWeekBtn');

  // 이전 주 버튼: 항상 활성화 (제한 없음)
  prevWeekBtn.disabled = false;

  // 다음 주 버튼: 현재 주의 다음 주까지만 허용
  // 현재 주 + 1주까지 이동 가능
  const nextWeek = getOffsetWeek(currentWeek.startCompact, 1);

  // 선택된 주가 다음 주보다 크거나 같으면 비활성화
  const canGoNext = selectedWeek.startCompact < nextWeek.startCompact;
  nextWeekBtn.disabled = !canGoNext;

  console.log('주차 버튼 상태:', {
    currentWeek: currentWeek.startCompact,
    selectedWeek: selectedWeek.startCompact,
    nextWeek: nextWeek.startCompact,
    canGoNext,
    nextWeekBtnDisabled: !canGoNext
  });
}

// 이미지 모달 열기 (브라우저 화면에)
async function openImageModal(imageUrl) {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.tabs.sendMessage(tabs[0].id, {
      action: 'openImageModal',
      imageUrl: imageUrl
    });

    // 팝업 닫기
    window.close();
  } catch (error) {
    console.error('모달 열기 실패:', error);
    // 실패 시 새 탭으로 열기
    window.open(imageUrl, '_blank');
    // 팝업 닫기
    window.close();
  }
}

// 이미지 모달 닫기 (사용하지 않음)
function closeImageModal() {
  // content script에서 처리
}

console.log('✅ Popup script loaded');
