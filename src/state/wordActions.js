import { api } from '../lib/api.js'
import * as ImagePicker from 'expo-image-picker'

// 가족 사전(단어) 액션: 로드/추가/수정/삭제 + 편집 폼 입력.
export function createWordActions({ ref, setState, navTo, go }) {
  // 현재 그룹의 단어 불러오기
  const loadWords = async (groupId) => {
    if (!groupId) return
    setState({ wordsLoading: true })
    try {
      const list = await api.listWords(groupId)
      setState({ groupWords: list, wordsLoading: false })
    } catch {
      setState({ groupWords: [], wordsLoading: false })
    }
  }

  const startEditWord = () => {
    const w = ref.current.word || {}
    // 기존 사진(photoUrl)을 편집 폼의 photo(문자열 URL)로 넣어 미리보기·재저장 되게
    setState({ menuOpen: null, editPost: 'word', wordDraft: { ...w, photo: w.photoUrl || null } })
  }
  const startAddWord = () =>
    navTo({ screen: 'word', menuOpen: null, editPost: 'word', word: { by: { ini: '엄', c: '#FF5E8A' } }, wordDraft: { term: '', reading: '', meaning: '', example: '' } })

  const onWordTerm = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, term: text } }))
  const onWordReading = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, reading: text } }))
  const onWordMeaning = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, meaning: text } }))
  const onWordExample = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, example: text } }))
  const removeWordPhoto = () => setState((s2) => ({ wordDraft: { ...s2.wordDraft, photo: null } }))

  // 기기 사진 선택 → 즉시 미리보기 → 서버(Supabase)로 업로드 → URL 을 wordDraft.photo 에 저장
  const pickWordPhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (perm.status !== 'granted') return
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
      })
      if (result.canceled || !result.assets || !result.assets[0]) return
      const asset = result.assets[0]
      // 1) 로컬 URI 로 즉시 미리보기 + 업로드 중 표시
      setState((s2) => ({ wordDraft: { ...s2.wordDraft, photo: asset.uri }, photoUploading: true, photoError: null }))
      try {
        // 2) 서버 업로드 → public URL 로 교체 (저장 시 이 URL 이 photoUrl 로 전송됨)
        const url = await api.uploadImage(asset, 'words')
        setState((s2) => ({ wordDraft: { ...s2.wordDraft, photo: url }, photoUploading: false }))
      } catch (e) {
        setState({ photoUploading: false, photoError: e.message })
      }
    } catch {}
  }

  const saveWord = async () => {
    const draft = ref.current.wordDraft || {}
    const term = (draft.term || '').trim()
    const meaning = (draft.meaning || '').trim()
    if (!term || !meaning) return // 단어·뜻 필수
    const groupId = ref.current.currentGroup?.id
    const editingId = ref.current.word && ref.current.word.id
    const body = {
      term,
      reading: (draft.reading || '').trim(),
      meaning,
      example: (draft.example || '').trim(),
      photoUrl: draft.photo || undefined,
    }
    setState({ actionLoading: true })
    try {
      if (editingId) await api.updateWord(editingId, body)
      else await api.createWord(groupId, body)
      await loadWords(groupId)
      setState({ actionLoading: false, editPost: null, word: null, wordDraft: {}, screen: 'dict' })
    } catch (e) {
      setState({ actionLoading: false, authError: e.message })
    }
  }

  const deleteWord = async () => {
    const id = ref.current.word?.id
    const groupId = ref.current.currentGroup?.id
    setState({ menuOpen: null })
    if (id) {
      try {
        await api.deleteWord(id)
        await loadWords(groupId)
      } catch {}
    }
    go('dict')
  }

  return {
    loadWords,
    startEditWord,
    startAddWord,
    onWordTerm,
    onWordReading,
    onWordMeaning,
    onWordExample,
    removeWordPhoto,
    pickWordPhoto,
    saveWord,
    deleteWord,
  }
}
