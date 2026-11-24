import { View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// 이번 달 우리 가족 — 홈 카드나 '요약이 도착했어요' 배너를 누르면 여기로 온다.
// 홈 카드는 세 줄까지만 보여주고, 여기서 전부 읽는다.
export default function Summary() {
  const vm = useVm()
  const sum = vm.summaryPage
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:center;gap:xl;margin:sm 0 2xl')}>
        <Pressable onPress={vm.back} accessibilityRole="button" accessibilityLabel="뒤로" style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:20px;font-weight:800;color:#17303B;letter-spacing:-0.4px')}>{sum ? sum.title : '이번 달 요약'}</Text>
      </View>

      {!sum && (
        <Text style={s('padding:6xl 0;text-align:center;font-size:12.5px;color:#9DB2BD')}>아직 정리된 요약이 없어요</Text>
      )}

      {sum && (
        <>
          <View style={s('background:#fff;border:1px solid #FFE1EC;border-radius:26px;padding:4xl 3xl;box-shadow:0 10px 24px rgba(255,94,138,0.10)')}>
            <Text style={[s('font-size:15px;color:#17303B;line-height:1.75'), { wordBreak: 'keep-all' }]}>{sum.text}</Text>
          </View>
          <Text style={s('font-size:11px;color:#9DB2BD;margin:lg hair 0')}>{sum.meta}</Text>
          <Text style={s('font-size:11px;color:#9DB2BD;margin:xs hair 0;line-height:1.5')}>AI가 가족 기록을 모아 정리한 글이라, 실제와 조금 다를 수 있어요.</Text>
        </>
      )}
    </View>
  )
}
