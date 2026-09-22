// 앱 전체 뷰모델 조립. app = useApp() 결과(상태·네비게이션·액션)를 받아
// 화면들이 쓰는 vm 객체를 만든다. 화면은 useVm()으로 이걸 가져간다.
import { QUESTION_BANK } from '../data/questionBank.js'
import { EVENT_CATEGORIES } from '../data/eventCategories.js'
import * as Clipboard from 'expo-clipboard'
import { Linking, Platform, Share } from 'react-native'
import { MAX_WORD_PHOTOS } from '../state/wordActions.js'
import { clipText } from '../lib/text.js'
import { dateWheel, fmtYmdRange } from '../lib/date.js'
import { placeMapUrl } from '../lib/place.js'

// 일상(갤러리) 폴더 탭 색. 멤버 아바타 색을 쓰면 탭마다 색이 튀어 무지개가 된다.
// 브랜드 핑크(#FF5E8A)와 같은 밝기에서 마젠타 쪽으로 살짝 밀어 또렷하게.
const FOLDER_TAB_COLOR = '#FF5A97'
const fmtDate = (iso) => {
  const str = String(iso || '')
  // 시각이 없는 날짜만 있는 값('2026-09-20')은 그대로 읽는다 — Date 로 넘기면 UTC 자정으로
  // 해석돼 하루 밀린다. 시각이 붙은 값은 fmtTime 과 같은 현지 기준으로 맞춘다.
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const m = str.match(/^\d{4}-(\d{2})-(\d{2})/)
    return `${Number(m[1])}월 ${Number(m[2])}일`
  }
  const d = new Date(str)
  if (isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
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
    id: a.id,
    by: { name: a.author?.nickname || a.author?.name || '가족', ini: String(key).slice(0, 1), photoUrl: a.author?.photoUrl || null },
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
    logout, deleteAccount, kakaoLogin, saveProfile, pickProfilePhoto,
    doCreateGroup, doJoinGroup, loadMembers, loadHistory, saveGroupName,
    loadBucket, openBucket, onBucketDraft, toggleBucketDone,
    openBucketPicker, closeBucketPicker, pickBucketMedia, unlinkBucketMedia, saveBucket, clearBucket, reorderBucket,
    startBucketMedia, cancelBucketLink, setBucketDatePart, toggleBucketRow,
    cancelEditGroupName, sendMood, openInvite, deleteGroup, loadActivity,
    loadWords, startEditWord, startAddWord, onWordTerm, onWordReading, onWordMeaning, onWordExample, removeWordPhoto, pickWordPhoto, saveWord, deleteWord,
    refreshGroups,
    loadQna, submitAnswer, submitQuestion,
    loadMedia, pickUploadPhoto, onUploadCaption, submitUpload, openUpload, startEditMedia, removeMedia, removeUploadItem, reorderUploadAsset,
    addMediaDate, removeMediaDate, toggleMediaRange, setMediaDatePart,
    openPlaceSearch, closePlaceSearch, onPlaceQuery, pickPlace, removePlace,
    loadComments, onCommentDraft, startReply, startEditComment, cancelCommentMode, submitComment, removeComment,
    retryUploadJob, discardUploadJob,
  } = app

  const toggleMenu = (which) => setState((s2) => ({ menuOpen: s2.menuOpen === which ? null : which }))

  // 공용 확인 모달: askConfirm({ title, message, yesText, danger, onYes })
  const askConfirm = (cfg) => setState({ menuOpen: null, confirm: cfg })
  const closeConfirm = () => setState({ confirm: null })
  const confirmYes = () => {
    const onYes = st.confirm && st.confirm.onYes
    setState({ confirm: null })
    if (onYes) onYes()
  }

  // 사진 원본 보기: openPhotoViewer(url) 또는 openPhotoViewer([url, ...], 시작 번호)
  const openPhotoViewer = (urls, index = 0) => {
    const list = (Array.isArray(urls) ? urls : [urls]).filter(Boolean)
    if (list.length) setState({ photoViewer: { urls: list, index: Math.min(Math.max(0, index), list.length - 1) } })
  }
  const closePhotoViewer = () => setState({ photoViewer: null })

  const deleteMedia = () => { setState({ menuOpen: null }); const id = st.media?.id; if (id) removeMedia(id) }
  const editMedia = () => { setState({ menuOpen: null }); startEditMedia() }

  // 올리기 화면은 '새 글'과 '수정' 둘 다 쓴다.
  // 수정 중인데 사진을 아직 다시 안 골랐으면 기존 사진을 미리보기로 보여준다.
  const editingMedia = !!st.editMediaId
  const pickedAssets = st.uploadAssets || []
  // 수정 중이면 '기존 사진 + 새로 고른 사진' 을 함께 보여준다.
  // 예전엔 새로 고르는 순간 기존 사진이 가려져, ＋ 로 더하려 해도 교체가 됐다.
  const existingItems = editingMedia ? st.editMediaItems || [] : []
  const uploadExisting = existingItems.map((it, i) => ({
    key: `e-${it.url}`,
    uri: it.url,
    isVideo: it.type === 'video',
    remove: () => removeUploadItem({ kind: 'existing', index: i }),
  }))
  // 새로 고른 것만 끌어서 순서를 바꾼다. 이미 올라간 사진은 자리를 지킨다 —
  // 서버가 '남긴 기존 사진 + 새 사진' 순서로 붙이기 때문.
  const uploadPicked = pickedAssets.map((a, i) => ({
    key: `n-${a.uri}`,
    // 웹은 작은 미리보기가 준비될 때까지 빈 칸 (null). 준비되면 그걸, 못 만들었으면 원본
    uri: a.thumbPending ? null : a.thumbUri || a.uri,
    isVideo: a.type === 'video' || /^video\//.test(a.mimeType || ''),
    remove: () => removeUploadItem({ kind: 'new', index: i }),
  }))
  const uploadPreview = [...uploadExisting, ...uploadPicked]
  const cancelEdit = () => setState({ editPost: null })

  const v = variant === 'grid' ? 'grid' : 'cards'
  const scr = st.screen || initialScreen || 'login'

  // 실제 그룹 구성원(백엔드) → 홈 링/멤버 화면용 형태.
  // getGroup 로딩 전이면 그룹 목록의 요약 멤버로 폴백, 그것도 없으면 최소 '나' 하나.
  const myId = st.me?.id
  const myMood = st.myMoodSent && (st.myMood || '').trim() ? st.myMood.trim() : ''
  const rawMembers = st.groupMembers || st.currentGroup?.members || []
  const members = rawMembers.map((m, i) => {
    const label = m.nickname || m.name || '가족' // 호칭 우선
    // userId 로 판별하되, 내 정보(me)가 아직 없으면 호칭으로 폴백 (색 통일이 깨지지 않게)
    const isMe = m.userId && myId ? m.userId === myId : label === st.currentGroup?.myNickname
    return {
      name: label,
      role: m.name || '', // 부제엔 실제 이름
      ini: String(label).slice(0, 1),
      // 가족마다 다른 사진. 이 가족에서 정하지 않았으면 계정 사진으로 대신하지 않고 이니셜로 보인다.
      photoUrl: m.photoUrl || null,
      admin: m.role === 'OWNER',
      me: isMe,
      mood: m.mood || (isMe ? myMood : ''),
      emoji: m.moodEmoji || '',
      slotId: 'prof-' + i,
    }
  })
  if (members.length === 0) {
    const label = st.currentGroup?.myNickname || st.me?.name || '나'
    members.push({ name: label, role: st.me?.name || '', ini: String(label).slice(0, 1), photoUrl: st.currentGroup?.myPhotoUrl || null, admin: true, me: true, mood: myMood, emoji: '', slotId: 'prof-0' })
  }
  // 가족 목록(/groups)이 주는 members 에는 mood 가 없다. 상세(groupMembers)를 받기 전까지는
  // "한마디가 없는 것"과 "아직 못 받아온 것"을 구분할 수 없으므로, 빈 상태 문구를 미룬다.
  const moodLoading = !!st.currentGroup && !Array.isArray(st.groupMembers)
  const memberCount = st.groupMembers ? st.groupMembers.length : (st.currentGroup?.memberCount ?? members.length)
  const myInitial = String(st.currentGroup?.myNickname || st.me?.name || '나').slice(0, 1)
  // 이 가족에서 쓰는 내 사진 (구성원 목록이 더 최신이면 그걸 쓴다). 없으면 이니셜.
  const myGroupPhoto = members.find((m) => m.me)?.photoUrl || st.currentGroup?.myPhotoUrl || null

  // 사람 → 프로필 사진을 한 군데로 통일.
  // 단어 작성자처럼 payload 에 사진이 없는 경우, 이미 로드된 멤버 목록에서
  // 호칭/이름으로 찾아 같은 사진을 쓴다.
  const photoByLabel = {}
  members.forEach((m) => {
    if (m.photoUrl) {
      if (m.name) photoByLabel[m.name] = m.photoUrl
      if (m.role) photoByLabel[m.role] = m.photoUrl
    }
  })
  const personPhoto = (p) => {
    if (!p) return null
    if (p.photoUrl) return p.photoUrl
    return photoByLabel[p.nickname || p.name || ''] || null
  }

  // 프로필 화면 진입 — 편집하다 만 초안(이름/호칭/한마디/고른 사진)은 버리고
  // 저장된 값부터 다시 시작한다. 저장 안 하고 나갔다 들어오면 원래대로 보여야 한다.
  const openProfile = () => {
    setState({
      profileName: undefined, profileNickname: undefined, profileMood: undefined,
      profilePhoto: undefined, profilePhotoAsset: undefined, profilePhotoRemove: undefined, profileError: null,
    })
    go('profile')
  }

  const N = members.length, BOX = 296, C = BOX / 2, AV = 60, RING = 3
  // 반지름은 사람 수에 따라 정한다. 프로필(+이름)이 상자(BOX) 밖으로 나가지 않는 선에서
  // 최대한 밀어낸다. 예전엔 가로만 봐서 짝수 명이면 맨 아래 사람의 이름이 상자 밖
  // 날짜 줄까지 내려갔다 (2명이면 48px).
  // 위·옆은 커진 프로필(1.18배), 아래는 프로필 밑에 붙는 이름까지 들어가야 한다.
  const EXT_TOP = (AV / 2) * 1.18, EXT_SIDE = EXT_TOP, EXT_BOTTOM = AV / 2 + 12 + 14
  const fitRing = (offset) => {
    const angs = Array.from({ length: N }, (_, i) => -Math.PI / 2 + offset + (i * 2 * Math.PI) / N)
    let r = 140
    for (const a of angs) {
      const cos = Math.abs(Math.cos(a)), sin = Math.sin(a)
      if (cos > 1e-6) r = Math.min(r, (C - EXT_SIDE) / cos)
      if (sin < -1e-6) r = Math.min(r, (C - EXT_TOP) / -sin)
      if (sin > 1e-6) r = Math.min(r, (C - EXT_BOTTOM) / sin)
    }
    return Math.floor(r)
  }
  // 맨 위에서 시작하는 배치와 반 칸 돌린 배치 중 더 넓게 펼 수 있는 쪽을 쓴다.
  // 2명이면 위아래 대신 좌우, 4명이면 +자 대신 ×자가 된다 (말풍선을 위아래로 누르지 않는다).
  const ringOffset = N && fitRing(Math.PI / N) > fitRing(0) ? Math.PI / N : 0
  const R = N ? fitRing(ringOffset) : 124
  // 프로필을 누르면 그 사람의 한마디가 고정된다. 한 번 더 누르면 풀려 다시 자동으로 돈다.
  const pinned = st.moodPin != null && N ? ((st.moodPin % N) + N) % N : null
  const active = pinned ?? (((st.activeMood ?? 0) % N) + N) % N
  const ringMembers = members.map((m, i) => {
    const ang = -Math.PI / 2 + ringOffset + (i * 2 * Math.PI) / N
    const cx = C + R * Math.cos(ang), cy = C + R * Math.sin(ang)
    const isA = i === active
    return {
      ...m,
      // 지금 한마디를 보여주는 사람은 조금 커지고, 강조색 테두리를 두른다.
      // 테두리 두께만큼 상자를 키워(테두리는 안쪽으로 그려진다) 아바타 크기는 그대로 둔다.
      wrapStyle: (() => {
        const box = isA ? AV + RING * 2 : AV
        return `position:absolute;left:${cx - box / 2}px;top:${cy - box / 2}px;width:${box}px;height:${box}px;border-radius:50%;align-items:center;justify-content:center;${isA ? `border:${RING}px solid #FF5E8A;` : ''}box-shadow:0 6px 15px rgba(255,94,138,0.22);transform:scale(${isA ? 1.18 : 0.97});z-index:${isA ? 6 : 2}`
      })(),
      press: () =>
        setState(pinned === i ? { moodPin: null, activeMood: i } : { moodPin: i }),
      badgeStyle: m.me
        ? `position:absolute;left:${cx + AV / 2 - 21}px;top:${cy + AV / 2 - 21}px;width:22px;height:22px;border-radius:50%;background:#FF5E8A;border:2px solid #fff;align-items:center;justify-content:center;z-index:${isA ? 7 : 3};box-shadow:0 2px 6px rgba(255,94,138,0.4)`
        : `display:none`,
      badgeClick: m.me ? openProfile : undefined,
      labelStyle: `position:absolute;left:${cx - 40}px;top:${cy + AV / 2 + 12}px;width:80px;text-align:center;font-size:10.5px;font-weight:700;color:${isA ? '#17303B' : '#A9B4BD'};z-index:2`,
    }
  })
  const activeMember = members[active]

  // 실제 그룹 단어(백엔드) → 화면용 형태로 변환.
  // 저장 직후 목록 갱신이 실패한 경우의 폴백에도 재사용하려고 함수로 뺐다.
  const wordVm = (w) => {
    const obj = {
      id: w.id,
      term: w.term,
      reading: w.reading || '',
      meaning: w.meaning || '',
      example: w.example || '',
      // 사진 여러 장. 예전 서버/단어는 photoUrl 한 장만 준다.
      photoUrls: w.photoUrls?.length ? w.photoUrls : (w.photoUrl ? [w.photoUrl] : []),
      photo: !!(w.photoUrls?.length || w.photoUrl),
      photoUrl: w.photoUrls?.[0] || w.photoUrl || null,
      ph: '사진',
      tint: '#FFF0F5',
      date: fmtDate(w.createdAt),
      by: {
        name: w.author?.nickname || w.author?.name || '',
        ini: String(w.author?.nickname || w.author?.name || '?').slice(0, 1),
        photoUrl: personPhoto(w.author),
      },
    }
    // 단어를 열 때는 늘 '보기'로. 추가·수정하다 뒤로 나가면 editPost 가 남아서,
    // 비우지 않으면 다음에 여는 단어가 빈 수정 화면으로 뜬다.
    obj.open = () => navTo({ screen: 'word', word: obj, editPost: null, menuOpen: null, wordError: null })
    return obj
  }
  const words = (st.groupWords || []).map(wordVm)

  const dictGroups = []
  const gIdx = {}
  ;[...words].sort((a, b) => a.term.localeCompare(b.term, 'ko')).forEach((w) => {
    const ch = choOf(w.term)
    if (gIdx[ch] == null) { gIdx[ch] = dictGroups.length; dictGroups.push({ cho: ch, items: [] }) }
    dictGroups[gIdx[ch]].items.push(w)
  })

  // 일상(갤러리) — 백엔드에서 불러온 사진 목록.
  // 목록과 상세가 같은 모양을 쓰도록 shaper 하나로 모은다.
  const shapeMedia = (m) => ({
    id: m.id,
    // 글 하나에 사진·영상 여러 개
    items: m.items || [],
    coverUrl: m.coverUrl || null,
    count: (m.items || []).length,
    title: m.caption || '',
    // 언제의 일인지 ('2026년 9월 20일 ~ 22일'). 고르지 않았으면 빈 문자열 — 줄을 그리지 않는다
    takenLabel: fmtYmdRange(m.takenFrom, m.takenTo),
    // 이 순간이 있었던 곳 — 누르면 구글 지도
    place: m.place || null,
    openPlace: m.place ? () => Linking.openURL(placeMapUrl(m.place)).catch(() => {}) : undefined,
    date: fmtDate(m.createdAt),
    // 몇 시에 올렸는지 (예: 오후 3:07)
    time: fmtTime(m.createdAt),
    // 대표(첫 장)가 영상이면 목록에 재생 배지를 띄운다
    isVideo: (m.items || [])[0]?.type === 'video',
    mine: !!myId && m.author?.userId === myId,
    by: {
      name: m.author?.nickname || m.author?.name || '가족',
      ini: String(m.author?.nickname || m.author?.name || '?').slice(0, 1),
      photoUrl: personPhoto(m.author),
    },
  })
  // 일상 글 열기 — 이전 글에서 쓰던 댓글 입력(답글·수정 중)은 비운다
  const openMediaDetail = (m) =>
    navTo({ screen: 'media', media: m, commentDraft: '', commentReplyTo: null, commentEditingId: null, commentError: null })
  const media = (st.groupMedia || []).map((m) => ({
    ...shapeMedia(m),
    open: () => openMediaDetail(m),
  }))

  // 일상 댓글 → 화면 형태. 답글은 replies 에 한 단계로 붙어 온다.
  const shapeComment = (c) => {
    const name = c.author?.nickname || c.author?.name || '가족'
    const obj = {
      id: c.id,
      deleted: !!c.deleted,
      text: c.text || '',
      time: `${fmtDate(c.createdAt)} ${fmtTime(c.createdAt)}`,
      edited: !!c.edited,
      mine: !!c.mine,
      by: { name, ini: String(name).slice(0, 1), photoUrl: personPhoto(c.author) },
      replies: (c.replies || []).map(shapeComment),
    }
    obj.reply = () => startReply(obj)
    obj.edit = () => startEditComment(obj)
    obj.remove = () => askConfirm({
      title: '댓글을 삭제할까요?',
      message: obj.replies.length ? '답글은 남고, 이 댓글은 "삭제된 댓글"로 보여요.' : '삭제하면 되돌릴 수 없어요.',
      yesText: '삭제',
      onYes: () => removeComment(c.id),
    })
    return obj
  }

  // 홈 '최근 활동' — 사전 추가·일상 올림·질문·답변·댓글·버킷·한마디 (서버가 최신순으로 섞어 준다).
  // 문구: "{이름}님이 {prefix}{highlight}{suffix}"
  // 이모지를 한 글자로 세고, 잘릴 때도 끝에 붙은 이모지는 살린다 (lib/text.js)
  const clip = clipText
  const toQna = () => navTo({ screen: 'record', recordTab: 'qna' })
  const recentActivity = (st.groupActivity || []).map((a) => {
    const name = a.author?.nickname || a.author?.name || '가족'
    const base = {
      key: `${a.type}-${a.id}`,
      by: { name, ini: String(name).slice(0, 1), photoUrl: personPhoto(a.author) },
      date: fmtDate(a.createdAt),
      prefix: '',
    }
    if (a.type === 'word') {
      return {
        ...base, highlight: clip(a.text), suffix: ' 추가',
        // 이미 불러온 사전에서 찾아 상세로. 없으면(방금 지워짐 등) 사전 탭으로
        open: () => { const w = words.find((x) => x.id === a.targetId); if (w) w.open(); else navTo({ screen: 'record', recordTab: 'dict' }) },
      }
    }
    if (a.type === 'media') {
      return {
        ...base, highlight: '일상', suffix: ' 올림',
        open: () => { const m = (st.groupMedia || []).find((x) => x.id === a.targetId); if (m) openMediaDetail(m); else go('gallery') },
      }
    }
    // 댓글: 댓글 내용을 보여주고, 누르면 그 일상 글로 (targetId 는 글)
    if (a.type === 'comment') {
      return {
        ...base, highlight: `"${clip(a.text)}"`, suffix: ' 댓글',
        open: () => { const m = (st.groupMedia || []).find((x) => x.id === a.targetId); if (m) openMediaDetail(m); else go('gallery') },
      }
    }
    // 버킷리스트 — targetId 는 칸 번호. 누르면 그 칸으로 간다.
    if (a.type === 'bucket' || a.type === 'bucketDone') {
      const no = Number(a.targetId)
      const toItem = () => { setState({ recordTab: 'bucket' }); openBucket(no) }
      // 달성은 가족이 함께 이룬 일이라 누가 눌렀는지 보여주지 않는다
      if (a.type === 'bucketDone') {
        return { ...base, by: null, highlight: `버킷리스트 ${no}번`, suffix: '을 달성했어요!', open: toItem }
      }
      return { ...base, prefix: '버킷리스트에 ', highlight: `"${clip(a.text)}"`, suffix: ' 추가', open: toItem }
    }
    // 오늘의 한마디 — 이모지가 있으면 앞에 붙인다. 누르면 가족 기록(한마디 모음)으로
    if (a.type === 'mood') {
      const emoji = a.emoji ? `${a.emoji} ` : ''
      return { ...base, prefix: '한마디 ', highlight: `"${emoji}${clip(a.text)}"`, suffix: ' 남김', open: () => go('moodhistory') }
    }
    // 질문 하나만 여는 화면은 없어서 문답 탭(오늘의 질문 + 지난 질문)으로
    if (a.type === 'question') return { ...base, prefix: '질문 ', highlight: `"${clip(a.text)}"`, suffix: ' 등록', open: toQna }
    return { ...base, highlight: `"${clip(a.text)}"`, suffix: '에 답변', open: toQna }
  })
  const gFilter = st.galleryFilter || 'all'
  const galleryMedia = gFilter === 'all' ? media : media.filter((m) => m.by && m.by.name === gFilter)
  // 뒤에서 올리는 중인 일상 — 지금 가족 것만 목록 맨 위 카드로
  const uploadJobs = (st.uploadJobs || [])
    .filter((j) => j.groupId === st.currentGroup?.id)
    .map((j) => {
      const first = j.assets[0] || {}
      return {
        id: j.id,
        cover: first.uri || null,
        isVideo: first.type === 'video',
        failed: j.status === 'failed',
        progress: j.total > 1 ? `${j.done}/${j.total}` : '',
        error: j.error,
        retry: () => retryUploadJob(j.id),
        discard: () => askConfirm({
          title: '올리지 못한 일상을 지울까요?',
          message: '고른 사진과 글이 사라져요.',
          yesText: '지우기',
          onYes: () => discardUploadJob(j.id),
        }),
      }
    })
  const galleryTabs = [{ label: '전체', key: 'all' }].concat(members.map((m) => ({ label: m.name, key: m.name }))).map((t) => {
    const sel = t.key === gFilter
    return { label: t.label, sel, bg: sel ? FOLDER_TAB_COLOR : '#fff', color: sel ? '#fff' : '#6A7E88', border: sel ? FOLDER_TAB_COLOR : '#FFE1EC', pick: () => setState({ galleryFilter: t.key }) }
  })

  const qc = st.qnaCurrent
  const todayQ = qc && qc.question
    ? {
        id: qc.question.id,
        no: `${qc.no}/${qc.total}`,
        q: qc.question.text,
        progress: `${qc.memberCount}명 중 ${qc.answers.length}명이 답했어요`,
        answered: qc.answers.map((a) => ({ ...answerCard(a), mine: !!myId && a.author?.userId === myId })),
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
    screen: scr, // 화면 전환 모션용 키
    // 뒤로 갈 곳이 있는지 (스와이프 뒤로가기·안드로이드 뒤로가기 버튼용).
    // 히스토리가 없으면 탭 화면이라 뒤로가기가 의미 없다.
    canGoBack: !st.booting && scr !== 'login' && (st._hist || []).length > 0,
    isLogin: scr === 'login', isHome: scr === 'home', isDict: scr === 'dict', isWord: scr === 'word',
    isGallery: scr === 'gallery', isMedia: scr === 'media', isUpload: scr === 'upload',
    isMembers: scr === 'members',
    isQna: scr === 'qna', isProfile: scr === 'profile',
    isRecord: scr === 'record', // 사전+문답 통합 탭
    recordTab: st.recordTab || 'dict', // 'dict' | 'qna'
    setRecordTab: (k) => setState({ recordTab: k }),
    isSignup: scr === 'signup', isSpace: scr === 'space', isCreateSpace: scr === 'createSpace', isJoinSpace: scr === 'joinSpace',
    isSpaceSelect: scr === 'spaceSelect',
    // 백엔드에서 불러온 실제 그룹 목록
    mySpaces: (st.groups || []).map((g) => ({
      name: g.name,
      sub: `${g.memberCount}명 · 내 호칭 ${g.myNickname}`,
      avatars: (g.members || []).map((m) => ({
        i: String(m.nickname || m.name || '').slice(0, 1),
        photoUrl: personPhoto(m),
      })),
      current: !!st.currentGroup && g.id === st.currentGroup.id,
      pick: () => {
        // 지금 가족을 다시 고르면 불러올 것 없이 홈으로
        if (st.currentGroup && g.id === st.currentGroup.id) {
          setState({ screen: 'home', _hist: [], spaceSheetOpen: false })
          return
        }
        // 다른 가족으로 전환: 이전 가족의 화면 상태를 비우고, 뒤로가기로 이전 가족 화면에 돌아가지 않게 히스토리도 비운다
        setState({
          currentGroup: g, groupMembers: null, groupWords: [], qnaCurrent: null, qnaList: null, groupMedia: [],
          word: null, media: null, menuOpen: null, galleryFilter: 'all', photoViewer: null, groupActivity: [],
          moodPin: null,
          screen: 'home', _hist: [], spaceSheetOpen: false,
        })
        loadMembers(g.id); loadWords(g.id); loadQna(g.id); loadMedia(g.id)
      },
    })),
    // 앱 안(가족 탭)에서 연 가족 선택 화면이면 뒤로가기는 이전 화면으로, 로그인 직후면 로그아웃
    spaceSelectInApp: !!st.currentGroup,
    currentGroup: st.currentGroup || null,
    myNickname: st.currentGroup?.myNickname || '나',
    myInitial,
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
    // 카카오에서 받은 닉네임 — 이름 칸 아래 '기본 이름'으로. 아직 못 받았으면(예전 가입자) 숨긴다
    profileKakaoName: st.me?.kakaoName || '',
    profileNickname: st.profileNickname ?? (st.currentGroup?.myNickname ?? ''),
    profileMood: st.profileMood ?? (members.find((m) => m.me)?.mood ?? ''),
    onProfileName: (t) => setState({ profileName: t, profileError: null }),
    onProfileNickname: (t) => setState({ profileNickname: t, profileError: null }),
    onProfileMood: (t) => setState({ profileMood: t, profileError: null }),
    // 사진은 가족마다 따로 — 지금 가족에서 쓰는 사진을 편집한다.
    // profilePhoto: 편집 중 미리보기 (undefined = 안 건드림, null = 지우기로 함)
    profilePhoto: st.profilePhoto !== undefined ? st.profilePhoto : myGroupPhoto,
    myPhoto: myGroupPhoto, // 저장된 이 가족 사진 (아바타 표시용)
    pickProfilePhoto,
    removeProfilePhoto: () => setState({ profilePhoto: null, profilePhotoAsset: undefined, profilePhotoRemove: true, profileError: null }),
    profilePhotoUploading: !!st.profilePhotoUploading,
    saveProfile,
    profileSaving: !!st.profileSaving,
    profileError: st.profileError || null,
    groupsLoading: !!st.groupsLoading,
    // 가족 전환 화면 — 그 사이 초대받은 가족이 보이도록 열 때마다 목록을 새로 받는다
    goSpaceSelect: () => { go('spaceSelect'); refreshGroups() },
    // 가족 전환 시트 (하단 '홈' 길게 누르기). 열 때마다 목록을 새로 받는다.
    spaceSheetOpen: !!st.spaceSheetOpen,
    openSpaceSheet: () => { setState({ spaceSheetOpen: true }); refreshGroups() },
    closeSpaceSheet: () => setState({ spaceSheetOpen: false }),
    sheetGoCreate: () => { setState({ spaceSheetOpen: false }); go('createSpace') },
    sheetGoJoin: () => { setState({ spaceSheetOpen: false }); go('joinSpace') },
    // 인증
    isAuth: scr === 'auth',
    authError: st.authError || null, authLoading: !!st.authLoading,
    // 앱을 켤 때 저장된 로그인을 확인하는 중 (이때는 시작 화면)
    booting: !!st.booting,
    kakaoLogin,
    logout,
    // 가족 삭제 — 방장(canEditGroupName)에게만 버튼이 보이고, 서버도 방장만 허용한다
    deleteGroup: () => askConfirm({
      title: '이 가족을 삭제할까요?',
      message: `'${st.currentGroup?.name || '이 가족'}'의 사전·일상·문답과 사진이 모두 지워져요.\n구성원 모두에게서 사라지고 되돌릴 수 없어요.`,
      yesText: '삭제하기',
      onYes: deleteGroup,
    }),
    groupDeleting: !!st.groupDeleting,
    groupDeleteError: st.groupDeleteError || null,
    deleteAccount: () => askConfirm({
      title: '정말 탈퇴하시겠어요?',
      message: '이름과 프로필 사진은 바로 삭제되고 되돌릴 수 없어요.\n가족 공간에 남긴 사진·단어·문답은 호칭과 함께 남아요.\n혼자 있는 가족 공간은 함께 삭제돼요.',
      yesText: '탈퇴하기',
      onYes: deleteAccount,
    }),
    accountDeleting: !!st.accountDeleting,
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
    showNav: ['home', 'record', 'dict', 'gallery', 'members', 'qna'].indexOf(scr) !== -1,
    members, words, media, dictGroups,
    galleryMedia, galleryTabs, galleryEmpty: galleryMedia.length === 0 && uploadJobs.length === 0,
    uploadJobs,
    // 모든 가족을 통틀어 올리는 중인 작업 수 (웹에서 탭 닫기 확인용)
    uploadingCount: (st.uploadJobs || []).filter((j) => j.status === 'uploading').length,
    todayQ, pastQs,
    qnaHistory, qnaHistoryTotal,
    qnaLoading: !!st.qnaLoading,
    isQnaHistory: scr === 'qnahistory',
    openQnaHistory: () => go('qnahistory'),

    // 버킷리스트 — 1~100 칸을 늘 다 그린다. 채운 칸만 서버에서 오고 나머지는 빈 칸.
    isBucketItem: scr === 'bucketitem',
    loadBucket,
    bucketLoading: !!st.bucketLoading,
    bucketTotal: st.bucket?.size || 100,
    // 한 장(100칸)씩 넘겨 본다. 앞 장을 다 채우면 서버가 pages 를 늘려준다.
    bucketPages: st.bucket?.pages || 1,
    bucketPage: Math.min(st.bucketPage || 1, st.bucket?.pages || 1),
    bucketPrev: () => setState((p) => ({ bucketPage: Math.max(1, (p.bucketPage || 1) - 1) })),
    bucketNext: () =>
      setState((p) => ({
        bucketPage: Math.min(p.bucket?.pages || 1, (p.bucketPage || 1) + 1),
      })),
    // 진행률은 보고 있는 장 기준 — 목록이 그 장이므로
    bucketDoneCount: (() => {
      const size = st.bucket?.size || 100
      const page = Math.min(st.bucketPage || 1, st.bucket?.pages || 1)
      const start = (page - 1) * size
      return (st.bucket?.items || []).filter(
        (i) => i.done && i.no > start && i.no <= start + size,
      ).length
    })(),
    bucketPercent: (() => {
      const size = st.bucket?.size || 100
      const page = Math.min(st.bucketPage || 1, st.bucket?.pages || 1)
      const start = (page - 1) * size
      const done = (st.bucket?.items || []).filter(
        (i) => i.done && i.no > start && i.no <= start + size,
      ).length
      return Math.round((done / size) * 100)
    })(),
    // 목록에서 끌어다 놓기 — 이 장 안의 몇 번째 줄에서 몇 번째 줄로 (index → 칸 번호)
    reorderBucketRows: (fromIdx, toIdx) => {
      const size = st.bucket?.size || 100
      const start = (Math.min(st.bucketPage || 1, st.bucket?.pages || 1) - 1) * size
      reorderBucket(start + fromIdx + 1, start + toIdx + 1)
    },
    bucketRows: (() => {
      const size = st.bucket?.size || 100
      const page = Math.min(st.bucketPage || 1, st.bucket?.pages || 1)
      const start = (page - 1) * size
      const byNo = new Map((st.bucket?.items || []).map((i) => [i.no, i]))
      return Array.from({ length: size }, (_, k) => {
        const no = start + k + 1
        const it = byNo.get(no)
        return {
          no,
          text: it?.text || '',
          filled: !!it,
          done: !!it?.done,
          coverUrl: it?.mediaCoverUrl || null,
          byName: it?.createdBy?.nickname || it?.createdBy?.name || '',
          doneDate: it?.doneAt ? fmtDate(it.doneAt) : '',
          key: no,
          open: () => openBucket(no),
          // 빈 칸은 적을 내용이 없어 체크할 수 없다
          check: it ? () => toggleBucketRow(no) : undefined,
        }
      })
    })(),

    // 칸 편집 화면
    bucketNo: st.bucketNo || 1,
    bucketDraft: st.bucketDraft ?? '',
    bucketDoneDraft: !!st.bucketDone,
    bucketMediaId: st.bucketMediaId ?? null,
    bucketMediaCover: (st.groupMedia || []).find((m) => m.id === st.bucketMediaId)
      ? shapeMedia((st.groupMedia || []).find((m) => m.id === st.bucketMediaId)).coverUrl
      : null,
    bucketError: st.bucketError || null,
    bucketSaving: !!st.bucketSaving,
    bucketPicking: !!st.bucketPicking,
    // 연결할 일상 글 고르기 — 가족이 올린 글의 대표 사진만 늘어놓는다
    bucketPickable: (st.groupMedia || []).map((m) => {
      const v = shapeMedia(m)
      return { id: m.id, coverUrl: v.coverUrl || null, pick: () => pickBucketMedia(m.id) }
    }),
    onBucketDraft, toggleBucketDone, openBucketPicker, closeBucketPicker,
    unlinkBucketMedia, saveBucket, clearBucket,
    startBucketMedia, cancelBucketLink,
    // 올리기 화면에서 '이 글은 버킷 n번에 붙는다' 를 알려주기 위해
    bucketLinkNo: st.bucketLinkNo || null,

    // 이룬 날 — 체크한 순간이 아니라 실제로 이룬 날을 고른다
    // 년·월·일 휠. 굴려서 멈춘 값이 들어간다
    setBucketDatePart,
    // 앞으로 올 날은 이룬 날이 될 수 없어 올해·이번 달은 오늘까지만 (lib/date.js)
    bucketDateParts: dateWheel(st.bucketDoneAt),
    bucketByName: (() => {
      const it = (st.bucket?.items || []).find((i) => i.no === st.bucketNo)
      return it?.createdBy?.nickname || it?.createdBy?.name || ''
    })(),
    // 언제 이뤘는지 — 달성한 칸에만
    bucketDoneWhen: (() => {
      const it = (st.bucket?.items || []).find((i) => i.no === st.bucketNo)
      return it?.doneAt ? `${fmtDate(it.doneAt)} ${fmtTime(it.doneAt)}` : ''
    })(),

    // 가족 기록 — 한마디와 프로필 사진 변경이 시간순으로 섞인다.
    // 사진을 바꾼 줄은 눌러서 크게 볼 수 있다.
    isMoodHistory: scr === 'moodhistory',
    openMoodHistory: () => go('moodhistory'),
    loadHistory: () => loadHistory(st.currentGroup?.id),
    historyLoading: !!st.historyLoading,
    historyItems: (st.historyItems || []).map((m) => {
      const label = m.author?.nickname || m.author?.name || '알 수 없음'
      const isPhoto = m.type === 'photo'
      return {
        id: m.id,
        type: m.type,
        text: isPhoto
          ? (m.photoUrl ? '프로필 사진을 바꿨어요' : '프로필 사진을 지웠어요')
          : `${m.text}${m.emoji ? ` ${m.emoji}` : ''}`,
        // 바꾼 사진 (지운 줄은 없다) — 누르면 크게 보기
        shotUrl: isPhoto ? m.photoUrl : null,
        open: isPhoto && m.photoUrl ? () => openPhotoViewer([m.photoUrl], 0) : undefined,
        name: label,
        ini: String(label).slice(0, 1),
        photoUrl: m.author?.photoUrl || null,
        when: `${fmtDate(m.createdAt)} ${fmtTime(m.createdAt)}`.trim(),
      }
    }),
    ringMembers, activeMember, moodLoading,
    ringAvatarSize: AV,
    membersFromLink: !!st.membersFromLink,
    answerOpen: !!st.answerOpen,
    eventCats,
    addEventOpen: !!st.addEventOpen,
    closeAddEvent: () => setState({ addEventOpen: false }),
    isRange: st.eventRange === true,
    isOneDay: st.eventRange !== true,
    setRange: () => setState({ eventRange: true }),
    setOneDay: () => setState({ eventRange: false }),
    oneDayBg: st.eventRange !== true ? '#fff' : 'transparent',
    oneDayColor: st.eventRange !== true ? '#FF5E8A' : '#B39AA4',
    rangeBg: st.eventRange === true ? '#fff' : 'transparent',
    rangeColor: st.eventRange === true ? '#FF5E8A' : '#B39AA4',
    goProfileEdit: openProfile,
    myMood: st.myMood ?? '',
    myMoodSent: !!st.myMoodSent,
    sendBg: st.myMood && st.myMood.trim() ? '#FF5E8A' : '#F3C6D5',
    onMoodInput: (text) => setState({ myMood: text, myMoodSent: false }),
    onMoodKey: () => sendMood(),
    sendMood: () => sendMood(),
    inviteOpen: !!st.inviteOpen,
    inviteLoading: !!st.inviteLoading,
    inviteError: st.inviteError || null,
    inviteCode: st.inviteCode || null,
    inviteCopied: !!st.inviteCopied,
    openInvite,
    closeInvite: () => setState({ inviteOpen: false, inviteCopied: false }),
    // 초대 문구: 서버가 준 링크(웹 참여 주소)가 있으면 함께 보낸다. 링크를 누르면 코드가 채워진 참여 화면으로 간다.
    copyInvite: async () => {
      if (!st.inviteCode) return
      const text = `우리끼리 가족앱 초대!\n참여 코드: ${st.inviteCode}${st.inviteLink ? `\n아래 링크를 누르면 바로 참여할 수 있어요\n${st.inviteLink}` : ''}`
      try { await Clipboard.setStringAsync(text); setState({ inviteCopied: true }) } catch {}
    },
    shareInvite: async () => {
      if (!st.inviteCode) return
      const text = `우리끼리 가족앱 초대!\n참여 코드: ${st.inviteCode}${st.inviteLink ? `\n아래 링크를 누르면 바로 참여할 수 있어요\n${st.inviteLink}` : ''}`
      // 휴대폰의 공유 창을 연다 — 목록에서 카카오톡을 고르면 채팅방으로 보낼 수 있다.
      // 앱은 RN Share, 웹(아이폰 Safari 등)은 navigator.share. 둘 다 없으면(PC 브라우저) 복사로 대신한다.
      try {
        if (Platform.OS !== 'web') {
          await Share.share({ message: text })
          return
        }
        if (typeof navigator !== 'undefined' && navigator.share) {
          await navigator.share({ title: '우리끼리 가족 초대', text })
          return
        }
      } catch {
        return // 공유 창을 그냥 닫은 경우
      }
      try { await Clipboard.setStringAsync(text); setState({ inviteCopied: true }) } catch {}
    },
    searchOpen: !!st.searchOpen,
    openSearch: () => setState({ searchOpen: true }),
    closeSearch: () => setState({ searchOpen: false }),
    stopEvt: () => {},
    recentActivity,
    activityLoading: !!st.activityLoading,
    loadActivity: () => loadActivity(st.currentGroup?.id),
    loadMembers: () => loadMembers(st.currentGroup?.id),
    // 아래로 당겨서 새로고침 — 화면마다 새로 받는 것이 다르다.
    // 목록이 있는 화면에서만 켠다 (입력 화면에서 당기면 쓰던 내용이 날아간 것처럼 느껴진다).
    canRefresh: ['home', 'gallery', 'record', 'members', 'media', 'word', 'qnahistory', 'spaceSelect'].includes(scr),
    refreshing: !!st.refreshing,
    refresh: async () => {
      const gid = st.currentGroup?.id
      setState({ refreshing: true })
      try {
        if (scr === 'home') await Promise.all([loadMembers(gid), loadActivity(gid)])
        else if (scr === 'gallery') await loadMedia(gid)
        else if (scr === 'record') await (st.recordTab === 'qna' ? loadQna(gid) : loadWords(gid))
        else if (scr === 'members') await loadMembers(gid)
        else if (scr === 'media') await Promise.all([loadMedia(gid), loadComments(st.media?.id)])
        else if (scr === 'word') await loadWords(gid)
        else if (scr === 'qnahistory') await loadQna(gid)
        else if (scr === 'spaceSelect') await refreshGroups()
      } finally {
        setState({ refreshing: false })
      }
    },
    // 홈 날짜 (오늘, 기기 시간 기준)
    todayLabel: (() => {
      const d = new Date()
      return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
    })(),
    // st.word 는 열었던 시점의 스냅샷이라, 저장 직후엔 같은 id 를 최신 목록에서 다시 찾아 반영한다.
    // 목록에 없으면(갱신 실패 등) 서버 응답을 화면 형태로 변환해 쓴다 — by/date 누락 방지.
    currentWord:
      (st.word && words.find((w) => w.id === st.word.id)) ||
      (st.word && (st.word.by ? st.word : wordVm(st.word))) ||
      words[0],
    currentMedia: st.media ? shapeMedia(st.media) : (media[0] || null),
    // 일상 댓글 — 지금 보고 있는 글의 것만 (다른 글의 목록이 잠깐 비치지 않게)
    mediaComments: st.media && st.commentsFor === st.media.id ? (st.comments || []).map(shapeComment) : [],
    commentCount: st.media && st.commentsFor === st.media.id ? (st.commentCount || 0) : 0,
    commentsLoading: !!st.commentsLoading,
    commentDraft: st.commentDraft || '',
    commentReplyTo: st.commentReplyTo || null,
    commentEditing: !!st.commentEditingId,
    commentSaving: !!st.commentSaving,
    commentError: st.commentError || null,
    loadComments: () => loadComments(st.media?.id),
    onCommentDraft, submitComment, cancelCommentMode,
    isMenuMedia: st.menuOpen === 'media',
    toggleMenuMedia: () => toggleMenu('media'),
    startEditWord, startAddWord,
    // 삭제는 항상 확인 모달을 거친다
    confirm: st.confirm || null, confirmOpen: !!st.confirm, askConfirm, closeConfirm, confirmYes,
    photoViewerUrls: st.photoViewer?.urls || [], photoViewerIndex: st.photoViewer?.index || 0,
    photoViewerOpen: !!st.photoViewer, openPhotoViewer, closePhotoViewer,
    deleteWord: () => askConfirm({ title: '이 단어를 삭제하시겠습니까?', message: '삭제하면 되돌릴 수 없어요.', onYes: deleteWord }),
    deleteMedia: () => askConfirm({ title: '이 게시물을 삭제하시겠습니까?', message: '삭제하면 되돌릴 수 없어요.', onYes: deleteMedia }),
    onWordTerm, onWordReading, onWordMeaning, onWordExample,
    removeWordPhoto, pickWordPhoto,
    wordPhotos: (st.wordDraft && st.wordDraft.photos) || [],
    wordPhotoMax: MAX_WORD_PHOTOS,
    canAddWordPhoto: ((st.wordDraft && st.wordDraft.photos) || []).length < MAX_WORD_PHOTOS,
    photoError: st.photoError || null,
    wordError: st.wordError || null, // 단어 저장 실패 사유 (사전 화면에 표시)
    toast: st.toast || null, // 하단 알림 문구
    saveWord, cancelEdit,
    editWord: st.editPost === 'word', readWord: st.editPost !== 'word',
    wordDraft: st.wordDraft || {},
    navHome: navC(scr === 'home'), navDict: navC(scr === 'dict'), navQna: navC(scr === 'qna'),
    navRecord: navC(scr === 'record'),
    navGallery: navC(scr === 'gallery'), navMembers: navC(scr === 'members'),
    uploadHint: ut === 'photo' ? '사진을 선택하세요' : '영상을 선택하세요',
    goSpace: () => go('space'), goCreate: () => go('createSpace'), goJoin: () => go('joinSpace'), finishOnboard: () => go('spaceSelect'), goLogin: () => go('login'), goSignupBack: () => go('signup'),
    linkSheetOpen: !!st.linkSheetOpen, openLinkSheet: () => setState({ linkSheetOpen: true }), closeLinkSheet: () => setState({ linkSheetOpen: false }),
    goHome: () => go('home'),
    goRecord: () => go('record'), // 기록 탭 (마지막 서브탭 유지)
    goGallery: () => go('gallery'),
    goMembers: () => navTo({ screen: 'members', membersFromLink: false }),
    goMembersDeep: () => navTo({ screen: 'members', membersFromLink: true }),
    // 문답 답변 남기기 (오늘의 질문에 대해)
    answerDraft: st.answerDraft ?? '',
    onAnswerInput: (text) => setState({ answerDraft: text }),
    openAnswer: () => setState({ answerOpen: true, answerDraft: '', editingAnswerId: null }),
    closeAnswer: () => setState({ answerOpen: false, editingAnswerId: null }),
    startEditAnswer: (ans) => setState({ answerOpen: true, answerDraft: ans.text, editingAnswerId: ans.id }),
    editingAnswer: !!st.editingAnswerId,
    submitAnswer,
    // 새 질문 내기
    questionOpen: !!st.questionOpen,
    questionDraft: st.questionDraft ?? '',
    onQuestionInput: (text) => setState({ questionDraft: text }),
    openQuestion: () => setState({ questionOpen: true, questionDraft: '' }),
    closeQuestion: () => setState({ questionOpen: false }),
    fillSuggestedQuestion: () => setState({ questionDraft: suggestQuestion() }),
    submitQuestion,
    goUpload: openUpload,
    // 새 일상 올리기 (사진·영상 여러 개가 글 하나)
    uploadCount: uploadPreview.length,
    // 순서 바꾸기는 새로 고른 사진에만 — 기존 사진은 그대로 앞에 남는다
    uploadFixedItems: uploadExisting,
    uploadDraggableItems: uploadPicked,
    reorderUpload: (from, to) => reorderUploadAsset(from, to),
    // 언제의 일인지 — 시작일(하루면 이것만), 며칠이면 끝나는 날
    uploadTakenFrom: st.uploadTakenFrom || null,
    uploadTakenTo: st.uploadTakenTo || null,
    uploadFromWheel: dateWheel(st.uploadTakenFrom),
    uploadToWheel: dateWheel(st.uploadTakenTo || st.uploadTakenFrom),
    addMediaDate, removeMediaDate, toggleMediaRange, setMediaDatePart,
    // 장소 — 구글 장소 검색으로 골라 붙인다
    uploadPlace: st.uploadPlace || null,
    placeSearchOpen: !!st.placeSearchOpen,
    placeQuery: st.placeQuery || '',
    placeSearching: !!st.placeSearching,
    placeError: st.placeError || null,
    placeLimited: !!st.placeLimited,
    placeResults: (st.placeResults || []).map((p) => ({ ...p, pick: () => pickPlace(p) })),
    openPlaceSearch, closePlaceSearch, onPlaceQuery, removePlace,
    uploadTitle: editingMedia ? '일상 수정하기' : '새 일상 올리기',
    // 여러 개를 한 개씩 올리므로 진행 상황을 버튼에 같이 보여준다
    uploadCta: st.uploadSaving
      ? (editingMedia ? '수정 중…' : '올리는 중…') +
        (st.uploadTotal > 1 ? ` ${st.uploadDone || 0}/${st.uploadTotal}` : '')
      : (editingMedia ? '수정하기' : '올리기'),
    uploadCaption: st.uploadCaption ?? '',
    uploadSaving: !!st.uploadSaving,
    uploadError: st.uploadError || null,
    pickUploadPhoto, onUploadCaption, submitUpload, editMedia,
    mediaLoading: !!st.mediaLoading,
    back,
  }
}
