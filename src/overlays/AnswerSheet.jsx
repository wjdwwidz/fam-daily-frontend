import { View, Text, Pressable, TextInput } from 'react-native'
import { s } from '../lib/style.js'

export default function AnswerSheet({ vm }) {
  return (
    <Pressable onPress={vm.closeAnswer} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:45;align-items:flex-end;animation:sfade .18s ease')}>
      <Pressable onPress={vm.stopEvt} style={s('width:100%;background:#fff;border-radius:26px 26px 0 0;padding:20px 20px 28px;animation:sheetup .26s cubic-bezier(.4,0,.2,1)')}>
        <View style={s('width:40px;height:4px;border-radius:2px;background:#EADCE2;margin:0 auto 18px')} />
        <Text style={s('font-size:11px;font-weight:700;color:#FF5E8A;letter-spacing:0.4px')}>{vm.todayQ.no} 문답</Text>
        <Text style={s('font-size:16px;font-weight:800;color:#17303B;margin-top:6px;line-height:1.4')}>{vm.todayQ.q}</Text>
        <TextInput multiline textAlignVertical="top" placeholder="내 답변을 적어보세요" placeholderTextColor="#9DB2BD" style={s('width:100%;min-height:96px;margin-top:16px;border:1px solid #FFE1EC;outline:none;background:#FFF6FB;border-radius:14px;padding:14px 15px;font-size:13.5px;font-family:inherit;color:#17303B;resize:none')} />
        <Pressable onPress={vm.closeAnswer} style={s('margin-top:18px;height:54px;border-radius:17px;background:#FF5E8A;align-items:center;justify-content:center;cursor:pointer')}>
          <Text style={s('font-size:14px;font-weight:700;color:#fff')}>답변 남기기</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  )
}
