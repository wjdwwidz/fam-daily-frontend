import { request } from './client.js'
import { postFile } from './uploads.js'

export const groupsApi = {
  listGroups: () => request('/groups'),
  createGroup: (name, nickname) => request('/groups', { method: 'POST', body: { name, nickname } }),
  joinGroup: (code, nickname) => request('/groups/join', { method: 'POST', body: { code, nickname } }),
  getGroup: (id) => request(`/groups/${id}`),
  updateGroupName: (id, name) => request(`/groups/${id}`, { method: 'PATCH', body: { name } }),
  deleteGroup: (id) => request(`/groups/${id}`, { method: 'DELETE' }),
  updateMyNickname: (id, nickname) => request(`/groups/${id}/me`, { method: 'PATCH', body: { nickname } }),
  // 이 가족에서 쓰는 내 사진 — 업로드+저장을 서버가 한 요청으로 처리한다. 둘 다 갱신된 그룹 상세를 돌려준다.
  updateMyGroupPhoto: (id, asset) => postFile(`/groups/${id}/me/photo`, asset, '프로필 사진 저장에 실패했어요.'),
  deleteMyGroupPhoto: (id) => request(`/groups/${id}/me/photo`, { method: 'DELETE' }),
  setMood: (id, text, emoji) => request(`/groups/${id}/mood`, { method: 'PUT', body: { text, emoji } }),
  createInvite: (id) => request(`/groups/${id}/invites`, { method: 'POST', body: {} }),
}
