import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from './Avatar.jsx'

// 가족 공간 카드 한 줄 — 가족 선택 화면과 가족 전환 시트가 같이 쓴다.
// space: vm.mySpaces 의 한 항목 { name, sub, avatars, current }
export default function SpaceCard({ space, onPress }) {
  return (
    <Pressable onPress={onPress} style={s('flex-direction:row;align-items:center;gap:2xl;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:22px;padding:3xl 4xl;margin-bottom:btnGap')}>
      <View style={s('flex-direction:row')}>
        {space.avatars.slice(0, 4).map((a, j) => (
          <Avatar key={j} photoUrl={a.photoUrl} ini={a.i} size={36} style={{ borderWidth: 2, borderColor: '#fff', marginLeft: j === 0 ? 0 : -11 }} />
        ))}
      </View>
      <View style={s('flex:1;min-width:0')}>
        <View style={s('flex-direction:row;align-items:center;gap:md')}>
          <Text style={s('font-size:15.5px;font-weight:800;color:#17303B;flex-shrink:1')} numberOfLines={1}>{space.name}</Text>
          {space.current && (
            <View style={s('background:#FFF0F5;border-radius:999px;padding:hair md')}>
              <Text style={s('font-size:10.5px;font-weight:800;color:#FF5E8A')}>지금</Text>
            </View>
          )}
        </View>
        <Text style={s('font-size:12px;color:#9DB2BD;margin-top:hair')}>{space.sub}</Text>
      </View>
      <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M9 6 L15 12 L9 18" /></Svg>
    </Pressable>
  )
}
