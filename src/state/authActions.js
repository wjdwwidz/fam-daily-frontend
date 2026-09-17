import { api, getToken, setToken, clearToken } from '../lib/api.js'
import { prepareImage, PROFILE_MAX_SIDE, PROFILE_QUALITY } from '../lib/image.js'
import * as ImagePicker from 'expo-image-picker'

// 인증 흐름 (로그인/가입/카카오/로그아웃). 공유 컨텍스트 {ref,setState,go} 주입.
export function createAuthActions({ ref, setState, go }) {
  // 내 가족 목록 새로 받기 (로그인 직후, 가족 전환 화면을 열 때).
  // 실패하면 들고 있던 목록을 그대로 둔다 — 전환 화면이 갑자기 비어 보이지 않게.
  const refreshGroups = async () => {
    try {
      const groups = await api.listGroups()
      setState({ groups, groupsLoading: false })
    } catch {
      setState((p) => ({ groups: p.groups || [], groupsLoading: false }))
    }
  }

  // 로그인 성공 후: 내 그룹 목록 로드 → 다음 화면으로
  const afterAuth = async () => {
    await refreshGroups()
    // 초대 링크로 들어왔으면 로그인 후 바로 참여(코드 입력) 화면으로
    const next = ref.current.authNext || 'spaceSelect'
    setState({ authNext: null })
    go(next)
  }

  const logout = async () => {
    await clearToken()
    // 지금 가족도 비운다. 남아 있으면 다시 로그인했을 때 가족 선택 화면이 '앱 안에서 연 것'으로 보인다.
    setState({ me: null, groups: [], currentGroup: null, moodPin: null })
    go('login')
  }

  // 회원 탈퇴 — 서버에서 계정이 지워진 뒤에만 토큰을 버린다. 실패하면 로그인 상태 그대로 둔다.
  const deleteAccount = async () => {
    setState({ accountDeleting: true, profileError: null })
    try {
      await api.deleteMe()
    } catch (e) {
      setState({ accountDeleting: false, profileError: e.message })
      return
    }
    setState({ accountDeleting: false })
    await logout()
  }

  // 카카오 로그인 — 앱은 카카오 SDK, 웹은 페이지 이동 방식. 취소면 token 이 null 로 온다.
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

  // 앱을 켤 때 저장된 토큰으로 로그인 상태를 되살린다.
  // 이게 없으면 폰이 앱을 완전히 종료할 때마다 카카오 로그인을 다시 해야 한다.
  // 토큰이 만료·무효(401)일 때만 지운다. 네트워크 오류에도 지우면 잠깐 끊겼다는 이유로 로그아웃된다.
  // 앱을 켤 때 한 번. 끝날 때까지(booting) 로그인 화면 대신 시작 화면이 보인다 —
  // 이미 로그인한 사람에게 로그인 화면이 번쩍이지 않게.
  const restoreSession = async () => {
    try {
      // 웹: 초대 링크로 들어왔으면 코드를 보관해 두고, 카카오 로그인에서 돌아왔으면 토큰부터 저장한다
      api.consumeWebJoinLink()
      await api.consumeWebAuthCallback()
      const token = await getToken()
      if (!token) return
      setState({ authLoading: true, authError: null })
      try {
        const me = await api.me()
        // 초대 링크로 들어온 사람은 로그인 뒤 코드가 채워진 참여 화면으로 보낸다
        const joinCode = api.takePendingJoinCode()
        setState({ authLoading: false, me, groupsLoading: true, ...(joinCode ? { joinCode, authNext: 'joinSpace' } : {}) })
        await afterAuth()
      } catch (e) {
        if (e.status === 401) await clearToken()
        setState({ authLoading: false, authError: e.status === 401 ? null : e.message })
      }
    } finally {
      // 토큰이 없든, 실패했든, 성공했든 확인은 끝났다
      setState({ booting: false })
    }
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
    const removePhoto = !pendingPhoto && cur.profilePhotoRemove // '사진 지우기'를 눌렀음
    const photoGid = cur.currentGroup?.id
    setState({ profileSaving: true, profileError: null })
    try {
      // 사진은 가족마다 따로 — 지금 가족의 내 사진만 바꾼다. 실패하면 저장 전체를 중단한다.
      // 업로드와 DB 기록을 서버가 한 요청으로 묶어주므로, 실패해도 고아 파일이 안 남는다.
      if (photoGid && (pendingPhoto || removePhoto)) {
        setState({ profilePhotoUploading: true })
        try {
          // 프로필은 아바타로만 보여서 작게(512px) 줄여 올린다
          const g = pendingPhoto
            ? await api.updateMyGroupPhoto(photoGid, await prepareImage(pendingPhoto, { maxSide: PROFILE_MAX_SIDE, quality: PROFILE_QUALITY }))
            : await api.deleteMyGroupPhoto(photoGid)
          const myPhotoUrl = (g.members || []).find((m) => m.userId === ref.current.me?.id)?.photoUrl ?? null
          setState((p) => ({
            groupMembers: g.members || [],
            currentGroup: { ...p.currentGroup, myPhotoUrl },
            groups: (p.groups || []).map((x) => (x.id === photoGid ? { ...x, myPhotoUrl } : x)),
          }))
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
      setState({ profileSaving: false, profileName: undefined, profileNickname: undefined, profileMood: undefined, profilePhoto: undefined, profilePhotoAsset: undefined, profilePhotoRemove: undefined })
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
        // 압축은 저장할 때 prepareImage 가 한 번만 한다
        quality: 1,
      })
      if (result.canceled || !result.assets || !result.assets[0]) return
      const asset = result.assets[0]
      setState({ profilePhoto: asset.uri, profilePhotoAsset: asset, profilePhotoRemove: undefined, profileError: null })
    } catch {}
  }

  return { afterAuth, refreshGroups, logout, deleteAccount, kakaoLogin, restoreSession, saveProfile, pickProfilePhoto }
}
