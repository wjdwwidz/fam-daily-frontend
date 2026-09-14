import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import { Flower5, Flower6, Leaf } from '../components/Flower.jsx'
import mascot from '../../assets/img/mascot.png'

import { useVm } from '../vm/useVm.js'

export default function Login() {
  const vm = useVm()
  return (
    <View style={s('flex:1;align-items:center;justify-content:center;padding:8xl 7xl;background:#FFF6FB;position:relative;overflow:hidden')}>
      <View style={[s('position:absolute;top:40px;left:20px'), { transform: [{ rotate: '-14deg' }] }]}><Flower6 size={66} petal="#FF9EBB" center="#FFD36E" /></View>
      <View style={[s('position:absolute;top:84px;right:24px'), { transform: [{ rotate: '12deg' }] }]}><Flower6 size={50} petal="#C6A8FF" center="#FFD36E" /></View>
      <View style={[s('position:absolute;top:150px;right:64px'), { transform: [{ rotate: '6deg' }] }]}><Flower5 size={30} petal="#FFC24D" center="#FF7BA0" /></View>
      <View style={[s('position:absolute;bottom:132px;left:30px'), { transform: [{ rotate: '10deg' }] }]}><Flower6 size={42} petal="#FFB38A" center="#FFD36E" /></View>
      <View style={[s('position:absolute;bottom:64px;right:34px'), { transform: [{ rotate: '-10deg' }] }]}><Leaf size={56} /></View>
      <View style={[s('position:absolute;bottom:110px;right:90px'), { transform: [{ rotate: '-6deg' }] }]}><Flower5 size={34} petal="#FF9EBB" center="#FFD36E" /></View>

      <Image source={mascot} style={{ width: 160, height: 213, marginBottom: 16 }} resizeMode="contain" />
      <Text style={s('font-size:30px;font-weight:800;color:#17303B;letter-spacing:-0.5px')}>우리끼리</Text>
      <Text style={s('font-size:15px;color:#6A7E88;margin-top:lg;line-height:1.55;max-width:250px;text-align:center')}>우리 가족만의 단어와 추억을{'\n'}한곳에 담아두는 작은 공간</Text>

      <View style={s('width:100%;margin-top:8xl;flex-direction:column;gap:btnGap')}>
        <Pressable onPress={vm.kakaoLogin} disabled={vm.authLoading} style={s(`height:56px;border-radius:24px;background:#FEE500;flex-direction:row;align-items:center;justify-content:center;gap:lg;opacity:${vm.authLoading ? 0.7 : 1}`)}>
          <Svg viewBox="0 0 24 24" width={21} height={21}><Path d="M12 4 C7 4 3 7 3 10.8 C3 13.2 4.7 15.3 7.2 16.4 L6.3 20 L10.4 17.4 C11 17.5 11.5 17.5 12 17.5 C17 17.5 21 14.5 21 10.8 C21 7 17 4 12 4 Z" fill="#3C1E1E" /></Svg>
          <Text style={s('font-size:16px;font-weight:700;color:#3C1E1E')}>카카오톡으로 시작하기</Text>
        </Pressable>
      </View>

      {vm.authLoading && <View style={s('margin-top:3xl')}><ActivityIndicator color="#FF5E8A" /></View>}
      {vm.authError && <Text style={s('font-size:12px;color:#E5484D;margin-top:2xl;text-align:center;line-height:1.5')}>{vm.authError}</Text>}

      <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:6xl;line-height:1.5;text-align:center')}>
        가입 시 <Text style={s('color:#6A7E88')}>이용약관</Text>과 <Text style={s('color:#6A7E88')}>개인정보 방침</Text>에{'\n'}동의하는 것으로 간주됩니다
      </Text>
    </View>
  )
}
