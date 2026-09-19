import { useEffect } from 'react'
import { View, Text, Pressable, Image, ScrollView } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'

import { useVm } from '../vm/useVm.js'

// 가족 기록 — 한마디와 프로필 사진 변경을 시간순으로.
// 홈의 무드 링은 '지금 상태'만 보여주므로, 지나간 것들은 여기서 본다.
// 사진을 바꾼 줄은 눌러서 크게 볼 수 있다.
export default function MoodHistory() {
  const vm = useVm()
  const groupId = vm.currentGroup?.id
  useEffect(() => { vm.loadHistory() }, [groupId])

  const items = vm.historyItems
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:center;gap:xl;margin:sm 0 sm')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:20px;font-weight:800;color:#17303B;letter-spacing:-0.4px')}>한마디 기록</Text>
      </View>
      <Text style={s('font-size:11.3px;color:#9DB2BD;margin:0 hair 2xl')}>
        {vm.historyLoading ? '불러오는 중…' : `한마디와 프로필 사진 ${items.length}개의 기록`}
      </Text>

      {!vm.historyLoading && items.length === 0 && (
        <View style={s('background:#FCEEF4;border-radius:20px;padding:6xl 3xl;align-items:center')}>
          <Text style={s('font-size:12.5px;color:#9DB2BD;text-align:center;line-height:1.6')}>아직 기록이 없어요{'\n'}홈에서 가족에게 한마디를 남겨보세요</Text>
        </View>
      )}

      {items.length > 0 && (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={s('background:#FCEEF4;border-radius:20px;padding:xs 3xl md')}>
            {items.map((m, i) => {
              const line = i < items.length - 1 ? ';border-bottom:1px solid #F3DCE6' : ''
              const Row = m.open ? Pressable : View
              return (
                <Row
                  key={m.id ?? i}
                  onPress={m.open}
                  style={s(`display:flex;flex-direction:row;align-items:center;gap:xl;padding:2xl 0${line}${m.open ? ';cursor:pointer' : ''}`)}
                >
                  <Avatar photoUrl={m.photoUrl} ini={m.ini} size={34} />
                  <View style={s('flex:1;min-width:0')}>
                    <Text style={s(`font-size:12.6px;line-height:1.5;color:${m.type === 'photo' ? '#6A7E88' : '#17303B'}`)}>{m.text}</Text>
                    <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:hair')}>{m.name} · {m.when}</Text>
                  </View>
                  {/* 바꾼 사진 미리보기 — 누르면 크게 보기 */}
                  {m.shotUrl && (
                    <Image source={{ uri: m.shotUrl }} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: '#F3DCE6' }} resizeMode="cover" />
                  )}
                </Row>
              )
            })}
          </View>
        </ScrollView>
      )}
    </View>
  )
}
