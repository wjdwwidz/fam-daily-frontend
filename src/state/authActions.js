import { api, setToken, clearToken } from '../lib/api.js'
import * as ImagePicker from 'expo-image-picker'

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
    const mood = cur.profileMood // undefined면 안 건드린 것
    if (!name || !nickname) {
      setState({ profileError: '이름과 호칭을 입력해주세요.' })
      return
    }
    const pendingPhoto = cur.profilePhotoAsset // 고르기만 하고 아직 안 올린 사진
    setState({ profileSaving: true, profileError: null })
    try {
      // 사진은 여기서 처음 서버로 올라간다. 실패하면 저장 전체를 중단한다.
      // 업로드와 DB 기록을 서버가 한 요청으로 묶어주므로, 실패해도 고아 파일이 안 남는다.
      if (pendingPhoto) {
        setState({ profilePhotoUploading: true })
        try {
          const me = await api.updateMyPhoto(pendingPhoto)
          setState({ me })
        } finally {
          setState({ profilePhotoUploading: false })
        }
      }
      if (name !== ref.current.me?.name) {
        const me = await api.updateMe({ name })
        setState({ me })
      }
      const gid = cur.currentGroup?.id
      let groupChanged = false
      if (gid && nickname !== cur.currentGroup?.myNickname) {
        await api.updateMyNickname(gid, nickname)
        setState((p) => ({ currentGroup: { ...p.currentGroup, myNickname: nickname } }))
        groupChanged = true
      }
      // 오늘의 한마디: 편집했고(undefined 아님) 내용이 있으면 저장
      if (gid && mood !== undefined && mood.trim()) {
        await api.setMood(gid, mood.trim())
        groupChanged = true
      }
      if (groupChanged) {
        try {
          const g = await api.getGroup(gid)
          setState({ groupMembers: g.members || [] })
        } catch {}
      }
      setState({ profileSaving: false, profileName: undefined, profileNickname: undefined, profileMood: undefined, profilePhoto: undefined, profilePhotoAsset: undefined })
      go('members')
    } catch (e) {
      setState({ profileSaving: false, profileError: e.message })
    }
  }

  // 프로필 사진 선택 — 기기 안의 파일로 미리보기만 하고, 고른 asset 을 들고 있는다.
  // 실제 업로드는 저장할 때(saveProfile). 고르기만 하고 저장 안 하면 서버엔 아무것도 안 남는다.
  const pickProfilePhoto = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (perm.status !== 'granted') return
      const result = await ImagePicker.launchImageLibraryAsync({
        // 배열 형태가 현재 API. MediaTypeOptions 는 deprecated.
        mediaTypes: ['images'],
        // 한 장만 쓴다(assets[0]). 기본값 selectionLimit:0 은 '시스템 최대치'라
        // 사진첩이 다중 선택으로 열리고, 탭하면 체크만 될 뿐 확정 버튼을 따로 눌러야 한다.
        allowsMultipleSelection: false,
        selectionLimit: 1,
        quality: 0.7,
      })
      if (result.canceled || !result.assets || !result.assets[0]) return
      const asset = result.assets[0]
      setState({ profilePhoto: asset.uri, profilePhotoAsset: asset, profileError: null })
    } catch {}
  }

  return { afterAuth, logout, kakaoLogin, googleLogin, saveProfile, pickProfilePhoto }
}
