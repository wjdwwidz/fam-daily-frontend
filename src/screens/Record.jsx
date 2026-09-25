import { View, Text, Pressable } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'
import Dict from './Dict.jsx'
import Qna from './Qna.jsx'
import Bucket from './Bucket.jsx'
import Calendar from './Calendar.jsx'

// '기록' 탭: 사전/문답을 하나의 화면 안에서 상단 세그먼트로 전환.
// 각 하위 화면(Dict/Qna)은 제목줄 없이 본문만 렌더하고, 헤더는 여기서 소유한다.
const SUBTABS = [
  { key: 'dict', label: '사전' },
  { key: 'qna', label: '문답' },
  { key: 'bucket', label: '버킷리스트' },
  { key: 'calendar', label: '달력' },
]

export default function Record() {
  const vm = useVm()
  const tab = vm.recordTab || 'dict'
  const isDict = tab === 'dict'
  const isQna = tab === 'qna'
  const isCalendar = tab === 'calendar'
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('flex-direction:row;align-items:flex-start;justify-content:space-between;margin:sm hair lg')}>
        {/* 사전 / 문답 — 타이틀이자 전환 스위처 (활성=진하게) */}
        <View style={s('flex-direction:row;align-items:center;gap:2xl')}>
          {SUBTABS.map((t) => {
            const on = vm.recordTab === t.key
            return (
              <Pressable key={t.key} onPress={() => vm.setRecordTab(t.key)}>
                <Text style={s(`font-size:22.6px;font-weight:800;letter-spacing:-0.5px;color:${on ? '#17303B' : '#C4CFD6'}`)}>{t.label}</Text>
                {/* 색 차이만으로는 지금 어느 탭인지 잘 안 보여서 활성 탭에 밑줄을 둔다 */}
                <View style={s(`height:3px;border-radius:2px;margin-top:xs;background:${on ? '#FF5E8A' : 'transparent'}`)} />
              </Pressable>
            )
          })}
        </View>
        {/* 하위 탭별 컨텍스트 액션 */}
        {isDict ? (
          <Pressable onPress={vm.openSearch} style={s('width:40px;height:40px;border-radius:12px;background:#fff;border:1px solid #FFE1EC;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#FF5E8A')}>
            <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#FF5E8A"><Circle cx={11} cy={11} r={6} /><Path d="M20 20 L16 16" /></Svg>
          </Pressable>
        ) : isQna ? (
          <Pressable onPress={vm.openQuestion} style={s('flex-direction:row;align-items:center;gap:sm;background:#FF5E8A;border-radius:13px;padding:btnY 2xl')}>
            <Text style={s('color:#fff;font-size:14px;font-weight:800;line-height:1')}>＋</Text>
            <Text style={s('color:#fff;font-size:12px;font-weight:700')}>새 질문</Text>
          </Pressable>
        ) : isCalendar ? (
          <Pressable onPress={vm.openEvent} style={s('flex-direction:row;align-items:center;gap:sm;background:#FF5E8A;border-radius:13px;padding:btnY 2xl')}>
            <Text style={s('color:#fff;font-size:14px;font-weight:800;line-height:1')}>＋</Text>
            <Text style={s('color:#fff;font-size:12px;font-weight:700')}>일정</Text>
          </Pressable>
        ) : null}
      </View>
      {isDict ? <Dict /> : isQna ? <Qna /> : isCalendar ? <Calendar /> : <Bucket />}
    </View>
  )
}
