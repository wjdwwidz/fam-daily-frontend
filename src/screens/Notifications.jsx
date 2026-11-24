import { useEffect } from 'react'
import { View, Text, Pressable, Image, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'

import { useVm } from '../vm/useVm.js'

// 알림 — 나에게 온 것만. 내 일상에 달린 댓글과, 내 댓글에 달린 답글.
// 가족 전체 소식은 홈의 '최근 활동' 에서 본다.
export default function Notifications() {
  const vm = useVm()
  const groupId = vm.currentGroup?.id
  // 화면을 열면 읽음으로 표시한다. 목록의 '새 알림' 점은 이번 화면에서는 그대로 보여준다 —
  // 무엇이 새로 왔는지 알아야 하니까.
  useEffect(() => { vm.loadNotifications(); vm.loadSummaryHistory() }, [groupId])

  const items = vm.notifications
  const summaries = vm.summaryItems
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:center;gap:xl;margin:sm 0 sm')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:20px;font-weight:800;color:#17303B;letter-spacing:-0.4px')}>내 활동 알림</Text>
      </View>
      {/* 불러오는 동안엔 빙글빙글 도는 표시만 (글씨까지 있으면 두 번 말하는 셈) */}
      {vm.notificationsLoading && items.length === 0 && (
        <View style={s('align-items:center;padding:6xl 0')}>
          <ActivityIndicator color="#FF9FBC" />
        </View>
      )}

      {/* 가족 요약 — 매달 AI 가 정리한 이번 달 우리 가족. 홈 배너로 처음 알리고, 본 뒤에는 여기서 다시 본다 */}
      {summaries.length > 0 && (
        <View style={s('gap:md;margin-top:2xl')}>
          <Text style={s('font-size:12px;font-weight:700;color:#7C8B95;margin:0 hair')}>가족 요약</Text>
          {summaries.map((m) => (
            <Pressable
              key={m.key}
              role="button"
              accessibilityLabel={`${m.title} 요약 열기`}
              onPress={m.open}
              style={s(`flex-direction:row;align-items:center;gap:lg;background:${m.unread ? '#FFF0F5' : '#fff'};border:1px solid ${m.unread ? '#FFD3E2' : '#FFE1EC'};border-radius:16px;padding:xl 2xl;cursor:pointer`)}
            >
              <View style={s('width:38px;height:38px;border-radius:13px;background:#FFF0F5;align-items:center;justify-content:center')}>
                <Text style={s('font-size:18px')}>💌</Text>
              </View>
              <View style={s('flex:1;min-width:0;gap:hair')}>
                <View style={s('flex-direction:row;align-items:center;gap:sm')}>
                  <Text style={s('font-size:11.7px;font-weight:700;color:#17303B')}>{m.title}</Text>
                  {m.unread && <View style={s('width:6px;height:6px;border-radius:50%;background:#FF5E8A')} />}
                </View>
                <Text numberOfLines={2} style={s('font-size:12.5px;color:#3F4E58;line-height:1.45')}>{m.text}</Text>
                <Text style={s('font-size:10.5px;color:#B4C1CA')}>{m.meta}</Text>
              </View>
            </Pressable>
          ))}
          {items.length > 0 && <Text style={s('font-size:12px;font-weight:700;color:#7C8B95;margin:lg hair 0')}>내 활동</Text>}
        </View>
      )}

      {!vm.notificationsLoading && items.length === 0 && summaries.length === 0 && (
        <View style={s('align-items:center;padding:6xl 0;gap:md')}>
          <Text style={s('font-size:13px;color:#9DB2BD')}>아직 온 알림이 없어요</Text>
          <Text style={s('font-size:11.5px;color:#C4CFD6')}>가족이 내 일상에 댓글을 달면 여기에 모여요</Text>
        </View>
      )}

      <View style={s('gap:md;margin-top:2xl')}>
        {items.map((n) => (
          <Pressable
            key={n.key}
            onPress={n.open}
            style={s(`flex-direction:row;align-items:center;gap:lg;background:${n.unread ? '#FFF0F5' : '#fff'};border:1px solid ${n.unread ? '#FFD3E2' : '#FFE1EC'};border-radius:16px;padding:xl 2xl;cursor:pointer`)}
          >
            <Avatar photoUrl={n.by.photoUrl} ini={n.by.ini} size={38} />
            <View style={s('flex:1;min-width:0;gap:hair')}>
              <View style={s('flex-direction:row;align-items:center;gap:sm')}>
                <Text style={s('font-size:11.7px;font-weight:700;color:#17303B')}>{n.by.name}</Text>
                <Text style={s('font-size:10.5px;color:#9DB2BD')}>{n.what}</Text>
                {/* 아직 안 본 알림은 분홍 점으로 */}
                {n.unread && <View style={s('width:6px;height:6px;border-radius:50%;background:#FF5E8A')} />}
              </View>
              <Text numberOfLines={2} style={s('font-size:12.5px;color:#3F4E58;line-height:1.45')}>{n.text}</Text>
              <Text style={s('font-size:10.5px;color:#B4C1CA')}>{n.when}</Text>
            </View>
            {!!n.coverUrl && (
              <Image source={{ uri: n.coverUrl }} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3DCE6' }} resizeMode="cover" />
            )}
          </Pressable>
        ))}
      </View>
    </View>
  )
}
