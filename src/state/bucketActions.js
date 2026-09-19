import { api } from '../lib/api.js'

// 가족 버킷리스트 — 1~100 칸을 골라 채우고, 달성하면 일상 글과 이어붙인다.
export function createBucketActions({ st, setState, ref, go, back, showToast }) {
  const gid = () => ref.current.currentGroup?.id

  const loadBucket = async () => {
    const id = gid()
    if (!id) return
    setState({ bucketLoading: true })
    try {
      const r = await api.bucket(id)
      setState({ bucket: r, bucketLoading: false })
    } catch {
      setState({ bucket: { size: 100, doneCount: 0, items: [] }, bucketLoading: false })
    }
  }

  // 칸 열기 — 채워진 칸이면 그 내용으로, 빈 칸이면 빈 상태로 편집 화면을 연다
  const openBucket = (no) => {
    const found = (ref.current.bucket?.items || []).find((i) => i.no === no)
    setState({
      bucketNo: no,
      bucketDraft: found?.text ?? '',
      bucketDone: !!found?.done,
      bucketMediaId: found?.mediaId ?? null,
      bucketError: null,
      bucketPicking: false,
    })
    go('bucketitem')
  }

  // 이 칸에 붙일 일상을 새로 쓰러 간다. 올리기가 끝나면 이 칸으로 돌아온다.
  const startBucketMedia = () => {
    const cur = ref.current
    setState({
      bucketLinkNo: cur.bucketNo,
      editMediaId: null, editMediaItems: undefined, editItemsTrimmed: false,
      uploadError: null,
      // 앞서 올리다 실패해 남겨둔 사진이 있으면 그대로 이어서 쓴다
      ...(cur.bucketLinkNo === cur.bucketNo ? {} : { uploadAssets: undefined, uploadCaption: undefined }),
    })
    go('upload')
  }
  // 올리기 화면에서 예약만 푼다 (평범한 일상 글로 올리고 싶을 때)
  const cancelBucketLink = () => setState({ bucketLinkNo: null })

  const onBucketDraft = (v) => setState({ bucketDraft: v, bucketError: null })
  const toggleBucketDone = () => setState((p) => ({ bucketDone: !p.bucketDone }))
  const openBucketPicker = () => setState({ bucketPicking: true })
  const closeBucketPicker = () => setState({ bucketPicking: false })
  const pickBucketMedia = (mediaId) =>
    setState({ bucketMediaId: mediaId, bucketPicking: false })
  const unlinkBucketMedia = () => setState({ bucketMediaId: null })

  const saveBucket = async () => {
    const cur = ref.current
    const id = gid()
    const text = (cur.bucketDraft || '').trim()
    if (!text) {
      setState({ bucketError: '내용을 적어주세요.' })
      return
    }
    setState({ bucketSaving: true, bucketError: null })
    try {
      await api.saveBucket(id, cur.bucketNo, {
        text,
        done: !!cur.bucketDone,
        mediaId: cur.bucketMediaId ?? null,
      })
      await loadBucket()
      setState({ bucketSaving: false })
      back()
    } catch (e) {
      setState({ bucketSaving: false, bucketError: e.message })
    }
  }

  // 우선순위 조정 — 고른 번호로 옮기고 목록을 새로 받는다
  const moveBucketTo = async (to) => {
    const cur = ref.current
    if (!to || to === cur.bucketNo) return
    setState({ bucketSaving: true, bucketError: null })
    try {
      await api.moveBucket(gid(), cur.bucketNo, to)
      await loadBucket()
      setState({ bucketSaving: false, bucketNo: to })
      showToast(`${to}번으로 옮겼어요`)
    } catch (e) {
      setState({ bucketSaving: false, bucketError: e.message })
    }
  }

  const clearBucket = async () => {
    const id = gid()
    setState({ bucketSaving: true, bucketError: null })
    try {
      await api.clearBucket(id, ref.current.bucketNo)
      await loadBucket()
      setState({ bucketSaving: false })
      showToast('칸을 비웠어요')
      back()
    } catch (e) {
      setState({ bucketSaving: false, bucketError: e.message })
    }
  }

  return {
    loadBucket, openBucket, onBucketDraft, toggleBucketDone,
    openBucketPicker, closeBucketPicker, pickBucketMedia, unlinkBucketMedia,
    saveBucket, clearBucket, moveBucketTo, startBucketMedia, cancelBucketLink,
  }
}
