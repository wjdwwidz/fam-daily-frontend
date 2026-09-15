import { api } from '../lib/api.js'
import { prepareImage } from '../lib/image.js'
import { runOnce } from './runOnce.js'
import * as ImagePicker from 'expo-image-picker'

// 한 단어에 넣을 수 있는 최대 사진 수 (서버의 MAX_WORD_PHOTOS 와 같은 값).
export const MAX_WORD_PHOTOS = 10

// 편집 폼의 사진 한 장: { key, uri(미리보기), url(업로드 끝난 주소), uploading }
let photoSeq = 0
const nextKey = () => `wp${++photoSeq}`
const toPhotoItems = (urls) => (urls || []).map((url) => ({ key: nextKey(), uri: url, url, uploading: false }))

// 가족 사전(단어) 액션: 로드/추가/수정/삭제 + 편집 폼 입력.
export function createWordActions({ ref, setState, navTo, go, showToast }) {
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
    // 기존 사진들을 편집 폼의 photos 로 넣어 미리보기·재저장 되게
    const urls = w.photoUrls?.length ? w.photoUrls : (w.photoUrl ? [w.photoUrl] : [])
    setState({ menuOpen: null, editPost: 'word', wordError: null, photoError: null, wordDraft: { ...w, photos: toPhotoItems(urls) } })
  }
  const startAddWord = () =>
    navTo({ screen: 'word', menuOpen: null, editPost: 'word', wordError: null, photoError: null, word: { by: { ini: '엄', c: '#FF5E8A' } }, wordDraft: { term: '', reading: '', meaning: '', example: '', photos: [] } })

  const onWordTerm = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, term: text } }))
  const onWordReading = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, reading: text } }))
  const onWordMeaning = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, meaning: text } }))
  const onWordExample = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, example: text } }))

  const updatePhotos = (fn) =>
    setState((s2) => ({ wordDraft: { ...s2.wordDraft, photos: fn(s2.wordDraft.photos || []) } }))
  const removeWordPhoto = (key) => updatePhotos((photos) => photos.filter((p) => p.key !== key))

  // 기기 사진 선택(남은 장수만큼) → 즉시 미리보기 → 한 장씩 서버(Supabase)로 업로드 → url 채움
  const pickWordPhoto = async () => {
    try {
      const remain = MAX_WORD_PHOTOS - (ref.current.wordDraft?.photos || []).length
      if (remain <= 0) return
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (perm.status !== 'granted') return
      const result = await ImagePicker.launchImageLibraryAsync({
        // 배열 형태가 현재 API. MediaTypeOptions 는 deprecated.
        mediaTypes: ['images'],
        // 한 장만 남았으면 단일 선택으로 연다. 다중 선택 모드는 탭하면 체크만 되고
        // 확정 버튼을 따로 눌러야 해서, 한 장 고를 때는 불편하다.
        allowsMultipleSelection: remain > 1,
        selectionLimit: remain,
        // 압축은 올릴 때 prepareImage 가 한 번만 한다
        quality: 1,
      })
      if (result.canceled || !result.assets || !result.assets.length) return
      const added = result.assets.slice(0, remain).map((asset) => ({ key: nextKey(), uri: asset.uri, url: null, uploading: true, asset }))
      // 1) 로컬 URI 로 즉시 미리보기 + 업로드 중 표시
      updatePhotos((photos) => [...photos, ...added.map(({ asset, ...p }) => p)])
      setState({ photoError: null })
      // 2) 한 장씩 업로드 → public URL 로 교체 (저장 시 이 URL 들이 photoUrls 로 전송됨)
      for (const item of added) {
        try {
          // 줄이고 JPEG 로 바꿔서 올린다 (미리보기는 고른 원본 그대로)
          const url = await api.uploadImage(await prepareImage(item.asset), 'words')
          updatePhotos((photos) => photos.map((p) => (p.key === item.key ? { ...p, url, uploading: false } : p)))
        } catch (e) {
          updatePhotos((photos) => photos.filter((p) => p.key !== item.key))
          setState({ photoError: e.message })
        }
      }
    } catch {}
  }

  // 저장 버튼을 여러 번 눌러도 한 번만 저장한다 (예전엔 단어가 몇 개씩 등록됐다)
  const saveWord = () => runOnce('saveWord', async () => {
    const draft = ref.current.wordDraft || {}
    const term = (draft.term || '').trim()
    const meaning = (draft.meaning || '').trim()
    // 단어·뜻 필수 — 그냥 return 하면 버튼이 먹통인 것처럼 보이므로 이유를 알린다
    if (!term || !meaning) {
      setState({ wordError: '단어와 뜻을 입력해주세요.' })
      return
    }
    const photos = draft.photos || []
    // 올리는 중에 저장하면 그 사진이 빠진 채로 저장된다
    if (photos.some((p) => p.uploading)) {
      setState({ wordError: '사진을 올리는 중이에요. 잠시 후 저장해주세요.' })
      return
    }
    const groupId = ref.current.currentGroup?.id
    const editingId = ref.current.word && ref.current.word.id
    const body = {
      term,
      reading: (draft.reading || '').trim(),
      meaning,
      example: (draft.example || '').trim(),
      // 빈 배열이면 사진 전부 삭제
      photoUrls: photos.map((p) => p.url).filter(Boolean),
    }
    setState({ actionLoading: true, wordError: null })
    try {
      const saved = editingId ? await api.updateWord(editingId, body) : await api.createWord(groupId, body)
      await loadWords(groupId) // 목록 갱신 → 상세보기가 최신 내용으로 다시 그려진다
      // 저장 후엔 목록이 아니라 방금 쓴 글의 상세보기로 돌아간다
      setState({ actionLoading: false, wordError: null, editPost: null, wordDraft: {}, screen: 'word', word: saved })
      showToast('저장되었습니다')
    } catch (e) {
      // 예전엔 authError 로 넣어서 사전 화면에 아무것도 안 떴다 → 저장 실패가 조용히 묻힘
      setState({ actionLoading: false, wordError: e.message })
    }
  })

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
    // 삭제한 단어로 되돌아갈 일은 없으니 히스토리 없이 사전 목록으로
    setState({ screen: 'record', recordTab: 'dict' })
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
