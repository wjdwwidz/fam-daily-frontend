import { api } from '../lib/api.js'

// 가족 문답 액션: 로드 + 답변/질문 등록.
export function createQnaActions({ ref, setState }) {
  // 현재 그룹의 문답(오늘의 질문 + 지난 질문 목록) 불러오기
  const loadQna = async (groupId) => {
    if (!groupId) return
    setState({ qnaLoading: true })
    try {
      const [current, list] = await Promise.all([api.currentQuestion(groupId), api.listQuestions(groupId)])
      setState({ qnaCurrent: current, qnaList: list, qnaLoading: false })
    } catch {
      setState({ qnaCurrent: null, qnaList: null, qnaLoading: false })
    }
  }

  const submitAnswer = async () => {
    const text = (ref.current.answerDraft || '').trim()
    const editingId = ref.current.editingAnswerId
    const qid = ref.current.qnaCurrent?.question?.id
    if (!text || (!editingId && !qid)) { setState({ answerOpen: false, editingAnswerId: null }); return }
    setState({ actionLoading: true })
    try {
      if (editingId) await api.editAnswer(editingId, text) // 수정
      else await api.answerQuestion(qid, text) // 새 답변
      await loadQna(ref.current.currentGroup?.id)
      setState({ actionLoading: false, answerOpen: false, answerDraft: '', editingAnswerId: null })
    } catch (e) {
      setState({ actionLoading: false, answerOpen: false, editingAnswerId: null, authError: e.message })
    }
  }

  const submitQuestion = async () => {
    const text = (ref.current.questionDraft || '').trim()
    const groupId = ref.current.currentGroup?.id
    if (!text || !groupId) { setState({ questionOpen: false }); return }
    setState({ actionLoading: true })
    try {
      await api.createQuestion(groupId, text)
      await loadQna(groupId)
      setState({ actionLoading: false, questionOpen: false, questionDraft: '' })
    } catch (e) {
      setState({ actionLoading: false, questionOpen: false, authError: e.message })
    }
  }

  return { loadQna, submitAnswer, submitQuestion }
}
