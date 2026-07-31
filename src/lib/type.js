// 타이포 스케일(단일 출처).
// 화면에서는 숫자 대신 토큰만 쓴다:  s('font-size:sm')  → 11.5px
// 새 크기가 필요하면 여기에 단계를 추가/조정하고, 화면 코드에는 숫자를 넣지 않는다.
//
// 참고: 최종 렌더 크기는 style.js 의 FONT_BUMP(+1px) 가 더해진 값이다.
// 아래 값은 디자인 원본 기준이며, 기존 px 선언과 동일한 규칙으로 보정된다.
export const FONT_SIZE = {
  xs: 10,     // 탭 라벨, 배지
  sm: 11.5,   // 캡션, 날짜, 보조 설명
  md: 12.5,   // 작은 본문, 메타 정보
  base: 13.5, // 기본 본문, 버튼
  lg: 15,     // 강조 본문, 입력값
  xl: 17,     // 카드·시트 제목
  '2xl': 22,  // 화면 제목
  '3xl': 30,  // 디스플레이 (단어 상세, 로그인 타이틀)
}

export const FONT_SIZE_TOKENS = Object.keys(FONT_SIZE)

// 토큰이면 숫자를, 토큰이 아니면 null 을 돌려준다.
export function resolveFontSize(val) {
  const t = String(val).trim()
  if (Object.prototype.hasOwnProperty.call(FONT_SIZE, t)) return FONT_SIZE[t]
  // 알파벳으로 시작하는데 스케일에 없으면 오타 → 개발 중에만 경고
  if (__DEV__ && /^[a-z]/i.test(t)) {
    console.warn(`[type] 알 수 없는 폰트 토큰 "${t}". 사용 가능: ${FONT_SIZE_TOKENS.join(', ')}`)
  }
  return null
}
