import { View, Text, Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function AnswerSheet() {
  const vm = useVm()
  const insets = useSafeAreaInsets()
  return (
    <Pressable onPress={vm.closeAnswer} style={s('position:absolute;inset:0;background:rgba(23,48,59,0.5);z-index:45;flex-direction:row;align-items:flex-end;animation:sfade .18s ease')}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={insets.top}
        style={{ width: '100%' }}
      >
        <Pressable onPress={vm.stopEvt} style={s('width:100%;background:#fff;border-radius:26px 26px 0 0;padding:5xl 5xl 7xl;animation:sheetup .26s cubic-bezier(.4,0,.2,1)')}>
          <View style={s('width:40px;height:4px;border-radius:2px;background:#EADCE2;margin:0 auto 4xl')} />
          <View style={s('flex-direction:row;align-items:center;justify-content:space-between')}>
            <Text style={s('font-size:11px;font-weight:700;color:#FF5E8A;letter-spacing:0.4px')}>{vm.todayQ.no} 문답</Text>
            <Pressable onPress={vm.closeAnswer} hitSlop={12} style={s('width:28px;height:28px;border-radius:9px;align-items:center;justify-content:center')}>
              <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#B7C3CC" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <Path d="M6 6 L18 18" />
                <Path d="M18 6 L6 18" />
              </Svg>
            </Pressable>
          </View>
          <Text style={s('font-size:16px;font-weight:800;color:#17303B;margin-top:sm;line-height:1.4')}>{vm.todayQ.q}</Text>
          <TextInput multiline textAlignVertical="top" value={vm.answerDraft} onChangeText={vm.onAnswerInput} placeholder="내 답변을 적어보세요" placeholderTextColor="#9DB2BD" style={s('width:100%;min-height:96px;margin-top:fieldGap;border:1px solid #FFE1EC;outline:none;background:#FFF6FB;border-radius:14px;padding:2xl 3xl;font-size:13.5px;font-family:inherit;color:#17303B;resize:none')} />
          <Pressable onPress={vm.submitAnswer} style={s('margin-top:ctaTop;height:54px;border-radius:17px;background:#FF5E8A;align-items:center;justify-content:center;cursor:pointer')}>
            <Text style={s('font-size:14px;font-weight:700;color:#fff')}>{vm.actionLoading ? (vm.editingAnswer ? '수정 중…' : '남기는 중…') : (vm.editingAnswer ? '답변 수정하기' : '답변 남기기')}</Text>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Pressable>
  )
}
