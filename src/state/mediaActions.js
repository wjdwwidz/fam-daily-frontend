import { api } from '../lib/api.js'
import { prepareImage } from '../lib/image.js'
import { runOnce } from './runOnce.js'
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

  // 첨부된 사진 한 장 빼기.
  // 새로 고른 사진이면 목록에서 빼고, 수정 중인 기존 사진이면 '남길 목록'에서 뺀다
  // (editItemsTrimmed 가 켜져야 저장할 때 keepUrls 를 보낸다).
  const removeUploadItem = (index) => {
    const cur = ref.current
    if ((cur.uploadAssets || []).length) {
      const next = cur.uploadAssets.filter((_, i) => i !== index)
      setState({ uploadAssets: next.length ? next : undefined, uploadError: null })
      return
    }
    const items = cur.editMediaItems || []
    if (!items.length) return
    if (items.length === 1) {
      setState({ uploadError: '사진은 최소 한 장 남겨야 해요.' })
      return
    }
    setState({
      editMediaItems: items.filter((_, i) => i !== index),
      editItemsTrimmed: true,
      uploadError: null,
    })
  }

  // ── 뒤에서 올리기 ─────────────────────────────────────────────────
  //
  // 새 일상 글은 '올리기'를 누르면 바로 목록으로 돌아가고, 업로드는 뒤에서 한다.
  // 목록 맨 위에 '올리는 중' 카드(uploadJobs)가 보이고, 끝나면 실제 글로 바뀐다.
  // 실패하면 카드에 다시 시도·삭제가 남는다. 앱을 완전히 끄면 그 글은 올라가지 않고,
  // 반쯤 올라간 파일은 서버가 나중에 치운다(SweepService).
  const updateJob = (id, patch) =>
    setState((p) => ({ uploadJobs: (p.uploadJobs || []).map((j) => (j.id === id ? { ...j, ...patch } : j)) }))

  // 같은 작업이 두 번 돌지 않게 작업마다 runOnce 로 막는다
  const runUploadJob = (job) => runOnce(`upload:${job.id}`, async () => {
    updateJob(job.id, { status: 'uploading', done: 0, error: null })
    try {
      // 사진은 줄이고 JPEG 로 바꿔서 올린다 (영상은 그대로). 메모리를 아끼려고 한 장씩.
      const ready = []
      for (const a of job.assets) ready.push(await prepareImage(a))
      const files = ready.map((a) => ({
        contentType: api.assetContentType(a),
        size: a.fileSize,
        fileName: a.fileName,
      }))
      // 파일은 서버를 거치지 않고 스토리지로 직접 간다
      const slots = await api.prepareUpload(job.groupId, files)
      for (let i = 0; i < ready.length; i++) {
        await api.putToSignedUrl(slots[i].signedUrl, ready[i], files[i].contentType)
        updateJob(job.id, { done: i + 1 })
      }
      await api.commitUpload(job.groupId, slots.map((s) => s.uploadId), job.caption)
      // 목록을 먼저 받은 뒤 카드를 없앤다 — 반대면 실제 글이 뜨기 전에 잠깐 비어 보인다
      if (ref.current.currentGroup?.id === job.groupId) await loadMedia(job.groupId)
      setState((p) => ({ uploadJobs: (p.uploadJobs || []).filter((j) => j.id !== job.id) }))
      showToast('일상을 올렸어요')
    } catch (e) {
      updateJob(job.id, { status: 'failed', error: e?.message || '올리지 못했어요. 다시 시도해주세요.' })
    }
  })

  const retryUploadJob = (id) => {
    const job = (ref.current.uploadJobs || []).find((j) => j.id === id)
    if (job) runUploadJob(job)
  }
  // 실패한 작업만 지운다 (올리는 중인 작업은 멈출 방법이 없어서 지우지 않는다)
  const discardUploadJob = (id) =>
    setState((p) => ({ uploadJobs: (p.uploadJobs || []).filter((j) => !(j.id === id && j.status === 'failed')) }))

  // 올리기 버튼을 빠르게 여러 번 눌러도 글은 하나만 만든다
  const submitUpload = () => runOnce('submitUpload', async () => {
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

    // 새 글: 작업만 넣고 바로 목록으로. 업로드는 기다리지 않는다.
    if (!editId) {
      const job = {
        id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        groupId, assets, caption,
        status: 'uploading', done: 0, total: assets.length, error: null,
      }
      setState((p) => ({
        uploadJobs: [job, ...(p.uploadJobs || [])],
        uploadAssets: undefined, uploadCaption: undefined, uploadError: null,
      }))
      go('gallery')
      runUploadJob(job)
      return
    }

    // 수정(사진 교체)은 끝날 때까지 기다린다 — 도중에 떠나면 원래 글이 어정쩡해질 수 있다
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
      // uploadIds 가 있으면 서버가 파일까지 교체하고 옛 파일을 지운다.
      // 사진을 빼기만 했으면 남길 것들을 keepUrls 로 알린다.
      const keepUrls =
        !uploadIds && cur.editItemsTrimmed
          ? (ref.current.editMediaItems || []).map((it) => it.url)
          : undefined
      const updated = await api.updateMedia(editId, uploadIds, caption, keepUrls)
      await loadMedia(groupId)
      setState({
        uploadSaving: false, editMediaId: null, editMediaItems: undefined, editItemsTrimmed: false,
        uploadAssets: undefined, uploadCaption: undefined, uploadError: null,
        uploadDone: 0, uploadTotal: 0,
        media: updated, // 되돌아갈 상세 화면이 바뀐 내용을 보도록
      })
      showToast('일상을 수정했어요')
      back()
    } catch (e) {
      setState({ uploadSaving: false, uploadError: e.message })
    }
  })

  // 올리기 화면 진입 — 이전에 고르다 만 초안은 버린다.
  const openUpload = () => {
    setState({
      editMediaId: null, editMediaItems: undefined, editItemsTrimmed: false,
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
      editMediaId: m.id, editMediaItems: m.items || [], editItemsTrimmed: false,
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

  // ── 댓글 ─────────────────────────────────────────────────────────
  const MAX_COMMENT = 300 // 서버의 MAX_COMMENT_LENGTH 와 같은 값

  // 응답이 올 때 이미 다른 글을 보고 있으면 버린다
  const applyComments = (mediaId, res) => {
    if (ref.current.media?.id !== mediaId) return
    setState({ comments: res.comments || [], commentCount: res.count || 0, commentsFor: mediaId, commentsLoading: false })
  }

  const loadComments = async (mediaId) => {
    if (!mediaId) return
    setState({ commentsLoading: true, commentError: null })
    try {
      applyComments(mediaId, await api.listComments(mediaId))
    } catch (e) {
      setState({ commentsLoading: false, commentError: e.message })
    }
  }

  const onCommentDraft = (text) => setState({ commentDraft: text, commentError: null })
  // 답글은 최상위 댓글에만 붙는다 — 답글에 답해도 서버가 같은 댓글 아래로 모은다
  const startReply = (c) => setState({ commentReplyTo: { id: c.id, name: c.by.name }, commentEditingId: null, commentError: null })
  const startEditComment = (c) => setState({ commentEditingId: c.id, commentDraft: c.text, commentReplyTo: null, commentError: null })
  const cancelCommentMode = () => setState({ commentReplyTo: null, commentEditingId: null, commentDraft: '', commentError: null })

  const submitComment = () => runOnce('submitComment', async () => {
    const cur = ref.current
    const mediaId = cur.media?.id
    const text = (cur.commentDraft || '').trim()
    if (!mediaId || cur.commentSaving) return
    if (!text) {
      setState({ commentError: '댓글 내용을 입력해주세요.' })
      return
    }
    if (text.length > MAX_COMMENT) {
      setState({ commentError: `댓글은 ${MAX_COMMENT}자까지 쓸 수 있어요.` })
      return
    }
    setState({ commentSaving: true, commentError: null })
    try {
      const res = cur.commentEditingId
        ? await api.editComment(cur.commentEditingId, text)
        : await api.addComment(mediaId, text, cur.commentReplyTo?.id)
      applyComments(mediaId, res)
      setState({ commentSaving: false, commentDraft: '', commentReplyTo: null, commentEditingId: null })
    } catch (e) {
      setState({ commentSaving: false, commentError: e.message })
    }
  })

  const removeComment = async (commentId) => {
    const mediaId = ref.current.media?.id
    if (!mediaId) return
    try {
      applyComments(mediaId, await api.deleteComment(commentId))
      // 수정하던 댓글을 지웠으면 입력칸도 비운다
      if (ref.current.commentEditingId === commentId) cancelCommentMode()
      showToast('댓글을 삭제했어요')
    } catch (e) {
      showToast(e.message)
    }
  }

  return {
    loadMedia, pickUploadPhoto, onUploadCaption, submitUpload, openUpload, startEditMedia, removeMedia,
    removeUploadItem,
    retryUploadJob, discardUploadJob,
    loadComments, onCommentDraft, startReply, startEditComment, cancelCommentMode, submitComment, removeComment,
  }
}
