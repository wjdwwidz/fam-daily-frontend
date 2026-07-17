import { Fragment } from 'react'
import { View, Text, Image, Pressable, TextInput } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import mascot from '../../assets/img/mascot.png'

import { useVm } from '../vm/useVm.js'

export default function Home() {
  const vm = useVm()
  return (
    <View style={s('padding:8px 20px 110px')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;margin:6px 0 16px')}>
        <View style={s('display:flex;align-items:center;gap:11px')}>
          <Image source={mascot} style={{ width: 52, height: 69 }} resizeMode="cover" />
          <View>
            <Text style={s('font-size:18px;font-weight:800;color:#17303B;letter-spacing:-0.3px;line-height:1.35;white-space:nowrap')}>오늘의 한마디!</Text>
          </View>
        </View>
        <Pressable onPress={vm.goMembersDeep}>
          <View style={s('width:44px;height:44px;border-radius:15px;background:#FF5E8A;display:flex;align-items:center;justify-content:center;cursor:pointer;')}>
            <Text style={s('color:#fff;font-weight:800;font-size:15px')}>서</Text>
          </View>
        </Pressable>
      </View>

      <View style={s('display:flex;justify-content:flex-end;margin:0 2px 2px')}>
        <Pressable onPress={vm.goMembersDeep}>
          <Text style={s('font-size:12.5px;color:#8497A1;cursor:pointer')}>가족 전체 ›</Text>
        </Pressable>
      </View>

      <View style={s('position:relative;width:296px;height:296px;margin:2px auto 18px')}>
        <View style={s('position:absolute;left:148px;top:148px;transform:translate(-50%,-50%);width:150px;text-align:center;background:#fff;border:1px solid #FFE1EC;border-radius:18px;padding:11px 14px;box-shadow:0 10px 24px rgba(255,94,138,0.16);z-index:5')}>
          <Text style={s(`font-size:12px;font-weight:800;color:${vm.activeMember.c}`)}>{vm.activeMember.name}</Text>
          <Text style={s('font-size:12.5px;color:#4A5A64;margin-top:3px;line-height:1.4')}>{vm.activeMember.mood} {vm.activeMember.emoji}</Text>
        </View>
        <View style={s(vm.tailStyle)}><View style={s(vm.dotStyle)} /></View>
        {vm.ringMembers.map((m, i) => (
          <Fragment key={i}>
            <View style={s(m.wrapStyle)}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={s('color:#fff;font-weight:700;font-size:20px')}>{m.ini}</Text>
              </View>
            </View>
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

      <View style={s('display:flex;align-items:flex-end;justify-content:space-between;margin:4px 2px 10px')}>
        <View>
          <Text style={s('font-size:12.5px;font-weight:500;color:#FF5E8A;letter-spacing:0.3px')}>2026.07.07</Text>
        </View>
        <Pressable onPress={vm.toggleMoodHistory}>
          <Text style={s('font-size:11.5px;color:#B4C1CA;font-weight:600;cursor:pointer')}>전체보기</Text>
        </Pressable>
      </View>
      <View style={s('display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:24px;padding:8px 8px 8px 12px;margin-bottom:20px')}>
        <View style={s('width:36px;height:36px;border-radius:50%;background:#FF5E8A;display:flex;align-items:center;justify-content:center;flex:0 0 auto')}>
          <Text style={s('color:#fff;font-weight:800;font-size:13px')}>엄</Text>
        </View>
        <TextInput value={vm.myMood} onChangeText={vm.onMoodInput} onSubmitEditing={vm.onMoodKey} placeholder="가족에게 한마디 남겨보세요" placeholderTextColor="#9DB2BD" style={s('flex:1;min-width:0;border:none;outline:none;background:transparent;font-size:13px;color:#17303B;font-family:inherit')} />
        <Pressable onPress={vm.sendMood} style={s(`width:38px;height:38px;border-radius:50%;background:${vm.sendBg};display:flex;align-items:center;justify-content:center;flex:0 0 auto;cursor:pointer;transition:background .2s`)}>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 19 V5" />
            <Path d="M5 12 L12 5 L19 12" />
          </Svg>
        </Pressable>
      </View>
      {vm.myMoodSent && (
        <View style={s('display:flex;align-items:center;gap:9px;margin:-10px 2px 20px;font-size:11.5px;color:#8497A1')}>
          <Text style={s('color:#FF5E8A;font-weight:700')}>✓ 인사 완료!</Text>
        </View>
      )}

      <Text style={s('margin:4px 2px 10px;font-size:13px;font-weight:500;color:#7C8B95')}>최근 활동</Text>
      <View style={s('background:rgba(255,255,255,0.45);border:1px solid rgba(255,225,236,0.6);border-radius:26px;padding:2px 16px;')}>
        {vm.recentWords.map((w, i) => (
          <Pressable key={i} onPress={w.open} style={s('display:flex;align-items:center;gap:12px;padding:9px 0;border-bottom:1px solid rgba(239,244,247,0.7);cursor:pointer')}>
            <View style={s(`width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 auto;background:${w.by.c}`)}>
              <Text style={s('color:#fff;font-size:12px;font-weight:700')}>{w.by.ini}</Text>
            </View>
            <Text style={s('flex:1;font-size:11.5px;color:#57646E')}><Text style={s('color:#17303B;font-weight:700')}>{w.by.name}</Text>님이 <Text style={s('color:#FF5E8A;font-weight:700')}>{w.term}</Text> 추가</Text>
            <Text style={s('font-size:10px;color:#B4C1CA')}>{w.date}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )
}
