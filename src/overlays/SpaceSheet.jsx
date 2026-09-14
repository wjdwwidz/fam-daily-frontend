import { View, Text, Pressable, ScrollView, ActivityIndicator, Dimensions } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import SpaceCard from '../components/SpaceCard.jsx'

import { useVm } from '../vm/useVm.js'

// 가족 전환 시트. 하단 탭의 '홈'을 길게 누르면 열린다 (vm.openSpaceSheet).
// 가족이 많아도 시트가 화면을 다 덮지 않게 목록 높이를 제한하고 안에서 스크롤한다.
const LIST_MAX_HEIGHT = Math.round(Dimensions.get('window').height * 0.5)

export default function SpaceSheet() {
  const vm = useVm()
  const empty = !vm.groupsLoading && vm.mySpaces.length === 0
  return (
    <Pressable onPress={vm.closeSpaceSheet} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:45;display:flex;align-items:flex-end;animation:sfade .18s ease')}>
      <Pressable onPress={vm.stopEvt} style={s('width:100%;background:#FFF6FB;border-radius:26px 26px 0 0;padding:5xl 5xl 7xl;animation:sheetup .26s cubic-bezier(.4,0,.2,1)')}>
        <View style={s('width:40px;height:4px;border-radius:2px;background:#EADCE2;margin:0 auto 4xl')}></View>
        <View style={s('flex-direction:row;align-items:center;justify-content:space-between')}>
          <Text style={s('font-size:15.7px;font-weight:800;color:#17303B')}>가족 전환</Text>
          <Pressable onPress={vm.closeSpaceSheet} hitSlop={12} style={s('width:28px;height:28px;border-radius:9px;align-items:center;justify-content:center')}>
            <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#B7C3CC" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M6 6 L18 18" />
              <Path d="M18 6 L6 18" />
            </Svg>
          </Pressable>
        </View>
        <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:sm;margin-bottom:3xl')}>여러 가족 공간에 참여할 수 있어요</Text>

        {vm.groupsLoading && vm.mySpaces.length === 0 && (
          <View style={s('align-items:center;padding:4xl')}>
            <ActivityIndicator color="#FF5E8A" />
          </View>
        )}
        {empty && (
          <Text style={s('padding:3xl;text-align:center;color:#8497A1;font-size:12.5px')}>아직 참여 중인 가족 공간이 없어요</Text>
        )}

        <ScrollView style={{ maxHeight: LIST_MAX_HEIGHT }} showsVerticalScrollIndicator={false}>
          {vm.mySpaces.map((g, i) => (
            // 지금 가족을 누르면 시트만 닫는다
            <SpaceCard key={i} space={g} onPress={g.current ? vm.closeSpaceSheet : g.pick} />
          ))}
        </ScrollView>

        <View style={s('flex-direction:row;gap:btnGap;margin-top:sm')}>
          <Pressable onPress={vm.sheetGoCreate} style={s('flex:1;flex-direction:row;align-items:center;justify-content:center;gap:md;border:1.5px dashed #FFC4D8;border-radius:18px;padding:3xl 0;background:#fff')}>
            <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#FF5E8A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 5 V19" /><Path d="M5 12 H19" /></Svg>
            <Text style={s('font-size:13px;font-weight:700;color:#FF5E8A')}>새 가족 만들기</Text>
          </Pressable>
          <Pressable onPress={vm.sheetGoJoin} style={s('flex:1;flex-direction:row;align-items:center;justify-content:center;gap:md;border:1.5px dashed #C7E7F7;border-radius:18px;padding:3xl 0;background:#fff')}>
            <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#12B5F0" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M9.5 14.5 L14.5 9.5" /><Path d="M11 7.5 L12.7 5.8 A3.2 3.2 0 0 1 18.2 11.3 L16.5 13" /><Path d="M13 16.5 L11.3 18.2 A3.2 3.2 0 0 1 5.8 12.7 L7.5 11" /></Svg>
            <Text style={s('font-size:13px;font-weight:700;color:#12B5F0')}>링크로 참여하기</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  )
}
