import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function Signup() {
  const vm = useVm()
  return (
    <View style={s('min-height:768px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:8xl 7xl;text-align:center;background:#FFF6FB;position:relative')}>
      <Pressable onPress={vm.back} style={s('position:absolute;top:18px;left:18px;width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
        <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
      </Pressable>
      <View style={s('width:96px;height:96px;border-radius:50%;background:#FF5E8A;display:flex;align-items:center;justify-content:center;box-shadow:0 16px 32px rgba(255,94,138,0.34);margin-bottom:6xl')}>
        <Svg viewBox="0 0 24 24" width={46} height={46} fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 12.5 L10 17.5 L19 7" /></Svg>
      </View>
      <Text style={s('font-size:26px;font-weight:800;color:#17303B;letter-spacing:-0.5px')}>가입 완료!</Text>
      <Text style={s('font-size:14px;color:#6A7E88;margin-top:xl;line-height:1.6;max-width:250px')}>카카오 프로필로 시작해요.{'\n'}이제 우리 가족 공간을 만들어볼까요?</Text>
      <Pressable onPress={vm.goSpace} style={s('width:100%;margin:ctaTop 0 ctaBottom;height:56px;border-radius:20px;background:#FF5E8A;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;cursor:pointer')}>
        <Text style={s('font-size:16px;font-weight:700;color:#fff')}>시작하기</Text>
      </Pressable>
    </View>
  )
}
