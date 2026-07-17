import * as WebBrowser from 'expo-web-browser'
import * as Linking from 'expo-linking'
import { request, setToken, API_BASE } from './client.js'

WebBrowser.maybeCompleteAuthSession()

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

export const authApi = {
  kakaoLogin,
  me: () => request('/auth/me'),
  updateMe: (name) => request('/auth/me', { method: 'PATCH', body: { name } }),
}
