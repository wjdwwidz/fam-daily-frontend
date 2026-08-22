import { request } from './client.js'
import { postFiles } from './uploads.js'

// 일상 사진 — 그룹 범위
export const mediaApi = {
  listMedia: (groupId) => request(`/groups/${groupId}/media`),
  // 사진·영상 여러 개가 글 하나가 된다. 업로드와 등록을 서버가 한 요청으로 처리
  createMedia: (groupId, assets, caption) =>
    postFiles(`/groups/${groupId}/media`, assets, '올리기에 실패했어요.', { caption }),
  deleteMedia: (mediaId) => request(`/media/${mediaId}`, { method: 'DELETE' }),
}
