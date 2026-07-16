import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'

WebBrowser.maybeCompleteAuthSession()

// 개발 중엔 폰이 맥의 로컬 백엔드에 붙어야 하므로, Metro 호스트(맥 LAN IP)를 그대로 사용.
function resolveHost() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    ''
  const host = String(hostUri).split(':')[0]
  return host || 'localhost'
}

export const API_BASE = `http://${resolveHost()}:3000/api`

const TOKEN_KEY = 'famdaily_token'
let memToken = null

export async function getToken() {
  if (memToken) return memToken
  try {
    memToken = await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {}
  return memToken
}
export async function setToken(t) {
  memToken = t
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, t)
  } catch {}
}
export async function clearToken() {
  memToken = null
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  } catch {}
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = await getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (e) {
    throw new Error(`서버에 연결할 수 없어요 (${API_BASE}). 백엔드가 켜져 있고 같은 와이파이인지 확인하세요.`)
  }
  const text = await res.text()
  let data = null
  try {
    data = text ? JSON.parse(text) : null
  } catch {
    data = text
  }
  if (!res.ok) {
    const m = (data && (data.message || data.error)) || `요청 실패 (${res.status})`
    throw new Error(Array.isArray(m) ? m.join(', ') : m)
  }
  return data
}

// 카카오 로그인: 인앱 브라우저로 백엔드 /auth/kakao 를 열고, 백엔드가 딥링크로 토큰을 돌려주면 저장.
export async function kakaoLogin() {
  const redirectUri = Linking.createURL('auth-callback') // ExpoGo: exp://…/--/auth-callback, 웹: http://host/auth-callback
  const startUrl = `${API_BASE}/auth/kakao?redirect=${encodeURIComponent(redirectUri)}`
  const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri)
  if (result.type !== 'success' || !result.url) return null // 사용자가 취소/실패
  const { queryParams } = Linking.parse(result.url)
  const token = queryParams?.token
  if (!token) throw new Error('로그인에 실패했어요. 다시 시도해주세요.')
  await setToken(String(token))
  return String(token)
}

export const api = {
  base: API_BASE,
  kakaoLogin,
  signup: (email, password, name) =>
    request('/auth/signup', { method: 'POST', body: { email, password, name }, auth: false }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  me: () => request('/auth/me'),
  listGroups: () => request('/groups'),
  createGroup: (name, nickname) => request('/groups', { method: 'POST', body: { name, nickname } }),
  joinGroup: (code, nickname) => request('/groups/join', { method: 'POST', body: { code, nickname } }),
  getGroup: (id) => request(`/groups/${id}`),
  createInvite: (id) => request(`/groups/${id}/invites`, { method: 'POST', body: {} }),
  // 가족 사전(단어) — 그룹 범위
  listWords: (groupId) => request(`/groups/${groupId}/words`),
  createWord: (groupId, body) => request(`/groups/${groupId}/words`, { method: 'POST', body }),
  updateWord: (wordId, body) => request(`/words/${wordId}`, { method: 'PATCH', body }),
  deleteWord: (wordId) => request(`/words/${wordId}`, { method: 'DELETE' }),
  // 가족 문답 — 그룹 범위
  listQuestions: (groupId) => request(`/groups/${groupId}/questions`),
  currentQuestion: (groupId) => request(`/groups/${groupId}/questions/current`),
  createQuestion: (groupId, text) => request(`/groups/${groupId}/questions`, { method: 'POST', body: { text } }),
  answerQuestion: (questionId, text) => request(`/questions/${questionId}/answers`, { method: 'POST', body: { text } }),
}
