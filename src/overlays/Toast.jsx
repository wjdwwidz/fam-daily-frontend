import { View, Text } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// 하단 알림. vm.showToast('저장되었습니다') 로 띄우고 잠시 뒤 자동으로 사라진다.
// 화면을 막지 않도록 pointerEvents 는 none.
export default function Toast() {
  const vm = useVm()
  return (
    <View pointerEvents="none" style={s('position:absolute;left:0;right:0;bottom:96px;z-index:70;display:flex;align-items:center;padding:0 6xl')}>
      <View style={s('flex-direction:row;align-items:center;gap:md;background:#17303B;border-radius:16px;padding:2xl 4xl;box-shadow:0 14px 32px rgba(23,48,59,0.32)')}>
        <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#7BE8C2" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={12} r={9} />
          <Path d="M8 12.5 L11 15.5 L16 9.5" />
        </Svg>
        <Text style={s('color:#fff;font-size:13px;font-weight:700')}>{vm.toast}</Text>
      </View>
    </View>
  )
}
