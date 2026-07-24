// 앱 전체 뷰모델 조립. app = useApp() 결과(상태·네비게이션·액션)를 받아
// 화면들이 쓰는 vm 객체를 만든다. 화면은 useVm()으로 이걸 가져간다.
import { QUESTION_BANK } from '../data/questionBank.js'
import { CALENDAR_SINGLE, CALENDAR_RANGES, CALENDAR_EVENTS } from '../data/mockCalendar.js'
import { MOCK_JOIN_GROUPS } from '../data/mockGroups.js'
import { MOCK_MOOD_HISTORY } from '../data/mockMood.js'
import { seedComments } from '../data/mockComments.js'
import { EVENT_CATEGORIES } from '../data/eventCategories.js'

const AVATAR_COLORS = ['#FF5E8A', '#4D7CFE', '#FF9F43', '#22C4A6', '#A66CFF']
const colorFor = (key) => {
  const str = String(key || '')
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}
const fmtDate = (iso) => {
  const m = String(iso || '').match(/^\d{4}-(\d{2})-(\d{2})/)
  return m ? `${Number(m[1])}월 ${Number(m[2])}일` : ''
}
const fmtTime = (iso) => {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  let h = d.getHours()
  const min = String(d.getMinutes()).padStart(2, '0')
  const ap = h < 12 ? '오전' : '오후'
  h = h % 12 || 12
  return `${ap} ${h}:${min}`
}
// 백엔드 답변 → 화면 카드 형태
const answerCard = (a) => {
  const key = a.author?.nickname || a.author?.name || '?'
  return {
    by: { name: a.author?.nickname || a.author?.name || '가족', ini: String(key).slice(0, 1), c: colorFor(key) },
    time: fmtTime(a.createdAt),
    likes: 0,
    text: a.text,
  }
}
const CHO = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const BASE = { ㄲ: 'ㄱ', ㄸ: 'ㄷ', ㅃ: 'ㅂ', ㅆ: 'ㅅ', ㅉ: 'ㅈ' }
const choOf = (str) => { const c = str.charCodeAt(0) - 0xac00; if (c < 0 || c > 11171) return str[0]; const ch = CHO[Math.floor(c / 588)]; return BASE[ch] || ch }

