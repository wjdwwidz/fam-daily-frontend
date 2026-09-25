import * as WebBrowser from 'expo-web-browser'
import { SERVER_BASE } from './api/client.js'

// 스토어에 등록한 공개 문서 (백엔드가 제공). 앱 안 브라우저로 연다.
export const PRIVACY_URL = `${SERVER_BASE}/privacy`

export const openPrivacy = () => WebBrowser.openBrowserAsync(PRIVACY_URL)
