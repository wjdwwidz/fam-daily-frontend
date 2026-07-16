import { View, Text, Image, Pressable, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import mascot from '../../assets/img/mascot.png'

function KakaoIcon() {
  return (
    <Svg viewBox="0 0 24 24" width={20} height={20}>
      <Path d="M12 4 C7 4 3 7 3 10.8 C3 13.2 4.7 15.3 7.2 16.4 L6.3 20 L10.4 17.4 C11 17.5 11.5 17.5 12 17.5 C17 17.5 21 14.5 21 10.8 C21 7 17 4 12 4 Z" fill="#3C1E1E" />
    </Svg>
  )
}

function GoogleIcon() {
  return (
    <Svg viewBox="0 0 24 24" width={19} height={19}>
      <Path fill="#4285F4" d="M23.06 12.25c0-.85-.08-1.67-.22-2.45H12v4.64h6.2a5.3 5.3 0 0 1-2.3 3.48v2.89h3.72c2.18-2 3.44-4.96 3.44-8.56z" />
      <Path fill="#34A853" d="M12 24c3.1 0 5.7-1.03 7.6-2.79l-3.72-2.89c-1.03.69-2.35 1.1-3.88 1.1-2.98 0-5.5-2.01-6.4-4.72H1.76v2.98A11.99 11.99 0 0 0 12 24z" />
      <Path fill="#FBBC05" d="M5.6 14.7A7.2 7.2 0 0 1 5.22 12c0-.94.16-1.85.38-2.7V6.32H1.76A12 12 0 0 0 0 12c0 1.94.46 3.77 1.76 5.68l3.84-2.98z" />
      <Path fill="#EA4335" d="M12 4.75c1.68 0 3.19.58 4.38 1.72l3.28-3.28C17.7 1.19 15.1 0 12 0 7.36 0 3.34 2.66 1.76 6.32l3.84 2.98C6.5 6.76 9.02 4.75 12 4.75z" />
    </Svg>
  )
}

export default function Auth({ vm }) {
  return (
    <View style={s('flex:1;padding:16px 28px 28px;background:#FFF6FB')}>
      <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;align-items:center;justify-content:center;margin-bottom:6px')}>
        <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#17303B" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
      </Pressable>

      <View style={s('flex:1;justify-content:center')}>
        <View style={s('align-items:center;margin-bottom:34px')}>
          <Image source={mascot} style={{ width: 150, height: 200 }} resizeMode="contain" />
          <Text style={s('font-size:26px;font-weight:800;color:#17303B;margin-top:8px;letter-spacing:-0.5px')}>우리끼리 시작하기</Text>
          <Text style={s('font-size:14px;color:#6A7E88;margin-top:8px')}>가족과 함께할 계정을 만들어요</Text>
        </View>

        <Pressable onPress={() => vm.socialLogin('카카오')} disabled={vm.authLoading} style={s(`height:56px;border-radius:16px;background:#FEE500;flex-direction:row;align-items:center;justify-content:center;gap:9px;margin-bottom:12px;opacity:${vm.authLoading ? 0.7 : 1}`)}>
          <KakaoIcon />
          <Text style={s('font-size:15.5px;font-weight:700;color:#3C1E1E')}>카카오톡으로 시작하기</Text>
        </Pressable>
        <Pressable onPress={() => vm.socialLogin('구글')} disabled={vm.authLoading} style={s(`height:56px;border-radius:16px;background:#fff;border:1px solid #E4E7EC;flex-direction:row;align-items:center;justify-content:center;gap:9px;opacity:${vm.authLoading ? 0.7 : 1}`)}>
          <GoogleIcon />
          <Text style={s('font-size:15.5px;font-weight:700;color:#3C4149')}>Google로 시작하기</Text>
        </Pressable>

        {vm.authLoading && (
          <View style={s('align-items:center;margin-top:18px')}>
            <ActivityIndicator color="#FF5E8A" />
          </View>
        )}
        {vm.authError && <Text style={s('font-size:12px;color:#E5484D;margin-top:16px;line-height:1.5;text-align:center')}>{vm.authError}</Text>}

        <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:24px;line-height:1.5;text-align:center')}>가입 시 이용약관과 개인정보 방침에{'\n'}동의하는 것으로 간주됩니다</Text>
      </View>
    </View>
  )
}
