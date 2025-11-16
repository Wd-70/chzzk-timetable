// 관리자 페이지 로직

// 현재 상태
let currentTab = 'reports';
let currentReportStatus = 'p'; // pending

// 채널 정보 캐시
const channelCache = new Map();

// 채널 정보 가져오기
async function getChannelInfo(channelId) {
  // 캐시 확인
  if (channelCache.has(channelId)) {
    return channelCache.get(channelId);
  }

  try {
    const response = await fetch(`https://api.chzzk.naver.com/service/v1/channels/${channelId}`);
    if (!response.ok) {
      throw new Error('채널 정보 조회 실패');
    }

    const data = await response.json();
    console.log('📺 채널 API 응답:', channelId, data);

    // 응답 구조 확인 및 파싱
    let channelName = channelId;
    if (data.content) {
      channelName = data.content.channelName || data.content.channel?.channelName || channelId;
    }

    const channelInfo = {
      id: channelId,
      name: channelName,
      imageUrl: data.content?.channelImageUrl || data.content?.channel?.channelImageUrl || null
    };

    console.log('✅ 파싱된 채널 정보:', channelInfo);

    // 캐시 저장
    channelCache.set(channelId, channelInfo);
    return channelInfo;
  } catch (error) {
    console.error('채널 정보 조회 오류:', channelId, error);
    // 실패 시 ID만 반환
    const fallback = { id: channelId, name: channelId, imageUrl: null };
    channelCache.set(channelId, fallback);
    return fallback;
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔧 관리자 페이지 초기화');

  try {
    // 인증 확인
    await ensureAuthenticated();
    const user = auth.currentUser;

    // 관리자 권한 체크
    if (!isAdmin(user.uid)) {
      showNoAccess(user.uid);
      return;
    }

    // 관리자 패널 표시
    showAdminPanel(user.uid);

    // 대시보드 로드
    await loadDashboard();

    // 초기 탭 로드
    await loadTabContent('reports');

    // 이벤트 리스너 설정
    setupEventListeners();

  } catch (error) {
    console.error('초기화 오류:', error);
    alert('초기화 중 오류가 발생했습니다: ' + error.message);
  }
});

// 권한 없음 표시
function showNoAccess(uid) {
  document.getElementById('authCheck').style.display = 'none';
  document.getElementById('noAccess').style.display = 'flex';
  document.getElementById('currentUserId').textContent = uid;
}

// 관리자 패널 표시
function showAdminPanel(uid) {
  document.getElementById('authCheck').style.display = 'none';
  document.getElementById('adminPanel').style.display = 'block';
  document.getElementById('adminUserId').textContent = uid.slice(0, 12) + '...';
}

// 대시보드 로드
async function loadDashboard() {
  try {
    const stats = await getAdminStats();

    document.getElementById('totalTimetables').textContent = stats.total;
    document.getElementById('pendingReports').textContent = stats.pendingReports;
    document.getElementById('removedTimetables').textContent = stats.removed;
    document.getElementById('hiddenTimetables').textContent = stats.hidden;

    console.log('✅ 대시보드 로드 완료:', stats);
  } catch (error) {
    console.error('대시보드 로드 오류:', error);
  }
}

