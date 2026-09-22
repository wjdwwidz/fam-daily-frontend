import { View, Text, Pressable, TextInput, Image, ScrollView, ActivityIndicator } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import DragReorder from '../components/DragReorder.jsx'
import WheelChip from '../components/WheelChip.jsx'

import { useVm } from '../vm/useVm.js'

// 첨부한 사진을 빼는 버튼. 사진 위에 얹히므로 어두운 반투명 바탕에 흰 X 를 그린다.
// hitSlop 으로 실제 누를 수 있는 범위를 넓혀 작은 썸네일에서도 잘 눌린다.
function RemoveButton({ onPress, top, right, size }) {
  if (!onPress) return null
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel="사진 빼기"
      hitSlop={10}
      style={s(`position:absolute;top:${top}px;right:${right}px;width:${size}px;height:${size}px;border-radius:50%;background:rgba(23,48,59,0.6);align-items:center;justify-content:center;z-index:2`)}
    >
      <Svg viewBox="0 0 24 24" width={size * 0.45} height={size * 0.45} fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round">
        <Path d="M6 6 L18 18 M18 6 L6 18" />
      </Svg>
    </Pressable>
  )
}

const THUMB = 140

// 썸네일 한 칸 — 고정된 사진과 끌 수 있는 사진이 같은 모양이어야 해서 함수로 뺀다
function Thumb({ it, dragging }) {
  return (
    <>
      <View style={{ width: '100%', height: '100%', borderRadius: 18, overflow: 'hidden', backgroundColor: '#FCEEF4', ...(dragging ? { borderWidth: 2, borderColor: '#FF5E8A' } : null) }}>
        {/* 고른 사진은 원본(수 MB)이다. 안드로이드는 resizeMethod="resize" 로 칸 크기로 줄여 풀고,
          웹은 작은 미리보기(makeThumb)를 만들어 그걸 쓴다 — 만드는 동안 uri 가 비어 있다 */}
        {it.uri ? (
          <Image source={{ uri: it.uri }} style={{ width: '100%', height: '100%' }} resizeMode="cover" resizeMethod="resize" />
        ) : (
          // 웹: 미리보기용 작은 사진을 만드는 중
          <View style={s('flex:1;align-items:center;justify-content:center')}>
            <ActivityIndicator color="#FF9FBC" />
          </View>
        )}
        {it.isVideo && (
          <View style={s('position:absolute;left:6px;top:6px;width:22px;height:22px;border-radius:50%;background:rgba(0,0,0,0.5);align-items:center;justify-content:center')}>
            <Svg viewBox="0 0 24 24" width={11} height={11} fill="#fff" stroke="none" style={{ marginLeft: 1 }}><Path d="M8 5 L19 12 L8 19 Z" /></Svg>
          </View>
        )}
      </View>
      <RemoveButton onPress={it.remove} top={6} right={6} size={24} />
    </>
  )
}

// 년·월·일 칩 셋 — 누르면 그 칸만 휠로 떠서 굴려 고른다 (버킷리스트 이룬 날과 같은 모양)
function DateChips({ wheel, onPart }) {
  return (
    <View style={s('flex-direction:row;align-items:center;gap:sm')}>
      <WheelChip items={wheel.years} value={wheel.y} unit="년" width={84} onChange={(n) => onPart('y', n)} />
      <WheelChip items={wheel.months} value={wheel.m} unit="월" onChange={(n) => onPart('m', n)} />
      <WheelChip items={wheel.days} value={wheel.d} unit="일" onChange={(n) => onPart('d', n)} />
    </View>
  )
}

