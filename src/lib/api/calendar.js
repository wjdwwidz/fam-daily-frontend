import { request } from './client.js'

// 가족 일정 (달력) — 가족 공용이라 누구나 고치고 지울 수 있다.
export const calendarApi = {
  // from~to 에 걸치는 일정. 기간 일정은 그 달에 걸쳐만 있어도 온다.
  events: (groupId, from, to) =>
    request(`/groups/${groupId}/events?from=${from}&to=${to}`),
  createEvent: (groupId, body) =>
    request(`/groups/${groupId}/events`, { method: 'POST', body }),
  updateEvent: (eventId, body) =>
    request(`/events/${eventId}`, { method: 'PATCH', body }),
  deleteEvent: (eventId) => request(`/events/${eventId}`, { method: 'DELETE' }),
}
