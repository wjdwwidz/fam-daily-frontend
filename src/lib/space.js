// 여백(spacing) 스케일 — 단일 출처. type.js 의 폰트 토큰과 같은 방식.
// 화면에서는 숫자 대신 토큰만 쓴다:  s('padding:lg')  → 16px,  s('gap:sm') → 6px
// margin/padding/gap 에 적용된다. (top/left 등 위치, border-radius, width/height 는 대상 아님)
//
// 이 앱은 2px 그리드라, 자주 쓰는 짝수 값은 토큰으로 "이름만" 붙였고(시각 변화 없음),
// 흩어져 있던 홀수/애매한 값만 가장 가까운 단계로 정렬했다.
// 더 성긴 리듬을 원하면 여기 값만 바꾸면 화면 전체가 따라온다.
// 전반적으로 여백을 키운 스케일 (숨 쉴 공간 확보).
// 작은 광학 보정값(hair/xs)은 유지, 중간~큰 단계를 ~25% 상향.
const SCALE = {
  hair: 2, // 미세 광학 보정 (1~3px 정렬)
  xs: 4, // 아이콘-텍스트 붙은 간격
  sm: 7, // 요소 사이 좁은 간격
  md: 10, // 요소 사이 기본 간격
  lg: 13, // 리스트/행 간격
  xl: 15, // 카드 안쪽 여백(좁게)
  '2xl': 18, // 카드 안쪽 여백(기본)
  '3xl': 21, // 카드 패딩, 섹션 사이
  '4xl': 24, // 넉넉한 카드 패딩
  '5xl': 26, // 화면 좌우 여백, 큰 간격
  '6xl': 32, // 섹션 큰 간격
  '7xl': 42, // 블록 사이 넓은 간격
  '8xl': 52, // 화면 상하 큰 여백
}

// 의미 기반 별칭 — 상호작용 요소의 세로 리듬을 한 곳에서 정의한다.
// 값은 위 스케일을 가리키므로, 스케일을 바꾸면 함께 따라온다.
const ROLES = {
  ctaTop: SCALE['6xl'], // 주요 액션 버튼 위 여백 (본문과 분리)
  ctaBottom: SCALE.lg, // 주요 액션 버튼 아래 여백
  fieldGap: SCALE['4xl'], // 폼 필드 사이 (라벨 위 여백)
  labelGap: SCALE.md, // 라벨 → 입력란 간격
  btnY: 12, // 클릭 버튼 세로 안쪽 여백 (한 줄/두 줄 무관하게 일정한 상하 여백)
  btnGap: 16, // 세로로 쌓인 버튼 사이 간격
  // 앱 화면 마진 (탭 화면 공통) — 한 곳에서 관리
  screenX: 20, // 좌우
  screenTop: 12, // 상단 (상태바 아래 콘텐츠 시작)
  screenBottom: 110, // 하단 (네비바 74px 확보)
}

export const SPACE = { ...SCALE, ...ROLES }

export const SPACE_TOKENS = Object.keys(SPACE)

// 토큰이면 숫자를, 토큰이 아니면 null 을 돌려준다. (style.js 에서 margin/padding/gap 해석용)
export function resolveSpace(val) {
  const t = String(val).trim()
  if (Object.prototype.hasOwnProperty.call(SPACE, t)) return SPACE[t]
  return null
}