// 언제의 일인지 — 고르지 않으면 날짜 없이 올라간다. 며칠 동안의 일이면 끝나는 날도.
function DateField({ vm }) {
  return (
    <>
      <Text style={s('margin-top:3xl;font-size:11.3px;font-weight:700;color:#17303B;margin-bottom:md')}>언제</Text>
      {vm.uploadTakenFrom ? (
        <View style={s('background:#fff;border:1px solid #FFE1EC;border-radius:16px;padding:lg 2xl;gap:md')}>
          {/* 이름표는 칩 위에 — 옆에 두면 좁은 폰에서 칩 셋에 밀려 '시…' 로 잘린다 */}
          <View style={s('gap:xs')}>
            <Text style={s('font-size:10.5px;color:#9DB2BD')}>{vm.uploadTakenTo ? '시작' : '날짜'}</Text>
            <DateChips wheel={vm.uploadFromWheel} onPart={(part, n) => vm.setMediaDatePart('from', part, n)} />
          </View>
          {!!vm.uploadTakenTo && (
            <View style={s('gap:xs')}>
              <Text style={s('font-size:10.5px;color:#9DB2BD')}>끝</Text>
              <DateChips wheel={vm.uploadToWheel} onPart={(part, n) => vm.setMediaDatePart('to', part, n)} />
            </View>
          )}
          <View style={s('flex-direction:row;align-items:center;justify-content:space-between;padding-top:md;border-top:1px solid #FBEDF3')}>
            {/* 며칠 동안 — 켜면 끝나는 날이 생긴다 (처음엔 시작일과 같은 날) */}
            <Pressable onPress={vm.toggleMediaRange} hitSlop={6} style={s('flex-direction:row;align-items:center;gap:md;cursor:pointer')}>
              <View style={s(`width:18px;height:18px;border-radius:5px;align-items:center;justify-content:center;border:1.5px solid ${vm.uploadTakenTo ? '#FF5E8A' : '#E7D3DC'};background:${vm.uploadTakenTo ? '#FF5E8A' : 'transparent'}`)}>
                {!!vm.uploadTakenTo && (
                  <Svg viewBox="0 0 24 24" width={11} height={11} fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round"><Path d="M5 13 L10 18 L19 7" /></Svg>
                )}
              </View>
              <Text style={s('font-size:11.5px;color:#6A7E88;font-weight:700')}>며칠 동안이었어요</Text>
            </Pressable>
            <Pressable onPress={vm.removeMediaDate} hitSlop={8}>
              <Text style={s('font-size:11.5px;color:#9DB2BD')}>빼기</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable onPress={vm.addMediaDate} style={s('flex-direction:row;align-items:center;gap:md;border:1.5px dashed #FFC4D8;border-radius:16px;padding:xl 2xl;background:#FFF6FA;cursor:pointer')}>
          <Svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="#FF5E8A" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M5 6 h14 a1 1 0 0 1 1 1 v12 a1 1 0 0 1 -1 1 H5 a1 1 0 0 1 -1 -1 V7 a1 1 0 0 1 1 -1 Z" />
            <Path d="M4 10 H20 M8 4 V8 M16 4 V8" />
          </Svg>
          <Text style={s('font-size:12px;color:#FF5E8A;font-weight:700')}>날짜 추가</Text>
          <Text style={s('font-size:10.5px;color:#9DB2BD')}>안 고르면 날짜 없이 올라가요</Text>
        </Pressable>
      )}
    </>
  )
}

