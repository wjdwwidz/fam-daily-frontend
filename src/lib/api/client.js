import Constants from 'expo-constants'
import * as SecureStore from 'expo-secure-store'

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

// 배포: EXPO_PUBLIC_API_URL(예: https://xxx.up.railway.app) 설정 시 그 백엔드를 사용.
// 로컬: 미설정이면 Metro 호스트(맥 LAN IP)로 자동 연결.
const LOCAL_BASE = `http://${resolveHost()}:3000`
// 서버 루트 (공개 문서 /privacy 등은 /api 밖에 있다)
export const SERVER_BASE = process.env.EXPO_PUBLIC_API_URL || LOCAL_BASE
export const API_BASE = `${SERVER_BASE}/api`

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

// 모든 API 호출의 공통 경로: 토큰 자동 첨부 + 에러 메시지 정리
export async function request(path, { method = 'GET', body, auth = true } = {}) {
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
