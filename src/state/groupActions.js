import { api } from '../lib/api.js'

// 그룹 만들기/참여. afterAuth 는 성공 후 그룹 목록을 다시 불러오려고 주입받음.
export function createGroupActions({ ref, setState }, afterAuth) {
  const doCreateGroup = async () => {
    const name = (ref.current.createName || '').trim()
    const nickname = (ref.current.createNickname || '').trim()
    if (!name || !nickname) {
      setState({ createNameErr: !name, createNickErr: !nickname })
      return
    }
    setState({ actionLoading: true, actionError: null, createNameErr: false, createNickErr: false })
    try {
      await api.createGroup(name, nickname)
      setState({ actionLoading: false, createName: '', createNickname: '' })
      await afterAuth()
    } catch (e) {
      setState({ actionLoading: false, actionError: e.message })
    }
  }

  const doJoinGroup = async () => {
    let code = (ref.current.joinCode || '').trim()
    if (code.includes('/')) code = code.split('/').pop()
    const nickname = (ref.current.joinNickname || '').trim()
    if (!code || !nickname) {
      setState({ joinCodeErr: !code, joinNickErr: !nickname })
      return
    }
    setState({ actionLoading: true, actionError: null, joinCodeErr: false, joinNickErr: false })
    try {
      await api.joinGroup(code, nickname)
      setState({ actionLoading: false, joinCode: '', joinNickname: '' })
      await afterAuth()
    } catch (e) {
      setState({ actionLoading: false, actionError: e.message })
    }
  }

  // 현재 그룹의 실제 구성원 로드 (userId·호칭·역할 포함) — 홈 링/멤버 화면용
  const loadMembers = async (groupId) => {
    if (!groupId) return
    try {
      const g = await api.getGroup(groupId)
      setState({ groupMembers: g.members || [] })
    } catch {
      setState({ groupMembers: [] })
    }
  }

  // 그룹(가족) 이름 저장 — 편집 중인 draft 를 서버에 반영 + 로컬 상태 갱신
  const saveGroupName = async () => {
    const cur = ref.current
    const gid = cur.currentGroup?.id
    const nm = (cur.groupNameDraft ?? '').trim()
    if (!gid || !nm) { setState({ groupNameError: '가족 이름을 입력해주세요.' }); return }
    setState({ groupNameSaving: true, groupNameError: null })
    try {
      await api.updateGroupName(gid, nm)
      setState((p) => ({
        groupNameSaving: false,
        editingGroupName: false,
        currentGroup: { ...p.currentGroup, name: nm },
        groups: (p.groups || []).map((g) => (g.id === gid ? { ...g, name: nm } : g)),
      }))
    } catch (e) {
      setState({ groupNameSaving: false, groupNameError: e.message })
    }
  }
  const cancelEditGroupName = () => setState({ editingGroupName: false, groupNameError: null })

  // 홈 '최근 활동' 불러오기. 실패하면 들고 있던 목록을 그대로 둔다.
  const loadActivity = async (groupId) => {
    if (!groupId) return
    setState({ activityLoading: true })
    try {
      const list = await api.groupActivity(groupId, 5)
      // 불러오는 사이 다른 가족으로 전환했으면 이 결과는 버린다
      if (ref.current.currentGroup?.id !== groupId) {
        setState({ activityLoading: false })
        return
      }
      setState({ groupActivity: list, activityLoading: false })
    } catch {
      setState({ activityLoading: false })
    }
  }

  // 가족 공간 삭제(방장만) → 이 가족의 화면 상태를 비우고 가족 선택 화면으로.
  // 뒤로가기로 지운 가족 화면에 돌아가지 않게 히스토리도 비운다.
  const deleteGroup = async () => {
    const gid = ref.current.currentGroup?.id
    if (!gid) return
    setState({ groupDeleting: true, groupDeleteError: null })
    try {
      await api.deleteGroup(gid)
      setState((p) => ({
        groupDeleting: false,
        currentGroup: null, groupMembers: null, groupWords: [], qnaCurrent: null, qnaList: null, groupMedia: [],
        word: null, media: null, menuOpen: null, galleryFilter: 'all', photoViewer: null, spaceSheetOpen: false, groupActivity: [],
        groups: (p.groups || []).filter((g) => g.id !== gid),
        screen: 'spaceSelect', _hist: [],
      }))
      await afterAuth() // 목록을 서버에서 다시 받는다 (이미 가족 선택 화면이라 이동은 없음)
    } catch (e) {
      setState({ groupDeleting: false, groupDeleteError: e.message })
    }
  }

  // 오늘의 한마디(무드) 저장 → 멤버 목록 갱신
  const sendMood = async () => {
    const cur = ref.current
    const gid = cur.currentGroup?.id
    const text = (cur.myMood ?? '').trim()
    if (!gid || !text) return
    setState({ moodSending: true, moodError: null })
    try {
      const g = await api.setMood(gid, text)
      // 전송 완료 → 입력란은 비운다. 내 무드 표시는 서버에서 갱신된 m.mood 로 유지됨.
      setState({ moodSending: false, myMoodSent: true, myMood: '', groupMembers: g.members || [] })
    } catch (e) {
      setState({ moodSending: false, moodError: e.message })
    }
  }

  // 초대 시트 열기 = 초대 코드 생성 (백엔드)
  const openInvite = async () => {
    const gid = ref.current.currentGroup?.id
    if (!gid) return
    setState({ inviteOpen: true, inviteLoading: true, inviteCode: null, inviteLink: null, inviteError: null, inviteCopied: false })
    try {
      const res = await api.createInvite(gid) // { code, link, expiresAt } — link 는 웹 주소가 설정된 경우에만
      setState({ inviteLoading: false, inviteCode: res.code, inviteLink: res.link || null })
    } catch (e) {
      setState({ inviteLoading: false, inviteError: e.message })
    }
  }

  return { doCreateGroup, doJoinGroup, loadMembers, saveGroupName, cancelEditGroupName, deleteGroup, loadActivity, sendMood, openInvite }
}
