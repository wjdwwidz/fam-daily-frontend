import { View, Text, Image, ActivityIndicator } from 'react-native'
import { s } from '../lib/style.js'
import mascot from '../../assets/img/mascot.png'

// 앱을 켤 때 저장된 로그인을 확인하는 동안 보여주는 화면.
//
// 이게 없으면 기본 화면인 로그인이 먼저 그려져서, 이미 로그인한 사람에게도
// '카카오톡으로 시작하기' 화면이 잠깐 번쩍인다.
export default function Splash() {
  return (
    <View style={s('flex:1;align-items:center;justify-content:center;background:#FFF6FB;padding:8xl 7xl')}>
      <Image source={mascot} style={{ width: 120, height: 160 }} resizeMode="contain" />
      <Text style={s('font-size:24px;font-weight:800;color:#17303B;letter-spacing:-0.5px;margin-top:2xl')}>우리끼리</Text>
      <View style={s('margin-top:4xl')}><ActivityIndicator color="#FF5E8A" /></View>
    </View>
  )
}
