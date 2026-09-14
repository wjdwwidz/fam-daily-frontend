import { Platform } from 'react-native'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'

// 올리기 전 사진 준비 — 긴 변을 maxSide 이하로 줄이고(원본 비율 유지) JPEG 로 통일한다.
//
// 폰 카메라 원본(3~4MB, 긴 변 4000px 안팎)을 그대로 올리면 목록 칸·아바타에서도 그 원본을 받아
// 느리다. 스토리지(Supabase)의 이미지 축소 기능은 유료라, 올릴 때 줄여 두는 게 가장 싸다.
// HEIC·PNG 도 JPEG 로 바뀌어 어느 브라우저에서나 열린다.

export const PHOTO_MAX_SIDE = 1920 // 일상·사전 사진 (뷰어에서 확대해도 볼 만한 크기)
export const PHOTO_QUALITY = 0.8
export const PROFILE_MAX_SIDE = 512 // 프로필 사진 (아바타는 커도 104px)
export const PROFILE_QUALITY = 0.85

const isVideo = (asset) => asset.type === 'video' || /^video\//.test(asset.mimeType || '')
const isJpeg = (asset) =>
  /image\/jpe?g/i.test(asset.mimeType || '') || /\.jpe?g$/i.test(asset.fileName || '')
const jpegName = (asset) => `${String(asset.fileName || 'photo').replace(/\.[^.]+$/, '')}.jpg`

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
    const needsResize = Math.max(w, h) > maxSide
    // 이미 작은 JPEG 는 그대로 — 다시 압축하면 화질만 떨어진다
    if (!needsResize && isJpeg(asset)) return asset

    const ctx = ImageManipulator.manipulate(asset.uri)
    // 한 변만 정하면 나머지는 원본 비율대로 맞춰진다
    if (needsResize) ctx.resize(w >= h ? { width: maxSide } : { height: maxSide })
    const ref = await ctx.renderAsync()
    const out = await ref.saveAsync({ format: SaveFormat.JPEG, compress: quality })

    const next = {
      ...asset,
      type: 'image',
      uri: out.uri,
      width: out.width,
      height: out.height,
      mimeType: 'image/jpeg',
      fileName: jpegName(asset),
    }
    if (Platform.OS === 'web') {
      // 웹 업로드는 File 객체를 보낸다. 결과는 blob URL 로 오니 File 로 바꾼다.
      const blob = await (await fetch(out.uri)).blob()
      next.file = new File([blob], next.fileName, { type: 'image/jpeg' })
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
