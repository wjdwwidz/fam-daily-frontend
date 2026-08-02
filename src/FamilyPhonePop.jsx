import { View, ScrollView } from 'react-native'
import { s } from './lib/style.js'
import { Flower6 } from './components/Flower.jsx'
import Nav from './components/Nav.jsx'
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
import MoodHistory from './screens/MoodHistory.jsx'
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

// 셸: 현재 화면을 고르고, 배경·오버레이·네비를 얹는다.
// 상태/뷰모델은 각 화면이 useVm() 으로 직접 가져간다.
export default function FamilyPhonePop() {
  const vm = useVm()

  const Screen =
    vm.isLogin ? Login : vm.isAuth ? Auth : vm.isSpaceSelect ? SpaceSelect : vm.isSignup ? Signup : vm.isSpace ? Space : vm.isCreateSpace ? CreateSpace :
    vm.isJoinSpace ? JoinSpace : vm.isHome ? Home : vm.isRecord ? Record : vm.isWord ? Word :
    vm.isGallery ? Gallery : vm.isMedia ? Media : vm.isMoodHistory ? MoodHistory :
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
        <Screen />
      </ScrollView>

      {vm.linkSheetOpen && <LinkSheet />}
      {vm.answerOpen && <AnswerSheet />}
      {vm.questionOpen && <QuestionSheet />}
      {vm.addEventOpen && <AddEventSheet />}
      {vm.inviteOpen && <InviteSheet />}
      {vm.searchOpen && <SearchOverlay />}
      {vm.showNav && <Nav />}
      {vm.confirmOpen && <ConfirmDialog />}
    </View>
  )
}
