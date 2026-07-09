import { useEffect, useRef, useState } from 'react'
import { View, ScrollView } from 'react-native'
import { s } from './lib/style.js'
import { Flower6 } from './components/Flower.jsx'
import Nav from './components/Nav.jsx'
import Login from './screens/Login.jsx'
import SpaceSelect from './screens/SpaceSelect.jsx'
import Signup from './screens/Signup.jsx'
import Space from './screens/Space.jsx'
import CreateSpace from './screens/CreateSpace.jsx'
import JoinSpace from './screens/JoinSpace.jsx'
import Home from './screens/Home.jsx'
import Dict from './screens/Dict.jsx'
import Word from './screens/Word.jsx'
import Gallery from './screens/Gallery.jsx'
import Media from './screens/Media.jsx'
import MoodHistory from './screens/MoodHistory.jsx'
import QnaHistory from './screens/QnaHistory.jsx'
import Qna from './screens/Qna.jsx'
import Upload from './screens/Upload.jsx'
import Members from './screens/Members.jsx'
import Profile from './screens/Profile.jsx'
import LinkSheet from './overlays/LinkSheet.jsx'
import AnswerSheet from './overlays/AnswerSheet.jsx'
import AddEventSheet from './overlays/AddEventSheet.jsx'
import InviteSheet from './overlays/InviteSheet.jsx'
import SearchOverlay from './overlays/SearchOverlay.jsx'

