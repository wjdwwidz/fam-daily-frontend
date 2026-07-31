// 도메인별 모듈(api/*)을 모아 앱에서 쓰는 단일 진입점으로 재노출.
// 화면은 여기서 `api` 하나만 import 하면 됨.
import { API_BASE, getToken, setToken, clearToken } from './api/client.js'
import { authApi, kakaoLogin } from './api/auth.js'
import { groupsApi } from './api/groups.js'
import { wordsApi } from './api/words.js'
import { qnaApi } from './api/qna.js'
import { uploadImage } from './api/uploads.js'

export { API_BASE, getToken, setToken, clearToken, kakaoLogin }

export const api = {
  base: API_BASE,
  ...authApi,
  ...groupsApi,
  ...wordsApi,
  ...qnaApi,
  uploadImage,
}
