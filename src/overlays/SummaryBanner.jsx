import { useEffect, useRef, useState } from 'react'
import { AccessibilityInfo, Animated, Easing, Platform, View, Text, Pressable } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { s } from '../lib/style.js'

import { useVm } from '../vm/useVm.js'

// 홈 위쪽에 뜨는 '11월 요약이 도착했어요!' 배너. 누르면 요약 페이지로, ✕ 는 닫기.
// 이 기기에서 같은 요약을 한 번 보면(열거나 닫으면) 다시 뜨지 않는다.
//
// 모션: 처음엔 서서히 나타나고, 그다음엔 배너 둘레의 분홍 빛이 흐려졌다 나타났다를 천천히 되풀이한다.
// 배너 자체를 흐리게 하면 아래 홈 제목이 비쳐 글자가 겹쳐 보여서, 배너는 늘 불투명하게 두고 빛만 움직인다.
// 손쉬운 사용의 '동작 줄이기'가 켜져 있으면 움직이지 않는다.

// RN Web 은 네이티브 드라이버가 없다 (ScreenTransition 과 같은 이유)
const NATIVE = Platform.OS !== 'web'
const FADE_IN = 300
const PULSE = 900 // 빛이 흐려지는(또는 나타나는) 데 걸리는 시간
const GLOW = 0.45 // 빛이 가장 진할 때의 불투명도

function useMotion() {
  const appear = useRef(new Animated.Value(0)).current
  const glow = useRef(new Animated.Value(0)).current
  const [still, setStill] = useState(false)
  useEffect(() => {
    let anim
    let alive = true
    const run = (reduceMotion) => {
      if (!alive) return
      if (reduceMotion) {
        setStill(true)
        appear.setValue(1)
        return
      }
      const ease = Easing.inOut(Easing.quad)
      anim = Animated.sequence([
        Animated.timing(appear, { toValue: 1, duration: FADE_IN, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glow, { toValue: GLOW, duration: PULSE, easing: ease, useNativeDriver: NATIVE }),
            Animated.timing(glow, { toValue: 0, duration: PULSE, easing: ease, useNativeDriver: NATIVE }),
          ]),
        ),
      ])
      anim.start()
    }
    Promise.resolve(AccessibilityInfo.isReduceMotionEnabled?.())
      .then((on) => run(!!on))
      .catch(() => run(false))
    return () => {
      alive = false
      anim?.stop()
    }
  }, [appear, glow])
  return { appear, glow, still }
}

export default function SummaryBanner() {
  const vm = useVm()
  const { appear, glow, still } = useMotion()
  return (
    <Animated.View pointerEvents="box-none" style={[s('position:absolute;left:0;right:0;top:10px;z-index:65;padding:0 screenX'), { opacity: appear }]}>
      <View>
        {/* 배너 둘레의 분홍 빛 — 이것만 흐려졌다 나타났다 한다 */}
        {!still && (
          <Animated.View
            pointerEvents="none"
            style={[{ position: 'absolute', top: -4, left: -4, right: -4, bottom: -4, borderRadius: 22, backgroundColor: '#FF8FB0' }, { opacity: glow }]}
          />
        )}
        <Pressable
          role="button"
          accessibilityLabel={`${vm.summaryBannerText} 요약 열기`}
          onPress={vm.openSummary}
          style={s('flex-direction:row;align-items:center;gap:md;background:#FFF0F5;border:1px solid #FFD3E2;border-radius:18px;padding:lg xl lg 2xl;box-shadow:0 12px 28px rgba(255,94,138,0.22);cursor:pointer')}
        >
          <Text style={s('font-size:18px')}>💌</Text>
          <View style={s('flex:1;min-width:0')}>
            <Text numberOfLines={1} style={s('font-size:13.5px;font-weight:800;color:#17303B')}>{vm.summaryBannerText}</Text>
            <Text style={s('font-size:11px;color:#8497A1;margin-top:hair')}>눌러서 읽어보기</Text>
          </View>
          <Pressable
            role="button"
            accessibilityLabel="배너 닫기"
            onPress={vm.dismissSummaryBanner}
            hitSlop={10}
            style={s('width:28px;height:28px;border-radius:10px;align-items:center;justify-content:center;cursor:pointer')}
          >
            <Svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="#9DB2BD" strokeWidth={2.4} strokeLinecap="round"><Path d="M6 6 L18 18 M18 6 L6 18" /></Svg>
          </Pressable>
        </Pressable>
      </View>
    </Animated.View>
  )
}
