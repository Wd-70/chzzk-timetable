// 관리자 설정 - 한 곳에서 관리

// 관리자 UID 목록 (여기에만 추가하면 됨)
const ADMIN_UIDS = ["NuaaEizOmRPh3izEXtBwDwPKW7Z2"];

// 관리자 권한 체크 함수
function isAdmin(uid) {
  return ADMIN_UIDS.includes(uid);
}

console.log("✅ Admin config loaded");