// 탭 컨텐츠 로드
async function loadTabContent(tab) {
  currentTab = tab;

  // 탭 버튼 활성화
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // 탭 패널 활성화
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tab}`);
  });

  // 데이터 로드
  switch (tab) {
    case 'reports':
      await loadReports(currentReportStatus);
      break;
    case 'removed':
      await loadRemovedTimetables();
      break;
    case 'hidden':
      await loadHiddenTimetables();
      break;
    case 'all':
      await loadAllTimetables();
      break;
  }
}

// 신고 목록 로드
async function loadReports(status) {
  const container = document.getElementById('reportsList');
  container.innerHTML = '<div class="loading">신고 목록을 불러오는 중...</div>';

  try {
    const reports = await getReports(status);

    if (reports.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>신고가 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = reports.map(report => `
      <div class="data-item" data-id="${report.id}">
        <div class="item-header">
          <div class="item-info">
            <div class="item-title">
              시간표 ID: ${report.timetableId}
            </div>
            <div class="item-meta">
              <span>📅 ${getRelativeTime(report.reportedAt)}</span>
              <span>👤 ${report.reportedBy.slice(0, 8)}...</span>
              <span class="status-badge status-${status === 'p' ? 'pending' : status === 'a' ? 'approved' : 'rejected'}">
                ${status === 'p' ? '대기 중' : status === 'a' ? '승인됨' : '거부됨'}
              </span>
            </div>
          </div>
          <div class="item-actions">
            ${status === 'p' ? `
              <button class="btn btn-approve" onclick="approveReport('${report.id}', '${report.timetableId}')">
                ✅ 승인 (삭제)
              </button>
              <button class="btn btn-reject" onclick="rejectReport('${report.id}')">
                ❌ 거부
              </button>
            ` : ''}
            <button class="btn btn-view" onclick="viewTimetable('${report.timetableId}')">
              👁️ 시간표 보기
            </button>
          </div>
        </div>
        <div class="item-content">
          <div class="item-reason">
            <strong>신고 사유:</strong> ${report.reason}
          </div>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('신고 로드 오류:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <p>오류가 발생했습니다.</p>
      </div>
    `;
  }
}

// 삭제된 시간표 로드
async function loadRemovedTimetables() {
  const container = document.getElementById('removedList');
  container.innerHTML = '<div class="loading">삭제된 시간표를 불러오는 중...</div>';

  try {
    const timetables = await getRemovedTimetables();

    if (timetables.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>삭제된 시간표가 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = timetables.map(tt => `
      <div class="data-item" data-id="${tt.id}" data-channel-id="${tt.channelId}">
        <div class="item-header">
          <div class="item-info">
            <div class="item-title channel-title">
              채널: <span class="channel-name">불러오는 중...</span>
            </div>
            <div class="item-meta">
              <span>📅 ${tt.weekStart} ~ ${tt.weekEnd}</span>
              <span>👤 ${tt.uploadedBy.slice(0, 8)}...</span>
              <span>👍 ${tt.likes}</span>
              <span>👎 ${tt.dislikes}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-restore" onclick="restoreTimetable('${tt.id}')">
              ♻️ 복구 (내 ID로)
            </button>
            <button class="btn btn-delete" onclick="permanentlyDeleteTimetable('${tt.id}')">
              🗑️ 영구 삭제
            </button>
          </div>
        </div>
        <div class="item-content">
          <img src="${tt.imageUrl}" alt="시간표" class="item-image" data-image-url="${tt.imageUrl}" />
        </div>
      </div>
    `).join('');

    // 이미지 클릭 이벤트 추가
    container.querySelectorAll('.item-image').forEach(img => {
      img.addEventListener('click', function() {
        const imageUrl = this.getAttribute('data-image-url');
        showImageModal(imageUrl);
      });
    });

    // 채널 정보 비동기 로드
    container.querySelectorAll('.data-item').forEach(async (item) => {
      const channelId = item.getAttribute('data-channel-id');
      const channelNameSpan = item.querySelector('.channel-name');

      if (channelId && channelNameSpan) {
        const channelInfo = await getChannelInfo(channelId);
        channelNameSpan.textContent = `${channelInfo.name} (${channelId})`;
      }
    });

  } catch (error) {
    console.error('삭제된 시간표 로드 오류:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <p>오류가 발생했습니다.</p>
      </div>
    `;
  }
}

