import { request } from './client.js'
import { postFile } from './uploads.js'

export const groupsApi = {
  listGroups: () => request('/groups'),
  createGroup: (name, nickname) => request('/groups', { method: 'POST', body: { name, nickname } }),
  joinGroup: (code, nickname) => request('/groups/join', { method: 'POST', body: { code, nickname } }),
  getGroup: (id) => request(`/groups/${id}`),
  updateGroupName: (id, name) => request(`/groups/${id}`, { method: 'PATCH', body: { name } }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
  // 홈 '최근 활동' — 사전 추가·일상·질문·답변을 서버가 최신순으로 섞어 준다
  groupActivity: (id, limit = 5) => request(`/groups/${id}/activity?limit=${limit}`),
  // 알림 — 내 글의 댓글·내 댓글의 답글 (안 읽은 수 포함). seen 은 '읽음' 표시
  notifications: (id, limit = 30) => request(`/groups/${id}/notifications?limit=${limit}`),
  markNotificationsSeen: (id) => request(`/groups/${id}/notifications/seen`, { method: 'POST' }),
  updateMyNickname: (id, nickname) => request(`/groups/${id}/me`, { method: 'PATCH', body: { nickname } }),
  // 이 가족에서 쓰는 내 사진 — 업로드+저장을 서버가 한 요청으로 처리한다. 둘 다 갱신된 그룹 상세를 돌려준다.
  updateMyGroupPhoto: (id, asset) => postFile(`/groups/${id}/me/photo`, asset, '프로필 사진 저장에 실패했어요.'),
  deleteMyGroupPhoto: (id) => request(`/groups/${id}/me/photo`, { method: 'DELETE' }),
  setMood: (id, text, emoji) => request(`/groups/${id}/mood`, { method: 'PUT', body: { text, emoji } }),
  // 가족 기록 — 한마디·프로필 사진 변경을 최신순으로
  history: (id) => request(`/groups/${id}/history`),

  // 버킷리스트 — 채운 칸과 진행률. 빈 칸은 화면이 1~100 으로 그린다.
  bucket: (id) => request(`/groups/${id}/bucket`),
  saveBucket: (id, no, body) =>
    request(`/groups/${id}/bucket/${no}`, { method: 'PUT', body }),
  clearBucket: (id, no) =>
    request(`/groups/${id}/bucket/${no}`, { method: 'DELETE' }),
  // 칸을 다른 번호로 (우선순위 조정) — 사이 칸들은 한 칸씩 밀린다
  moveBucket: (id, no, to) =>
    request(`/groups/${id}/bucket/${no}/move`, { method: 'PUT', body: { to } }),
  createInvite: (id) => request(`/groups/${id}/invites`, { method: 'POST', body: {} }),
}
