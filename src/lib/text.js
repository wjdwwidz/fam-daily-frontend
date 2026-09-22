// 글자 단위로 자르기 — 이모지를 한 글자로 센다.
//
// JS 문자열의 length·slice 는 UTF-16 칸 단위라 이모지 하나가 2칸(피부색·가족 이모지는 더)이다.
// 그대로 slice 하면 이모지 한가운데가 잘려 깨지거나 아예 안 보인다.
// Hermes(안드로이드)에는 Intl.Segmenter 가 없어서, 이모지를 이어 붙이는 문자만 직접 묶는다.

const isJoiner = (cp) =>
  cp === 0x200d || // ZWJ — 👨‍👩‍👧 처럼 앞뒤를 이어 붙인다
  (cp >= 0xfe00 && cp <= 0xfe0f) || // 이모지로 보이게 하는 선택자 (❤️ 의 뒤쪽)
  (cp >= 0x1f3fb && cp <= 0x1f3ff) || // 피부색 👍🏻
  cp === 0x20e3 || // 키캡 1️⃣
  (cp >= 0xe0020 && cp <= 0xe007f) // 태그 (영국 지역 국기 등)
const isRegional = (cp) => cp >= 0x1f1e6 && cp <= 0x1f1ff // 국기는 두 개가 한 쌍 🇰🇷

// 문자열을 '보이는 글자' 덩어리로 나눈다
export function graphemes(str) {
  const out = []
  let joinNext = false
  for (const ch of Array.from(String(str || ''))) {
    const cp = ch.codePointAt(0)
    const last = out.length - 1
    const pairFlag = isRegional(cp) && last >= 0 && isRegional(out[last].codePointAt(0)) && Array.from(out[last]).length === 1
    if (last >= 0 && (joinNext || isJoiner(cp) || pairFlag)) out[last] += ch
    else out.push(ch)
    joinNext = cp === 0x200d
  }
  return out
}

const isEmoji = (g) => {
  const cp = g.codePointAt(0)
  return cp >= 0x1f000 || (cp >= 0x2600 && cp <= 0x27bf) || (cp >= 0x2b00 && cp <= 0x2bff) || /️/.test(g)
}

// n 글자로 줄인다. 잘릴 때 끝에 붙은 이모지(최대 3개)는 살려서 '…' 뒤에 둔다 —
// 이모지는 대개 글 끝에 붙어 기분을 전하는데, 앞에서부터 자르면 늘 잘려 나간다.
export function clipText(t, n = 14) {
  const g = graphemes(String(t || '').trim())
  if (g.length <= n) return g.join('')
  const tail = []
  for (let i = g.length - 1; i >= 0 && tail.length < 3 && isEmoji(g[i]); i--) tail.unshift(g[i])
  const head = g.slice(0, Math.max(1, n - tail.length)).join('').trimEnd()
  return `${head}…${tail.join('')}`
}