// 숨겨진 시간표 로드
async function loadHiddenTimetables() {
  const container = document.getElementById('hiddenList');
  container.innerHTML = '<div class="loading">숨겨진 시간표를 불러오는 중...</div>';

  try {
    const timetables = await getHiddenTimetables();

    if (timetables.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>숨겨진 시간표가 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = timetables.map(tt => `
      <div class="data-item" data-id="${tt.id}" data-channel-id="${tt.channelId}">
        <div class="item-header">
          <div class="item-info">
            <div class="item-title channel-title">
              채널: <span class="channel-name">불러오는 중...</span>
            </div>
            <div class="item-meta">
              <span>📅 ${tt.weekStart} ~ ${tt.weekEnd}</span>
              <span>👤 ${tt.uploadedBy.slice(0, 8)}...</span>
              <span>👍 ${tt.likes}</span>
              <span>👎 ${tt.dislikes}</span>
              <span style="color: #f44336;">점수: ${tt.score}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-restore" onclick="unhideTimetable('${tt.id}')">
              👁️ 숨김 해제
            </button>
            <button class="btn btn-delete" onclick="deleteTimetableAsAdmin('${tt.id}')">
              🗑️ 삭제
            </button>
          </div>
        </div>
        <div class="item-content">
          <img src="${tt.imageUrl}" alt="시간표" class="item-image" data-image-url="${tt.imageUrl}" />
        </div>
      </div>
    `).join('');

    // 이미지 클릭 이벤트 추가
    container.querySelectorAll('.item-image').forEach(img => {
      img.addEventListener('click', function() {
        const imageUrl = this.getAttribute('data-image-url');
        showImageModal(imageUrl);
      });
    });

    // 채널 정보 비동기 로드
    container.querySelectorAll('.data-item').forEach(async (item) => {
      const channelId = item.getAttribute('data-channel-id');
      const channelNameSpan = item.querySelector('.channel-name');

      if (channelId && channelNameSpan) {
        const channelInfo = await getChannelInfo(channelId);
        channelNameSpan.textContent = `${channelInfo.name} (${channelId})`;
      }
    });

  } catch (error) {
    console.error('숨겨진 시간표 로드 오류:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <p>오류가 발생했습니다.</p>
      </div>
    `;
  }
}

// 전체 시간표 로드
async function loadAllTimetables(channelId = null) {
  const container = document.getElementById('allTimetablesList');
  container.innerHTML = '<div class="loading">전체 시간표를 불러오는 중...</div>';

  try {
    const timetables = await getAllTimetables(channelId, 100);

    if (timetables.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">📋</div>
          <p>시간표가 없습니다.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = timetables.map(tt => `
      <div class="data-item" data-id="${tt.id}" data-channel-id="${tt.channelId}">
        <div class="item-header">
          <div class="item-info">
            <div class="item-title channel-title">
              채널: <span class="channel-name">불러오는 중...</span>
            </div>
            <div class="item-meta">
              <span>📅 ${tt.weekStart} ~ ${tt.weekEnd}</span>
              <span>👤 ${tt.uploadedBy.slice(0, 8)}...</span>
              <span>👍 ${tt.likes}</span>
              <span>👎 ${tt.dislikes}</span>
              <span>점수: ${tt.score}</span>
              <span>⏰ ${getRelativeTime(tt.uploadedAt)}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-delete" onclick="deleteTimetableAsAdmin('${tt.id}')">
              🗑️ 삭제
            </button>
            <button class="btn btn-view" onclick="hideTimetableAsAdmin('${tt.id}')">
              👁️ 숨기기
            </button>
          </div>
        </div>
        <div class="item-content">
          <img src="${tt.imageUrl}" alt="시간표" class="item-image" data-image-url="${tt.imageUrl}" />
        </div>
      </div>
    `).join('');

    // 이미지 클릭 이벤트 추가
    container.querySelectorAll('.item-image').forEach(img => {
      img.addEventListener('click', function() {
        const imageUrl = this.getAttribute('data-image-url');
        showImageModal(imageUrl);
      });
    });

    // 채널 정보 비동기 로드
    container.querySelectorAll('.data-item').forEach(async (item) => {
      const channelId = item.getAttribute('data-channel-id');
      const channelNameSpan = item.querySelector('.channel-name');

      if (channelId && channelNameSpan) {
        const channelInfo = await getChannelInfo(channelId);
        channelNameSpan.textContent = `${channelInfo.name} (${channelId})`;
      }
    });

  } catch (error) {
    console.error('전체 시간표 로드 오류:', error);
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <p>오류가 발생했습니다.</p>
      </div>
    `;
  }
}

// 이벤트 리스너 설정
function setupEventListeners() {
  // 탭 버튼
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      loadTabContent(btn.dataset.tab);
    });
  });

  // 신고 상태 필터
  document.querySelectorAll('input[name="reportStatus"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      currentReportStatus = e.target.value;
      loadReports(currentReportStatus);
    });
  });

  // 새로고침 버튼
  document.getElementById('refreshStats').addEventListener('click', async () => {
    await loadDashboard();
    await loadTabContent(currentTab);
  });

  // 전체 시간표 검색
  document.getElementById('searchBtn').addEventListener('click', async () => {
    const channelId = document.getElementById('channelFilter').value.trim();
    await loadAllTimetables(channelId || null);
  });

  // 필터 초기화
  document.getElementById('clearFilterBtn').addEventListener('click', async () => {
    document.getElementById('channelFilter').value = '';
    await loadAllTimetables();
  });

  // Enter 키로 검색
  document.getElementById('channelFilter').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
      const channelId = e.target.value.trim();
      await loadAllTimetables(channelId || null);
    }
  });
}

