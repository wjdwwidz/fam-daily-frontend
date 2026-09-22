import { api } from '../lib/api.js'
import { prepareImage, makeThumb } from '../lib/image.js'
import { runOnce } from './runOnce.js'
import { todayYmd, withDatePart } from '../lib/date.js'
import * as ImagePicker from 'expo-image-picker'
import { Platform, ToastAndroid } from 'react-native'

// 장소 검색 입력을 멈출 때까지 기다리는 타이머. 액션은 렌더마다 새로 만들어지므로
// 여기(모듈)에 둬야 앞서 건 타이머를 취소할 수 있다.
let placeTimer = null

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

  // 장소 검색 창을 닫은 상태
  const PLACE_SEARCH_CLOSED = { placeSearchOpen: false, placeQuery: '', placeResults: [], placeSearching: false, placeError: null }

  // 한 글에 담을 수 있는 최대 개수 (서버의 MAX_FILES 와 같은 값).
  const MAX_PICK = 10

  // 사진 선택 — 기기 안의 파일로 미리보기만. 실제 업로드는 '올리기' 누를 때.
  // (고르기만 하고 나가면 서버엔 아무것도 안 남는다)
  // 사진 고르기 — 이미 고른 것에 덧붙인다 (예전엔 통째로 바꿨다).
  // 수정 중에 처음 고르는 경우엔 기존 사진을 교체하는 뜻이므로 덧붙이지 않는다.
  const pickUploadPhoto = async () => {
    try {
      const cur = ref.current
      const picked = cur.uploadAssets || []
      // 수정 중이면 남아 있는 기존 사진도 자리를 차지한다
      const existing = cur.editMediaId ? (cur.editMediaItems || []).length : 0
      const room = MAX_PICK - picked.length - existing
      if (room <= 0) {
        setState({ uploadError: `사진은 최대 ${MAX_PICK}장까지 올릴 수 있어요.` })
        return
      }
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (perm.status !== 'granted') return
      // 안드로이드는 기기에 따라 개수 제한이 없는 갤러리 앱이 열린다 (selectionLimit 이 안 먹는다).
      // 앱 안 알림은 갤러리에 가려 안 보이므로, 갤러리 위에도 뜨는 시스템 토스트로 미리 알려둔다.
      if (Platform.OS === 'android') {
        ToastAndroid.show(`최대 ${room}장까지 고를 수 있어요`, ToastAndroid.LONG)
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        // 배열 형태가 현재 API. MediaTypeOptions 는 deprecated.
        // 영상은 아직 받지 않는다 (저장 공간). 이미 올라간 영상은 그대로 재생된다.
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: room,
        // 압축은 올릴 때 prepareImage 가 한 번만 한다 (여기서도 하면 두 번 압축돼 화질이 떨어진다)
        quality: 1,
      })
      if (result.canceled || !result.assets || !result.assets.length) return
      // 넘치게 고른 건 앞에서부터 남은 자리만큼만 담는다.
      // (예전엔 MAX_PICK 로 잘라, 수정 중이면 기존 사진과 합쳐 10장을 넘을 수 있었다)
      // 웹은 미리보기용 작은 사진을 만드는 동안 빈 칸으로 먼저 보여준다 (원본을 그리면 느리다)
      const web = Platform.OS === 'web'
      const taken = result.assets.slice(0, room).map((a) => (web ? { ...a, thumbPending: true } : a))
      setState({ uploadAssets: [...picked, ...taken], uploadError: null })
      if (result.assets.length > room) {
        showToast(`최대 ${MAX_PICK}장이라 ${result.assets.length}장 중 ${room}장만 담았어요`)
      }
      if (web) fillThumbs(taken)
    } catch {}
  }

  // 미리보기용 작은 사진을 한 장씩 만들어 채운다. 한꺼번에 만들면 아이폰 사파리 메모리가 모자란다.
  // 그사이 사진을 빼거나 순서를 바꿔도 되게 uri 로 찾아 바꾼다. 실패하면 원본을 그대로 보여준다.
  const fillThumbs = async (assets) => {
    for (const a of assets) {
      const thumbUri = await makeThumb(a)
      setState((p) => ({
        uploadAssets: (p.uploadAssets || []).map((x) =>
          x.uri === a.uri ? { ...x, thumbUri, thumbPending: false } : x,
        ),
      }))
    }
  }

  const onUploadCaption = (v) => setState({ uploadCaption: v })

  // ── 언제의 일인지 ─────────────────────────────────────────────────
  // 고르지 않으면 날짜 없이 올라간다. 추가하면 오늘부터, '며칠 동안' 을 켜면 끝나는 날이 생긴다.
  // 끝나는 날은 시작보다 앞일 수 없다 — 어느 쪽을 바꾸든 순서가 뒤집히지 않게 맞춘다.
  const addMediaDate = () => setState({ uploadTakenFrom: todayYmd(), uploadTakenTo: null })
  const removeMediaDate = () => setState({ uploadTakenFrom: null, uploadTakenTo: null })
  const toggleMediaRange = () =>
    setState((p) => ({ uploadTakenTo: p.uploadTakenTo ? null : p.uploadTakenFrom }))
  const setMediaDatePart = (which, part, value) => {
    const cur = ref.current
    let from = cur.uploadTakenFrom
    let to = cur.uploadTakenTo
    if (which === 'from') {
      from = withDatePart(from, part, value)
      if (to && to < from) to = from
    } else {
      to = withDatePart(to || from, part, value)
      if (to < from) to = from
    }
    setState({ uploadTakenFrom: from, uploadTakenTo: to })
  }

  // ── 장소 (구글 장소 검색) ─────────────────────────────────────────
  // 치는 동안 매번 부르면 요청이 많아 요금이 붙는다. 멈추고 잠깐 뒤에 한 번만 찾는다.
  // 늦게 도착한 옛 검색 결과가 새 결과를 덮지 않게 마지막 검색어와 맞는지 본다.
  const openPlaceSearch = () => setState({ placeSearchOpen: true, placeQuery: '', placeResults: [], placeError: null })
  const closePlaceSearch = () => { clearTimeout(placeTimer); setState(PLACE_SEARCH_CLOSED) }
  const onPlaceQuery = (q) => {
    setState({ placeQuery: q, placeError: null })
    clearTimeout(placeTimer)
    const text = q.trim()
    if (!text) { setState({ placeResults: [], placeSearching: false }); return }
    placeTimer = setTimeout(async () => {
      setState({ placeSearching: true })
      try {
        const results = await api.searchPlaces(text)
        if ((ref.current.placeQuery || '').trim() !== text) return
        setState({ placeResults: results || [], placeSearching: false })
      } catch (e) {
        if ((ref.current.placeQuery || '').trim() !== text) return
        setState({ placeResults: [], placeSearching: false, placeError: e.message })
      }
    }, 450)
  }
  const pickPlace = (p) => {
    clearTimeout(placeTimer)
    setState({
      uploadPlace: { name: p.name, address: p.address || undefined, placeId: p.placeId, lat: p.lat ?? undefined, lng: p.lng ?? undefined },
      ...PLACE_SEARCH_CLOSED,
    })
  }
  const removePlace = () => setState({ uploadPlace: null })

  // 새로 고른 사진 순서 바꾸기 (끌어서 놓기). 올릴 때 이 순서대로 붙는다.
  const reorderUploadAsset = (from, to) => {
    const list = [...(ref.current.uploadAssets || [])]
    if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return
    const [moved] = list.splice(from, 1)
    list.splice(to, 0, moved)
    setState({ uploadAssets: list })
  }

  // 첨부된 사진 한 장 빼기.
  // 새로 고른 사진이면 목록에서 빼고, 수정 중인 기존 사진이면 '남길 목록'에서 뺀다
  // (editItemsTrimmed 가 켜져야 저장할 때 keepUrls 를 보낸다).
  const removeUploadItem = ({ kind, index }) => {
    const cur = ref.current
    const existing = cur.editMediaId ? cur.editMediaItems || [] : []
    const picked = cur.uploadAssets || []
    // 마지막 한 장은 뺄 수 없다 — 사진 없는 글은 만들 수 없으므로
    if (existing.length + picked.length <= 1) {
      setState({ uploadError: '사진은 최소 한 장 남겨야 해요.' })
      return
    }
    if (kind === 'new') {
      const next = picked.filter((_, i) => i !== index)
      setState({ uploadAssets: next.length ? next : undefined, uploadError: null })
      return
    }
    setState({
      editMediaItems: existing.filter((_, i) => i !== index),
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
      await api.commitUpload(job.groupId, slots.map((s) => s.uploadId), job.caption, job.extra)
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
    // 언제의 일인지 — 없으면 null 로 (수정에서 날짜를 뺐을 때도 서버가 비우게)
    const taken = { takenFrom: cur.uploadTakenFrom || null, takenTo: cur.uploadTakenTo || null }
    // 장소 — 뺐으면 null (수정에서 서버도 비우게)
    const place = cur.uploadPlace || null
    const extra = { ...taken, place }

    // 버킷리스트에 붙이려고 쓰는 글은 끝까지 기다린다 —
    // 올라간 글을 그 칸에 이어붙이고 곧바로 그 칸으로 돌아가야 하기 때문.
    const linkNo = cur.bucketLinkNo
    if (!editId && linkNo) {
      setState({ uploadSaving: true, uploadError: null, uploadDone: 0, uploadTotal: assets.length })
      try {
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
        const created = await api.commitUpload(groupId, slots.map((s) => s.uploadId), caption, extra)
        await loadMedia(groupId)

        // 칸에 내용이 이미 적혀 있으면 바로 이어붙여 저장한다.
        // 비어 있으면 붙이기만 하고, 사용자가 내용을 적어 저장하게 둔다.
        const draft = (cur.bucketDraft || '').trim()
        if (draft) {
          await api.saveBucket(groupId, linkNo, {
            text: draft,
            done: !!cur.bucketDone,
            mediaId: created.id,
          })
          // 목록을 새로 받아 칸에 썸네일이 바로 보이게
          const fresh = await api.bucket(groupId).catch(() => null)
          if (fresh) setState({ bucket: fresh })
          showToast(`버킷리스트 ${linkNo}번에 연결했어요`)
        } else {
          showToast('일상을 올렸어요')
        }
        setState({
          uploadSaving: false, bucketLinkNo: null, bucketMediaId: created.id,
          uploadAssets: undefined, uploadCaption: undefined, uploadTakenFrom: null, uploadTakenTo: null, uploadPlace: undefined,
          uploadDone: 0, uploadTotal: 0,
        })
        back()
      } catch (e) {
        // 고른 사진은 남겨둔다 — 돌아가서 다시 누르면 이어서 올릴 수 있게
        setState({ uploadSaving: false, uploadDone: 0, uploadTotal: 0 })
        showToast('올리지 못했어요. 다시 시도해주세요')
        back()
      }
      return
    }

    // 새 글: 작업만 넣고 바로 목록으로. 업로드는 기다리지 않는다.
    if (!editId) {
      const job = {
        id: `up-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        groupId, assets, caption, extra,
        status: 'uploading', done: 0, total: assets.length, error: null,
      }
      setState((p) => ({
        uploadJobs: [job, ...(p.uploadJobs || [])],
        uploadAssets: undefined, uploadCaption: undefined, uploadTakenFrom: null, uploadTakenTo: null, uploadPlace: undefined, uploadError: null,
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
      // 수정은 늘 '남길 기존 사진' 을 함께 보낸다 — 그래야 새로 고른 사진이
      // 기존 것을 밀어내지 않고 뒤에 붙는다. (예전엔 uploadIds 만 보내 통째로 교체됐다)
      const keepUrls = (ref.current.editMediaItems || []).map((it) => it.url)
      // 날짜·장소는 늘 보낸다 — 뺐으면 null 로 보내야 서버에서도 빠진다
      const updated = await api.updateMedia(editId, uploadIds, caption, keepUrls, extra)
      await loadMedia(groupId)
      setState({
        uploadSaving: false, editMediaId: null, editMediaItems: undefined, editItemsTrimmed: false,
        uploadAssets: undefined, uploadCaption: undefined, uploadTakenFrom: null, uploadTakenTo: null, uploadPlace: undefined, uploadError: null,
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
      uploadAssets: undefined, uploadCaption: undefined, uploadTakenFrom: null, uploadTakenTo: null, uploadPlace: undefined, uploadError: null,
      ...PLACE_SEARCH_CLOSED,
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
      uploadTakenFrom: m.takenFrom || null, uploadTakenTo: m.takenTo || null, uploadPlace: m.place || undefined,
      ...PLACE_SEARCH_CLOSED,
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
    removeUploadItem, reorderUploadAsset,
    addMediaDate, removeMediaDate, toggleMediaRange, setMediaDatePart,
    openPlaceSearch, closePlaceSearch, onPlaceQuery, pickPlace, removePlace,
    retryUploadJob, discardUploadJob,
    loadComments, onCommentDraft, startReply, startEditComment, cancelCommentMode, submitComment, removeComment,
  }
}
