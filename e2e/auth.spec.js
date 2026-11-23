// 기준: e2e-criteria.md
const { test, expect } = require('@playwright/test')

test('1. 비로그인 첫 화면: 로그인 버튼이 보이고 누를 수 있다', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('우리끼리', { exact: true })).toBeVisible()

  const kakao = page.getByRole('button', { name: '카카오톡으로 시작하기' })
  await expect(kakao).toBeVisible()
  await expect(kakao).toBeEnabled()
})

// 기준 미정: 배포 환경에서 ?screen=home 을 허용할지 결정한 뒤 작성한다.
test.fixme('2. 비로그인 상태로 ?screen=home 접속', async () => {})