export function buildVm(app) {
  const {
    st, setState, go, navTo, back,
    variant = 'grid', initialScreen = 'login',
    logout, kakaoLogin, googleLogin, saveProfile,
    doCreateGroup, doJoinGroup, loadMembers, saveGroupName, cancelEditGroupName, sendMood,
    loadWords, startEditWord, startAddWord, onWordTerm, onWordReading, onWordMeaning, onWordExample, removeWordPhoto, saveWord, deleteWord,
    loadQna, submitAnswer, submitQuestion,
  } = app

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

  const startEditMedia = () => { const m = st.media || media[0] || {}; setState({ menuOpen: null, editPost: 'media', mediaDraft: { ...m } }) }
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

  // 실제 그룹 구성원(백엔드) → 홈 링/멤버 화면용 형태.
  // getGroup 로딩 전이면 그룹 목록의 요약 멤버로 폴백, 그것도 없으면 최소 '나' 하나.
  const myId = st.me?.id
  const myMood = st.myMoodSent && (st.myMood || '').trim() ? st.myMood.trim() : ''
  const rawMembers = st.groupMembers || st.currentGroup?.members || []
  const members = rawMembers.map((m, i) => {
    const label = m.nickname || m.name || '가족' // 호칭 우선
    const isMe = m.userId ? m.userId === myId : label === st.currentGroup?.myNickname
    return {
      name: label,
      role: m.name || '', // 부제엔 실제 이름
      ini: String(label).slice(0, 1),
      c: colorFor(m.userId || label), // 사용자 고유색 (userId 기반, 닉네임 바뀌어도 유지)
      admin: m.role === 'OWNER',
      me: isMe,
      mood: m.mood || (isMe ? myMood : ''),
      emoji: m.moodEmoji || '',
      slotId: 'prof-' + i,
    }
  })
  if (members.length === 0) {
    const label = st.currentGroup?.myNickname || st.me?.name || '나'
    members.push({ name: label, role: st.me?.name || '', ini: String(label).slice(0, 1), c: colorFor(myId || label), admin: true, me: true, mood: myMood, emoji: '', slotId: 'prof-0' })
  }
  const memberCount = st.groupMembers ? st.groupMembers.length : (st.currentGroup?.memberCount ?? members.length)
  const myInitial = String(st.currentGroup?.myNickname || st.me?.name || '나').slice(0, 1)
  const myColor = colorFor(myId || st.currentGroup?.myNickname || '나') // 내 고유색 (프로필/아바타 통일용)

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

  // 실제 그룹 단어(백엔드) → 화면용 형태로 변환
  const words = (st.groupWords || []).map((w) => {
    const obj = {
      id: w.id,
      term: w.term,
      reading: w.reading || '',
      meaning: w.meaning || '',
      example: w.example || '',
      photo: !!w.photoUrl,
      ph: '사진',
      tint: '#FFF0F5',
      date: fmtDate(w.createdAt),
      by: {
        name: w.author?.nickname || w.author?.name || '',
        ini: String(w.author?.nickname || w.author?.name || '?').slice(0, 1),
        c: colorFor(w.author?.nickname || w.author?.name),
      },
    }
    obj.open = () => navTo({ screen: 'word', word: obj })
    return obj
  })

  const dictGroups = []
  const gIdx = {}
  ;[...words].sort((a, b) => a.term.localeCompare(b.term, 'ko')).forEach((w) => {
    const ch = choOf(w.term)
    if (gIdx[ch] == null) { gIdx[ch] = dictGroups.length; dictGroups.push({ cho: ch, items: [] }) }
    dictGroups[gIdx[ch]].items.push(w)
  })

  const gbase = [] // 추억(갤러리)은 백엔드 연동 전까지 빈 목록 (목업 제거)
  const media = gbase.map((g) => ({ ...g, isVideo: g.type === 'video', open: () => navTo({ screen: 'media', media: g, mediaLiked: false }) }))
  const gFilter = st.galleryFilter || 'all'
  const galleryMedia = gFilter === 'all' ? media : media.filter((m) => m.by && m.by.name === gFilter)
  const galleryTabs = [{ label: '전체', key: 'all', c: '#FF5E8A' }].concat(members.map((m) => ({ label: m.name, key: m.name, c: m.c }))).map((t) => {
    const sel = t.key === gFilter
    return { label: t.label, sel, bg: sel ? t.c : '#fff', color: sel ? '#fff' : '#6A7E88', border: sel ? t.c : '#FFE1EC', pick: () => setState({ galleryFilter: t.key }) }
  })
  const curMedia = st.media || media[0] || {}
  const cmts = commentsFor(curMedia.title).map((c, i) => ({
    ...c,
    editing: st.editCmt === i,
    viewing: st.editCmt !== i,
    draft: st.editCmt === i ? (st.editCmtDraft || '') : c.text,
    edit: () => startEditCmt(i, c.text),
    save: () => saveCmt(i),
  }))

  const single = CALENDAR_SINGLE
  const ranges = CALENDAR_RANGES
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
  const events = CALENDAR_EVENTS

  const qc = st.qnaCurrent
  const todayQ = qc && qc.question
    ? {
        id: qc.question.id,
        no: `${qc.no}/${qc.total}`,
        q: qc.question.text,
        progress: `${qc.memberCount}명 중 ${qc.answers.length}명이 답했어요`,
        answered: qc.answers.map(answerCard),
        empty: false,
      }
    : { id: null, no: '0/0', q: '', progress: '', answered: [], empty: true }
  const qListAll = (st.qnaList && st.qnaList.questions) || []
  const pastQs = qListAll.slice(1, 4).map((q) => ({ id: q.id, day: q.no, q: q.text, count: q.answerCount }))
  const qBank = QUESTION_BANK
  const qnaHistory = qListAll.map((q) => ({ id: q.id, no: q.no, q: q.text, count: q.answerCount }))
  const qnaHistoryTotal = (st.qnaList && st.qnaList.total) || qnaHistory.length
  // 아직 등록된 질문 중에 없는 추천 질문 하나 (새 질문 제안용)
  const usedQ = new Set(qListAll.map((q) => q.q || q.text))
  const suggestQuestion = () => {
    const pool = qBank.filter((q) => !usedQ.has(q))
    const src = pool.length ? pool : qBank
    return src[(st.qnaCurrent?.total || 0) % src.length]
  }

  const joinGroups = MOCK_JOIN_GROUPS
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

  const CATS = EVENT_CATEGORIES
  const selColor = st.newEventColor || CATS[0].c
  const eventCats = CATS.map((k) => ({
    label: k.label, c: k.c, sel: k.c === selColor,
    swStyle: `width:46px;height:46px;border-radius:50%;background:${k.c};border:3px solid ${k.c === selColor ? '#17303B' : 'transparent'};box-shadow:0 3px 8px rgba(0,0,0,0.12);transform:scale(${k.c === selColor ? 1.08 : 1});align-items:center;justify-content:center;color:#fff;font-size:18px;font-weight:800`,
    labelStyle: `font-size:11px;margin-top:6px;font-weight:${k.c === selColor ? 700 : 500};color:${k.c === selColor ? '#17303B' : '#9DB2BD'}`,
    pick: () => setState({ newEventColor: k.c }),
  }))

  return {
    isCards: v === 'cards', isGrid: v === 'grid',
    isLogin: scr === 'login', isHome: scr === 'home', isDict: scr === 'dict', isWord: scr === 'word',
    isGallery: scr === 'gallery', isMedia: scr === 'media', isUpload: scr === 'upload',
    isMembers: scr === 'members',
    isQna: scr === 'qna', isProfile: scr === 'profile',
    isSignup: scr === 'signup', isSpace: scr === 'space', isCreateSpace: scr === 'createSpace', isJoinSpace: scr === 'joinSpace',
    isSpaceSelect: scr === 'spaceSelect',
    // 백엔드에서 불러온 실제 그룹 목록
    mySpaces: (st.groups || []).map((g) => ({
      name: g.name,
      sub: `${g.memberCount}명 · 내 호칭 ${g.myNickname}`,
      avatars: (g.members || []).map((m, i) => ({
        i: String(m.nickname || m.name || '').slice(0, 1),
        c: AVATAR_COLORS[i % AVATAR_COLORS.length],
      })),
      pick: () => { setState({ currentGroup: g, groupMembers: null, groupWords: [], qnaCurrent: null, qnaList: null }); go('home'); loadMembers(g.id); loadWords(g.id); loadQna(g.id) },
    })),
    currentGroup: st.currentGroup || null,
    myNickname: st.currentGroup?.myNickname || '나',
    myInitial,
    myColor,
    memberCount,
    // 그룹(가족) 이름 편집 — 방장만 연필 노출
    canEditGroupName: st.currentGroup?.myRole === 'OWNER',
    editingGroupName: !!st.editingGroupName,
    groupNameDraft: st.groupNameDraft ?? (st.currentGroup?.name || ''),
    groupNameSaving: !!st.groupNameSaving,
    groupNameError: st.groupNameError || null,
    startEditGroupName: () => setState({ editingGroupName: true, groupNameDraft: st.currentGroup?.name || '', groupNameError: null }),
    onGroupNameDraft: (t) => setState({ groupNameDraft: t, groupNameError: null }),
    saveGroupName,
    cancelEditGroupName,
    // 프로필 편집 (이름 + 가족 내 호칭)
    profileName: st.profileName ?? (st.me?.name ?? ''),
    profileNickname: st.profileNickname ?? (st.currentGroup?.myNickname ?? ''),
    profileMood: st.profileMood ?? (members.find((m) => m.me)?.mood ?? ''),
    onProfileName: (t) => setState({ profileName: t, profileError: null }),
    onProfileNickname: (t) => setState({ profileNickname: t, profileError: null }),
    onProfileMood: (t) => setState({ profileMood: t, profileError: null }),
    saveProfile,
    profileSaving: !!st.profileSaving,
    profileError: st.profileError || null,
    groupsLoading: !!st.groupsLoading,
    goSpaceSelect: () => go('spaceSelect'),
    // 인증
    isAuth: scr === 'auth',
    authMode: st.authMode || 'login',
    authError: st.authError || null, authLoading: !!st.authLoading,
    authNotice: st.authNotice || null,
    kakaoLogin,
    googleLogin,
    setAuthMode: (m) => setState({ authMode: m, authError: null }),
    logout,
    me: st.me || null,
    // 그룹 만들기/참여 입력
    createName: st.createName ?? '', createNickname: st.createNickname ?? '',
    createNameErr: !!st.createNameErr, createNickErr: !!st.createNickErr,
    onCreateName: (t) => setState({ createName: t, createNameErr: false }),
    onCreateNickname: (t) => setState({ createNickname: t, createNickErr: false }),
    doCreateGroup,
    joinCode: st.joinCode ?? '', joinNickname: st.joinNickname ?? '',
    joinCodeErr: !!st.joinCodeErr, joinNickErr: !!st.joinNickErr,
    onJoinCode: (t) => setState({ joinCode: t, joinCodeErr: false }),
    onJoinNickname: (t) => setState({ joinNickname: t, joinNickErr: false }),
    doJoinGroup,
    actionLoading: !!st.actionLoading, actionError: st.actionError || null,
    isMoodHistory: scr === 'moodhistory', readMedia: st.editPost !== 'media',
    showNav: ['home', 'dict', 'gallery', 'members', 'qna'].indexOf(scr) !== -1,
    members, words, media, days, events, dictGroups,
    galleryMedia, galleryTabs, galleryEmpty: galleryMedia.length === 0,
    todayQ, pastQs, joinList,
    qnaHistory, qnaHistoryTotal,
    qnaLoading: !!st.qnaLoading,
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
    moodHistory: MOCK_MOOD_HISTORY,
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
    currentMedia: st.media || media[0] || null,
    mediaLiked: !!st.mediaLiked,
    mediaHearts: ((st.media || media[0] || {}).hearts || 0) + (st.mediaLiked ? 1 : 0),
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
    enter: () => { setState({ authNext: null }); go('auth') },
    enterJoin: () => { setState({ authNext: 'joinSpace' }); go('auth') },
    goSpace: () => go('space'), goCreate: () => go('createSpace'), goJoin: () => go('joinSpace'), finishOnboard: () => go('spaceSelect'), goLogin: () => go('login'), goSignupBack: () => go('signup'),
    linkSheetOpen: !!st.linkSheetOpen, openLinkSheet: () => setState({ linkSheetOpen: true }), closeLinkSheet: () => setState({ linkSheetOpen: false }),
    goHome: () => go('home'), goDict: () => go('dict'),
    goGallery: () => go('gallery'),
    goMembers: () => navTo({ screen: 'members', membersFromLink: false }),
    goMembersDeep: () => navTo({ screen: 'members', membersFromLink: true }),
    goCalendar: () => go('calendar'), goQna: () => go('qna'),
    // 문답 답변 남기기 (오늘의 질문에 대해)
    answerDraft: st.answerDraft ?? '',
    onAnswerInput: (text) => setState({ answerDraft: text }),
    openAnswer: () => setState({ answerOpen: true, answerDraft: '' }),
    closeAnswer: () => setState({ answerOpen: false }),
    submitAnswer,
    // 새 질문 내기
    questionOpen: !!st.questionOpen,
    questionDraft: st.questionDraft ?? '',
    onQuestionInput: (text) => setState({ questionDraft: text }),
    openQuestion: () => setState({ questionOpen: true, questionDraft: '' }),
    closeQuestion: () => setState({ questionOpen: false }),
    fillSuggestedQuestion: () => setState({ questionDraft: suggestQuestion() }),
    submitQuestion,
    goUpload: () => go('upload'),
    openTodayWord: () => navTo({ screen: 'word', word: words[0] }),
    setPhoto: () => setState({ uploadType: 'photo' }),
    setVideo: () => setState({ uploadType: 'video' }),
    back,
  }
}
