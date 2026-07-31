import { API_BASE, getToken } from './client.js'

// 이미지 업로드 (multipart/form-data, field=file) → 서버가 준 public URL 반환
export async function uploadImage(asset) {
  const form = new FormData()
  if (asset.file) {
    // 웹: expo-image-picker 가 File 객체를 제공
    form.append('file', asset.file)
  } else {
    // 네이티브: { uri, name, type } 형태로 첨부
    const type = asset.mimeType || 'image/jpeg'
    const name = asset.fileName || `photo.${type.split('/')[1] || 'jpg'}`
    form.append('file', { uri: asset.uri, name, type })
  }
  const token = await getToken()
  const res = await fetch(`${API_BASE}/uploads`, {
    method: 'POST',
    // Content-Type 은 넣지 않음 — 브라우저가 multipart boundary 를 자동 설정
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    let msg = '사진 업로드에 실패했어요.'
    try {
      const d = await res.json()
      msg = (d && (d.message || d.error)) || msg
    } catch {}
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
  }
  const data = await res.json()
  return data.url
}
