import { View, Text, Image, Pressable, TextInput } from 'react-native'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { s } from '../lib/style.js'

export default function Word({ vm }) {
  return (
    <View style={s('padding:0 0 120px')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;padding:6px 18px 14px')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <View style={s('position:relative')}>
          <Pressable onPress={vm.toggleMenuWord} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer')}>
            <Text style={s('color:#8497A1;font-size:17.4px')}>⋯</Text>
          </Pressable>
          {vm.isMenuWord && (
            <View style={s('position:absolute;right:0;top:46px;background:#fff;border:1px solid #FFE1EC;border-radius:14px;box-shadow:0 12px 30px rgba(255,94,138,0.22);overflow:hidden;z-index:20;min-width:128px')}>
              <Pressable onPress={vm.startEditWord} style={s('display:flex;flex-direction:row;align-items:center;gap:9px;padding:12px 15px;cursor:pointer;border-bottom:1px solid #FDECF2')}>
                <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="#FF5E8A" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M4 20 h4 L18.5 9.5 a2 2 0 0 0 -3 -3 L5 17 Z" /></Svg>
                <Text style={s('font-size:13px;font-weight:600;color:#17303B')}>수정하기</Text>
              </Pressable>
              <Pressable onPress={vm.deleteWord} style={s('display:flex;flex-direction:row;align-items:center;gap:9px;padding:12px 15px;cursor:pointer')}>
                <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#E5484D"><Path d="M5 7 h14 M9 7 V5 h6 v2 M6 7 l1 13 h10 l1 -13" /></Svg>
                <Text style={s('font-size:13px;font-weight:600;color:#E5484D')}>삭제하기</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {vm.editWord && (
        <View style={s('padding:0 22px')}>
          <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin-bottom:6px')}>단어</Text>
          <TextInput value={vm.wordDraft.term} onChangeText={vm.onWordTerm} style={s('width:100%;box-sizing:border-box;border:1px solid #FFE1EC;border-radius:12px;padding:12px 14px;font-size:20px;font-weight:800;font-family:inherit;color:#17303B;outline:none;background:#FFFAFC')} />
          <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin:16px 0 6px')}>발음</Text>
          <TextInput value={vm.wordDraft.reading} onChangeText={vm.onWordReading} style={s('width:100%;box-sizing:border-box;border:1px solid #FFE1EC;border-radius:12px;padding:11px 14px;font-size:14px;font-family:inherit;color:#17303B;outline:none;background:#FFFAFC')} />
          <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin:16px 0 6px')}>뜻</Text>
          <TextInput value={vm.wordDraft.meaning} onChangeText={vm.onWordMeaning} multiline textAlignVertical="top" style={s('width:100%;box-sizing:border-box;border:1px solid #FFE1EC;border-radius:12px;padding:11px 14px;font-size:14px;font-family:inherit;color:#17303B;outline:none;background:#FFFAFC;resize:none;line-height:1.6')} />
          <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin:16px 0 6px')}>이럴 때 써요</Text>
          <TextInput value={vm.wordDraft.example} onChangeText={vm.onWordExample} multiline textAlignVertical="top" style={s('width:100%;box-sizing:border-box;border:1px solid #FFE1EC;border-radius:12px;padding:11px 14px;font-size:14px;font-family:inherit;color:#17303B;outline:none;background:#FFFAFC;resize:none;line-height:1.6')} />
          {vm.wordDraft.photo && (
            <View style={s('margin-top:14px;position:relative')}>
              <Image source={vm.wordDraft.photo} style={s('width:100%;border-radius:14px;display:block')} resizeMode="cover" />
              <Pressable onPress={vm.removeWordPhoto} style={s('position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;background:rgba(23,48,59,0.55);display:flex;align-items:center;justify-content:center;cursor:pointer')}>
                <Text style={s('color:#fff;font-size:15px')}>×</Text>
              </Pressable>
            </View>
          )}
          {vm.noWordPhoto && (
            <Pressable style={s('margin-top:14px;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:7px;padding:14px;border:1.5px dashed #FFC4D8;border-radius:14px;cursor:pointer;background:#FFF6FA')}>
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#FF5E8A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Rect x={3} y={5} width={18} height={14} rx={3} /><Circle cx={9} cy={11} r={2} /><Path d="M21 17l-5-5-4 4-2-2-4 4" /></Svg>
              <Text style={s('color:#FF5E8A;font-size:13.5px;font-weight:700')}>사진 추가하기</Text>
            </Pressable>
          )}
          <View style={s('display:flex;flex-direction:row;gap:10px;margin-top:20px')}>
            <Pressable onPress={vm.cancelEdit} style={s('flex:1;align-items:center;justify-content:center;padding:14px;border-radius:14px;border:1px solid #FFE1EC;cursor:pointer')}>
              <Text style={s('color:#8497A1;font-size:14px;font-weight:700')}>취소</Text>
            </Pressable>
            <Pressable onPress={vm.saveWord} style={s('flex:2;align-items:center;justify-content:center;padding:14px;border-radius:14px;background:#FF5E8A;cursor:pointer;box-shadow:0 10px 22px rgba(255,94,138,0.3)')}>
              <Text style={s('color:#fff;font-size:14px;font-weight:800')}>저장하기</Text>
            </Pressable>
          </View>
        </View>
      )}

      {vm.readWord && (
      <View style={s('padding:0 22px')}>
        <View style={s('display:flex;flex-direction:row;align-items:center;gap:9px;margin-bottom:16px')}>
          <View style={s(`width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 auto;background:${vm.currentWord.by.c}`)}>
            <Text style={s('color:#fff;font-weight:700;font-size:12.5px')}>{vm.currentWord.by.ini}</Text>
          </View>
          <View style={s('flex:1')}>
            <Text style={s('font-size:12px;font-weight:700;color:#17303B')}>{vm.currentWord.by.name}</Text>
            <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:1px')}>{vm.currentWord.date} 등록</Text>
          </View>
        </View>

        <Text style={s('font-size:40px;font-weight:800;color:#17303B;letter-spacing:-1.3px;line-height:1.05')}>{vm.currentWord.term}</Text>
        <Text style={s('font-size:15px;color:#FF5E8A;font-weight:600;margin-top:6px')}>“{vm.currentWord.reading}”</Text>

        <View style={s('height:1px;background:#F0DEE6;margin:18px 0')}></View>

        <Text style={s('font-size:12px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin-bottom:8px')}>뜻</Text>
        <Text style={s('font-size:15px;color:#293842;line-height:1.7;font-weight:500')}>{vm.currentWord.meaning}</Text>

        <View style={s('height:1px;background:#F0DEE6;margin:22px 0')}></View>

        <Text style={s('font-size:12px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin-bottom:8px')}>💬 이럴 때 써요</Text>
        <Text style={s('font-size:14.5px;color:#3F4E58;line-height:1.7')}>{vm.currentWord.example}</Text>
        {vm.currentWord.photo && (
          <View style={s('margin-top:18px;border-radius:18px;height:200px;overflow:hidden;position:relative;background-color:#FFF0F5;align-items:center;justify-content:center;flex-direction:column;gap:8px')}>
            <Svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke="#9DB2BD" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><Rect x={3} y={5} width={18} height={15} rx={2.5} /><Circle cx={8.5} cy={10} r={1.8} /><Path d="M4 18 L10 12 L14 15.5 L17 12.5 L20 15.5" /></Svg>
            <Text style={s('font-family:ui-monospace,Menlo,monospace;font-size:11px;color:#9DB2BD')}>{vm.currentWord.ph}</Text>
          </View>
        )}
      </View>
      )}
    </View>
  )
}
