import { View, Text, Image, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import mascot from '../../assets/img/mascot.png'

export default function SpaceSelect({ vm }) {
  return (
    <View style={s('flex:1;padding:36px 24px 24px')}>
      <View style={s('flex-direction:row;align-items:center;gap:12px;margin-bottom:6px')}>
        <Image source={mascot} style={{ width: 46, height: 61 }} resizeMode="contain" />
        <Text style={s('font-size:26px;font-weight:800;color:#17303B;letter-spacing:-0.5px;line-height:1.25')}>어느 가족으로{'\n'}들어갈까요?</Text>
      </View>
      <Text style={s('font-size:14px;color:#6A7E88;margin-top:6px;margin-bottom:24px')}>여러 가족 공간에 참여 중이에요 💛</Text>

      {vm.mySpaces.map((g, i) => (
        <Pressable key={i} onPress={g.pick} style={s('flex-direction:row;align-items:center;gap:14px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:22px;padding:16px 18px;margin-bottom:12px')}>
          <View style={s('flex-direction:row')}>
            {g.avatars.slice(0, 4).map((a, j) => (
              <View key={j} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', backgroundColor: a.c, marginLeft: j === 0 ? 0 : -11 }}>
                <Text style={{ color: '#fff', fontSize: 12.5, fontWeight: '700' }}>{a.i}</Text>
              </View>
            ))}
          </View>
          <View style={s('flex:1;min-width:0')}>
            <Text style={s('font-size:15.5px;font-weight:800;color:#17303B')}>{g.name}</Text>
            <Text style={s('font-size:12px;color:#9DB2BD;margin-top:2px')}>{g.sub}</Text>
          </View>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M9 6 L15 12 L9 18" /></Svg>
        </Pressable>
      ))}

      <Pressable onPress={vm.goSpace} style={s('flex-direction:row;align-items:center;justify-content:center;gap:8px;border:1.5px dashed #C7E7F7;border-radius:22px;padding:17px;margin-top:4px;background:#F3FAFE')}>
        <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#12B5F0" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Path d="M12 5 V19" /><Path d="M5 12 H19" /></Svg>
        <Text style={s('font-size:14px;font-weight:700;color:#12B5F0')}>새 가족 공간 만들기 · 참여하기</Text>
      </Pressable>
    </View>
  )
}
