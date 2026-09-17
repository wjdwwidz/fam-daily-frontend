import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createAuthActions } from './authActions.js'
import { createGroupActions } from './groupActions.js'
import { createWordActions } from './wordActions.js'
import { createQnaActions } from './qnaActions.js'
import { createMediaActions } from './mediaActions.js'

// 앱 전역 상태 + 네비게이션 + 도메인 액션을 담는 컨텍스트.
// 화면/오버레이는 useApp() 으로 필요한 것만 꺼내 쓴다.
const Ctx = createContext(null)

export function AppProvider({ initialScreen = 'login', variant = 'grid', children }) {
  // booting: 저장된 로그인을 확인하는 동안 true. 그동안은 로그인 화면 대신 시작 화면을 보여준다.
  const [st, setRaw] = useState({ screen: undefined, booting: true, uploadType: 'photo', recordTab: 'dict' })
  const ref = useRef(st)
  ref.current = st
  const setState = (patch) =>
    setRaw((prev) => ({ ...prev, ...(typeof patch === 'function' ? patch(prev) : patch) }))

  // 뒤로가기 히스토리 스택
  const cur0 = (p) => p.screen || initialScreen || 'login'
  const go = (sc) => setState((p) => (sc === cur0(p) ? {} : { screen: sc, _hist: [...(p._hist || []), cur0(p)] }))
  const navTo = (patch) => setState((p) => ({ ...patch, _hist: [...(p._hist || []), cur0(p)] }))
  const back = () =>
    setState((p) => {
      const onWord = cur0(p) === 'word'
      // 기존 단어를 수정하던 중이면 화면을 떠나지 않고 수정만 끝낸다 (상세 보기로)
      if (onWord && p.editPost === 'word' && p.word?.id) return { editPost: null, wordError: null }
      // 사전 화면을 떠날 때는 수정 상태를 비운다. 남겨두면 다음에 여는 단어가 빈 수정 화면으로 뜬다.
      const leaveWord = onWord ? { editPost: null, wordError: null } : {}
      const h = p._hist || []
      if (h.length) return { screen: h[h.length - 1], _hist: h.slice(0, -1), ...leaveWord }
      // 히스토리가 없으면 화면별 기본 이전 화면으로 폴백
      // 사전/문답은 '기록' 탭으로 병합됨 — 옛 화면명('dict','qna')으로 보내면 라우팅에서 떨어진다
      const map = { word: 'record', media: 'gallery', upload: 'home', members: 'home', qnahistory: 'record', spaceSelect: 'login', space: 'spaceSelect', createSpace: 'space', joinSpace: 'space', signup: 'login' }
      return { screen: map[cur0(p)] || 'home', ...leaveWord }
    })

  // 무드 링 자동 순환 — 홈에서 프로필을 눌러 고정해두면(moodPin) 멈춘다.
  // 고정 중에는 타이머 자체를 걸지 않아, 풀면 그 자리에서 다시 돈다.
  useEffect(() => {
    if (st.moodPin != null) return
    const t = setInterval(() => setState((s2) => ({ activeMood: (s2.activeMood ?? 0) + 1 })), 2600)
    return () => clearInterval(t)
  }, [st.moodPin])

  // 하단 알림 — 잠시 뒤 자동으로 사라진다. 그 사이 다른 알림이 떴으면 건드리지 않는다.
  const showToast = (text, ms = 2200) => {
    setState({ toast: text })
    setTimeout(() => setState((p) => (p.toast === text ? { toast: null } : {})), ms)
  }

  const core = { st, setState, ref, go, navTo, back, showToast }
  const auth = createAuthActions(core)
  const groups = createGroupActions(core, auth.afterAuth)
  const words = createWordActions(core)
  const qna = createQnaActions(core)
  const media = createMediaActions(core)

  // 앱을 켤 때 한 번: 저장된 로그인 되살리기 (로그인 화면은 확인하는 동안 로딩만 보여준다)
  useEffect(() => {
    auth.restoreSession()
  }, [])

  const value = { ...core, back, initialScreen, variant, ...auth, ...groups, ...words, ...qna, ...media }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
