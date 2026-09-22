import { View, Text } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// 하단 알림. vm.showToast('저장되었습니다') 로 띄우고 잠시 뒤 자동으로 사라진다.
// 화면을 막지 않도록 pointerEvents 는 none.
// 하단 탭·올리기 버튼보다 위(바닥에서 180px)에 띄운다 — 탭 바로 위에 붙으면 눈에 잘 안 들어온다.
//
// 연분홍 — 안드로이드 시스템 알림(갤러리 열 때 뜨는 것)과 분위기를 맞춘다. 예전엔 진한 남색이라
// 같은 흐름에서 두 알림이 따로 놀았다.
// 가운데 정렬 — s() 는 display:flex 를 가로줄(row)로 바꾸므로 가로 가운데는 justify-content 가 맡는다.
// (예전엔 align-items 만 있어 왼쪽에 붙었다) 긴 문구는 줄바꿈한다 — 안 그러면 칸이 화면보다 넓어진다.
export default function Toast() {
  const vm = useVm()
  return (
    <View pointerEvents="none" style={s('position:absolute;left:0;right:0;bottom:180px;z-index:70;display:flex;align-items:center;justify-content:center;padding:0 3xl')}>
      <View style={s('max-width:100%;flex-direction:row;align-items:center;gap:md;background:#FFF0F5;border:1px solid #FFD3E2;border-radius:16px;padding:xl 3xl;box-shadow:0 10px 24px rgba(255,94,138,0.18)')}>
        <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#FF5E8A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
          <Circle cx={12} cy={12} r={9} />
          <Path d="M8 12.5 L11 15.5 L16 9.5" />
        </Svg>
        {/* keep-all: 줄바꿈을 낱말 사이에서만 (웹은 기본이 글자 단위라 '담 / 았어요' 처럼 끊긴다) */}
        <Text style={[s('flex-shrink:1;text-align:center;color:#17303B;font-size:13px;font-weight:700;line-height:1.4'), { wordBreak: 'keep-all' }]}>{vm.toast}</Text>
      </View>
    </View>
  )
}
