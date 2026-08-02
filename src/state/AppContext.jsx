import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { createAuthActions } from './authActions.js'
import { createGroupActions } from './groupActions.js'
import { createWordActions } from './wordActions.js'
import { createQnaActions } from './qnaActions.js'

// 앱 전역 상태 + 네비게이션 + 도메인 액션을 담는 컨텍스트.
// 화면/오버레이는 useApp() 으로 필요한 것만 꺼내 쓴다.
const Ctx = createContext(null)

export function AppProvider({ initialScreen = 'login', variant = 'grid', children }) {
  const [st, setRaw] = useState({ screen: undefined, uploadType: 'photo', recordTab: 'dict' })
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
      const h = p._hist || []
      if (h.length) return { screen: h[h.length - 1], _hist: h.slice(0, -1) }
      // 히스토리가 없으면 화면별 기본 이전 화면으로 폴백
      const map = { word: 'dict', media: 'gallery', upload: 'home', members: 'home', moodhistory: 'home', qnahistory: 'qna', spaceSelect: 'login', space: 'spaceSelect', createSpace: 'space', joinSpace: 'space', signup: 'login' }
      return { screen: map[cur0(p)] || 'home' }
    })

  // 무드 링 자동 순환
  useEffect(() => {
    const t = setInterval(() => setState((s2) => ({ activeMood: (s2.activeMood ?? 0) + 1 })), 2600)
    return () => clearInterval(t)
  }, [])

  const core = { st, setState, ref, go, navTo }
  const auth = createAuthActions(core)
  const groups = createGroupActions(core, auth.afterAuth)
  const words = createWordActions(core)
  const qna = createQnaActions(core)

  const value = { ...core, back, initialScreen, variant, ...auth, ...groups, ...words, ...qna }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export const useApp = () => useContext(Ctx)
