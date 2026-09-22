// 'YYYY-MM-DD' 날짜 다루기 — 버킷리스트 이룬 날, 일상 날짜가 같이 쓴다.
// 시각 없이 날짜만 다룬다. Date 로 바꿨다 되돌리면 시간대 때문에 하루가 밀린다.

const p2 = (n) => String(n).padStart(2, '0')

// 오늘 (현지 기준 — 자정 무렵에 하루가 어긋나지 않게)
export function todayYmd() {
  const d = new Date()
  return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
}

// 고를 수 있는 가장 이른 해 — 오래전 일도 적을 수 있게 넉넉히
export const FIRST_YEAR = 1950

// 년·월·일 중 하나만 바꾼다. 말일이 넘어가면(2월 31일 등) 그 달 마지막 날로,
// 오늘보다 뒤로 가면(올해로 바꿨더니 아직 안 온 달 등) 오늘로 당긴다.
export function withDatePart(ymd, part, value) {
  const [y, m, d] = (ymd || todayYmd()).split('-').map(Number)
  const next = { y, m, d, [part]: value }
  const last = new Date(next.y, next.m, 0).getDate()
  if (next.d > last) next.d = last
  const out = `${next.y}-${p2(next.m)}-${p2(next.d)}`
  const today = todayYmd()
  return out > today ? today : out
}

// 휠에 늘어놓을 년·월·일 목록. 앞으로 올 날은 고를 수 없어 올해·이번 달은 오늘까지만.
export function dateWheel(ymd) {
  const m = String(ymd || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const now = new Date()
  const thisYear = now.getFullYear()
  const y = m ? Number(m[1]) : thisYear
  const mo = m ? Number(m[2]) : 1
  const d = m ? Number(m[3]) : 1
  const lastMonth = y === thisYear ? now.getMonth() + 1 : 12
  const lastDay = y === thisYear && mo === now.getMonth() + 1
    ? now.getDate()
    : new Date(y, mo, 0).getDate() // 말일은 달마다 다르다
  const range = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => from + i)
  return {
    y, m: mo, d,
    years: range(FIRST_YEAR, thisYear),
    months: range(1, lastMonth),
    days: range(1, lastDay),
  }
}

// 기간을 읽기 좋게: '2026년 9월 20일', '2026년 9월 20일 ~ 22일', '2026년 9월 30일 ~ 10월 2일'
export function fmtYmdRange(from, to) {
  const parse = (s) => {
    const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})$/)
    return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : null
  }
  const a = parse(from)
  if (!a) return ''
  const head = `${a.y}년 ${a.m}월 ${a.d}일`
  const b = parse(to)
  if (!b || (b.y === a.y && b.m === a.m && b.d === a.d)) return head
  if (b.y !== a.y) return `${head} ~ ${b.y}년 ${b.m}월 ${b.d}일`
  if (b.m !== a.m) return `${head} ~ ${b.m}월 ${b.d}일`
  return `${head} ~ ${b.d}일`
}
