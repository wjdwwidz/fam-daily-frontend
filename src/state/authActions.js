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

  const doSignup = async () => {
    const { authEmail, authPassword, authName } = ref.current
    if (!authEmail || !authPassword || !authName) {
      setState({ authError: '이메일·비밀번호·이름을 모두 입력하세요.' })
      return
    }
    setState({ authLoading: true, authError: null })
    try {
      const r = await api.signup(authEmail.trim(), authPassword, authName.trim())
      await setToken(r.accessToken)
      setState({ authLoading: false, me: r.user, groupsLoading: true })
      await afterAuth()
    } catch (e) {
      setState({ authLoading: false, authError: e.message })
    }
  }

  const doLogin = async () => {
    const { authEmail, authPassword } = ref.current
    if (!authEmail || !authPassword) {
      setState({ authError: '이메일·비밀번호를 입력하세요.' })
      return
    }
    setState({ authLoading: true, authError: null })
    try {
      const r = await api.login(authEmail.trim(), authPassword)
      await setToken(r.accessToken)
      setState({ authLoading: false, me: r.user, groupsLoading: true })
      await afterAuth()
    } catch (e) {
      setState({ authLoading: false, authError: e.message })
    }
  }

  const logout = async () => {
    await clearToken()
    setState({ me: null, groups: [], authEmail: '', authPassword: '', authName: '' })
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

  // 구글 등 아직 미연동 소셜 — 임시 데모 계정 로그인(테스트용)
  const socialLogin = async (provider) => {
    const email = provider === '카카오' ? 'kakao-demo@urikkiri.app' : 'google-demo@urikkiri.app'
    const password = 'demo-pass-1234'
    const name = `${provider} 사용자`
    setState({ authLoading: true, authError: null })
    try {
      let r
      try {
        r = await api.login(email, password)
      } catch {
        r = await api.signup(email, password, name)
      }
      await setToken(r.accessToken)
      setState({ authLoading: false, me: r.user, groupsLoading: true })
      await afterAuth()
    } catch (e) {
      setState({ authLoading: false, authError: e.message })
    }
  }

  return { afterAuth, doSignup, doLogin, logout, kakaoLogin, socialLogin }
}
