import { View, Text, Pressable, TextInput } from 'react-native'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function QuestionSheet() {
  const vm = useVm()
  return (
    <Pressable onPress={vm.closeQuestion} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:45;align-items:flex-end;animation:sfade .18s ease')}>
      <Pressable onPress={vm.stopEvt} style={s('width:100%;background:#fff;border-radius:26px 26px 0 0;padding:5xl 5xl 7xl;animation:sheetup .26s cubic-bezier(.4,0,.2,1)')}>
        <View style={s('width:40px;height:4px;border-radius:2px;background:#EADCE2;margin:0 auto 4xl')} />
        <Text style={s('font-size:11px;font-weight:700;color:#FF5E8A;letter-spacing:0.4px')}>새 질문</Text>
        <Text style={s('font-size:16px;font-weight:800;color:#17303B;margin-top:sm;line-height:1.4')}>가족에게 물어보고 싶은 질문은?</Text>
        <TextInput
          multiline
          textAlignVertical="top"
          value={vm.questionDraft}
          onChangeText={vm.onQuestionInput}
          placeholder="예: 우리 가족 하면 떠오르는 냄새는?"
          placeholderTextColor="#9DB2BD"
          style={s('width:100%;min-height:88px;margin-top:fieldGap;border:1px solid #FFE1EC;outline:none;background:#FFF6FB;border-radius:14px;padding:2xl 3xl;font-size:13.5px;font-family:inherit;color:#17303B;resize:none')}
        />
        <Pressable onPress={vm.fillSuggestedQuestion} style={s('margin-top:xl;align-self:flex-start;flex-direction:row;align-items:center;gap:sm;background:#FCEEF4;border-radius:12px;padding:lg 2xl')}>
          <Text style={s('font-size:12px')}>🎲</Text>
          <Text style={s('font-size:12px;font-weight:700;color:#FF5E8A')}>추천 질문 받기</Text>
        </Pressable>
        <Pressable onPress={vm.submitQuestion} style={s('margin-top:ctaTop;height:54px;border-radius:17px;background:#FF5E8A;align-items:center;justify-content:center;cursor:pointer')}>
          <Text style={s('font-size:14px;font-weight:700;color:#fff')}>{vm.actionLoading ? '올리는 중…' : '질문 올리기'}</Text>
        </Pressable>
      </Pressable>
    </Pressable>
  )
}
