import { request } from './client.js'
import { postFile } from './uploads.js'

// 일상 사진 — 그룹 범위
export const mediaApi = {
  listMedia: (groupId) => request(`/groups/${groupId}/media`),
  // 업로드와 등록을 서버가 한 요청으로 처리한다 (나눠 부르면 고아 파일이 남는다)
  createMedia: (groupId, asset, caption) =>
    postFile(`/groups/${groupId}/media`, asset, '사진 올리기에 실패했어요.', { caption }),
  deleteMedia: (mediaId) => request(`/media/${mediaId}`, { method: 'DELETE' }),
}
