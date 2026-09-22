import { api } from '../lib/api.js'
import { todayYmd, withDatePart } from '../lib/date.js'

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
      // 이룬 날 — 없으면 오늘로 채워둔다 (체크하는 순간 바로 쓸 수 있게)
      bucketDoneAt: found?.doneAt ? String(found.doneAt).slice(0, 10) : todayYmd(),
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
      uploadError: null, placeSearchOpen: false,
      // 앞서 올리다 실패해 남겨둔 사진이 있으면 그대로 이어서 쓴다
      ...(cur.bucketLinkNo === cur.bucketNo ? {} : { uploadAssets: undefined, uploadCaption: undefined, uploadTakenFrom: null, uploadTakenTo: null, uploadPlace: undefined }),
    })
    go('upload')
  }
  // 올리기 화면에서 예약만 푼다 (평범한 일상 글로 올리고 싶을 때)
  const cancelBucketLink = () => setState({ bucketLinkNo: null })

  // 목록에서 바로 달성 체크. 세부 페이지에 들어가지 않아도 되게.
  // 화면을 먼저 바꾸고 서버에 보낸다 — 누르자마자 반응해야 답답하지 않다.
  const toggleBucketRow = async (no) => {
    const id = gid()
    const cur = ref.current
    const item = (cur.bucket?.items || []).find((i) => i.no === no)
    if (!id || !item) return // 빈 칸은 내용이 없어 체크할 수 없다
    const next = !item.done
    setState((p) => ({
      bucket: {
        ...p.bucket,
        doneCount: (p.bucket?.doneCount || 0) + (next ? 1 : -1),
        items: (p.bucket?.items || []).map((i) =>
          i.no === no ? { ...i, done: next, doneAt: next ? new Date().toISOString() : null } : i,
        ),
      },
    }))
    try {
      await api.saveBucket(id, no, { text: item.text, done: next })
      await loadBucket()
    } catch (e) {
      await loadBucket() // 실패하면 서버 상태로 되돌린다
      showToast('바꾸지 못했어요. 다시 시도해주세요')
    }
  }

  const onBucketDraft = (v) => setState({ bucketDraft: v, bucketError: null })
  // 년·월·일을 따로 고른다 (말일·미래 날짜는 lib/date.js 가 당긴다)
  const setBucketDatePart = (part, value) =>
    setState({ bucketDoneAt: withDatePart(ref.current.bucketDoneAt, part, value) })
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
        ...(cur.bucketDone && cur.bucketDoneAt ? { doneAt: cur.bucketDoneAt } : {}),
        mediaId: cur.bucketMediaId ?? null,
      })
      await loadBucket()
      setState({ bucketSaving: false })
      back()
    } catch (e) {
      setState({ bucketSaving: false, bucketError: e.message })
    }
  }

  // 우선순위 조정 — 목록에서 끌어다 놓은 번호로 옮긴다. 사이 칸들은 한 칸씩 밀린다.
  // 서버와 같은 규칙으로 화면을 먼저 바꿔두고(놓자마자 제자리에 있게), 끝나면 새로 받는다.
  const reorderBucket = async (from, to) => {
    const id = gid()
    if (!id || !from || !to || from === to) return
    const shift = (no) => {
      if (no === from) return to
      if (from < to && no > from && no <= to) return no - 1
      if (from > to && no >= to && no < from) return no + 1
      return no
    }
    setState((p) => ({
      bucket: { ...p.bucket, items: (p.bucket?.items || []).map((i) => ({ ...i, no: shift(i.no) })) },
    }))
    try {
      await api.moveBucket(id, from, to)
    } catch {
      showToast('옮기지 못했어요. 다시 시도해주세요')
    }
    await loadBucket() // 성공이면 확인, 실패면 서버 상태로 되돌린다
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
    saveBucket, clearBucket, reorderBucket, startBucketMedia, cancelBucketLink,
    setBucketDatePart, toggleBucketRow,
  }
}
