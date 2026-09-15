// 같은 저장 동작이 진행 중이면 두 번째 실행을 무시한다.
//
// 버튼의 disabled·"저장 중" 상태는 다음 렌더에야 반영돼서, 느린 네트워크에서
// 빠르게 두 번 누르면 둘 다 통과해 단어·글이 두 개씩 만들어졌다.
// 렌더를 기다리지 않는 모듈 변수로 바로 막는다.
const running = new Set()

export async function runOnce(key, fn) {
  if (running.has(key)) return undefined
  running.add(key)
  try {
    return await fn()
  } finally {
    running.delete(key)
  }
}