// 신고 승인 (시간표 삭제)
async function approveReport(reportId, timetableId) {
  if (!confirm('이 신고를 승인하고 시간표를 삭제하시겠습니까?')) return;

  try {
    await approveReportAdmin(reportId, timetableId);
    alert('✅ 신고가 승인되고 시간표가 삭제되었습니다.');
    await loadReports(currentReportStatus);
    await loadDashboard();
  } catch (error) {
    console.error('신고 승인 오류:', error);
    alert('오류: ' + error.message);
  }
}

// 신고 거부
async function rejectReport(reportId) {
  if (!confirm('이 신고를 거부하시겠습니까?')) return;

  try {
    await rejectReportAdmin(reportId);
    alert('✅ 신고가 거부되었습니다.');
    await loadReports(currentReportStatus);
    await loadDashboard();
  } catch (error) {
    console.error('신고 거부 오류:', error);
    alert('오류: ' + error.message);
  }
}

// 시간표 복구 (관리자 ID로)
async function restoreTimetable(timetableId) {
  if (!confirm('이 시간표를 복구하시겠습니까?\n\n복구 시 업로더 ID가 관리자 ID로 변경됩니다.')) return;

  try {
    await restoreTimetableAdmin(timetableId);
    alert('✅ 시간표가 복구되었습니다.');
    await loadRemovedTimetables();
    await loadDashboard();
  } catch (error) {
    console.error('시간표 복구 오류:', error);
    alert('오류: ' + error.message);
  }
}

// 시간표 영구 삭제
async function permanentlyDeleteTimetable(timetableId) {
  if (!confirm('⚠️ 경고: 이 시간표를 영구적으로 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!')) return;

  try {
    await permanentlyDeleteTimetableAdmin(timetableId);
    alert('✅ 시간표가 영구 삭제되었습니다.');
    await loadRemovedTimetables();
    await loadDashboard();
  } catch (error) {
    console.error('영구 삭제 오류:', error);
    alert('오류: ' + error.message);
  }
}

// 시간표 숨김 해제
async function unhideTimetable(timetableId) {
  if (!confirm('이 시간표의 숨김을 해제하시겠습니까?')) return;

  try {
    await unhideTimetableAdmin(timetableId);
    alert('✅ 시간표 숨김이 해제되었습니다.');
    await loadHiddenTimetables();
    await loadDashboard();
  } catch (error) {
    console.error('숨김 해제 오류:', error);
    alert('오류: ' + error.message);
  }
}

// 숨겨진 시간표 삭제
async function deleteTimetableAsAdmin(timetableId) {
  if (!confirm('이 시간표를 삭제하시겠습니까?')) return;

  try {
    await deleteTimetableAdmin(timetableId);
    alert('✅ 시간표가 삭제되었습니다.');
    await loadHiddenTimetables();
    await loadDashboard();
  } catch (error) {
    console.error('시간표 삭제 오류:', error);
    alert('오류: ' + error.message);
  }
}

// 시간표 보기
async function viewTimetable(timetableId) {
  try {
    const timetable = await getTimetableById(timetableId);
    if (timetable && timetable.imageUrl) {
      window.open(timetable.imageUrl, '_blank');
    } else {
      alert('시간표를 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error('시간표 보기 오류:', error);
    alert('오류: ' + error.message);
  }
}

// 시간표 숨기기 (관리자)
async function hideTimetableAsAdmin(timetableId) {
  if (!confirm('이 시간표를 숨기시겠습니까?')) return;

  try {
    await db.collection('timetables').doc(timetableId).update({ h: true });
    alert('✅ 시간표가 숨겨졌습니다.');
    await loadAllTimetables();
    await loadDashboard();
  } catch (error) {
    console.error('시간표 숨기기 오류:', error);
    alert('오류: ' + error.message);
  }
}

// 이미지 모달 표시
function showImageModal(imageUrl) {
  // 기존 모달 제거
  const existingModal = document.querySelector('.image-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // 모달 생성
  const modal = document.createElement('div');
  modal.className = 'image-modal';
  modal.innerHTML = `
    <div class="image-modal-overlay"></div>
    <div class="image-modal-content">
      <button class="image-modal-close">&times;</button>
      <img src="${imageUrl}" alt="시간표 확대" class="image-modal-image">
    </div>
  `;

  document.body.appendChild(modal);

  // 닫기 이벤트
  const closeModal = () => modal.remove();

  modal.querySelector('.image-modal-overlay').addEventListener('click', closeModal);
  modal.querySelector('.image-modal-close').addEventListener('click', closeModal);

  // ESC 키로 닫기
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

console.log('✅ Admin script loaded');