export default function FamilyPhonePop({ variant = 'grid', initialScreen = 'login' }) {
  const [st, setRaw] = useState({ screen: undefined, uploadType: 'photo' })
  const ref = useRef(st)
  ref.current = st
  const setState = (patch) => setRaw((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))
  const go = (sc) => setState({ screen: sc })

  useEffect(() => {
    const t = setInterval(() => setState((s2) => ({ activeMood: (s2.activeMood ?? 0) + 1 })), 2600)
    return () => clearInterval(t)
  }, [])

  const sendMood = () => {
    const t = (st.myMood || '').trim()
    if (!t) return
    setState({ myMoodSent: true })
  }

  const seedComments = () => ({
    '도윤이 첫 걸음마': [
      { name: '도윤', ini: '도', c: '#22C4A6', text: '우와 나 잘 걷는다!!', when: '3일 전' },
      { name: '할머니', ini: '할', c: '#A66CFF', text: '아이고 우리 강아지 다 컸네 🥰', when: '2일 전' },
    ],
  })
  const commentsFor = (key) => (st.commentsByKey || seedComments())[key] || []
  const addComment = () => {
    const key = st.media ? st.media.title : null
    const text = (st.commentDraft || '').trim()
    if (!key || !text) return
    const map = { ...(st.commentsByKey || seedComments()) }
    map[key] = [...(map[key] || []), { name: '엄마', ini: '엄', c: '#FF5E8A', text, when: '방금' }]
    setState({ commentsByKey: map, commentDraft: '' })
  }
  const onCommentInput = (text) => setState({ commentDraft: text })
  const onCommentKey = () => addComment()

  const toggleMenu = (which) => setState((s2) => ({ menuOpen: s2.menuOpen === which ? null : which }))

  const startEditWord = () => { const w = st.word || words[0]; setState({ menuOpen: null, editPost: 'word', wordDraft: { ...w } }) }
  const startAddWord = () => setState({ screen: 'word', menuOpen: null, editPost: 'word', word: { by: { ini: '엄', c: '#FF5E8A' } }, wordDraft: { term: '', reading: '', meaning: '', example: '' } })
  const onWordTerm = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, term: text } }))
  const onWordReading = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, reading: text } }))
  const onWordMeaning = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, meaning: text } }))
  const onWordExample = (text) => setState((s2) => ({ wordDraft: { ...s2.wordDraft, example: text } }))
  const removeWordPhoto = () => setState((s2) => ({ wordDraft: { ...s2.wordDraft, photo: null } }))
  const saveWord = () => setState((s2) => ({ word: { ...(s2.word || {}), ...s2.wordDraft }, editPost: null }))
  const deleteWord = () => setState({ menuOpen: null, screen: 'dict' })

  const startEditMedia = () => { const m = st.media || media[0]; setState({ menuOpen: null, editPost: 'media', mediaDraft: { ...m } }) }
  const onMediaTitle = (text) => setState((s2) => ({ mediaDraft: { ...s2.mediaDraft, title: text } }))
  const saveMedia = () => setState((s2) => ({ media: { ...(s2.media || {}), ...s2.mediaDraft }, editPost: null }))
  const deleteMedia = () => setState({ menuOpen: null, screen: 'gallery' })
  const cancelEdit = () => setState({ editPost: null })

  const startEditCmt = (i, text) => setState({ editCmt: i, editCmtDraft: text })
  const onEditCmtInput = (text) => setState({ editCmtDraft: text })
  const saveCmt = (i) => {
    const key = (st.media || media[0] || {}).title
    const text = (st.editCmtDraft || '').trim()
    if (!key || !text) { setState({ editCmt: null }); return }
    const map = { ...(st.commentsByKey || seedComments()) }
    const list = [...(map[key] || [])]
    if (list[i]) list[i] = { ...list[i], text }
    map[key] = list
    setState({ commentsByKey: map, editCmt: null, editCmtDraft: '' })
  }
  const onEditCmtKey = () => saveCmt(st.editCmt)

  const v = variant === 'grid' ? 'grid' : 'cards'
  const scr = st.screen || initialScreen || 'login'

  const M = {
    mom: { name: '엄마', role: '김서연 · 관리자', ini: '엄', c: '#FF5E8A', admin: true, me: true, mood: '오늘 저녁은 김치찌개! 🍲', emoji: '😊' },
    dad: { name: '아빠', role: '이준호', ini: '아', c: '#4D7CFE', admin: false, mood: '퇴근하고 바로 갈게~', emoji: '🚗' },
    ji: { name: '지우', role: '딸 · 7살', ini: '지', c: '#FF9F43', admin: false, mood: '오늘 피아노 100점 받았어!', emoji: '🎹' },
    do: { name: '도윤', role: '아들 · 3살', ini: '도', c: '#22C4A6', admin: false, mood: '까까 먹고 싶어용', emoji: '🍪' },
    gm: { name: '할머니', role: '박옥분', ini: '할', c: '#A66CFF', admin: false, mood: '다들 밥은 챙겨 먹었니', emoji: '💗' },
  }
  if (st.myMoodSent && (st.myMood || '').trim()) M.mom = { ...M.mom, mood: st.myMood.trim(), emoji: '' }
  const members = [M.mom, M.dad, M.ji, M.do, M.gm]
  members.forEach((m, i) => { m.slotId = 'prof-' + i })

  const N = members.length, BOX = 296, C = BOX / 2, R = 114, AV = 60
  const active = (((st.activeMood ?? 0) % N) + N) % N
  const ringMembers = members.map((m, i) => {
    const ang = -Math.PI / 2 + (i * 2 * Math.PI) / N
    const cx = C + R * Math.cos(ang), cy = C + R * Math.sin(ang)
    const isA = i === active
    return {
      ...m,
      wrapStyle: `position:absolute;left:${cx - AV / 2}px;top:${cy - AV / 2}px;width:${AV}px;height:${AV}px;border-radius:50%;border:3px solid ${m.c};overflow:hidden;background:${m.c};box-shadow:0 6px 15px rgba(255,94,138,0.22);transform:scale(${isA ? 1.18 : 0.97});z-index:${isA ? 6 : 2}`,
      badgeStyle: m.me
        ? `position:absolute;left:${cx + AV / 2 - 21}px;top:${cy + AV / 2 - 21}px;width:22px;height:22px;border-radius:50%;background:#FF5E8A;border:2px solid #fff;align-items:center;justify-content:center;z-index:${isA ? 7 : 3};box-shadow:0 2px 6px rgba(255,94,138,0.4)`
        : `display:none`,
      badgeClick: m.me ? () => go('profile') : undefined,
      labelStyle: `position:absolute;left:${cx - 40}px;top:${cy + AV / 2 + 3}px;width:80px;text-align:center;font-size:10.5px;font-weight:700;color:${isA ? m.c : '#A9B4BD'};z-index:2`,
    }
  })
  const activeMember = members[active]
  const tailStyle = `position:absolute;left:${C}px;top:${C}px;width:0;height:0;transform:rotate(${-90 + (active * 360) / N}deg);z-index:3`
  const dotStyle = `position:absolute;left:0;top:-7px;width:14px;height:14px;border-radius:50%;transform:translateX(60px);background:${activeMember.c};box-shadow:0 2px 6px rgba(255,94,138,0.3)`

  const wbase = [
    { term: '응아', reading: '응아응아', meaning: '화장실 가고 싶다는 도윤이 신호', example: '"엄마 응아!" 하면 만사 제쳐두고 화장실로 직행해요 🚽', by: M.mom, date: '7월 5일', photo: true, ph: '도윤이 사진', hearts: 4, tint: '#FFF0F5' },
    { term: '빠방', reading: '빠방!', meaning: '자동차, 특히 아빠 차를 부르는 말', example: '주차장만 가면 "빠방 빠방" 노래를 부른답니다 🚗', by: M.dad, date: '7월 3일', photo: true, ph: '아빠 차 앞에서', hearts: 3, tint: '#FFF0F5' },
    { term: '까까', reading: '까까!', meaning: '과자나 간식을 달라는 말', example: '간식 시간마다 "까까 까까" 손을 내밀어요 🍪', by: M.ji, date: '6월 15일', photo: false, ph: '', hearts: 6, tint: '#FFF0F5' },
  ]
  const words = wbase.map((w) => ({ ...w, open: () => setState({ screen: 'word', word: w }) }))

  const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
  const BASE = { ㄲ: 'ㄱ', ㄸ: 'ㄷ', ㅃ: 'ㅂ', ㅆ: 'ㅅ', ㅉ: 'ㅈ' }
  const choOf = (str) => { const c = str.charCodeAt(0) - 0xac00; if (c < 0 || c > 11171) return str[0]; const ch = CHO[Math.floor(c / 588)]; return BASE[ch] || ch }
  const dictGroups = []
  const gIdx = {}
  ;[...words].sort((a, b) => a.term.localeCompare(b.term, 'ko')).forEach((w) => {
    const ch = choOf(w.term)
    if (gIdx[ch] == null) { gIdx[ch] = dictGroups.length; dictGroups.push({ cho: ch, items: [] }) }
    dictGroups[gIdx[ch]].items.push(w)
  })

  const gbase = [
    { title: '제주도 가족여행', date: '6월 15일', by: M.dad, type: 'photo', hearts: 12, tone: '#FFE0EC', ph: '제주 바다 사진' },
    { title: '도윤이 첫 걸음마', date: '6월 2일', by: M.mom, type: 'video', hearts: 18, tone: '#FFE0EC', ph: '첫 걸음마 영상' },
    { title: '지우 학예회', date: '5월 28일', by: M.mom, type: 'photo', hearts: 9, tone: '#FFE0EC', ph: '학예회 사진' },
    { title: '할머니 생신상', date: '5월 20일', by: M.dad, type: 'photo', hearts: 15, tone: '#FFE0EC', ph: '생신 사진' },
    { title: '눈사람 만들기', date: '2월 3일', by: M.ji, type: 'video', hearts: 11, tone: '#FFE0EC', ph: '눈사람 영상' },
    { title: '주말 나들이', date: '5월 11일', by: M.mom, type: 'photo', hearts: 7, tone: '#FFE0EC', ph: '공원 나들이' },
    { title: '김장하는 날', date: '작년 11월', by: M.gm, type: 'photo', hearts: 8, tone: '#FFE0EC', ph: '김장 사진' },
    { title: '도윤이 목욕', date: '4월 22일', by: M.mom, type: 'photo', hearts: 10, tone: '#FFE0EC', ph: '목욕 사진' },
    { title: '벚꽃 구경', date: '4월 5일', by: M.dad, type: 'photo', hearts: 14, tone: '#FFE0EC', ph: '벚꽃 사진' },
    { title: '도윤이 블록놀이', date: '4월 12일', by: M.do, type: 'photo', hearts: 9, tone: '#FFE0EC', ph: '블록놀이 사진' },
    { title: '도윤이 첫 낮잠', date: '3월 30일', by: M.do, type: 'video', hearts: 13, tone: '#FFE0EC', ph: '낮잠 영상' },
  ]
  const media = gbase.map((g) => ({ ...g, isVideo: g.type === 'video', open: () => setState({ screen: 'media', media: g, mediaLiked: false }) }))
  const gFilter = st.galleryFilter || 'all'
  const galleryMedia = gFilter === 'all' ? media : media.filter((m) => m.by && m.by.name === gFilter)
  const galleryTabs = [{ label: '전체', key: 'all', c: '#FF5E8A' }].concat(members.map((m) => ({ label: m.name, key: m.name, c: m.c }))).map((t) => {
    const sel = t.key === gFilter
    return { label: t.label, sel, bg: sel ? t.c : '#fff', color: sel ? '#fff' : '#6A7E88', border: sel ? t.c : '#FFE1EC', pick: () => setState({ galleryFilter: t.key }) }
  })
  const curMedia = st.media || media[0]
  const cmts = commentsFor(curMedia.title).map((c, i) => ({
    ...c,
    editing: st.editCmt === i,
    viewing: st.editCmt !== i,
    draft: st.editCmt === i ? (st.editCmtDraft || '') : c.text,
    edit: () => startEditCmt(i, c.text),
    save: () => saveCmt(i),
  }))

  const single = { 7: '#FF5E8A', 12: '#FF9F43', 18: '#A66CFF' }
  const ranges = [{ start: 25, end: 28, c: '#4D7CFE' }]
  const days = []
  for (let i = 0; i < 4; i++) days.push({ n: '', hasRange: false, rangeStyle: '', numBg: 'transparent', numColor: 'transparent', numWeight: 600, hasDot: false, dot: '' })
  for (let d = 1; d <= 31; d++) {
    const today = d === 7
    const rg = ranges.find((x) => d >= x.start && d <= x.end)
    let rangeStyle = ''
    if (rg) {
      const isStart = d === rg.start, isEnd = d === rg.end
      const lr = isStart ? '3px' : '0', rr = isEnd ? '3px' : '0'
      const li = isStart ? '9px' : '0', ri = isEnd ? '9px' : '0'
      rangeStyle = `position:absolute;bottom:6px;height:5px;left:${li};right:${ri};background:${rg.c};border-radius:${lr} ${rr} ${rr} ${lr};z-index:0`
    }
    days.push({ n: d, hasRange: !!rg, rangeStyle, numBg: today ? '#FF5E8A' : 'transparent', numColor: today ? '#ffffff' : '#3F4E58', numWeight: today ? 800 : 600, hasDot: !rg && !!single[d], dot: single[d] || '' })
  }
  const events = [
    { d: 7, label: '온 가족 저녁식사 🍚', sub: '오후 7시 · 우리집', tag: '오늘', c: '#FF5E8A' },
    { d: 12, label: '지우 피아노 콩쿠르', sub: '오전 10시 · 예술회관', tag: 'D-5', c: '#FF9F43' },
    { d: 18, label: '할머니 생신 🎂', sub: '점심 · 한정식집', tag: 'D-11', c: '#A66CFF' },
    { d: 25, label: '제주도 가족여행', sub: '7.25 – 7.28 · 3박 4일', tag: 'D-18', c: '#4D7CFE' },
  ]

  const todayQ = {
    day: 12, no: '1/100',
    q: '우리 가족 하면 가장 먼저 떠오르는 냄새는?',
    progress: '5명 중 3명이 답했어요',
    answered: [
      { by: M.mom, time: '오전 8:20', likes: 4, text: '갓 지은 쌀밥 냄새 🍚 아침마다 밥솥 열 때 그 냄새가 제일 좋아.' },
      { by: M.dad, time: '오전 9:05', likes: 2, text: '주말 아침에 원두 갈 때 나는 커피 향 ☕' },
      { by: M.ji, time: '오후 3:40', likes: 5, text: '엄마 화장품 냄새! 안으면 포근해 🥰' },
    ],
  }
  const pastQs = [
    { day: 11, q: '요즘 가장 고마운 가족은 누구야?', count: 5 },
    { day: 10, q: '다시 태어나도 우리 가족으로 만나고 싶어?', count: 4 },
    { day: 9, q: '우리 집 최고의 요리 하나만 꼽는다면?', count: 5 },
  ]
  const qBank = [
    '요즘 가장 고마운 가족은 누구야?', '다시 태어나도 우리 가족으로 만나고 싶어?', '우리 집 최고의 요리 하나만 꼽는다면?',
    '어릴 때 가장 기억에 남는 여행은?', '가족에게 아직 못 한 말이 있다면?', '요즘 가장 자주 듣는 노래는?',
    '오늘 하루 중 가장 웃었던 순간은?', '내가 생각하는 우리 가족의 장점은?', '함께 가보고 싶은 여행지가 있다면?',
    '스무 살의 나에게 한마디 한다면?', '요즘 가장 큰 고민은 뭐야?', '가족과 하고 싶은 새로운 취미가 있다면?',
    '엄마·아빠에게 배우고 싶은 것은?', '최근에 새로 도전해 본 일이 있어?', '우리 가족만의 규칙이 있다면?',
    '가장 좋아하는 계절과 그 이유는?', '어렸을 때 꿈은 무엇이었어?', '요즘 가장 행복한 순간은 언제야?',
    '가족과 함께 본 최고의 영화는?', '내 인생의 첫 기억은 무엇일까?', '지금 가장 갖고 싶은 것은?',
    '스트레스를 푸는 나만의 방법은?', '가족에게 가장 미안했던 일은?', '올해 꼭 이루고 싶은 목표는?',
    '내가 제일 아끼는 물건은 뭐야?', '가족과 다시 하고 싶은 추억이 있다면?', '요즘 빠져 있는 것은 무엇이야?',
    '가장 자신 있는 요리가 있다면?', '어떤 어른이 되고 싶었어?', '오늘 감사한 일 세 가지는?',
    '내가 닮고 싶은 가족은 누구야?', '최근에 가장 감동받은 순간은?', '휴일이 생기면 뭘 하고 싶어?',
    '어린 시절 우리 동네는 어땠어?', '가족에게 자주 하는 말버릇이 있어?', '내가 제일 좋아하는 우리 집 장소는?',
    '요즘 배우고 있는 것이 있다면?', '가장 든든한 순간은 언제야?', '지금 나에게 필요한 응원은?',
    '가족과 함께 웃었던 최근 일은?',
  ]
  const totalQ = 100
  const qnaHistory = []
  for (let i = totalQ; i >= 1; i--) qnaHistory.push({ no: i, q: qBank[(i - 1) % qBank.length], count: 3 + ((i * 7) % 3) })

  const joinGroups = [
    { name: '서연이네 가족', sub: '5명 · 엄마가 초대했어요', avatars: [{ i: '엄', c: '#FF5E8A' }, { i: '아', c: '#4D7CFE' }, { i: '도', c: '#22C4A6' }, { i: '지', c: '#FF9F43' }, { i: '할', c: '#A66CFF' }] },
    { name: '외갓집 대가족', sub: '8명 · 막내이모가 초대했어요', avatars: [{ i: '외', c: '#12B5F0' }, { i: '삼', c: '#FF7BA0' }, { i: '사', c: '#7BC86C' }, { i: '이', c: '#F5A623' }] },
    { name: '아빠쪽 사촌들', sub: '6명 · 큰아빠가 초대했어요', avatars: [{ i: '큰', c: '#9B7BFF' }, { i: '작', c: '#FF8A5B' }, { i: '형', c: '#39B5A8' }] },
  ]
  const sj = st.selectedJoin ?? 0
  const joinList = joinGroups.map((g, i) => ({
    name: g.name, sub: g.sub, sel: i === sj,
    cardStyle: `flex-direction:row;align-items:center;gap:12px;background:#fff;border:2px solid ${i === sj ? '#FF5E8A' : '#FFE1EC'};border-radius:20px;padding:15px 16px`,
    checkStyle: `width:24px;height:24px;border-radius:50%;align-items:center;justify-content:center;border:2px solid ${i === sj ? '#FF5E8A' : '#E3D2DA'};background:${i === sj ? '#FF5E8A' : 'transparent'};color:#fff`,
    avatars: g.avatars.map((a, j) => ({ i: a.i, style: `width:28px;height:28px;border-radius:50%;border:2px solid #fff;align-items:center;justify-content:center;color:#fff;font-size:10.5px;font-weight:700;background:${a.c};margin-left:${j === 0 ? '0' : '-8px'}` })),
    pick: () => setState({ selectedJoin: i }),
  }))

  const ut = st.uploadType
  const navC = (on) => (on ? '#FF5E8A' : '#A6B4BD')

  const CATS = [
    { label: '가족 모임', c: '#FF5E8A' },
    { label: '기념일', c: '#A66CFF' },
    { label: '학교·학원', c: '#FF9F43' },
    { label: '여행', c: '#4D7CFE' },
    { label: '병원', c: '#22C4A6' },
  ]
  const selColor = st.newEventColor || CATS[0].c
  const eventCats = CATS.map((k) => ({
    label: k.label, c: k.c, sel: k.c === selColor,
    swStyle: `width:46px;height:46px;border-radius:50%;background:${k.c};border:3px solid ${k.c === selColor ? '#17303B' : 'transparent'};box-shadow:0 3px 8px rgba(0,0,0,0.12);transform:scale(${k.c === selColor ? 1.08 : 1});align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:800`,
    labelStyle: `font-size:11px;margin-top:6px;font-weight:${k.c === selColor ? 700 : 500};color:${k.c === selColor ? '#17303B' : '#9DB2BD'}`,
    pick: () => setState({ newEventColor: k.c }),
  }))

  const vm = {
    isCards: v === 'cards', isGrid: v === 'grid',
    isLogin: scr === 'login', isHome: scr === 'home', isDict: scr === 'dict', isWord: scr === 'word',
    isGallery: scr === 'gallery', isMedia: scr === 'media', isUpload: scr === 'upload',
    isMembers: scr === 'members',
    isQna: scr === 'qna', isProfile: scr === 'profile',
    isSignup: scr === 'signup', isSpace: scr === 'space', isCreateSpace: scr === 'createSpace', isJoinSpace: scr === 'joinSpace',
    isSpaceSelect: scr === 'spaceSelect',
    mySpaces: joinGroups.map((g) => ({ ...g, pick: () => go('home') })),
    goSpaceSelect: () => go('spaceSelect'),
    isMoodHistory: scr === 'moodhistory', readMedia: st.editPost !== 'media',
    showNav: ['home', 'dict', 'gallery', 'members', 'qna'].indexOf(scr) !== -1,
    members, words, media, days, events, dictGroups,
    galleryMedia, galleryTabs, galleryEmpty: galleryMedia.length === 0,
    todayQ, pastQs, joinList,
    qnaHistory, qnaHistoryTotal: qnaHistory.length,
    isQnaHistory: scr === 'qnahistory',
    openQnaHistory: () => go('qnahistory'),
    ringMembers, activeMember, tailStyle, dotStyle,
    membersFromLink: !!st.membersFromLink,
    answerOpen: !!st.answerOpen,
    eventCats,
    addEventOpen: !!st.addEventOpen,
    openAddEvent: () => setState({ addEventOpen: true }),
    closeAddEvent: () => setState({ addEventOpen: false }),
    isRange: st.eventRange === true,
    isOneDay: st.eventRange !== true,
    setRange: () => setState({ eventRange: true }),
    setOneDay: () => setState({ eventRange: false }),
    oneDayBg: st.eventRange !== true ? '#fff' : 'transparent',
    oneDayColor: st.eventRange !== true ? '#FF5E8A' : '#B39AA4',
    rangeBg: st.eventRange === true ? '#fff' : 'transparent',
    rangeColor: st.eventRange === true ? '#FF5E8A' : '#B39AA4',
    goProfileEdit: () => go('profile'),
    myMood: st.myMood ?? '',
    myMoodSent: !!st.myMoodSent,
    sendBg: st.myMood && st.myMood.trim() ? '#FF5E8A' : '#F3C6D5',
    onMoodInput: (text) => setState({ myMood: text, myMoodSent: false }),
    onMoodKey: () => sendMood(),
    sendMood: () => sendMood(),
    moodHistoryOpen: !!st.moodHistoryOpen,
    toggleMoodHistory: () => go('moodhistory'),
    moodHistoryLabel: st.moodHistoryOpen ? '접기' : '펼치기',
    moodHistoryChevron: st.moodHistoryOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    moodHistory: [
      { date: '오늘 · 7월 7일', items: [
        { name: '엄마', ini: '엄', c: '#FF5E8A', when: '오후 6:12', text: '회의 끝! 이제 집가는 중 🌿' },
        { name: '지우', ini: '지', c: '#FF9F43', when: '오후 4:30', text: '학교 끝나고 학원 가요' },
      ] },
      { date: '어제 · 7월 6일', items: [
        { name: '엄마', ini: '엄', c: '#FF5E8A', when: '오전 8:02', text: '비 오니까 다들 우산 챙겨~ ☔' },
        { name: '아빠', ini: '아', c: '#4D7CFE', when: '오후 7:41', text: '오늘 회식이라 조금 늦어요' },
        { name: '할머니', ini: '할', c: '#A66CFF', when: '오후 1:15', text: '점심 맛있게들 먹었니' },
      ] },
      { date: '7월 5일', items: [
        { name: '지우', ini: '지', c: '#FF9F43', when: '오후 3:20', text: '받아쓰기 다 맞았어!! 🎉' },
        { name: '할머니', ini: '할', c: '#A66CFF', when: '오전 10:48', text: '김치 담갔으니 가져가렴' },
        { name: '아빠', ini: '아', c: '#4D7CFE', when: '오전 7:30', text: '오늘도 화이팅! 다녀올게' },
      ] },
    ],
    inviteOpen: !!st.inviteOpen,
    openInvite: () => setState({ inviteOpen: true }),
    closeInvite: () => setState({ inviteOpen: false }),
    searchOpen: !!st.searchOpen,
    openSearch: () => setState({ searchOpen: true }),
    closeSearch: () => setState({ searchOpen: false }),
    stopEvt: () => {},
    recentWords: words.slice(0, 3),
    todayWord: words[0],
    currentWord: st.word || words[0],
    currentMedia: st.media || media[0],
    mediaLiked: !!st.mediaLiked,
    mediaHearts: ((st.media || media[0]).hearts || 0) + (st.mediaLiked ? 1 : 0),
    toggleMediaLike: () => setState((s2) => ({ mediaLiked: !s2.mediaLiked })),
    likeBtnStyle: 'flex-direction:row;align-items:center;justify-content:center;gap:5px;height:32px;padding:0 13px;border-radius:16px;font-size:12.5px;font-weight:800;' + (st.mediaLiked ? 'background:#FF5E8A;color:#fff;border:1px solid #FF5E8A' : 'background:#FFF0F5;color:#FF5E8A;border:1px solid #FFD5E4'),
    comments: cmts,
    commentCount: cmts.length,
    commentDraft: st.commentDraft || '',
    onCommentInput, onCommentKey, addComment,
    onEditCmtInput, onEditCmtKey,
    isMenuWord: st.menuOpen === 'word', isMenuMedia: st.menuOpen === 'media',
    toggleMenuWord: () => toggleMenu('word'), toggleMenuMedia: () => toggleMenu('media'),
    startEditWord, deleteWord, startAddWord,
    startEditMedia, deleteMedia,
    onWordTerm, onWordReading, onWordMeaning, onWordExample,
    removeWordPhoto, noWordPhoto: !(st.wordDraft && st.wordDraft.photo),
    saveWord, onMediaTitle, saveMedia, cancelEdit,
    editWord: st.editPost === 'word', readWord: st.editPost !== 'word',
    editMedia: st.editPost === 'media',
    wordDraft: st.wordDraft || {}, mediaDraft: st.mediaDraft || {},
    navHome: navC(scr === 'home'), navDict: navC(scr === 'dict'), navQna: navC(scr === 'qna'),
    navGallery: navC(scr === 'gallery'), navMembers: navC(scr === 'members'),
    photoTabBg: ut === 'photo' ? '#FFF0F5' : 'transparent',
    photoTabColor: ut === 'photo' ? '#FF5E8A' : '#9DB2BD',
    videoTabBg: ut === 'video' ? '#FFF0F5' : 'transparent',
    videoTabColor: ut === 'video' ? '#FF5E8A' : '#9DB2BD',
    uploadHint: ut === 'photo' ? '사진을 선택하세요' : '영상을 선택하세요',
    enter: () => go('spaceSelect'), enterJoin: () => go('joinSpace'),
    goSpace: () => go('space'), goCreate: () => go('createSpace'), goJoin: () => go('joinSpace'), finishOnboard: () => go('home'), goLogin: () => go('login'), goSignupBack: () => go('signup'),
    linkSheetOpen: !!st.linkSheetOpen, openLinkSheet: () => setState({ linkSheetOpen: true }), closeLinkSheet: () => setState({ linkSheetOpen: false }),
    goHome: () => go('home'), goDict: () => go('dict'),
    goGallery: () => go('gallery'),
    goMembers: () => setState({ screen: 'members', membersFromLink: false }),
    goMembersDeep: () => setState({ screen: 'members', membersFromLink: true }),
    goCalendar: () => go('calendar'), goQna: () => go('qna'),
    openAnswer: () => setState({ answerOpen: true }), closeAnswer: () => setState({ answerOpen: false }),
    goUpload: () => go('upload'),
    openTodayWord: () => setState({ screen: 'word', word: words[0] }),
    setPhoto: () => setState({ uploadType: 'photo' }),
    setVideo: () => setState({ uploadType: 'video' }),
    back: () => {
      const map = { word: 'dict', media: 'gallery', upload: 'home', members: 'home', moodhistory: 'home', qnahistory: 'qna' }
      go(map[scr] || 'home')
    },
  }

  const Screen =
    vm.isLogin ? Login : vm.isSpaceSelect ? SpaceSelect : vm.isSignup ? Signup : vm.isSpace ? Space : vm.isCreateSpace ? CreateSpace :
    vm.isJoinSpace ? JoinSpace : vm.isHome ? Home : vm.isDict ? Dict : vm.isWord ? Word :
    vm.isGallery ? Gallery : vm.isMedia ? Media : vm.isMoodHistory ? MoodHistory :
    vm.isQnaHistory ? QnaHistory : vm.isQna ? Qna : vm.isUpload ? Upload :
    vm.isMembers ? Members : vm.isProfile ? Profile : Login

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF6FB', overflow: 'hidden' }}>
      <View pointerEvents="none" style={s('position:absolute;inset:0;overflow:hidden')}>
        <View style={[s('position:absolute;top:52px;right:-26px;opacity:0.1'), { transform: [{ rotate: '12deg' }] }]}><Flower6 size={116} petal="#FF9EBB" center="#FFD36E" /></View>
        <View style={[s('position:absolute;top:326px;left:-32px;opacity:0.08'), { transform: [{ rotate: '-14deg' }] }]}><Flower6 size={132} petal="#C6A8FF" center="#FFD36E" /></View>
        <View style={[s('position:absolute;bottom:52px;right:-22px;opacity:0.09'), { transform: [{ rotate: '20deg' }] }]}><Flower6 size={122} petal="#FFB38A" center="#FFD36E" /></View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Screen vm={vm} />
      </ScrollView>

      {vm.linkSheetOpen && <LinkSheet vm={vm} />}
      {vm.answerOpen && <AnswerSheet vm={vm} />}
      {vm.addEventOpen && <AddEventSheet vm={vm} />}
      {vm.inviteOpen && <InviteSheet vm={vm} />}
      {vm.searchOpen && <SearchOverlay vm={vm} />}
      {vm.showNav && <Nav vm={vm} />}
    </View>
  )
}
