import { request } from './client.js'

// 가족 사전(단어) — 그룹 범위
export const wordsApi = {
  listWords: (groupId) => request(`/groups/${groupId}/words`),
  createWord: (groupId, body) => request(`/groups/${groupId}/words`, { method: 'POST', body }),
  updateWord: (wordId, body) => request(`/words/${wordId}`, { method: 'PATCH', body }),
  deleteWord: (wordId) => request(`/words/${wordId}`, { method: 'DELETE' }),
}
