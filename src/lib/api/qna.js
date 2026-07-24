import { request } from './client.js'

// 가족 문답 — 그룹 범위
export const qnaApi = {
  listQuestions: (groupId) => request(`/groups/${groupId}/questions`),
  currentQuestion: (groupId) => request(`/groups/${groupId}/questions/current`),
  createQuestion: (groupId, text) => request(`/groups/${groupId}/questions`, { method: 'POST', body: { text } }),
  answerQuestion: (questionId, text) => request(`/questions/${questionId}/answers`, { method: 'POST', body: { text } }),
  editAnswer: (answerId, text) => request(`/answers/${answerId}`, { method: 'PATCH', body: { text } }),
}
