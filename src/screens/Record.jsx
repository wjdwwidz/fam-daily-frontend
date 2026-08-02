import { View, Text, Pressable } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'
import Dict from './Dict.jsx'
import Qna from './Qna.jsx'

// '기록' 탭: 사전/문답을 하나의 화면 안에서 상단 세그먼트로 전환.
// 각 하위 화면(Dict/Qna)은 제목줄 없이 본문만 렌더하고, 헤더는 여기서 소유한다.
const SUBTABS = [
  { key: 'dict', label: '사전' },
  { key: 'qna', label: '문답' },
]

export default function Record() {
  const vm = useVm()
  const isDict = vm.recordTab === 'dict'
  return (
    <View style={s('padding:md 5xl 110px')}>
      <View style={s('flex-direction:row;align-items:center;justify-content:space-between;margin:sm hair 3xl')}>
        {/* 사전 / 문답 세그먼트 */}
        <View style={s('flex-direction:row;background:#FCEEF4;border-radius:14px;padding:hair')}>
          {SUBTABS.map((t) => {
            const on = vm.recordTab === t.key
            return (
              <Pressable key={t.key} onPress={() => vm.setRecordTab(t.key)} style={s(`padding:md 6xl;border-radius:11px;background:${on ? '#fff' : 'transparent'}`)}>
                <Text style={s(`font-size:14px;font-weight:800;color:${on ? '#FF5E8A' : '#B98C9C'}`)}>{t.label}</Text>
              </Pressable>
            )
          })}
        </View>
        {/* 하위 탭별 컨텍스트 액션 */}
        {isDict ? (
          <Pressable onPress={vm.openSearch} style={s('width:40px;height:40px;border-radius:12px;background:#fff;border:1px solid #FFE1EC;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#FF5E8A')}>
            <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#FF5E8A"><Circle cx={11} cy={11} r={6} /><Path d="M20 20 L16 16" /></Svg>
          </Pressable>
        ) : (
          <Pressable onPress={vm.openQuestion} style={s('flex-direction:row;align-items:center;gap:sm;background:#FF5E8A;border-radius:13px;padding:md 2xl')}>
            <Text style={s('color:#fff;font-size:14px;font-weight:800;line-height:1')}>＋</Text>
            <Text style={s('color:#fff;font-size:12px;font-weight:700')}>새 질문</Text>
          </Pressable>
        )}
      </View>
      {isDict ? <Dict /> : <Qna />}
    </View>
  )
}
