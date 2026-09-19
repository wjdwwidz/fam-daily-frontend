import { useEffect } from 'react'
import { View, Text, Pressable, Image, ScrollView } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// 가족 버킷리스트 — 1~100 칸을 한 장에 늘어놓는다 (종이에 적어둔 느낌).
// 빈 칸도 번호와 함께 늘 보여서 "100개를 채운다"가 눈에 들어오게.
// 제목줄은 Record 가 소유하므로 여기선 본문만 그린다.
export default function Bucket() {
  const vm = useVm()
  const groupId = vm.currentGroup?.id
  useEffect(() => { vm.loadBucket() }, [groupId])

  return (
    <View>
      {/* 진행률 */}
      <View style={s('margin:0 hair lg')}>
        <View style={s('flex-direction:row;align-items:baseline;justify-content:space-between;margin-bottom:sm')}>
          <Text style={s('font-size:11.3px;color:#9DB2BD')}>
            같이 하고 싶은 일들{vm.bucketPages > 1 ? ` · ${vm.bucketPage}장` : ''}
          </Text>
          <Text style={s('font-size:12.5px;font-weight:800;color:#FF5E8A')}>
            {vm.bucketDoneCount} / {vm.bucketTotal}
          </Text>
        </View>
        <View style={s('height:6px;border-radius:3px;background:#F3DCE6;overflow:hidden')}>
          <View style={s(`height:6px;border-radius:3px;background:#FF5E8A;width:${vm.bucketPercent}%`)} />
        </View>
      </View>

      {/* 100칸 */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s('background:#fff;border:1px solid #FFE1EC;border-radius:20px;padding:sm 3xl md')}>
          {vm.bucketRows.map((r, i) => (
            <Pressable
              key={r.no}
              onPress={r.open}
              style={s(`flex-direction:row;align-items:center;gap:lg;padding:2xl 0${i < vm.bucketRows.length - 1 ? ';border-bottom:1px solid #FBEDF3' : ''};cursor:pointer`)}
            >
              {/* 번호 — 자릿수가 달라도 줄이 밀리지 않게 폭을 고정 */}
              <Text style={s(`width:26px;text-align:right;font-size:12.5px;font-variant:tabular-nums;color:${r.done ? '#FF5E8A' : '#C4CFD6'};font-weight:${r.filled ? 700 : 500}`)}>
                {r.no}
              </Text>

              {/* 체크 상자 */}
              <View style={s(`width:19px;height:19px;border-radius:6px;align-items:center;justify-content:center;border:1.5px solid ${r.done ? '#FF5E8A' : '#E7D3DC'};background:${r.done ? '#FF5E8A' : 'transparent'}`)}>
                {r.done && (
                  <Svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#fff" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M5 13 L10 18 L19 7" />
                  </Svg>
                )}
              </View>

              {/* 내용 — 30자 제한이라 한 줄에 떨어진다 */}
              <Text
                numberOfLines={1}
                style={s(`flex:1;min-width:0;font-size:13.5px;line-height:1.35;color:${r.filled ? (r.done ? '#8497A1' : '#17303B') : '#DCE5EA'};text-decoration:${r.done ? 'line-through' : 'none'}`)}
              >
                {r.filled ? r.text : '비어 있어요'}
              </Text>

              {/* 이어붙인 일상 글 */}
              {r.coverUrl && (
                <Image source={{ uri: r.coverUrl }} style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: '#F3DCE6' }} resizeMode="cover" />
              )}
            </Pressable>
          ))}
        </View>

        {/* 페이지 넘기기 — 한 장(100칸)을 다 채우면 다음 장이 열린다 */}
        <View style={s('flex-direction:row;align-items:center;justify-content:center;gap:2xl;padding:3xl 0 lg')}>
          <Pressable onPress={vm.bucketPrev} disabled={vm.bucketPage <= 1} style={s(`width:34px;height:34px;border-radius:11px;align-items:center;justify-content:center;background:#fff;border:1px solid #FFE1EC;opacity:${vm.bucketPage <= 1 ? 0.35 : 1}`)}>
            <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#FF5E8A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><Path d="M14.5 5 L7.5 12 L14.5 19" /></Svg>
          </Pressable>
          <Text style={s('font-size:12.5px;font-weight:700;color:#17303B;font-variant:tabular-nums')}>
            {vm.bucketPage} / {vm.bucketPages}
          </Text>
          <Pressable onPress={vm.bucketNext} disabled={vm.bucketPage >= vm.bucketPages} style={s(`width:34px;height:34px;border-radius:11px;align-items:center;justify-content:center;background:#fff;border:1px solid #FFE1EC;opacity:${vm.bucketPage >= vm.bucketPages ? 0.35 : 1}`)}>
            <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#FF5E8A" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><Path d="M9.5 5 L16.5 12 L9.5 19" /></Svg>
          </Pressable>
        </View>
        {vm.bucketPage >= vm.bucketPages && (
          <Text style={s('font-size:10.5px;color:#C4CFD6;text-align:center;margin-bottom:2xl')}>
            이 장을 모두 채우면 다음 {vm.bucketTotal}개가 열려요
          </Text>
        )}
      </ScrollView>
    </View>
  )
}
