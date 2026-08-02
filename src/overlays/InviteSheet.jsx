import { View, Text, Pressable } from 'react-native'
import Svg, { Path, Rect } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function InviteSheet() {
  const vm = useVm()
  return (
    <Pressable onPress={vm.closeInvite} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:45;display:flex;align-items:flex-end;animation:sfade .18s ease')}>
      <Pressable onPress={vm.stopEvt} style={s('width:100%;background:#fff;border-radius:26px 26px 0 0;padding:5xl 5xl 7xl;animation:sheetup .26s cubic-bezier(.4,0,.2,1)')}>
        <View style={s('width:40px;height:4px;border-radius:2px;background:#EADCE2;margin:0 auto 4xl')}></View>
        <Text style={s('font-size:15.7px;font-weight:800;color:#17303B')}>새 가족 초대하기</Text>
        <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:sm;margin-bottom:3xl')}>참여 코드를 공유하면 가족이 앱에서 입력해 들어와요</Text>

        {vm.inviteLoading ? (
          <Text style={s('padding:4xl;text-align:center;color:#9DB2BD;font-size:12.5px')}>초대 코드 생성 중…</Text>
        ) : vm.inviteError ? (
          <Text style={s('padding:2xl;text-align:center;color:#E5484D;font-size:12.5px')}>{vm.inviteError}</Text>
        ) : vm.inviteCode ? (
          <View style={s('background:#FFF6FB;border:1.5px dashed #FFC4D8;border-radius:14px;padding:2xl;margin-bottom:3xl;align-items:center')}>
            <Text style={s('font-size:11px;color:#9DB2BD;margin-bottom:sm')}>참여 코드</Text>
            <Text style={s('font-size:23px;font-weight:800;color:#FF5E8A;letter-spacing:2px')}>{vm.inviteCode}</Text>
          </View>
        ) : null}

        <Pressable onPress={vm.shareInvite} disabled={!vm.inviteCode} style={s(`display:flex;align-items:center;gap:xl;background:#FEE500;border-radius:16px;padding:3xl 3xl;cursor:pointer;opacity:${vm.inviteCode ? 1 : 0.5}`)}>
          <View style={s('width:36px;height:36px;border-radius:11px;background:#3C1E1E;display:flex;align-items:center;justify-content:center;flex:0 0 auto')}>
            <Text style={s('color:#FEE500;font-size:17px;font-weight:800')}>K</Text>
          </View>
          <View style={s('flex:1')}><Text style={s('font-size:13.5px;font-weight:800;color:#3C1E1E')}>카카오톡·메시지로 공유</Text><Text style={s('font-size:11px;color:#7A5C2E;margin-top:hair')}>공유 시트에서 카카오톡 선택</Text></View>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#3C1E1E" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={s('flex:0 0 auto')}><Path d="M9 6 L15 12 L9 18" /></Svg>
        </Pressable>
        <Pressable onPress={vm.copyInvite} disabled={!vm.inviteCode} style={s(`display:flex;align-items:center;gap:xl;background:#FFF6FB;border:1px solid #FFE1EC;border-radius:16px;padding:3xl 3xl;margin-top:lg;cursor:pointer;opacity:${vm.inviteCode ? 1 : 0.5}`)}>
          <View style={s('width:36px;height:36px;border-radius:11px;background:#FFF0F5;display:flex;align-items:center;justify-content:center;color:#FF5E8A;flex:0 0 auto')}><Svg viewBox="0 0 24 24" width={19} height={19} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#FF5E8A"><Path d="M9.5 14.5 L14.5 9.5" /><Path d="M11 7.5 L12.7 5.8 A3 3 0 0 1 18 11 L16.5 13" /><Path d="M13 16.5 L11.3 18.2 A3 3 0 0 1 6 15 L7.5 11" /></Svg></View>
          <View style={s('flex:1')}><Text style={s('font-size:13.5px;font-weight:800;color:#17303B')}>{vm.inviteCopied ? '복사됨! ✓' : '초대 코드 복사'}</Text><Text style={s('font-size:11px;color:#9DB2BD;margin-top:hair')}>코드·링크를 클립보드에 복사</Text></View>
          <Svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#D9C3CC" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={s('flex:0 0 auto')}><Rect x={8} y={8} width={12} height={12} rx={2.5} /><Path d="M16 8 V6 a2 2 0 0 0 -2 -2 H6 a2 2 0 0 0 -2 2 v8 a2 2 0 0 0 2 2 h2" /></Svg>
        </Pressable>
      </Pressable>
    </Pressable>
  )
}
