import { View, Text, Pressable } from 'react-native'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// 공용 확인 모달. vm.askConfirm({ title, message, yesText, onYes }) 으로 연다.
// 배색은 앱 브랜드 핑크(#FF5E8A)로 통일.
export default function ConfirmDialog() {
  const vm = useVm()
  const c = vm.confirm || {}
  return (
    <Pressable onPress={vm.closeConfirm} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:60;display:flex;align-items:center;justify-content:center;padding:0 32px')}>
      <Pressable onPress={vm.stopEvt} style={s('width:100%;max-width:320px;background:#fff;border:1px solid #FFE1EC;border-radius:22px;padding:24px 20px 18px;box-shadow:0 18px 44px rgba(255,94,138,0.28)')}>
        <Text style={s('font-size:16px;font-weight:800;color:#17303B;text-align:center')}>{c.title || '삭제하시겠습니까?'}</Text>
        {!!c.message && (
          <Text style={s('font-size:12.5px;color:#9DB2BD;text-align:center;margin-top:8px;line-height:1.6')}>{c.message}</Text>
        )}
        <View style={s('display:flex;flex-direction:row;gap:10px;margin-top:20px')}>
          <Pressable onPress={vm.closeConfirm} style={s('flex:1;align-items:center;justify-content:center;padding:14px;border-radius:14px;border:1px solid #FFE1EC;background:#FFF6FB;cursor:pointer')}>
            <Text style={s('color:#FF8FAE;font-size:14px;font-weight:700')}>{c.noText || '아니오'}</Text>
          </Pressable>
          <Pressable onPress={vm.confirmYes} style={s('flex:1;align-items:center;justify-content:center;padding:14px;border-radius:14px;background:#FF5E8A;cursor:pointer;box-shadow:0 10px 22px rgba(255,94,138,0.3)')}>
            <Text style={s('color:#fff;font-size:14px;font-weight:800')}>{c.yesText || '네'}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Pressable>
  )
}
