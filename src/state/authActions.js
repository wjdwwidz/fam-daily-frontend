import { api, setToken, clearToken } from '../lib/api.js'

// 인증 흐름 (로그인/가입/카카오/로그아웃). 공유 컨텍스트 {ref,setState,go} 주입.
export function createAuthActions({ ref, setState, go }) {
  // 로그인 성공 후: 내 그룹 목록 로드 → 다음 화면으로
  const afterAuth = async () => {
    try {
      const groups = await api.listGroups()
      setState({ groups, groupsLoading: false })
    } catch {
      setState({ groups: [], groupsLoading: false })
    }
    // 초대 링크로 들어왔으면 로그인 후 바로 참여(코드 입력) 화면으로
    const next = ref.current.authNext || 'spaceSelect'
    setState({ authNext: null })
    go(next)
  }

  const logout = async () => {
    await clearToken()
    setState({ me: null, groups: [] })
    go('login')
  }

  // 카카오 로그인 (실제 OAuth) — 인앱 브라우저 → 백엔드 → 딥링크로 토큰 수신
  const kakaoLogin = async () => {
    setState({ authLoading: true, authError: null })
    try {
      const token = await api.kakaoLogin()
      if (!token) {
        setState({ authLoading: false })
        return
      }
      const me = await api.me()
      setState({ authLoading: false, me, groupsLoading: true })
      await afterAuth()
    } catch (e) {
      setState({ authLoading: false, authError: e.message })
    }
  }

  // 구글 로그인 — 아직 미연동. 실제 구글 OAuth 붙이기 전까지 임시 안내만.
  const googleLogin = async () => {
    setState({ authError: '구글 로그인은 아직 준비 중이에요. 카카오로 시작해주세요.' })
  }

  // 프로필 저장: 이름(User) + 가족 내 호칭(Membership). 바뀐 것만 호출.
  const saveProfile = async () => {
    const cur = ref.current
    const name = (cur.profileName ?? cur.me?.name ?? '').trim()
    const nickname = (cur.profileNickname ?? cur.currentGroup?.myNickname ?? '').trim()
    if (!name || !nickname) {
      setState({ profileError: '이름과 호칭을 입력해주세요.' })
      return
    }
    setState({ profileSaving: true, profileError: null })
    try {
      if (name !== cur.me?.name) {
        const me = await api.updateMe(name)
        setState({ me })
      }
      const gid = cur.currentGroup?.id
      if (gid && nickname !== cur.currentGroup?.myNickname) {
        await api.updateMyNickname(gid, nickname)
        setState((p) => ({ currentGroup: { ...p.currentGroup, myNickname: nickname } }))
        try {
          const g = await api.getGroup(gid)
          setState({ groupMembers: g.members || [] })
        } catch {}
      }
      setState({ profileSaving: false, profileName: undefined, profileNickname: undefined })
      go('members')
    } catch (e) {
      setState({ profileSaving: false, profileError: e.message })
    }
  }

  return { afterAuth, logout, kakaoLogin, googleLogin, saveProfile }
}
