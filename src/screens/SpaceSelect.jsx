import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import mascot from '../../assets/img/mascot.png'

import { useVm } from '../vm/useVm.js'

export default function SpaceSelect() {
  const vm = useVm()
  const empty = !vm.groupsLoading && vm.mySpaces.length === 0
  return (
    <View style={s('flex:1;padding:3xl 6xl 6xl')}>
      <Pressable onPress={vm.logout} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);align-items:center;justify-content:center;margin-bottom:2xl')}>
        <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#17303B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
      </Pressable>
      <View style={s('flex-direction:row;align-items:center;gap:xl;margin-bottom:sm')}>
        <Image source={mascot} style={{ width: 46, height: 61 }} resizeMode="contain" />
        <Text style={s('font-size:26px;font-weight:800;color:#17303B;letter-spacing:-0.5px;line-height:1.25')}>어느 가족으로{'\n'}들어갈까요?</Text>
      </View>
      <Text style={s('font-size:14px;color:#6A7E88;margin-top:sm;margin-bottom:6xl')}>여러 가족 공간에 참여할 수 있어요</Text>

      {vm.groupsLoading && (
        <View style={s('align-items:center;padding:7xl')}>
          <ActivityIndicator color="#FF5E8A" />
          <Text style={s('font-size:13px;color:#9DB2BD;margin-top:lg')}>가족 공간 불러오는 중…</Text>
        </View>
      )}

      {empty && (
        <View style={s('align-items:center;padding:6xl lg 7xl')}>
          <Text style={s('font-size:14px;color:#8497A1;text-align:center;line-height:1.6')}>아직 참여 중인 가족 공간이 없어요.{'\n'}새로 만들거나 초대 코드로 참여해보세요</Text>
        </View>
      )}

      {vm.mySpaces.map((g, i) => (
        <Pressable key={i} onPress={g.pick} style={s('flex-direction:row;align-items:center;gap:2xl;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:22px;padding:3xl 4xl;margin-bottom:xl')}>
          <View style={s('flex-direction:row')}>
            {g.avatars.slice(0, 4).map((a, j) => (
              <View key={j} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', backgroundColor: a.c, marginLeft: j === 0 ? 0 : -11 }}>
                <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>{a.i}</Text>
              </View>
            ))}
          </View>
          <View style={s('flex:1;min-width:0')}>
            <Text style={s('font-size:15.5px;font-weight:800;color:#17303B')}>{g.name}</Text>
            <Text style={s('font-size:12px;color:#9DB2BD;margin-top:hair')}>{g.sub}</Text>
          </View>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M9 6 L15 12 L9 18" /></Svg>
        </Pressable>
      ))}

      <View style={s('flex-direction:column;gap:lg;margin-top:xs')}>
        <Pressable onPress={vm.goCreate} style={s('flex-direction:row;align-items:center;justify-content:center;gap:lg;border:1.5px dashed #FFC4D8;border-radius:20px;padding:4xl;background:#FFF6FA')}>
          <Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke="#FF5E8A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 5 V19" /><Path d="M5 12 H19" /></Svg>
          <Text style={s('font-size:14px;font-weight:700;color:#FF5E8A')}>새 가족 만들기</Text>
        </Pressable>
        <Pressable onPress={vm.goJoin} style={s('flex-direction:row;align-items:center;justify-content:center;gap:lg;border:1.5px dashed #C7E7F7;border-radius:20px;padding:4xl;background:#F3FAFE')}>
          <Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke="#12B5F0" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M9.5 14.5 L14.5 9.5" /><Path d="M11 7.5 L12.7 5.8 A3.2 3.2 0 0 1 18.2 11.3 L16.5 13" /><Path d="M13 16.5 L11.3 18.2 A3.2 3.2 0 0 1 5.8 12.7 L7.5 11" /></Svg>
          <Text style={s('font-size:14px;font-weight:700;color:#12B5F0')}>링크로 참여하기</Text>
        </Pressable>
      </View>
    </View>
  )
}
