// 여백(spacing) 스케일 — 단일 출처. type.js 의 폰트 토큰과 같은 방식.
// 화면에서는 숫자 대신 토큰만 쓴다:  s('padding:lg')  → 16px,  s('gap:sm') → 6px
// margin/padding/gap 에 적용된다. (top/left 등 위치, border-radius, width/height 는 대상 아님)
//
// 이 앱은 2px 그리드라, 자주 쓰는 짝수 값은 토큰으로 "이름만" 붙였고(시각 변화 없음),
// 흩어져 있던 홀수/애매한 값만 가장 가까운 단계로 정렬했다.
// 더 성긴 리듬을 원하면 여기 값만 바꾸면 화면 전체가 따라온다.
export const SPACE = {
  hair: 2, // 미세 광학 보정 (1~3px 정렬)
  xs: 4, // 아이콘-텍스트 붙은 간격
  sm: 6, // 요소 사이 좁은 간격
  md: 8, // 요소 사이 기본 간격
  lg: 10, // 리스트/행 간격
  xl: 12, // 카드 안쪽 여백(좁게)
  '2xl': 14, // 카드 안쪽 여백(기본)
  '3xl': 16, // 카드 패딩, 섹션 사이
  '4xl': 18, // 넉넉한 카드 패딩
  '5xl': 20, // 화면 좌우 여백, 큰 간격
  '6xl': 24, // 섹션 큰 간격
  '7xl': 32, // 블록 사이 넓은 간격
  '8xl': 40, // 화면 상하 큰 여백
}

export const SPACE_TOKENS = Object.keys(SPACE)

// 토큰이면 숫자를, 토큰이 아니면 null 을 돌려준다. (style.js 에서 margin/padding/gap 해석용)
export function resolveSpace(val) {
  const t = String(val).trim()
  if (Object.prototype.hasOwnProperty.call(SPACE, t)) return SPACE[t]
  return null
}
