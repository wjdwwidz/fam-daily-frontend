import { useEffect, useRef } from 'react'
import { View, ScrollView, Platform, BackHandler, RefreshControl } from 'react-native'
import { s } from './lib/style.js'
import { Flower6 } from './components/Flower.jsx'
import Nav from './components/Nav.jsx'
import SwipeBack from './components/SwipeBack.jsx'
import PullToRefresh from './components/PullToRefresh.jsx'
import ScreenTransition from './components/ScreenTransition.jsx'
import { useVm } from './vm/useVm.js'
import Login from './screens/Login.jsx'
import Splash from './screens/Splash.jsx'
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
import MoodHistory from './screens/MoodHistory.jsx'
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

  // 당겨서 새로고침은 스크롤이 맨 위일 때만 (웹 제스처 판단용)
  const canRefresh = vm.canRefresh
  const atTopRef = useRef(true)

  // 안드로이드 기기 뒤로가기(제스처·버튼): 앱을 닫지 말고 이전 화면으로.
  // 뒤로 갈 곳이 없으면 false 를 돌려줘 원래대로(앱 종료) 둔다.
  const canGoBack = vm.canGoBack
  useEffect(() => {
    if (Platform.OS === 'web') return
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!canGoBack) return false
      vm.back()
      return true
    })
    return () => sub.remove()
  }, [canGoBack])

  const Screen =
    vm.isLogin ? Login : vm.isAuth ? Auth : vm.isSpaceSelect ? SpaceSelect : vm.isSignup ? Signup : vm.isSpace ? Space : vm.isCreateSpace ? CreateSpace :
    vm.isJoinSpace ? JoinSpace : vm.isHome ? Home : vm.isRecord ? Record : vm.isWord ? Word :
    vm.isGallery ? Gallery : vm.isMedia ? Media :
    vm.isQnaHistory ? QnaHistory : vm.isMoodHistory ? MoodHistory : vm.isUpload ? Upload :
    vm.isMembers ? Members : vm.isProfile ? Profile : Login

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF6FB', overflow: 'hidden' }}>
      <View pointerEvents="none" style={s('position:absolute;inset:0;overflow:hidden')}>
        <View style={[s('position:absolute;top:52px;right:-26px;opacity:0.1'), { transform: [{ rotate: '12deg' }] }]}><Flower6 size={116} petal="#FF9EBB" center="#FFD36E" /></View>
        <View style={[s('position:absolute;top:326px;left:-32px;opacity:0.08'), { transform: [{ rotate: '-14deg' }] }]}><Flower6 size={132} petal="#C6A8FF" center="#FFD36E" /></View>
        <View style={[s('position:absolute;bottom:52px;right:-22px;opacity:0.09'), { transform: [{ rotate: '20deg' }] }]}><Flower6 size={122} petal="#FFB38A" center="#FFD36E" /></View>
      </View>

      {/* 왼쪽 가장자리에서 밀면 뒤로가기 (뒤로 갈 곳이 있을 때만) */}
      <SwipeBack enabled={canGoBack} onBack={vm.back}>
        {/* 아래로 당겨서 새로고침 — 웹은 PullToRefresh 가, 네이티브는 RefreshControl 이 처리 */}
        <PullToRefresh enabled={canRefresh} refreshing={vm.refreshing} onRefresh={vm.refresh} atTopRef={atTopRef}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={(e) => { atTopRef.current = e.nativeEvent.contentOffset.y <= 0 }}
            refreshControl={
              Platform.OS === 'web' || !canRefresh
                ? undefined
                : <RefreshControl refreshing={vm.refreshing} onRefresh={vm.refresh} tintColor="#FF5E8A" colors={['#FF5E8A']} />
            }
          >
            {/* 저장된 로그인을 확인하는 동안에는 시작 화면 — 로그인 화면이 번쩍이지 않게 */}
            <ScreenTransition screenKey={vm.booting ? 'splash' : vm.screen}>
              {vm.booting ? <Splash /> : <Screen />}
            </ScreenTransition>
          </ScrollView>
        </PullToRefresh>
      </SwipeBack>

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
