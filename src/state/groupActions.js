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

  return { doCreateGroup, doJoinGroup }
}
