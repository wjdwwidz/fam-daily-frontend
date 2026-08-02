import { View, Text, Image, Pressable, TextInput } from 'react-native'
import Svg, { Path, Circle, Rect } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

export default function Word() {
  const vm = useVm()
  return (
    <View style={s('padding:0 0 120px')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;padding:sm 4xl 2xl')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <View style={s('flex-direction:row;align-items:center;gap:md')}>
          <Pressable onPress={vm.startEditWord} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer')}>
            <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#FF5E8A" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M4 20 h4 L18.5 9.5 a2 2 0 0 0 -3 -3 L5 17 Z" /></Svg>
          </Pressable>
          <Pressable onPress={vm.deleteWord} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer')}>
            <Svg viewBox="0 0 24 24" width={17} height={17} fill="none" stroke="#E5484D" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 7 h14 M9 7 V5 h6 v2 M6 7 l1 13 h10 l1 -13" /></Svg>
          </Pressable>
        </View>
      </View>

      {vm.editWord && (
        <View style={s('padding:0 6xl')}>
          <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin-bottom:sm')}>단어</Text>
          <TextInput value={vm.wordDraft.term} onChangeText={vm.onWordTerm} style={s('width:100%;box-sizing:border-box;border:1px solid #FFE1EC;border-radius:12px;padding:xl 2xl;font-size:20px;font-weight:800;font-family:inherit;color:#17303B;outline:none;background:#FFFAFC')} />
          <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin:3xl 0 sm')}>발음</Text>
          <TextInput value={vm.wordDraft.reading} onChangeText={vm.onWordReading} style={s('width:100%;box-sizing:border-box;border:1px solid #FFE1EC;border-radius:12px;padding:xl 2xl;font-size:14px;font-family:inherit;color:#17303B;outline:none;background:#FFFAFC')} />
          <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin:3xl 0 sm')}>뜻</Text>
          <TextInput value={vm.wordDraft.meaning} onChangeText={vm.onWordMeaning} multiline textAlignVertical="top" style={s('width:100%;box-sizing:border-box;border:1px solid #FFE1EC;border-radius:12px;padding:xl 2xl;font-size:14px;font-family:inherit;color:#17303B;outline:none;background:#FFFAFC;resize:none;line-height:1.6')} />
          <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin:3xl 0 sm')}>이럴 때 써요</Text>
          <TextInput value={vm.wordDraft.example} onChangeText={vm.onWordExample} multiline textAlignVertical="top" style={s('width:100%;box-sizing:border-box;border:1px solid #FFE1EC;border-radius:12px;padding:xl 2xl;font-size:14px;font-family:inherit;color:#17303B;outline:none;background:#FFFAFC;resize:none;line-height:1.6')} />
          {vm.wordDraft.photo && (
            <View style={s('margin-top:2xl;position:relative')}>
              <Image source={typeof vm.wordDraft.photo === 'string' ? { uri: vm.wordDraft.photo } : vm.wordDraft.photo} style={s('width:100%;height:200px;border-radius:14px')} resizeMode="cover" />
              <Pressable onPress={vm.removeWordPhoto} style={s('position:absolute;top:10px;right:10px;width:28px;height:28px;border-radius:50%;background:rgba(23,48,59,0.55);display:flex;align-items:center;justify-content:center;cursor:pointer')}>
                <Text style={s('color:#fff;font-size:15px')}>×</Text>
              </Pressable>
              {vm.photoUploading && (
                <View style={s('position:absolute;inset:0;border-radius:14px;background:rgba(23,48,59,0.45);display:flex;align-items:center;justify-content:center')}>
                  <Text style={s('color:#fff;font-size:13px;font-weight:700')}>업로드 중…</Text>
                </View>
              )}
            </View>
          )}
          {vm.photoError && <Text style={s('margin-top:md;font-size:11.5px;color:#E5484D')}>{vm.photoError}</Text>}
          {vm.noWordPhoto && (
            <Pressable onPress={vm.pickWordPhoto} style={s('margin-top:2xl;display:flex;flex-direction:row;align-items:center;justify-content:center;gap:md;padding:2xl;border:1.5px dashed #FFC4D8;border-radius:14px;cursor:pointer;background:#FFF6FA')}>
              <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#FF5E8A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><Rect x={3} y={5} width={18} height={14} rx={3} /><Circle cx={9} cy={11} r={2} /><Path d="M21 17l-5-5-4 4-2-2-4 4" /></Svg>
              <Text style={s('color:#FF5E8A;font-size:13.5px;font-weight:700')}>사진 추가하기</Text>
            </Pressable>
          )}
          <View style={s('display:flex;flex-direction:row;gap:lg;margin-top:5xl')}>
            <Pressable onPress={vm.cancelEdit} style={s('flex:1;align-items:center;justify-content:center;padding:2xl;border-radius:14px;border:1px solid #FFE1EC;cursor:pointer')}>
              <Text style={s('color:#8497A1;font-size:14px;font-weight:700')}>취소</Text>
            </Pressable>
            <Pressable onPress={vm.saveWord} style={s('flex:2;align-items:center;justify-content:center;padding:2xl;border-radius:14px;background:#FF5E8A;cursor:pointer;box-shadow:0 10px 22px rgba(255,94,138,0.3)')}>
              <Text style={s('color:#fff;font-size:14px;font-weight:800')}>저장하기</Text>
            </Pressable>
          </View>
        </View>
      )}

      {vm.readWord && (
      <View style={s('padding:0 3xl')}>
        <View style={s('background:#FFFDFB;border:1px solid #F1E2E9;border-radius:0;padding:6xl 6xl;box-shadow:0 14px 34px rgba(214,150,175,0.14)')}>
        <View style={s('display:flex;flex-direction:row;align-items:center;gap:lg;margin-bottom:3xl')}>
          <View style={s(`width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex:0 0 auto;background:${vm.currentWord.by.c}`)}>
            <Text style={s('color:#fff;font-weight:700;font-size:12.5px')}>{vm.currentWord.by.ini}</Text>
          </View>
          <View style={s('flex:1')}>
            <Text style={s('font-size:12px;font-weight:700;color:#17303B')}>{vm.currentWord.by.name}</Text>
            <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:hair')}>{vm.currentWord.date} 등록</Text>
          </View>
        </View>

        <Text style={s('font-size:32px;font-weight:800;color:#17303B;letter-spacing:-1px;line-height:1.3')}>{vm.currentWord.term}</Text>
        <Text style={s('font-size:15px;color:#FF5E8A;font-weight:600;margin-top:md')}>“{vm.currentWord.reading}”</Text>

        <View style={s('height:1px;background:#F0DEE6;margin:4xl 0')}></View>

        <Text style={s('font-size:12px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin-bottom:md')}>뜻</Text>
        <Text style={s('font-size:15px;color:#293842;line-height:1.7;font-weight:500')}>{vm.currentWord.meaning}</Text>

        <View style={s('height:1px;background:#F0DEE6;margin:6xl 0')}></View>

        <Text style={s('font-size:12px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin-bottom:md')}>💬 이럴 때 써요</Text>
        <Text style={s('font-size:14.5px;color:#3F4E58;line-height:1.7')}>{vm.currentWord.example}</Text>
        {vm.currentWord.photoUrl && (
          <Image source={{ uri: vm.currentWord.photoUrl }} style={s('margin-top:4xl;width:100%;height:220px;border-radius:18px')} resizeMode="cover" />
        )}
        </View>
      </View>
      )}
    </View>
  )
}
