import { Platform } from 'react-native'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

// 올리기 전 사진 준비 — 해상도를 줄이고(원본 비율 유지) 되도록 JPEG 로 통일한다.
//
// 폰 카메라 원본(3~4MB, 긴 변 4000px 안팎)을 그대로 올리면 목록 칸·아바타에서도 그 원본을 받아
// 느리다. 스토리지(Supabase)의 이미지 축소 기능은 유료라, 올릴 때 줄여 두는 게 가장 싸다.

export const PHOTO_MAX_SIDE = 1920 // 일상·사전 사진 (뷰어에서 확대해도 볼 만한 크기)
export const PHOTO_QUALITY = 0.8
export const PROFILE_MAX_SIDE = 512 // 프로필 사진 (아바타는 커도 104px)
export const PROFILE_QUALITY = 0.85

// 아주 긴 사진(카톡 캡처 등): 긴 변 기준으로 줄이면 폭이 너무 좁아져 글씨를 못 읽는다
// (예: 1206x12309 → 188x1920). 긴 변이 짧은 변의 3배를 넘으면 짧은 변을 기준으로 줄인다.
const LONG_RATIO = 3
const LONG_SHORT_SIDE = 1080
// 캔버스 크기 한계(iOS Safari 약 16MP) 아래로. 넘으면 저장이 실패한다.
const MAX_PIXELS = 12_000_000

const isVideo = (asset) => asset.type === 'video' || /^video\//.test(asset.mimeType || '')
const isJpeg = (asset) =>
  /image\/jpe?g/i.test(asset.mimeType || '') || /\.jpe?g$/i.test(asset.fileName || '')
const isHeic = (asset) =>
  /image\/hei[cf]/i.test(asset.mimeType || '') || /\.hei[cf]$/i.test(asset.fileName || '')
// JPEG·HEIC 가 아니면(PNG 등) 투명한 부분이 있을 수 있다
const mayHaveAlpha = (asset) => !isJpeg(asset) && !isHeic(asset)
const renamed = (asset, ext) => `${String(asset.fileName || 'photo').replace(/\.[^.]+$/, '')}.${ext}`

// 원본 비율을 유지한 목표 크기. scaled=false 면 줄일 필요가 없다.
function targetSize(w, h, maxSide) {
  const long = Math.max(w, h)
  const short = Math.min(w, h)
  let scale = long / short > LONG_RATIO
    ? Math.min(1, Math.min(maxSide, LONG_SHORT_SIDE) / short)
    : Math.min(1, maxSide / long)
  if (w * scale * h * scale > MAX_PIXELS) scale = Math.sqrt(MAX_PIXELS / (w * h))
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
    scaled: scale < 1,
  }
}

export async function prepareImage(asset, { maxSide = PHOTO_MAX_SIDE, quality = PHOTO_QUALITY } = {}) {
  if (!asset || isVideo(asset)) return asset
  try {
    let w = asset.width || 0
    let h = asset.height || 0
    // 사진첩이 크기를 안 알려주면 한 번 열어서 읽는다
    if (!w || !h) {
      const probe = await ImageManipulator.manipulate(asset.uri).renderAsync()
      w = probe.width
      h = probe.height
    }
    const target = targetSize(w, h, maxSide)
    const alpha = mayHaveAlpha(asset)
    const web = Platform.OS === 'web'

    // 이미 작은 JPEG 는 그대로 — 다시 압축하면 화질만 떨어진다
    if (!target.scaled && isJpeg(asset)) return asset
    // 폰에서는 투명한 사진을 JPEG 로 바꾸면 투명한 부분이 검게 된다(흰 바탕을 깔 방법이 없음).
    // PNG 로 해상도만 줄이는데, 줄일 필요도 없으면 원본 그대로 올린다.
    if (!web && alpha && !target.scaled) return asset

    const ctx = ImageManipulator.manipulate(asset.uri)
    if (target.scaled) ctx.resize({ width: target.width, height: target.height })
    // 웹은 흰 바탕을 깐 뒤 JPEG 로 — 안 깔면 투명한 부분이 검게 저장된다 (extent 는 웹 전용)
    if (web && alpha) ctx.extent({ backgroundColor: '#ffffff', width: target.width, height: target.height })
    const ref = await ctx.renderAsync()

    const asPng = !web && alpha
    const out = await ref.saveAsync(
      asPng ? { format: SaveFormat.PNG } : { format: SaveFormat.JPEG, compress: quality },
    )
    const mimeType = asPng ? 'image/png' : 'image/jpeg'

    const next = {
      ...asset,
      type: 'image',
      uri: out.uri,
      width: out.width,
      height: out.height,
      mimeType,
      fileName: renamed(asset, asPng ? 'png' : 'jpg'),
    }
    if (web) {
      // 웹 업로드는 File 객체를 보낸다. 결과는 blob URL 로 오니 File 로 바꾼다.
      const blob = await (await fetch(out.uri)).blob()
      next.file = new File([blob], next.fileName, { type: mimeType })
      next.fileSize = blob.size
    } else {
      // 네이티브는 줄인 파일 크기를 바로 알 수 없다 (서버의 용량 검사는 크기가 있을 때만 한다)
      next.fileSize = undefined
    }
    return next
  } catch {
    // 줄이기에 실패하면(브라우저가 못 여는 형식 등) 원본을 올린다 — 업로드 자체는 막지 않는다
    return asset
  }
}
