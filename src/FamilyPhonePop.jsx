import { useEffect } from 'react'
import { View, ScrollView, Platform } from 'react-native'
import { s } from './lib/style.js'
import { Flower6 } from './components/Flower.jsx'
import Nav from './components/Nav.jsx'
import ScreenTransition from './components/ScreenTransition.jsx'
import { useVm } from './vm/useVm.js'
import Login from './screens/Login.jsx'
import Auth from './screens/Auth.jsx'
import SpaceSelect from './screens/SpaceSelect.jsx'
import Signup from './screens/Signup.jsx'
import Space from './screens/Space.jsx'
import CreateSpace from './screens/CreateSpace.jsx'
import JoinSpace from './screens/JoinSpace.jsx'
import Home from './screens/Home.jsx'
import Record from './screens/Record.jsx'
import Word from './screens/Word.jsx'
import Gallery from './screens/Gallery.jsx'
import Media from './screens/Media.jsx'
import QnaHistory from './screens/QnaHistory.jsx'
import Upload from './screens/Upload.jsx'
import Members from './screens/Members.jsx'
import Profile from './screens/Profile.jsx'
import LinkSheet from './overlays/LinkSheet.jsx'
import AnswerSheet from './overlays/AnswerSheet.jsx'
import QuestionSheet from './overlays/QuestionSheet.jsx'
import AddEventSheet from './overlays/AddEventSheet.jsx'
import InviteSheet from './overlays/InviteSheet.jsx'
import SearchOverlay from './overlays/SearchOverlay.jsx'
import ConfirmDialog from './overlays/ConfirmDialog.jsx'
import Toast from './overlays/Toast.jsx'
import PhotoViewer from './overlays/PhotoViewer.jsx'
import SpaceSheet from './overlays/SpaceSheet.jsx'

// 셸: 현재 화면을 고르고, 배경·오버레이·네비를 얹는다.
// 상태/뷰모델은 각 화면이 useVm() 으로 직접 가져간다.
export default function FamilyPhonePop() {
  const vm = useVm()

  // 웹: 일상을 뒤에서 올리는 중에 탭을 닫거나 새로고침하면 한 번 확인한다
  // (닫으면 그 글은 올라가지 않는다)
  const uploading = vm.uploadingCount > 0
  useEffect(() => {
    if (Platform.OS !== 'web' || !uploading) return
    const onBeforeUnload = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [uploading])

  const Screen =
    vm.isLogin ? Login : vm.isAuth ? Auth : vm.isSpaceSelect ? SpaceSelect : vm.isSignup ? Signup : vm.isSpace ? Space : vm.isCreateSpace ? CreateSpace :
    vm.isJoinSpace ? JoinSpace : vm.isHome ? Home : vm.isRecord ? Record : vm.isWord ? Word :
    vm.isGallery ? Gallery : vm.isMedia ? Media :
    vm.isQnaHistory ? QnaHistory : vm.isUpload ? Upload :
    vm.isMembers ? Members : vm.isProfile ? Profile : Login

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF6FB', overflow: 'hidden' }}>
      <View pointerEvents="none" style={s('position:absolute;inset:0;overflow:hidden')}>
        <View style={[s('position:absolute;top:52px;right:-26px;opacity:0.1'), { transform: [{ rotate: '12deg' }] }]}><Flower6 size={116} petal="#FF9EBB" center="#FFD36E" /></View>
        <View style={[s('position:absolute;top:326px;left:-32px;opacity:0.08'), { transform: [{ rotate: '-14deg' }] }]}><Flower6 size={132} petal="#C6A8FF" center="#FFD36E" /></View>
        <View style={[s('position:absolute;bottom:52px;right:-22px;opacity:0.09'), { transform: [{ rotate: '20deg' }] }]}><Flower6 size={122} petal="#FFB38A" center="#FFD36E" /></View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ScreenTransition screenKey={vm.screen}>
          <Screen />
        </ScreenTransition>
      </ScrollView>

      {vm.linkSheetOpen && <LinkSheet />}
      {vm.answerOpen && <AnswerSheet />}
      {vm.questionOpen && <QuestionSheet />}
      {vm.addEventOpen && <AddEventSheet />}
      {vm.inviteOpen && <InviteSheet />}
      {vm.searchOpen && <SearchOverlay />}
      {vm.showNav && <Nav />}
      {vm.spaceSheetOpen && <SpaceSheet />}
      {vm.confirmOpen && <ConfirmDialog />}
      {vm.photoViewerOpen && <PhotoViewer />}
      {!!vm.toast && <Toast />}
    </View>
  )
}
