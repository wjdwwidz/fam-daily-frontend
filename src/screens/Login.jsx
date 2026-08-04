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
        <Pressable onPress={vm.googleLogin} disabled={vm.authLoading} style={s(`height:56px;border-radius:24px;background:#fff;border:1px solid #E4E7EC;flex-direction:row;align-items:center;justify-content:center;gap:lg;opacity:${vm.authLoading ? 0.7 : 1}`)}>
          <Svg viewBox="0 0 24 24" width={20} height={20}>
            <Path fill="#4285F4" d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.56z" />
            <Path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.76v2.98A11.99 11.99 0 0 0 12 24z" />
            <Path fill="#FBBC05" d="M5.6 14.7A7.2 7.2 0 0 1 5.22 12c0-.94.16-1.85.38-2.7V6.32H1.76A12 12 0 0 0 0 12c0 1.94.46 3.77 1.76 5.68l3.84-2.98z" />
            <Path fill="#EA4335" d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.19 15.1 0 12 0 7.36 0 3.34 2.66 1.76 6.32l3.84 2.98C6.5 6.76 9.02 4.75 12 4.75z" />
          </Svg>
          <Text style={s('font-size:16px;font-weight:700;color:#3C4149')}>Google로 시작하기</Text>
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
