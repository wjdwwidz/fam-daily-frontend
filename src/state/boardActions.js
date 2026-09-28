import { api } from '../lib/api.js'
import { runOnce } from './runOnce.js'

// 서버와 같은 한도
const MAX_POST = 2000
const MAX_POST_COMMENT = 300

// 가족 게시판 — 글 목록·글 하나(댓글까지)·쓰기·고치기·지우기.
// 댓글 규칙은 일상 글과 같다 (답글 한 단계, 쓴 사람만 수정·삭제).
export function createBoardActions({ ref, setState, go, back, showToast, askConfirm }) {
  const gid = () => ref.current.currentGroup?.id

  const loadPosts = async (groupId = gid()) => {
    if (!groupId) return
    setState({ postsLoading: true })
    try {
      const rows = await api.posts(groupId)
      if (gid() !== groupId) return
      setState({ posts: rows || [], postsLoading: false })
    } catch {
      setState({ postsLoading: false })
    }
  }

  // 응답이 올 때 이미 다른 글을 보고 있으면 버린다
  const applyPost = (postId, res) => {
    if (ref.current.post?.id !== postId) return
    setState({ post: res, postError: null })
  }

  const openPost = async (postId) => {
    setState({ post: { id: postId }, postLoading: true, postError: null, ...COMMENT_IDLE })
    go('post')
    try {
      const res = await api.post(postId)
      if (ref.current.post?.id !== postId) return
      setState({ post: res, postLoading: false })
    } catch (e) {
      setState({ postLoading: false, postError: e.message })
    }
  }

  // ── 글 쓰기·고치기 시트 ───────────────────────────────────────────
  const openPostSheet = (post) =>
    setState({ postSheet: { id: post?.id || null, text: post?.text || '' }, postSheetError: null })
  const closePostSheet = () => setState({ postSheet: null, postSheetError: null })
  const onPostDraft = (text) =>
    setState((p) => ({ postSheet: { ...p.postSheet, text }, postSheetError: null }))

  const savePost = () => runOnce('savePost', async () => {
    const sheet = ref.current.postSheet
    const groupId = gid()
    if (!sheet || !groupId) return
    const text = (sheet.text || '').trim()
    if (!text) {
      setState({ postSheetError: '내용을 적어주세요.' })
      return
    }
    if (text.length > MAX_POST) {
      setState({ postSheetError: `글은 ${MAX_POST}자까지 쓸 수 있어요.` })
      return
    }
    setState({ postSaving: true, postSheetError: null })
    try {
      const saved = sheet.id
        ? await api.updatePost(sheet.id, text)
        : await api.createPost(groupId, text)
      await loadPosts(groupId)
      // 보고 있던 글을 고쳤으면 그 화면도 새 내용으로
      if (ref.current.post?.id === saved.id) setState({ post: saved })
      setState({ postSaving: false, postSheet: null })
      showToast(sheet.id ? '글을 고쳤어요' : '글을 올렸어요')
    } catch (e) {
      setState({ postSaving: false, postSheetError: e.message })
    }
  })

  const removePost = (postId) =>
    askConfirm({
      title: '이 글을 지울까요?',
      message: '댓글도 함께 사라져요.',
      yesText: '지우기',
      onYes: async () => {
        try {
          await api.deletePost(postId)
          await loadPosts()
          // 그 글을 보고 있었으면 목록으로 돌아간다
          if (ref.current.post?.id === postId) {
            setState({ post: null })
            back()
          }
          showToast('글을 지웠어요')
        } catch (e) {
          showToast(e.message)
        }
      },
    })

  // ── 댓글 ─────────────────────────────────────────────────────────
  const onPostCommentDraft = (text) =>
    setState({ postCommentDraft: text, postCommentError: null })
  // 답글은 최상위 댓글에만 붙는다 — 답글에 답해도 서버가 같은 댓글 아래로 모은다
  const startPostReply = (c) =>
    setState({ postReplyTo: { id: c.id, name: c.by.name }, postCommentEditingId: null, postCommentError: null })
  const startEditPostComment = (c) =>
    setState({ postCommentEditingId: c.id, postCommentDraft: c.text, postReplyTo: null, postCommentError: null })
  const cancelPostCommentMode = () => setState(COMMENT_IDLE)

  const submitPostComment = () => runOnce('submitPostComment', async () => {
    const cur = ref.current
    const postId = cur.post?.id
    const text = (cur.postCommentDraft || '').trim()
    if (!postId || cur.postCommentSaving) return
    if (!text) {
      setState({ postCommentError: '댓글 내용을 입력해주세요.' })
      return
    }
    if (text.length > MAX_POST_COMMENT) {
      setState({ postCommentError: `댓글은 ${MAX_POST_COMMENT}자까지 쓸 수 있어요.` })
      return
    }
    setState({ postCommentSaving: true, postCommentError: null })
    try {
      const res = cur.postCommentEditingId
        ? await api.editPostComment(cur.postCommentEditingId, text)
        : await api.addPostComment(postId, text, cur.postReplyTo?.id)
      applyPost(postId, { ...cur.post, comments: res.comments, commentCount: res.count })
      setState({ postCommentSaving: false, ...COMMENT_IDLE })
      // 목록의 댓글 수도 맞춰 둔다 (돌아갔을 때 다시 안 부르게)
      setState((p) => ({
        posts: (p.posts || []).map((x) => (x.id === postId ? { ...x, commentCount: res.count } : x)),
      }))
    } catch (e) {
      setState({ postCommentSaving: false, postCommentError: e.message })
    }
  })

  const removePostComment = (commentId) =>
    askConfirm({
      title: '이 댓글을 지울까요?',
      yesText: '지우기',
      onYes: async () => {
        const postId = ref.current.post?.id
        if (!postId) return
        try {
          const res = await api.deletePostComment(commentId)
          applyPost(postId, { ...ref.current.post, comments: res.comments, commentCount: res.count })
          if (ref.current.postCommentEditingId === commentId) cancelPostCommentMode()
          setState((p) => ({
            posts: (p.posts || []).map((x) => (x.id === postId ? { ...x, commentCount: res.count } : x)),
          }))
          showToast('댓글을 지웠어요')
        } catch (e) {
          showToast(e.message)
        }
      },
    })

  return {
    loadPosts, openPost,
    openPostSheet, closePostSheet, onPostDraft, savePost, removePost,
    onPostCommentDraft, startPostReply, startEditPostComment, cancelPostCommentMode,
    submitPostComment, removePostComment,
  }
}

// 댓글 입력칸이 아무 것도 하고 있지 않은 상태
const COMMENT_IDLE = {
  postCommentDraft: '',
  postReplyTo: null,
  postCommentEditingId: null,
  postCommentError: null,
}
