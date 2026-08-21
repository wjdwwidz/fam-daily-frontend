import { View, Text, Pressable, TextInput } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'
import Avatar from '../components/Avatar.jsx'

import { useVm } from '../vm/useVm.js'

export default function Media() {
  const vm = useVm()
  return (
    <View style={s('padding:0 0 120px')}>
      <View style={s('display:flex;align-items:center;justify-content:space-between;padding:sm 4xl 2xl')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <View style={s('width:40px;height:40px')} />
        <View style={s('position:relative')}>
          <Pressable onPress={vm.toggleMenuMedia} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center')}>
            <Text style={s('color:#8497A1;font-size:17.4px')}>⋯</Text>
          </Pressable>
          {vm.isMenuMedia && (
            <View style={s('position:absolute;right:0;top:46px;background:#fff;border:1px solid #FFE1EC;border-radius:14px;box-shadow:0 12px 30px rgba(255,94,138,0.22);overflow:hidden;z-index:20;min-width:128px')}>
              <Pressable onPress={vm.startEditMedia} style={s('display:flex;align-items:center;gap:lg;padding:xl 3xl;border-bottom:1px solid #FDECF2')}>
                <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="#FF5E8A" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round"><Path d="M4 20 h4 L18.5 9.5 a2 2 0 0 0 -3 -3 L5 17 Z" /></Svg>
                <Text style={s('font-size:13px;font-weight:600;color:#17303B')}>수정하기</Text>
              </Pressable>
              <Pressable onPress={vm.deleteMedia} style={s('display:flex;align-items:center;gap:lg;padding:xl 3xl')}>
                <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" color="#E5484D"><Path d="M5 7 h14 M9 7 V5 h6 v2 M6 7 l1 13 h10 l1 -13" /></Svg>
                <Text style={s('font-size:13px;font-weight:600;color:#E5484D')}>삭제하기</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <View style={s(`height:300px;position:relative;background-color:${vm.currentMedia.tone};background-image:repeating-linear-gradient(45deg,rgba(255,255,255,0.35) 0 12px,transparent 12px 24px);display:flex;align-items:center;justify-content:center;margin:0 5xl;border-radius:28px;overflow:hidden`)}>
        <Text style={s('font-family:ui-monospace,Menlo,monospace;font-size:11px;color:rgba(23,48,59,0.4)')}>{vm.currentMedia.ph}</Text>
        {vm.currentMedia.isVideo && (
          <View style={s('position:absolute;inset:0;display:flex;align-items:center;justify-content:center')}>
            <View style={s('width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.94);display:flex;align-items:center;justify-content:center;')}>
              <Svg viewBox="0 0 24 24" width={28} height={28} fill="#12B5F0" stroke="none" style={s('margin-left:xs')}><Path d="M8 5 L19 12 L8 19 Z" /></Svg>
            </View>
          </View>
        )}
      </View>
      <View style={s('padding:4xl screenX 0')}>
        {vm.editMedia && (
          <>
          <Text style={s('font-size:11px;font-weight:800;color:#FF5E8A;letter-spacing:0.4px;margin-bottom:labelGap')}>설명</Text>
          <TextInput multiline textAlignVertical="top" value={vm.mediaDraft.title} onChangeText={vm.onMediaTitle} placeholder="이 순간을 설명해 보세요" placeholderTextColor="#9DB2BD" style={s('width:100%;box-sizing:border-box;min-height:70px;resize:none;border:1px solid #FFE1EC;border-radius:12px;padding:xl 2xl;font-size:13.5px;font-weight:500;line-height:1.55;font-family:inherit;color:#17303B;outline:none;background:#FFFAFC')} />
          <View style={s('display:flex;gap:lg;margin:ctaTop 0 ctaBottom')}>
            <Pressable onPress={vm.cancelEdit} style={s('flex:1;align-items:center;justify-content:center;padding:btnY xl;border-radius:14px;border:1px solid #FFE1EC')}>
              <Text style={s('color:#8497A1;font-size:13.5px;font-weight:700')}>취소</Text>
            </Pressable>
            <Pressable onPress={vm.saveMedia} style={s('flex:2;align-items:center;justify-content:center;padding:btnY xl;border-radius:14px;background:#FF5E8A;box-shadow:0 10px 22px rgba(255,94,138,0.3)')}>
              <Text style={s('color:#fff;font-size:13.5px;font-weight:800')}>저장하기</Text>
            </Pressable>
          </View>
          </>
        )}
        {vm.readMedia && (
          <>
          <Text style={s('font-size:14px;color:#2B3A43;line-height:1.6;margin-bottom:3xl;white-space:pre-wrap')}>{vm.currentMedia.title}</Text>
        <View style={s('display:flex;align-items:center;gap:xl')}>
          <Avatar photoUrl={vm.currentMedia.by.photoUrl} ini={vm.currentMedia.by.ini} size={38} />
          <View style={s('flex:1')}><Text style={s('font-size:11.7px;font-weight:700;color:#17303B')}>{vm.currentMedia.by.name}님이 올림</Text><Text style={s('font-size:11px;color:#9DB2BD')}>{vm.currentMedia.date}</Text></View>
          <Pressable onPress={vm.toggleMediaLike} style={s(vm.likeBtnStyle)}>
            <Svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" stroke="none" color="#FF5E8A"><Path d="M12 20 C12 20 4 15 4 9.2 C4 6.4 6.1 4.8 8.2 4.8 C10 4.8 11.4 6 12 7 C12.6 6 14 4.8 15.8 4.8 C17.9 4.8 20 6.4 20 9.2 C20 15 12 20 12 20 Z" /></Svg>
            <Text>{vm.mediaHearts}</Text>
          </Pressable>
        </View>
        <Text style={s('margin-top:5xl;font-size:11px;font-weight:800;color:#9DB2BD;letter-spacing:0.4px')}>댓글 {vm.commentCount}</Text>
        <View style={s('margin-top:xs')}>
          {vm.comments.map((c, i) => (
            <View key={i} style={s('display:flex;gap:lg;padding:2xl 0;border-bottom:1px solid #F0DEE6')}>
              <Avatar photoUrl={c.photoUrl} ini={c.ini} size={30} />
              <View style={s('flex:1;min-width:0')}>
                {c.editing && (
                  <View style={s('display:flex;align-items:center;gap:md')}>
                    <TextInput value={c.draft} onChangeText={vm.onEditCmtInput} onSubmitEditing={vm.onEditCmtKey} style={s('flex:1;min-width:0;border:1px solid #FFE1EC;border-radius:10px;background:#FFFAFC;font-size:11.5px;font-family:inherit;color:#17303B;padding:md lg;outline:none')} />
                    <Pressable onPress={c.save} style={s('flex:0 0 auto')}><Text style={s('color:#FF5E8A;font-size:11.5px;font-weight:800')}>저장</Text></Pressable>
                  </View>
                )}
                {c.viewing && (
                  <>
                  <View style={s('display:flex;align-items:flex-start;gap:sm')}>
                    <Text style={s('flex:1;min-width:0;font-size:11.5px;color:#3F4E58;line-height:1.55')}><Text style={s('color:#17303B;font-weight:700')}>{c.name}</Text>  {c.text}</Text>
                    <Pressable onPress={c.edit} style={s('flex:0 0 auto;padding:hair hair')}><Text style={s('color:#B4C1CA;font-size:10.5px;font-weight:700')}>수정</Text></Pressable>
                  </View>
                  <Text style={s('font-size:10px;color:#B4C1CA;margin-top:xs')}>{c.when}</Text>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>
        <View style={s('display:flex;align-items:center;gap:lg;margin-top:3xl')}>
          <TextInput value={vm.commentDraft} onChangeText={vm.onCommentInput} onSubmitEditing={vm.onCommentKey} placeholder="따뜻한 댓글을 남겨보세요" placeholderTextColor="#9DB2BD" style={s('flex:1;border:none;outline:none;background:transparent;font-size:12.5px;font-family:inherit;color:#17303B;padding:md 0;border-bottom:1px solid #F0DEE6')} />
          <Pressable onPress={vm.addComment} style={s('flex:0 0 auto;padding:sm xs')}><Text style={s('color:#FF5E8A;font-size:12.5px;font-weight:800')}>등록</Text></Pressable>
        </View>
          </>
        )}
      </View>
    </View>
  )
}
