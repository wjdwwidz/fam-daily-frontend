import { Fragment, useEffect } from 'react'
import { View, Text, Image, Pressable, TextInput } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'
import ActivityRow from '../components/ActivityRow.jsx'
import { HOME_ACTIVITY_LIMIT } from '../state/groupActions.js'
import mascot from '../../assets/img/mascot.png'

import { useVm } from '../vm/useVm.js'

// 한마디는 링 가운데 말풍선에 들어간다. 너무 길면 세로로 늘어나 프로필을 침범해서
// 입력 단계에서 막는다. 서버는 100자를 받으므로 예전에 길게 남긴 한마디는 그대로 보인다.
const MOOD_MAX = 60

export default function Home() {
  const vm = useVm()
  const moodLeft = MOOD_MAX - (vm.myMood || '').length
  // 홈에 들어올 때마다(그리고 가족을 바꾸면) 최근 활동과 구성원을 새로 받는다 —
  // 다른 화면에서 글을 쓰거나 한마디를 남기고 돌아와도 바로 보이게.
  // 구성원 상세에만 mood 가 들어 있다 (가족 목록 API 에는 없다).
  const groupId = vm.currentGroup?.id
  // 홈에 올 때마다 최근 활동·구성원과 함께 알림 개수(종 모양 뱃지)도 새로 받는다
  useEffect(() => { vm.loadActivity(); vm.loadMembers(); vm.refreshNotificationCount(); vm.loadDday() }, [groupId])
  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:flex-start;justify-content:space-between;margin:sm 0 lg')}>
        <View style={s('display:flex;align-items:flex-start;gap:xl')}>
          <Image source={mascot} style={{ width: 52, height: 69 }} resizeMode="cover" />
          <View style={s('align-self:center')}>
            <Text style={s('font-size:22.6px;font-weight:800;color:#17303B;letter-spacing:-0.5px;white-space:nowrap')}>오늘의 한마디!</Text>
          </View>
        </View>
        <View style={s('flex-direction:row;align-items:center;gap:lg;align-self:center')}>
          {/* 알림 — 내 일상의 댓글·내 댓글의 답글. 안 읽은 게 있으면 숫자 뱃지 */}
          <Pressable onPress={vm.openNotifications} hitSlop={8} style={s('width:40px;height:40px;border-radius:14px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);align-items:center;justify-content:center;cursor:pointer')}>
            <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#FF5E8A" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <Path d="M18 16 v-5 a6 6 0 0 0 -12 0 v5 l-1.5 2.5 h15 Z" />
              <Path d="M10 20 a2 2 0 0 0 4 0" />
            </Svg>
            {vm.hasNotifications && (
              <View style={s('position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:9px;background:#FF5E8A;border:2px solid #FFF6FB;align-items:center;justify-content:center;padding:0 xs')}>
                <Text style={s('font-size:9.5px;font-weight:800;color:#fff')}>{vm.notificationBadge}</Text>
              </View>
            )}
          </Pressable>
          <Pressable onPress={vm.goProfileEdit}>
            <Avatar photoUrl={vm.myPhoto} ini={vm.myInitial} size={44} style={{ borderRadius: 15 }} />
          </Pressable>
        </View>
      </View>

      <View style={s('display:flex;justify-content:flex-end;margin:0 hair hair')}>
        <Pressable onPress={vm.goMembersDeep}>
          <Text style={s('font-size:12.5px;color:#8497A1;cursor:pointer')}>가족 전체 ›</Text>
        </Pressable>
      </View>

      <View style={s('position:relative;width:296px;height:296px;margin:hair auto 4xl')}>
        {!vm.moodLoading && (
          <View style={s('position:absolute;left:148px;top:148px;transform:translate(-50%,-50%);width:136px;text-align:center;background:#fff;border:1px solid #FFE1EC;border-radius:18px;padding:xl lg;box-shadow:0 10px 24px rgba(255,94,138,0.16);z-index:5')}>
            {/* 말풍선이 세로로 길어지면 위아래 프로필을 침범한다. 5줄에서 끊고,
              전문은 '한마디 기록'에서 볼 수 있다. */}
          <Text numberOfLines={5} style={s('font-size:12.5px;color:#4A5A64;line-height:1.4')}>{vm.activeMember.mood ? `${vm.activeMember.mood} ${vm.activeMember.emoji}`.trim() : '아직 오늘의 한마디가 없어요'}</Text>
          </View>
        )}
        {vm.ringMembers.map((m, i) => (
          <Fragment key={i}>
            <Pressable onPress={m.press} style={s(m.wrapStyle)}>
              <Avatar photoUrl={m.photoUrl} ini={m.ini} size={vm.ringAvatarSize} />
            </Pressable>
            <Pressable onPress={m.badgeClick} style={s(m.badgeStyle)}>
              <Svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M4 20 L4 16 L15 5 L19 9 L8 20 Z" />
                <Path d="M13 7 L17 11" />
              </Svg>
            </Pressable>
            <Text style={s(m.labelStyle)}>{m.name}</Text>
          </Fragment>
        ))}
      </View>

      <View style={s('display:flex;align-items:flex-end;justify-content:space-between;margin:xs hair lg')}>
        <View>
          <Text style={s('font-size:12.5px;font-weight:500;color:#FF5E8A;letter-spacing:0.3px')}>{vm.todayLabel}</Text>
        </View>
        <Pressable onPress={vm.openMoodHistory}>
          <Text style={s('font-size:12.5px;color:#8497A1;cursor:pointer')}>한마디 기록 ›</Text>
        </Pressable>
      </View>
      <View style={s('display:flex;align-items:center;gap:lg;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:24px;padding:md md md xl;margin-bottom:5xl')}>
        <Avatar photoUrl={vm.myPhoto} ini={vm.myInitial} size={36} />
        <TextInput value={vm.myMood} onChangeText={vm.onMoodInput} onSubmitEditing={vm.onMoodKey} maxLength={MOOD_MAX} placeholder="가족에게 한마디 남겨보세요" placeholderTextColor="#9DB2BD" style={s('flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:13px;color:#17303B;font-family:inherit')} />
        {/* 끝이 가까울 때만 알려준다 — 평소엔 조용하게 */}
        {moodLeft <= 20 && (
          <Text style={s(`font-size:10.5px;flex:0 0 auto;color:${moodLeft <= 5 ? '#FF5E8A' : '#9DB2BD'}`)}>{moodLeft}</Text>
        )}
        <Pressable onPress={vm.sendMood} style={s(`width:38px;height:38px;border-radius:50%;background:${vm.sendBg};display:flex;align-items:center;justify-content:center;flex:0 0 auto;cursor:pointer;transition:background .2s`)}>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 19 V5" />
            <Path d="M5 12 L12 5 L19 12" />
          </Svg>
        </Pressable>
      </View>
      {vm.myMoodSent && (
        <View style={s('display:flex;align-items:center;gap:lg;margin:-10px hair 5xl;font-size:11.5px;color:#8497A1')}>
          <Text style={s('color:#FF5E8A;font-weight:700')}>✓ 인사 완료!</Text>
        </View>
      )}

      {/* 다가오는 일정 — 일정에 'D-day 로 보여주기' 를 켠 것만 (가까운 순 3개) */}
      {vm.ddayEvents.length > 0 && (
        <View style={s('gap:md;margin:xs hair 5xl')}>
          {vm.ddayEvents.map((d) => (
            // 한 줄에 하나 — 테두리·배경 없이 홈 바탕 위에 그대로
            <Pressable key={d.key} onPress={d.open} style={s('flex-direction:row;align-items:center;gap:lg;padding:0 hair;align-self:flex-start;max-width:100%;cursor:pointer')}>
              <View style={{ width: 4, height: 30, borderRadius: 2, backgroundColor: d.color }} />
              <View style={s('flex-shrink:1;min-width:0')}>
                <Text numberOfLines={1} style={s('font-size:12.5px;font-weight:700;color:#17303B')}>{d.title}</Text>
                <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:hair')}>{d.when}</Text>
              </View>
              <Text style={s('font-size:14px;font-weight:800;color:#FF5E8A;font-variant:tabular-nums')}>{d.label}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={s('flex-direction:row;align-items:center;justify-content:space-between;margin:xs hair lg')}>
        <Text style={s('font-size:13px;font-weight:500;color:#7C8B95')}>최근 활동</Text>
        <Pressable onPress={vm.openActivityAll}>
          <Text style={s('font-size:12px;color:#8497A1;cursor:pointer')}>더보기 ›</Text>
        </Pressable>
      </View>
      <View style={s('background:rgba(255,255,255,0.45);border:1px solid rgba(255,225,236,0.6);border-radius:26px;padding:hair 3xl;')}>
        {vm.recentActivity.length === 0 && (
          <Text style={s('padding:3xl 0;text-align:center;font-size:11.5px;color:#9DB2BD')}>
            {vm.activityLoading ? '불러오는 중…' : '아직 활동이 없어요'}
          </Text>
        )}
        {/* 더보기 화면에서 길게 받아 온 뒤 돌아와도 홈에서는 앞의 몇 개만 */}
        {vm.recentActivity.slice(0, HOME_ACTIVITY_LIMIT).map((a) => (
          <ActivityRow key={a.key} a={a} />
        ))}
      </View>
    </View>
  )
}
