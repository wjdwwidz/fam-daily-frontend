import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import mascot from '../../assets/img/mascot.png'
import { openPrivacy } from '../lib/legal.js'

function KakaoIcon() {
  return (
    <Svg viewBox="0 0 24 24" width={20} height={20}>
      <Path d="M12 4 C7 4 3 7 3 10.8 C3 13.2 4.7 15.3 7.2 16.4 L6.3 20 L10.4 17.4 C11 17.5 11.5 17.5 12 17.5 C17 17.5 21 14.5 21 10.8 C21 7 17 4 12 4 Z" fill="#3C1E1E" />
    </Svg>
  )
}

import { useVm } from '../vm/useVm.js'

export default function Auth() {
  const vm = useVm()
  return (
    <View style={s('flex:1;padding:3xl 7xl 7xl;background:#FFF6FB')}>
      <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;align-items:center;justify-content:center;margin-bottom:sm')}>
        <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#17303B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
      </Pressable>

      <View style={s('flex:1;justify-content:center')}>
        <View style={s('align-items:center;margin-bottom:7xl')}>
          <Image source={mascot} style={{ width: 150, height: 200 }} resizeMode="contain" />
          <Text style={s('font-size:26px;font-weight:800;color:#17303B;margin-top:md;letter-spacing:-0.5px')}>우리끼리 시작하기</Text>
          <Text style={s('font-size:14px;color:#6A7E88;margin-top:md')}>가족과 함께할 계정을 만들어요</Text>
        </View>

        <Pressable onPress={vm.kakaoLogin} disabled={vm.authLoading} style={s(`height:56px;border-radius:16px;background:#FEE500;flex-direction:row;align-items:center;justify-content:center;gap:lg;margin-bottom:btnGap;opacity:${vm.authLoading ? 0.7 : 1}`)}>
          <KakaoIcon />
          <Text style={s('font-size:15.5px;font-weight:700;color:#3C1E1E')}>카카오톡으로 시작하기</Text>
        </Pressable>

        {vm.authLoading && (
          <View style={s('align-items:center;margin-top:4xl')}>
            <ActivityIndicator color="#FF5E8A" />
          </View>
        )}
        {vm.authError && <Text style={s('font-size:12px;color:#E5484D;margin-top:3xl;line-height:1.5;text-align:center')}>{vm.authError}</Text>}

        <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:6xl;line-height:1.5;text-align:center')}>시작하면 <Text onPress={openPrivacy} style={s('color:#6A7E88;text-decoration-line:underline')}>개인정보 처리방침</Text>에{'\n'}동의하게 돼요</Text>
      </View>
    </View>
  )
}
