import { View, Text, Image, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import onboarding from '../../assets/img/onboarding.png'

import { useVm } from '../vm/useVm.js'

export default function Space() {
  const vm = useVm()
  return (
    <View style={s('min-height:768px;display:flex;flex-direction:column;padding:72px 7xl 8xl;background:#FFF6FB;position:relative')}>
      <Pressable onPress={vm.back} style={s('position:absolute;top:18px;left:18px;width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
        <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B">
          <Path d="M14.5 5 L7.5 12 L14.5 19" />
        </Svg>
      </Pressable>
      <Image source={onboarding} style={{ width: 104, height: 82, marginBottom: 14 }} resizeMode="cover" />
      <Text style={s('font-size:24px;font-weight:600;color:#17303B;letter-spacing:-0.5px;line-height:1.35')}>가족 공간을{'\n'}만들어볼까요?</Text>
      <Text style={s('font-size:13px;color:#6A7E88;margin-top:lg')}>새로 만들거나, 초대받은 가족방에 참여하세요</Text>
      <View style={s('display:flex;flex-direction:column;gap:btnGap;margin-top:7xl')}>
        <Pressable onPress={vm.goCreate} style={s('display:flex;align-items:center;gap:2xl;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:22px;padding:4xl 4xl;cursor:pointer')}>
          <View style={s('width:48px;height:48px;border-radius:15px;background:#FFF0F5;display:flex;align-items:center;justify-content:center;color:#FF5E8A;flex:0 0 auto')}>
            <Svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#FF5E8A">
              <Path d="M4 11 L12 4 L20 11" />
              <Path d="M6 10 V19 H18 V10" />
              <Path d="M12 19 V14" />
              <Path d="M10 16 H14" />
            </Svg>
          </View>
          <View style={s('flex:1')}>
            <Text style={s('font-size:15px;font-weight:800;color:#17303B')}>새 가족 공간 만들기</Text>
            <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:hair')}>우리 가족의 첫 공간을 열어요</Text>
          </View>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 6 L15 12 L9 18" />
          </Svg>
        </Pressable>
        <Pressable onPress={vm.goJoin} style={s('display:flex;align-items:center;gap:2xl;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:22px;padding:4xl 4xl;cursor:pointer')}>
          <View style={s('width:48px;height:48px;border-radius:15px;background:#F3FAFE;display:flex;align-items:center;justify-content:center;color:#12B5F0;flex:0 0 auto')}>
            <Svg viewBox="0 0 24 24" width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#12B5F0">
              <Path d="M9.5 14.5 L14.5 9.5" />
              <Path d="M11 7.5 L12.7 5.8 A3.2 3.2 0 0 1 18.2 11.3 L16.5 13" />
              <Path d="M13 16.5 L11.3 18.2 A3.2 3.2 0 0 1 5.8 12.7 L7.5 11" />
            </Svg>
          </View>
          <View style={s('flex:1')}>
            <Text style={s('font-size:15px;font-weight:800;color:#17303B')}>초대 링크로 참여하기</Text>
            <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:hair')}>가족이 보낸 링크로 들어가요</Text>
          </View>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 6 L15 12 L9 18" />
          </Svg>
        </Pressable>
      </View>
    </View>
  )
}
