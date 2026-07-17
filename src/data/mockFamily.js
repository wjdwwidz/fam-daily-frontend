// ⚠️ 임시 목업 — 멤버·갤러리를 실데이터로 연동하면 이 파일은 제거됩니다.

// 가족 구성원(목업)
export const FAMILY = {
  mom: { name: '엄마', role: '김서연 · 관리자', ini: '엄', c: '#FF5E8A', admin: true, me: true, mood: '오늘 저녁은 김치찌개! 🍲', emoji: '😊' },
  dad: { name: '아빠', role: '이준호', ini: '아', c: '#4D7CFE', admin: false, mood: '퇴근하고 바로 갈게~', emoji: '🚗' },
  ji: { name: '지우', role: '딸 · 7살', ini: '지', c: '#FF9F43', admin: false, mood: '오늘 피아노 100점 받았어!', emoji: '🎹' },
  do: { name: '도윤', role: '아들 · 3살', ini: '도', c: '#22C4A6', admin: false, mood: '까까 먹고 싶어용', emoji: '🍪' },
  gm: { name: '할머니', role: '박옥분', ini: '할', c: '#A66CFF', admin: false, mood: '다들 밥은 챙겨 먹었니', emoji: '💗' },
}

// 추억(갤러리) 목업
export const MOCK_GALLERY = [
  { title: '제주도 가족여행', date: '6월 15일', by: FAMILY.dad, type: 'photo', hearts: 12, tone: '#FFE0EC', ph: '제주 바다 사진' },
  { title: '도윤이 첫 걸음마', date: '6월 2일', by: FAMILY.mom, type: 'video', hearts: 18, tone: '#FFE0EC', ph: '첫 걸음마 영상' },
  { title: '지우 학예회', date: '5월 28일', by: FAMILY.mom, type: 'photo', hearts: 9, tone: '#FFE0EC', ph: '학예회 사진' },
  { title: '할머니 생신상', date: '5월 20일', by: FAMILY.dad, type: 'photo', hearts: 15, tone: '#FFE0EC', ph: '생신 사진' },
  { title: '눈사람 만들기', date: '2월 3일', by: FAMILY.ji, type: 'video', hearts: 11, tone: '#FFE0EC', ph: '눈사람 영상' },
  { title: '주말 나들이', date: '5월 11일', by: FAMILY.mom, type: 'photo', hearts: 7, tone: '#FFE0EC', ph: '공원 나들이' },
  { title: '김장하는 날', date: '작년 11월', by: FAMILY.gm, type: 'photo', hearts: 8, tone: '#FFE0EC', ph: '김장 사진' },
  { title: '도윤이 목욕', date: '4월 22일', by: FAMILY.mom, type: 'photo', hearts: 10, tone: '#FFE0EC', ph: '목욕 사진' },
  { title: '벚꽃 구경', date: '4월 5일', by: FAMILY.dad, type: 'photo', hearts: 14, tone: '#FFE0EC', ph: '벚꽃 사진' },
  { title: '도윤이 블록놀이', date: '4월 12일', by: FAMILY.do, type: 'photo', hearts: 9, tone: '#FFE0EC', ph: '블록놀이 사진' },
  { title: '도윤이 첫 낮잠', date: '3월 30일', by: FAMILY.do, type: 'video', hearts: 13, tone: '#FFE0EC', ph: '낮잠 영상' },
]
