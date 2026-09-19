import { View, Text, Pressable, Image, TextInput, ScrollView } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

const MAX = 30

// 버킷리스트 한 칸 — 내용을 쓰고, 달성 체크하고, 일상 글을 이어붙인다.
export default function BucketItem() {
  const vm = useVm()
  const left = MAX - (vm.bucketDraft || '').length

  return (
    <View style={s('padding:screenTop screenX screenBottom')}>
      <View style={s('display:flex;align-items:center;gap:xl;margin:sm 0 2xl')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:20px;font-weight:800;color:#17303B;letter-spacing:-0.4px')}>{vm.bucketNo}번</Text>
        {!!vm.bucketByName && (
          <Text style={s('font-size:11.3px;color:#9DB2BD')}>{vm.bucketByName}님이 적음</Text>
        )}
      </View>

      {/* 내용 */}
      <View style={s('flex-direction:row;align-items:baseline;justify-content:space-between;margin:0 hair sm')}>
        <Text style={s('font-size:11.3px;font-weight:700;color:#17303B')}>하고 싶은 일</Text>
        <Text style={s(`font-size:10.5px;color:${left < 0 ? '#E5484D' : '#9DB2BD'}`)}>{left}자 남음</Text>
      </View>
      <TextInput
        value={vm.bucketDraft}
        onChangeText={vm.onBucketDraft}
        maxLength={MAX}
        placeholder="예) 제주도에서 가족사진 찍기"
        placeholderTextColor="#9DB2BD"
        style={s('width:100%;background:#fff;border:1px solid #FFE1EC;border-radius:16px;padding:2xl 3xl;font-size:12.5px;font-family:inherit;color:#17303B;outline:none')}
      />

      {/* 달성 — 가족 공동 */}
      <Pressable onPress={vm.toggleBucketDone} style={s('flex-direction:row;align-items:center;gap:md;margin-top:3xl;background:#fff;border:1px solid #FFE1EC;border-radius:16px;padding:2xl 3xl;cursor:pointer')}>
        <View style={s(`width:20px;height:20px;border-radius:6px;align-items:center;justify-content:center;border:1.5px solid ${vm.bucketDoneDraft ? '#FF5E8A' : '#E7D3DC'};background:${vm.bucketDoneDraft ? '#FF5E8A' : 'transparent'}`)}>
          {vm.bucketDoneDraft && (
            <Svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 13 L10 18 L19 7" /></Svg>
          )}
        </View>
        <View style={s('flex:1;min-width:0')}>
          <Text style={s('font-size:12.5px;font-weight:700;color:#17303B')}>우리 가족 달성!</Text>
          <Text style={s('font-size:10.5px;color:#9DB2BD;margin-top:hair')}>
            {vm.bucketDoneWhen ? `${vm.bucketDoneWhen} 달성` : '함께 이룬 일로 기록돼요'}
          </Text>
        </View>
      </Pressable>

      {/* 일상 글 연결 */}
      <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:3xl hair sm')}>일상 글 연결</Text>
      {vm.bucketMediaCover ? (
        <View style={s('flex-direction:row;align-items:center;gap:xl;background:#fff;border:1px solid #FFE1EC;border-radius:16px;padding:xl 2xl')}>
          <Image source={{ uri: vm.bucketMediaCover }} style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: '#F3DCE6' }} resizeMode="cover" />
          <Text style={s('flex:1;min-width:0;font-size:12px;color:#6A7E88')}>이 순간이 담긴 일상 글</Text>
          <Pressable onPress={vm.unlinkBucketMedia}>
            <Text style={s('font-size:11.5px;color:#FF5E8A;font-weight:700')}>해제</Text>
          </Pressable>
        </View>
      ) : (
        <View style={s('flex-direction:row;gap:md')}>
          <Pressable onPress={vm.openBucketPicker} style={s('flex:1;border:1.5px dashed #FFC4D8;border-radius:16px;padding:3xl md;align-items:center;background:#FFF6FA;cursor:pointer')}>
            <Text style={s('font-size:11.5px;color:#FF5E8A;font-weight:700')}>기존 글에서 고르기</Text>
          </Pressable>
          <Pressable onPress={vm.startBucketMedia} style={s('flex:1;border:1.5px dashed #C7E7F7;border-radius:16px;padding:3xl md;align-items:center;background:#F3FAFE;cursor:pointer')}>
            <Text style={s('font-size:11.5px;color:#3AA0D1;font-weight:700')}>＋ 새 일상 쓰기</Text>
          </Pressable>
        </View>
      )}

      {/* 고르기 — 가족이 올린 글의 대표 사진 */}
      {vm.bucketPicking && (
        <View style={s('margin-top:lg')}>
          {vm.bucketPickable.length === 0 ? (
            <Text style={s('font-size:11.5px;color:#9DB2BD;text-align:center;padding:2xl')}>아직 올린 일상 글이 없어요</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s('gap:md')}>
              {vm.bucketPickable.map((m) => (
                <Pressable key={m.id} onPress={m.pick}>
                  <Image source={{ uri: m.coverUrl }} style={{ width: 72, height: 72, borderRadius: 14, backgroundColor: '#F3DCE6' }} resizeMode="cover" />
                </Pressable>
              ))}
            </ScrollView>
          )}
          <Pressable onPress={vm.closeBucketPicker} style={s('align-self:center;margin-top:md')}>
            <Text style={s('font-size:11.5px;color:#9DB2BD')}>닫기</Text>
          </Pressable>
        </View>
      )}

      {/* 우선순위 조정 — 고른 번호로 옮기고 사이 칸들은 한 칸씩 밀린다 */}
      {!!vm.bucketByName && (
        <>
          <Text style={s('font-size:11.3px;font-weight:700;color:#17303B;margin:3xl hair sm')}>순서 바꾸기</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s('gap:sm')}>
            {vm.bucketMoveOptions.map((o) => (
              <Pressable
                key={o.no}
                onPress={o.pick}
                disabled={o.current || vm.bucketSaving}
                style={s(`min-width:38px;height:38px;padding:0 md;border-radius:12px;align-items:center;justify-content:center;background:${o.current ? '#FF5E8A' : '#fff'};border:1px solid ${o.current ? '#FF5E8A' : '#FFE1EC'}`)}
              >
                <Text style={s(`font-size:12.5px;font-weight:700;font-variant:tabular-nums;color:${o.current ? '#fff' : '#6A7E88'}`)}>{o.no}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={s('font-size:10.5px;color:#9DB2BD;margin:sm hair 0')}>번호를 누르면 그 자리로 옮겨가고, 사이 칸들은 한 칸씩 밀려요</Text>
        </>
      )}

      {vm.bucketError && <Text style={s('font-size:12px;color:#E5484D;margin-top:2xl;text-align:center')}>{vm.bucketError}</Text>}

      <Pressable onPress={vm.saveBucket} disabled={vm.bucketSaving} style={s(`margin:ctaTop 0 md;height:54px;border-radius:17px;background:#FF5E8A;align-items:center;justify-content:center;opacity:${vm.bucketSaving ? 0.7 : 1}`)}>
        <Text style={s('color:#fff;font-size:14px;font-weight:800')}>{vm.bucketSaving ? '저장 중…' : '저장하기'}</Text>
      </Pressable>
      <Pressable onPress={vm.clearBucket} style={s('align-self:center;padding:md')}>
        <Text style={s('font-size:11.5px;color:#9DB2BD')}>이 칸 비우기</Text>
      </Pressable>
    </View>
  )
}
