import { api } from '../lib/api.js'
import { todayYmd, withDatePart } from '../lib/date.js'
import { runOnce } from './runOnce.js'

// 홈에 보여줄 D-day 개수. 더 보고 싶으면 '전체보기' 로 들어간다.
export const HOME_DDAY_LIMIT = 3

const p2 = (n) => String(n).padStart(2, '0')
const ymd = (y, m, d) => `${y}-${p2(m)}-${p2(d)}`
// 그 달의 1일과 말일 ('YYYY-MM-DD')
export const monthRange = (y, m) => [ymd(y, m, 1), ymd(y, m, new Date(y, m, 0).getDate())]

// 가족 일정 (달력) — 생일·약속·여행을 함께 본다. 가족 누구나 고치고 지울 수 있다.
export function createCalendarActions({ ref, setState, showToast }) {
  const gid = () => ref.current.currentGroup?.id
  // 지금 보고 있는 달 (없으면 이번 달)
  const shown = () => {
    const now = new Date()
    const cur = ref.current
    return { y: cur.calYear || now.getFullYear(), m: cur.calMonth || now.getMonth() + 1 }
  }

  const loadEvents = async (y, m) => {
    const id = gid()
    if (!id) return
    const [from, to] = monthRange(y, m)
    setState({ calLoading: true })
    try {
      const rows = await api.events(id, from, to)
      // 보는 달이 그새 바뀌었으면 늦게 온 결과는 버린다
      const now2 = shown()
      if (now2.y !== y || now2.m !== m) return
      setState({ events: rows || [], calLoading: false })
    } catch {
      setState({ calLoading: false })
    }
  }

  // 홈에 띄울 D-day 일정 — 홈에 들어올 때와 일정이 바뀔 때 받아 둔다.
  // 전체보기 화면에서는 길게 받는다 (홈은 앞의 몇 개만 그린다).
  const loadDday = async (limit = HOME_DDAY_LIMIT) => {
    const id = gid()
    if (!id) return
    try {
      const rows = await api.ddayEvents(id, limit)
      if (gid() !== id) return
      setState({ ddayEvents: rows || [] })
    } catch {}
  }

  const showMonth = (y, m) => {
    // 12월 다음은 다음 해 1월, 1월 이전은 지난해 12월
    const yy = m < 1 ? y - 1 : m > 12 ? y + 1 : y
    const mm = m < 1 ? 12 : m > 12 ? 1 : m
    setState({ calYear: yy, calMonth: mm, calPicked: null })
    loadEvents(yy, mm)
  }
  // 제목의 년·월 칩에서 고른 달로 바로 이동
  const setCalYear = (y) => { const cur = shown(); showMonth(y, cur.m) }
  const setCalMonth = (m) => { const cur = shown(); showMonth(cur.y, m) }
  const prevMonth = () => { const { y, m } = shown(); showMonth(y, m - 1) }
  const nextMonth = () => { const { y, m } = shown(); showMonth(y, m + 1) }
  const goThisMonth = () => { const n = new Date(); showMonth(n.getFullYear(), n.getMonth() + 1) }
  // 날짜를 누르면 그날 일정만 아래에 모아 본다. 같은 날을 다시 누르면 전체로 돌아간다.
  const pickDay = (day) =>
    setState((p) => ({ calPicked: p.calPicked === day ? null : day }))

  // ── 일정 추가·수정 시트 ───────────────────────────────────────────
  // 새로 적으면 고른 날(없으면 오늘)부터. 수정이면 그 일정을 채워서 연다.
  const openEvent = (event) => {
    const { y, m } = shown()
    const picked = ref.current.calPicked
    const start = event?.startDate || (picked ? ymd(y, m, picked) : todayYmd())
    setState({
      eventSheet: {
        id: event?.id || null,
        title: event?.title || '',
        startDate: start,
        endDate: event?.endDate || null,
        category: event?.category || null,
        repeatYearly: !!event?.repeatYearly,
        isDday: !!event?.isDday,
        ddayMode: event?.ddayMode || 'dday',
      },
      eventError: null,
    })
  }
  const closeEvent = () => setState({ eventSheet: null, eventError: null })
  const onEventTitle = (title) =>
    setState((p) => ({ eventSheet: { ...p.eventSheet, title }, eventError: null }))
  // 해마다 같은 날 돌아오는 일정 (생일·기념일)
  const toggleEventRepeat = () =>
    setState((p) => ({ eventSheet: { ...p.eventSheet, repeatYearly: !p.eventSheet?.repeatYearly } }))
  // 홈에 D-day 로 띄울지
  const toggleEventDday = () =>
    setState((p) => ({ eventSheet: { ...p.eventSheet, isDday: !p.eventSheet?.isDday } }))
  // 세는 방법 — 남은 날(dday) · 지난 날수(count) · 주수(week)
  const setDdayMode = (ddayMode) =>
    setState((p) => ({ eventSheet: { ...p.eventSheet, ddayMode, isDday: true } }))
  const pickEventCategory = (category) =>
    setState((p) => ({
      eventSheet: { ...p.eventSheet, category: p.eventSheet?.category === category ? null : category },
    }))
  // '기간' 을 켜면 끝나는 날이 생긴다 (처음엔 시작일과 같은 날)
  const toggleEventRange = () =>
    setState((p) => ({
      eventSheet: { ...p.eventSheet, endDate: p.eventSheet?.endDate ? null : p.eventSheet?.startDate },
    }))
  // 끝나는 날은 시작보다 앞일 수 없다 — 어느 쪽을 바꾸든 순서가 뒤집히지 않게 맞춘다
  const setEventDatePart = (which, part, value) => {
    const sheet = ref.current.eventSheet
    if (!sheet) return
    let { startDate, endDate } = sheet
    if (which === 'from') {
      startDate = withDatePart(startDate, part, value, { future: true })
      if (endDate && endDate < startDate) endDate = startDate
    } else {
      endDate = withDatePart(endDate || startDate, part, value, { future: true })
      if (endDate < startDate) endDate = startDate
    }
    setState({ eventSheet: { ...sheet, startDate, endDate } })
  }

  const saveEvent = () => runOnce('saveEvent', async () => {
    const cur = ref.current
    const sheet = cur.eventSheet
    const id = gid()
    if (!sheet || !id) return
    const title = (sheet.title || '').trim()
    if (!title) {
      setState({ eventError: '일정 이름을 적어주세요.' })
      return
    }
    setState({ eventSaving: true, eventError: null })
    const body = {
      title,
      startDate: sheet.startDate,
      endDate: sheet.endDate || null,
      category: sheet.category || null,
      repeatYearly: !!sheet.repeatYearly,
      isDday: !!sheet.isDday,
      ddayMode: sheet.ddayMode || 'dday',
    }
    try {
      if (sheet.id) await api.updateEvent(sheet.id, body)
      else await api.createEvent(id, body)
      const { y, m } = shown()
      await loadEvents(y, m)
      await loadDday()
      setState({ eventSaving: false, eventSheet: null })
      showToast(sheet.id ? '일정을 수정했어요' : '일정을 추가했어요')
    } catch (e) {
      setState({ eventSaving: false, eventError: e.message })
    }
  })

  const removeEvent = async (eventId) => {
    try {
      await api.deleteEvent(eventId)
      const { y, m } = shown()
      await loadEvents(y, m)
      await loadDday()
      setState({ eventSheet: null })
      showToast('일정을 지웠어요')
    } catch (e) {
      showToast(e.message)
    }
  }

  return {
    loadDday,
    prevMonth, nextMonth, goThisMonth, pickDay, setCalYear, setCalMonth, toggleEventDday, setDdayMode, toggleEventRepeat,
    openEvent, closeEvent, onEventTitle, pickEventCategory, toggleEventRange,
    setEventDatePart, saveEvent, removeEvent,
  }
}
