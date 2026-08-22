import { api } from '../lib/api.js'
import * as ImagePicker from 'expo-image-picker'

// 일상 사진 액션: 목록 로드 / 사진 고르기 / 올리기 / 삭제.
export function createMediaActions({ ref, setState, go, showToast }) {
  const loadMedia = async (groupId) => {
    if (!groupId) return
    setState({ mediaLoading: true })
    try {
      const list = await api.listMedia(groupId)
      setState({ groupMedia: list, mediaLoading: false })
    } catch {
      setState({ groupMedia: [], mediaLoading: false })
    }
  }

  // 사진 선택 — 기기 안의 파일로 미리보기만. 실제 업로드는 '올리기' 누를 때.
  // (고르기만 하고 나가면 서버엔 아무것도 안 남는다)
  const pickUploadPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (perm.status !== 'granted') return
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      })
      if (result.canceled || !result.assets || !result.assets[0]) return
      const asset = result.assets[0]
      setState({ uploadPhoto: asset.uri, uploadAsset: asset, uploadError: null })
    } catch {}
  }

  const onUploadCaption = (v) => setState({ uploadCaption: v })

  const submitUpload = async () => {
    const cur = ref.current
    const asset = cur.uploadAsset
    if (!asset) {
      setState({ uploadError: '사진을 먼저 선택해주세요.' })
      return
    }
    const groupId = cur.currentGroup?.id
    if (!groupId) {
      setState({ uploadError: '가족 공간을 먼저 선택해주세요.' })
      return
    }
    setState({ uploadSaving: true, uploadError: null })
    try {
      await api.createMedia(groupId, asset, (cur.uploadCaption || '').trim())
      await loadMedia(groupId)
      setState({
        uploadSaving: false,
        uploadPhoto: undefined, uploadAsset: undefined,
        uploadCaption: undefined, uploadError: null,
      })
      showToast('일상을 올렸어요')
      go('gallery')
    } catch (e) {
      setState({ uploadSaving: false, uploadError: e.message })
    }
  }

  // 올리기 화면 진입 — 이전에 고르다 만 초안은 버린다.
  const openUpload = () => {
    setState({
      uploadPhoto: undefined, uploadAsset: undefined,
      uploadCaption: undefined, uploadError: null,
    })
    go('upload')
  }

  const removeMedia = async (mediaId) => {
    try {
      await api.deleteMedia(mediaId)
      await loadMedia(ref.current.currentGroup?.id)
      showToast('사진을 삭제했어요')
      go('gallery')
    } catch (e) {
      showToast(e.message)
    }
  }

  return { loadMedia, pickUploadPhoto, onUploadCaption, submitUpload, openUpload, removeMedia }
}
