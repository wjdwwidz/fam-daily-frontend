import { api } from '../lib/api.js'
import { prepareImage } from '../lib/image.js'
import * as ImagePicker from 'expo-image-picker'

// 일상 사진 액션: 목록 로드 / 사진 고르기 / 올리기 / 수정 / 삭제.
export function createMediaActions({ ref, setState, go, back, showToast }) {
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

  // 한 글에 담을 수 있는 최대 개수 (서버의 MAX_FILES 와 같은 값).
  const MAX_PICK = 10

  // 사진 선택 — 기기 안의 파일로 미리보기만. 실제 업로드는 '올리기' 누를 때.
  // (고르기만 하고 나가면 서버엔 아무것도 안 남는다)
  const pickUploadPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (perm.status !== 'granted') return
      const result = await ImagePicker.launchImageLibraryAsync({
        // 배열 형태가 현재 API. MediaTypeOptions 는 deprecated.
        // 사진과 영상 둘 다
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        selectionLimit: MAX_PICK,
        // 압축은 올릴 때 prepareImage 가 한 번만 한다 (여기서도 하면 두 번 압축돼 화질이 떨어진다)
        quality: 1,
      })
      if (result.canceled || !result.assets || !result.assets.length) return
      setState({ uploadAssets: result.assets, uploadError: null })
    } catch {}
  }

  const onUploadCaption = (v) => setState({ uploadCaption: v })

  const submitUpload = async () => {
    const cur = ref.current
    const assets = cur.uploadAssets || []
    const editId = cur.editMediaId
    // 새 글은 사진이 반드시 있어야 한다. 수정은 사진을 안 골라도 된다(= 기존 사진 유지).
    if (!editId && !assets.length) {
      setState({ uploadError: '사진을 먼저 선택해주세요.' })
      return
    }
    const groupId = cur.currentGroup?.id
    if (!groupId) {
      setState({ uploadError: '가족 공간을 먼저 선택해주세요.' })
      return
    }
    const caption = (cur.uploadCaption || '').trim()
    setState({ uploadSaving: true, uploadError: null, uploadDone: 0, uploadTotal: assets.length })
    try {
      // 사진을 골랐으면 먼저 스토리지에 직접 올린다(서버를 거치지 않음).
      // 여기서 멈춰도 글이 안 만들어질 뿐이고, 남은 파일은 서버가 나중에 치운다.
      let uploadIds
      if (assets.length) {
        // 사진은 줄이고 JPEG 로 바꿔서 올린다 (영상은 그대로). 메모리를 아끼려고 한 장씩.
        const ready = []
        for (const a of assets) ready.push(await prepareImage(a))
        const files = ready.map((a) => ({
          contentType: api.assetContentType(a),
          size: a.fileSize,
          fileName: a.fileName,
        }))
        const slots = await api.prepareUpload(groupId, files)
        for (let i = 0; i < ready.length; i++) {
          await api.putToSignedUrl(slots[i].signedUrl, ready[i], files[i].contentType)
          setState({ uploadDone: i + 1 })
        }
        uploadIds = slots.map((s) => s.uploadId)
      }
      if (editId) {
        // uploadIds 가 있으면 서버가 파일까지 교체하고 옛 파일을 지운다.
        const updated = await api.updateMedia(editId, uploadIds, caption)
        await loadMedia(groupId)
        setState({
          uploadSaving: false, editMediaId: null, editMediaItems: undefined,
          uploadAssets: undefined, uploadCaption: undefined, uploadError: null,
          uploadDone: 0, uploadTotal: 0,
          media: updated, // 되돌아갈 상세 화면이 바뀐 내용을 보도록
        })
        showToast('일상을 수정했어요')
        back()
        return
      }
      // 올린 자리들이 글 하나로 확정된다.
      await api.commitUpload(groupId, uploadIds, caption)
      await loadMedia(groupId)
      setState({
        uploadSaving: false,
        uploadAssets: undefined, uploadCaption: undefined, uploadError: null,
        uploadDone: 0, uploadTotal: 0,
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
      editMediaId: null, editMediaItems: undefined,
      uploadAssets: undefined, uploadCaption: undefined, uploadError: null,
    })
    go('upload')
  }

  // 수정 진입 — 올리기 화면을 그대로 재사용한다.
  // uploadAssets 를 비워두는 게 '사진은 그대로' 라는 뜻이고,
  // 다시 고르는 순간부터 교체 대상이 된다. editMediaItems 는 그때까지 보여줄 기존 사진.
  const startEditMedia = () => {
    const m = ref.current.media
    if (!m) return
    setState({
      editMediaId: m.id, editMediaItems: m.items || [],
      uploadAssets: undefined, uploadCaption: m.caption || '', uploadError: null,
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

  return { loadMedia, pickUploadPhoto, onUploadCaption, submitUpload, openUpload, startEditMedia, removeMedia }
}
