import { request } from './client.js'

export const groupsApi = {
  listGroups: () => request('/groups'),
  createGroup: (name, nickname) => request('/groups', { method: 'POST', body: { name, nickname } }),
  joinGroup: (code, nickname) => request('/groups/join', { method: 'POST', body: { code, nickname } }),
  getGroup: (id) => request(`/groups/${id}`),
  createInvite: (id) => request(`/groups/${id}/invites`, { method: 'POST', body: {} }),
}