export default function Upload() {
  const vm = useVm()
  return (
    <View style={s('padding:0 0 8xl')}>
      <View style={s('flex-direction:row;align-items:center;justify-content:space-between;padding:sm 4xl 2xl')}>
        <Pressable onPress={vm.back} style={s('width:40px;height:40px;border-radius:13px;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);align-items:center;justify-content:center;color:#17303B')}>
          <Svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" color="#17303B"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
        </Pressable>
        <Text style={s('font-size:13.9px;font-weight:800;color:#17303B')}>{vm.uploadTitle}</Text>
        <View style={s('width:40px')}></View>
      </View>
      <View style={s('padding:sm screenX 0')}>
        {vm.uploadCount === 0 && (
          <Pressable onPress={vm.pickUploadPhoto} style={s('margin-top:3xl;height:200px;border-radius:28px;overflow:hidden;border:2px dashed #BEE6F7;background:#F3FAFE;flex-direction:column;align-items:center;justify-content:center;gap:xl')}>
            <View style={s('width:60px;height:60px;border-radius:26px;background:#FFF0F5;align-items:center;justify-content:center;color:#FF5E8A')}>
              <Svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" color="#FF5E8A"><Path d="M12 16 V5" /><Path d="M8 9 L12 5 L16 9" /><Path d="M5 15 v3 a1 1 0 0 0 1 1 h12 a1 1 0 0 0 1 -1 v-3" /></Svg>
            </View>
            <View style={s('text-align:center')}>
              <Text style={s('font-size:12.6px;font-weight:700;color:#17303B')}>{vm.uploadHint}</Text>
              <Text style={s('font-size:11px;color:#9DB2BD;margin-top:xs')}>사진은 최대 10장 고를 수 있어요</Text>
            </View>
          </Pressable>
        )}
        {vm.uploadCount > 0 && (
          <View style={s('margin-top:3xl')}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s('gap:md')}>
              {/* 맨 왼쪽 '+ 사진' — 고른 것에 덧붙인다 */}
              <Pressable onPress={vm.pickUploadPhoto} style={s('width:140px;height:140px;border-radius:18px;background:rgba(23,48,59,0.06);align-items:center;justify-content:center;cursor:pointer')}>
                <Text style={s('font-size:24px;color:#9DB2BD;line-height:1')}>＋</Text>
                <Text style={s('font-size:11.5px;color:#9DB2BD;margin-top:sm;font-weight:700')}>사진</Text>
              </Pressable>
              {/* 이미 올라간 사진 — 자리를 지킨다 (서버가 이 뒤에 새 사진을 붙인다) */}
              {vm.uploadFixedItems.map((it) => (
                <View key={it.key} style={{ width: THUMB, height: THUMB }}>
                  <Thumb it={it} />
                </View>
              ))}
              {/* 새로 고른 사진 — 끌어서 순서를 바꾼다 */}
              <DragReorder
                items={vm.uploadDraggableItems}
                itemWidth={THUMB}
                gap={10}
                onReorder={vm.reorderUpload}
                renderItem={(it, i, dragging) => (
                  <View style={{ height: THUMB }}>
                    <Thumb it={it} dragging={dragging} />
                  </View>
                )}
              />
            </ScrollView>
            <Text style={s('font-size:11px;color:#9DB2BD;margin-top:md')}>{vm.uploadCount}장 선택됨 · 최대 10장{vm.uploadDraggableItems.length > 1 ? ' · 끌어서 순서 변경' : ''}</Text>
          </View>
        )}
        {/* 버킷리스트 칸에 붙이려고 쓰는 중이면 알려준다 */}
        {!!vm.bucketLinkNo && (
          <View style={s('flex-direction:row;align-items:center;gap:md;margin-top:3xl;background:rgba(23,48,59,0.05);border-radius:14px;padding:xl 2xl')}>
            <Text style={s('flex:1;min-width:0;font-size:11.5px;color:#6A7E88;font-weight:700')}>
              버킷리스트 {vm.bucketLinkNo}번에 연결됩니다
            </Text>
            <Pressable onPress={vm.cancelBucketLink}>
              <Text style={s('font-size:11.5px;color:#9DB2BD')}>취소</Text>
            </Pressable>
          </View>
        )}
        <Text style={s('margin-top:4xl;font-size:11.3px;font-weight:700;color:#17303B;margin-bottom:md')}>설명</Text>
        <TextInput value={vm.uploadCaption} onChangeText={vm.onUploadCaption} multiline textAlignVertical="top" placeholder="이 순간을 한 줄로 남겨보세요" placeholderTextColor="#9DB2BD" style={s('width:100%;min-height:64px;border:none;outline:none;background:#fff;border:1px solid #FFE1EC;box-shadow:0 10px 24px rgba(255,94,138,0.13);border-radius:16px;padding:2xl 3xl;font-size:12.2px;font-family:inherit;color:#17303B;resize:none')} />
        <DateField vm={vm} />
        {vm.uploadError && <Text style={s('font-size:12px;color:#E5484D;margin-top:3xl;text-align:center')}>{vm.uploadError}</Text>}
        <Pressable onPress={vm.submitUpload} disabled={vm.uploadSaving} style={s(`margin:ctaTop 0 ctaBottom;height:54px;border-radius:17px;background:#FF5E8A;align-items:center;justify-content:center;flex-direction:row;opacity:${vm.uploadSaving ? 0.7 : 1}`)}>
          <Text style={s('font-size:13.9px;font-weight:700;color:#fff')}>{vm.uploadCta}</Text>
        </Pressable>
      </View>
    </View>
  )
}
