import { View, Text, Image, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import { Flower5, Flower6, Leaf } from '../components/Flower.jsx'
import mascot from '../../assets/img/mascot.png'

export default function Login({ vm }) {
  return (
    <View style={s('flex:1;align-items:center;justify-content:center;padding:40px 32px;background:#FFF6FB;position:relative;overflow:hidden')}>
      <View style={[s('position:absolute;top:40px;left:20px'), { transform: [{ rotate: '-14deg' }] }]}><Flower6 size={66} petal="#FF9EBB" center="#FFD36E" /></View>
      <View style={[s('position:absolute;top:84px;right:24px'), { transform: [{ rotate: '12deg' }] }]}><Flower6 size={50} petal="#C6A8FF" center="#FFD36E" /></View>
      <View style={[s('position:absolute;top:150px;right:64px'), { transform: [{ rotate: '6deg' }] }]}><Flower5 size={30} petal="#FFC24D" center="#FF7BA0" /></View>
      <View style={[s('position:absolute;bottom:132px;left:30px'), { transform: [{ rotate: '10deg' }] }]}><Flower6 size={42} petal="#FFB38A" center="#FFD36E" /></View>
      <View style={[s('position:absolute;bottom:64px;right:34px'), { transform: [{ rotate: '-10deg' }] }]}><Leaf size={56} /></View>
      <View style={[s('position:absolute;bottom:110px;right:90px'), { transform: [{ rotate: '-6deg' }] }]}><Flower5 size={34} petal="#FF9EBB" center="#FFD36E" /></View>

      <Image source={mascot} style={{ width: 160, height: 213, marginBottom: 16 }} resizeMode="contain" />
      <Text style={s('font-size:30px;font-weight:800;color:#17303B;letter-spacing:-0.5px')}>우리끼리</Text>
      <Text style={s('font-size:15px;color:#6A7E88;margin-top:10px;line-height:1.55;max-width:250px;text-align:center')}>우리 가족만의 단어와 추억을{'\n'}한곳에 담아두는 작은 공간</Text>

      <View style={s('width:100%;margin-top:44px;flex-direction:column;gap:12px')}>
        <Pressable onPress={vm.enter} style={s('height:56px;border-radius:24px;background:#FEE500;flex-direction:row;align-items:center;justify-content:center;gap:9px')}>
          <Svg viewBox="0 0 24 24" width={21} height={21}><Path d="M12 4 C7 4 3 7 3 10.8 C3 13.2 4.7 15.3 7.2 16.4 L6.3 20 L10.4 17.4 C11 17.5 11.5 17.5 12 17.5 C17 17.5 21 14.5 21 10.8 C21 7 17 4 12 4 Z" fill="#3C1E1E" /></Svg>
          <Text style={s('font-size:16px;font-weight:700;color:#3C1E1E')}>카카오톡으로 시작하기</Text>
        </Pressable>
        <Pressable onPress={vm.enterJoin} style={s('height:56px;border-radius:24px;background:#fff;border:1.5px solid #C7E7F7;flex-direction:row;align-items:center;justify-content:center;gap:9px')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#FF5E8A" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><Path d="M9.5 14.5 L14.5 9.5" /><Path d="M11 7.5 L12.7 5.8 A3.2 3.2 0 0 1 18.2 11.3 L16.5 13" /><Path d="M13 16.5 L11.3 18.2 A3.2 3.2 0 0 1 5.8 12.7 L7.5 11" /></Svg>
          <Text style={s('font-size:16px;font-weight:700;color:#FF5E8A')}>초대 링크로 참여하기</Text>
        </Pressable>
      </View>
      <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:30px;line-height:1.5;text-align:center')}>
        가입 시 <Text style={s('color:#6A7E88')}>이용약관</Text>과 <Text style={s('color:#6A7E88')}>개인정보 방침</Text>에{'\n'}동의하는 것으로 간주됩니다
      </Text>
    </View>
  )
}
