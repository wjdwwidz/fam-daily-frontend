import { View, Text, Image, Pressable, TextInput } from 'react-native'
import Svg, { Path, Circle } from 'react-native-svg'
import { s } from '../lib/style.js'
import signature from '../../assets/img/signature.png'

import { useVm } from '../vm/useVm.js'

export default function Members() {
  const vm = useVm()
  return (
    <View style={s('padding:8px 20px 110px')}>
      {vm.membersFromLink && (
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B;margin:6px 2px 10px')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B">
            <Path d="M14.5 5 L7.5 12 L14.5 19" />
          </Svg>
        </Pressable>
      )}
      <View style={s('display:flex;align-items:center;gap:12px;margin:6px 2px 14px')}>
        <Image source={signature} style={{ width: 74, height: 42 }} resizeMode="cover" />
        <View style={s('flex:1')}>
          {vm.editingGroupName ? (
            <View style={s('flex-direction:row;align-items:center;gap:6px')}>
              <TextInput value={vm.groupNameDraft} onChangeText={vm.onGroupNameDraft} autoFocus placeholder="가족 이름" placeholderTextColor="#9DB2BD" style={s('flex:1;min-width:0;border:1px solid #FFE1EC;background:#FFF6FB;border-radius:10px;padding:6px 10px;font-size:18px;font-weight:800;color:#17303B;font-family:inherit')} />
              <Pressable onPress={vm.saveGroupName} disabled={vm.groupNameSaving} style={s(`padding:7px 11px;border-radius:10px;background:#FF5E8A;opacity:${vm.groupNameSaving ? 0.7 : 1}`)}>
                <Text style={s('color:#fff;font-size:12px;font-weight:700')}>저장</Text>
              </Pressable>
              <Pressable onPress={vm.cancelEditGroupName} style={s('padding:7px 9px;border-radius:10px;background:#fff;border:1px solid #FFE1EC')}>
                <Text style={s('color:#8497A1;font-size:12px;font-weight:700')}>취소</Text>
              </Pressable>
            </View>
          ) : (
            <View style={s('flex-direction:row;align-items:center;gap:6px')}>
              <Text style={s('font-size:22.6px;font-weight:800;color:#17303B;letter-spacing:-0.5px')}>{vm.currentGroup?.name || '우리 가족'}</Text>
              {vm.canEditGroupName && (
                <Pressable onPress={vm.startEditGroupName} style={s('width:26px;height:26px;border-radius:8px;align-items:center;justify-content:center')}>
                  <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="#B7C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M4 20 L4 16 L15 5 L19 9 L8 20 Z" />
                    <Path d="M13 7 L17 11" />
                  </Svg>
                </Pressable>
              )}
            </View>
          )}
          {vm.groupNameError && <Text style={s('font-size:11px;color:#E5484D;margin-top:3px')}>{vm.groupNameError}</Text>}
          <Text style={s('font-size:11.3px;color:#6A7E88;margin-top:2px')}>{vm.memberCount}명이 함께하고 있어요</Text>
        </View>
        <Pressable onPress={vm.openInvite} style={s('width:44px;height:44px;border-radius:14px;background:#FF5E8A;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto;box-shadow:0 8px 18px rgba(255,94,138,0.32)')}>
          <Svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#fff" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="10" cy="8" r="3.2" />
            <Path d="M4 19 C4 15.5 6.8 13.8 10 13.8 C11 13.8 12 14 12.8 14.3" />
            <Path d="M18 13 v6" />
            <Path d="M15 16 h6" />
          </Svg>
        </Pressable>
      </View>

      <Pressable onPress={vm.goProfileEdit} style={s('display:flex;align-items:center;gap:14px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:24px;padding:14px 16px;cursor:pointer;margin-bottom:12px')}>
        <View style={s(`width:52px;height:52px;border-radius:50%;overflow:hidden;background:${vm.myColor};display:flex;align-items:center;justify-content:center;flex:0 0 auto`)}>
          {vm.myPhoto ? <Image source={{ uri: vm.myPhoto }} style={s('width:52px;height:52px')} resizeMode="cover" /> : <Text style={s('color:#fff;font-weight:800;font-size:16.5px')}>{vm.myInitial}</Text>}
        </View>
        <View style={s('flex:1')}>
          <Text style={s('font-size:13.5px;font-weight:800;color:#17303B')}>내 프로필 설정하기</Text>
          <Text style={s('font-size:11px;color:#9DB2BD;margin-top:2px')}>사진 · 이름 · 오늘의 한마디</Text>
        </View>
        <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={s('flex:0 0 auto')}>
          <Path d="M9 6 L15 12 L9 18" />
        </Svg>
      </Pressable>

      <Text style={s('margin:22px 2px 12px;font-size:13.1px;font-weight:800;color:#17303B')}>구성원 {vm.memberCount}명</Text>
      <View style={s('display:flex;flex-direction:column;gap:10px')}>
        {vm.members.map((m, i) => (
          <View key={i} style={s('display:flex;align-items:center;gap:14px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:24px;padding:10px 16px;')}>
            <View style={s(`width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 auto;background:${m.c}`)}>
              <Text style={s('color:#fff;font-weight:700;font-size:14.8px')}>{m.ini}</Text>
            </View>
            <View style={s('flex:1;min-width:0')}>
              <View style={s('flex-direction:row;align-items:center;gap:6px')}><Text style={s('font-size:13.1px;font-weight:700;color:#17303B')}>{m.name}</Text><Text style={s('font-size:10.5px;color:#B7C3CC')}>{m.role}</Text></View>
              <Text numberOfLines={1} style={s('font-size:11.5px;color:#5A6D77;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap')}>{m.mood} {m.emoji}</Text>
            </View>
            {m.admin && <Text style={s('font-size:11px;font-weight:700;color:#FF5E8A;background:#FFF0F5;padding:4px 10px;border-radius:999px;flex:0 0 auto')}>관리자</Text>}
          </View>
        ))}
      </View>
    </View>
  )
}
