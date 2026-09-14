import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { request, setToken, API_BASE } from './client.js'

WebBrowser.maybeCompleteAuthSession()

const WEB_CALLBACK_PATH = '/auth-callback'

// 카카오 로그인
// 앱: 인앱 브라우저로 백엔드 /auth/kakao 를 열고, 백엔드가 딥링크로 토큰을 돌려주면 저장.
// 웹: 팝업 대신 페이지 전체를 카카오로 보냈다가 /auth-callback?token= 으로 돌아온다.
//     아이폰 '홈 화면에 추가' 모드에서는 팝업이 막히거나, 로그인 뒤 앱 화면으로 돌아오지 못한다.
export async function kakaoLogin() {
  if (Platform.OS === 'web') {
    const redirectUri = `${window.location.origin}${WEB_CALLBACK_PATH}`
    window.location.assign(`${API_BASE}/auth/kakao?redirect=${encodeURIComponent(redirectUri)}`)
    return null // 페이지가 떠난다. 돌아오면 consumeWebAuthCallback 이 토큰을 받는다
  }
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

// 웹: 카카오 로그인에서 돌아온 주소(/auth-callback?token=…)면 토큰을 저장하고 주소를 정리한다.
// 토큰이 주소창·방문 기록에 남지 않도록 바로 지운다.
export async function consumeWebAuthCallback() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return
  if (window.location.pathname !== WEB_CALLBACK_PATH) return
  const token = new URLSearchParams(window.location.search).get('token')
  window.history.replaceState(null, '', '/')
  if (token) await setToken(token)
}

const PENDING_JOIN_KEY = 'famdaily_pending_join'

// 웹: 초대 링크(/join/코드)로 들어왔으면 코드를 보관하고 주소를 정리한다.
// 로그인 전이면 카카오 로그인으로 페이지를 떠났다 돌아오므로, 메모리가 아니라 브라우저 저장소에 둔다.
export function consumeWebJoinLink() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return
  const m = window.location.pathname.match(/^\/join\/([A-Za-z0-9_-]+)\/?$/)
  if (!m) return
  try {
    window.localStorage.setItem(PENDING_JOIN_KEY, m[1])
  } catch {}
  window.history.replaceState(null, '', '/')
}

// 보관해 둔 초대 코드를 꺼내고 지운다 (없으면 null)
export function takePendingJoinCode() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return null
  try {
    const code = window.localStorage.getItem(PENDING_JOIN_KEY)
    if (code) window.localStorage.removeItem(PENDING_JOIN_KEY)
    return code
  } catch {
    return null
  }
}

export const authApi = {
  kakaoLogin,
  consumeWebAuthCallback,
  consumeWebJoinLink,
  takePendingJoinCode,
  me: () => request('/auth/me'),
  updateMe: (patch) => request('/auth/me', { method: 'PATCH', body: patch }),
  deleteMe: () => request('/auth/me', { method: 'DELETE' }),
}
