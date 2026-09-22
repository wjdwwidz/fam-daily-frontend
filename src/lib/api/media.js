import { request } from './client.js'

// 일상 사진·영상 — 그룹 범위
//
// 업로드는 2단계다. 파일 바이트가 서버를 거치지 않고 스토리지로 직행한다.
//   ① prepare : 올릴 자리(서명 URL)를 받는다
//   ② PUT     : 스토리지에 직접 올린다
//   ③ commit  : 올린 자리들로 글 하나를 만든다
// ③ 을 하지 않으면 파일만 남는데, 서버가 ① 에서 기록해둔 자리를 보고 나중에 치운다.

export const mediaApi = {
  listMedia: (groupId) => request(`/groups/${groupId}/media`),
  deleteMedia: (mediaId) => request(`/media/${mediaId}`, { method: 'DELETE' }),

  prepareUpload: (groupId, files) =>
    request(`/groups/${groupId}/media/prepare`, { method: 'POST', body: { files } }),

  // extra: 글에 덧붙이는 것들 — { takenFrom, takenTo } (언제의 일인지), { place } (장소)
  commitUpload: (groupId, uploadIds, caption, extra = {}) =>
    request(`/groups/${groupId}/media/commit`, { method: 'POST', body: { uploadIds, caption, ...extra } }),

  // uploadIds 를 주면 사진이 통째로 교체된다.
  // keepUrls 를 주면 거기 없는 기존 사진이 지워진다(한 장씩 빼기).
  // 둘 다 없으면 글(caption)만 바뀐다. extra 는 commitUpload 와 같다 (날짜·장소를 빼려면 null 로 보낸다).
  updateMedia: (mediaId, uploadIds, caption, keepUrls, extra = {}) =>
    request(`/media/${mediaId}`, {
      method: 'PATCH',
      body: {
        caption,
        ...(uploadIds?.length ? { uploadIds } : {}),
        ...(keepUrls ? { keepUrls } : {}),
        ...extra,
      },
    }),

  // 장소 검색 (구글) — 키는 서버에만 있어서 서버를 거친다
  searchPlaces: (q) => request(`/places/search?q=${encodeURIComponent(q)}`),

  // 댓글 — 쓰기 요청은 모두 갱신된 목록 { count, comments } 을 돌려준다
  listComments: (mediaId) => request(`/media/${mediaId}/comments`),
  addComment: (mediaId, text, parentId) =>
    request(`/media/${mediaId}/comments`, { method: 'POST', body: parentId ? { text, parentId } : { text } }),
  editComment: (commentId, text) => request(`/comments/${commentId}`, { method: 'PATCH', body: { text } }),
  deleteComment: (commentId) => request(`/comments/${commentId}`, { method: 'DELETE' }),
}

// 서명 URL 로 파일을 직접 올린다.
// Supabase 는 PUT + multipart 를 받는다. RN 은 raw body 로 file:// 를 못 보내서
// { uri, name, type } 을 FormData 에 담는 형태를 쓴다.
export async function putToSignedUrl(signedUrl, asset, contentType) {
  const form = new FormData()
  // 캐시 1년 — 파일 이름이 매번 새로 만들어지고 덮어쓰지 않아서 오래 캐시해도 안전하다
  // (서버를 거치는 업로드도 같은 값: 백엔드 StorageService 의 FILE_CACHE_SECONDS)
  form.append('cacheControl', '31536000')
  if (asset.file) {
    form.append('', asset.file) // 웹: File 객체
  } else {
    const ext = (contentType.split('/')[1] || 'bin').split(';')[0]
    form.append('', { uri: asset.uri, name: asset.fileName || `upload.${ext}`, type: contentType })
  }
  let res
  try {
    res = await fetch(signedUrl, { method: 'PUT', body: form })
  } catch {
    throw new Error('업로드 중 연결이 끊겼어요. 다시 시도해주세요.')
  }
  if (!res.ok) {
    let msg = '업로드에 실패했어요.'
    try {
      const d = await res.json()
      msg = (d && (d.message || d.error)) || msg
    } catch {}
    throw new Error(msg)
  }
}

// expo-image-picker asset → 서버에 알려줄 contentType
export function assetContentType(asset) {
  if (asset.mimeType) return asset.mimeType
  return asset.type === 'video' ? 'video/mp4' : 'image/jpeg'
}
