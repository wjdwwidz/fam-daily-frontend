import { API_BASE, getToken } from './client.js'

// 이미지 업로드 (multipart/form-data, field=file) → 서버가 준 public URL 반환
// folder: 버킷 내 정리용 폴더 (예: 'words')
function appendAsset(form, field, asset) {
  if (asset.file) {
    // 웹: expo-image-picker 가 File 객체를 제공
    form.append(field, asset.file)
  } else {
    // 네이티브: { uri, name, type } 형태로 첨부
    const type = asset.mimeType || 'image/jpeg'
    const ext = (type.split('/')[1] || 'jpg').split(';')[0]
    const name = asset.fileName || `upload.${ext}`
    form.append(field, { uri: asset.uri, name, type })
  }
}

function toForm(asset) {
  const form = new FormData()
  appendAsset(form, 'file', asset)
  return form
}

export async function postFile(path, asset, failMsg, fields) {
  const form = toForm(asset)
  // 파일과 같이 보낼 텍스트 필드 (예: caption)
  if (fields) {
    for (const [k, v] of Object.entries(fields)) {
      if (v !== undefined && v !== null) form.append(k, String(v))
    }
  }
  const token = await getToken()
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    // Content-Type 은 넣지 않음 — 브라우저가 multipart boundary 를 자동 설정
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  if (!res.ok) {
    let msg = failMsg
    try {
      const d = await res.json()
      msg = (d && (d.message || d.error)) || msg
    } catch {}
    throw new Error(Array.isArray(msg) ? msg.join(', ') : msg)
  }
  return res.json()
}

export async function uploadImage(asset, folder) {
  const qs = folder ? `?folder=${encodeURIComponent(folder)}` : ''
  const data = await postFile(`/uploads${qs}`, asset, '사진 업로드에 실패했어요.')
  return data.url
}

// 프로필 사진 교체 — 서버가 업로드와 DB 기록을 한 요청으로 처리한다.
// (두 번 나눠 부르면 업로드만 성공했을 때 고아 파일이 남는다)
export async function updateMyPhoto(asset) {
  return postFile('/auth/me/photo', asset, '프로필 사진 저장에 실패했어요.')
}
