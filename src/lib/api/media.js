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

  commitUpload: (groupId, uploadIds, caption) =>
    request(`/groups/${groupId}/media/commit`, { method: 'POST', body: { uploadIds, caption } }),

  // uploadIds 를 주면 사진이 통째로 교체되고, 생략하면 글(caption)만 바뀐다
  updateMedia: (mediaId, uploadIds, caption) =>
    request(`/media/${mediaId}`, {
      method: 'PATCH',
      body: uploadIds?.length ? { uploadIds, caption } : { caption },
    }),
}

// 서명 URL 로 파일을 직접 올린다.
// Supabase 는 PUT + multipart 를 받는다. RN 은 raw body 로 file:// 를 못 보내서
// { uri, name, type } 을 FormData 에 담는 형태를 쓴다.
export async function putToSignedUrl(signedUrl, asset, contentType) {
  const form = new FormData()
  form.append('cacheControl', '3600')
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
