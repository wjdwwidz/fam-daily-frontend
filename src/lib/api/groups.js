import { request } from './client.js'

export const groupsApi = {
  listGroups: () => request('/groups'),
  createGroup: (name, nickname) => request('/groups', { method: 'POST', body: { name, nickname } }),
  joinGroup: (code, nickname) => request('/groups/join', { method: 'POST', body: { code, nickname } }),
  getGroup: (id) => request(`/groups/${id}`),
  updateGroupName: (id, name) => request(`/groups/${id}`, { method: 'PATCH', body: { name } }),
  updateMyNickname: (id, nickname) => request(`/groups/${id}/me`, { method: 'PATCH', body: { nickname } }),
  setMood: (id, text, emoji) => request(`/groups/${id}/mood`, { method: 'PUT', body: { text, emoji } }),
  createInvite: (id) => request(`/groups/${id}/invites`, { method: 'POST', body: {} }),
}
