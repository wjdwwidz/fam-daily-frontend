import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { login as kakaoSdkLogin } from '@react-native-seoul/kakao-login'
import { request, setToken, API_BASE } from './client.js'

WebBrowser.maybeCompleteAuthSession()

const WEB_CALLBACK_PATH = '/auth-callback'

// 카카오 로그인
// 앱: 카카오 SDK 로 카카오톡(또는 카카오계정) 로그인 → 받은 카카오 토큰을 서버가 우리 JWT 로 교환.
// 웹: 팝업 대신 페이지 전체를 카카오로 보냈다가 /auth-callback?token= 으로 돌아온다.
//     아이폰 '홈 화면에 추가' 모드에서는 팝업이 막히거나, 로그인 뒤 앱 화면으로 돌아오지 못한다.
export async function kakaoLogin() {
  if (Platform.OS === 'web') {
    const redirectUri = `${window.location.origin}${WEB_CALLBACK_PATH}`
    window.location.assign(`${API_BASE}/auth/kakao?redirect=${encodeURIComponent(redirectUri)}`)
    return null // 페이지가 떠난다. 돌아오면 consumeWebAuthCallback 이 토큰을 받는다
  }
  return loginWithKakaoSdk()
}

// 앱 로그인. 예전에는 인앱 브라우저로 백엔드 /auth/kakao 를 열었는데, 카카오 인증 페이지가
// 로그인을 카카오톡 앱 웹뷰로 넘기면서 인증 세션이 끊겨 콜백이 서버까지 오지 않았다
// (안드로이드에서 로그인이 조용히 실패). SDK 는 앱끼리 직접 주고받아 그 문제가 없다.
async function loginWithKakaoSdk() {
  let kakaoAccessToken
  try {
    const token = await kakaoSdkLogin()
    kakaoAccessToken = token?.accessToken
  } catch (e) {
    if (isUserCancel(e)) return null // 사용자가 카카오 화면에서 취소
    // Expo Go 처럼 네이티브 모듈이 없는 환경에서는 예전 브라우저 방식으로 넘어간다
    if (isNativeModuleMissing(e)) return loginWithAuthSession()
    throw new Error('카카오 로그인에 실패했어요. 잠시 후 다시 시도해주세요.')
  }
  if (!kakaoAccessToken) return null
  const res = await request('/auth/kakao/app', {
    method: 'POST',
    body: { accessToken: kakaoAccessToken },
    auth: false,
  })
  if (!res?.accessToken) throw new Error('로그인에 실패했어요. 다시 시도해주세요.')
  await setToken(res.accessToken)
  return res.accessToken
}

// 예전 방식(인앱 브라우저). 네이티브 모듈이 없는 개발 환경용 대비책으로만 남긴다.
async function loginWithAuthSession() {
  const redirectUri = Linking.createURL('auth-callback') // ExpoGo: exp://…/--/auth-callback
  const startUrl = `${API_BASE}/auth/kakao?redirect=${encodeURIComponent(redirectUri)}`
  const result = await WebBrowser.openAuthSessionAsync(startUrl, redirectUri)
  if (result.type === 'cancel' || result.type === 'dismiss') return null
  if (result.type !== 'success' || !result.url) {
    throw new Error('로그인이 완료되지 않았어요. 다시 시도해주세요.')
  }
  const { queryParams } = Linking.parse(result.url)
  const token = queryParams?.token
  if (!token) throw new Error('로그인에 실패했어요. 다시 시도해주세요.')
  await setToken(String(token))
  return String(token)
}

// 취소는 오류가 아니다. 플랫폼마다 코드·메시지가 달라 문자열로 판별한다.
function isUserCancel(e) {
  return /cancel/i.test(`${e?.code ?? ''} ${e?.message ?? ''}`)
}

function isNativeModuleMissing(e) {
  return /native module|turbomodule|not available|doesn't exist/i.test(
    `${e?.code ?? ''} ${e?.message ?? ''}`,
  )
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
