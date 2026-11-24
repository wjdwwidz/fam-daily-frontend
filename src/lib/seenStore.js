import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'

// '이미 본 것' 표시를 기기에 남긴다 (예: 이번 달 요약을 봤는지). 서버에 둘 만큼 중요하지 않아
// 기기마다 따로 기억한다. 앱은 보안 저장소, 웹은 localStorage. 실패해도 앱 동작에는 지장 없게 조용히.
const PREFIX = 'famdaily_seen_'

export async function getSeen(key) {
  try {
    if (Platform.OS === 'web') return window.localStorage.getItem(PREFIX + key)
    return await SecureStore.getItemAsync(PREFIX + key)
  } catch {
    return null
  }
}

export async function setSeen(key, value) {
  try {
    if (Platform.OS === 'web') window.localStorage.setItem(PREFIX + key, value)
    else await SecureStore.setItemAsync(PREFIX + key, value)
  } catch {}
}
