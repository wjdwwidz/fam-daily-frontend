// @ts-check
const { defineConfig, devices } = require('@playwright/test')

// 우리끼리 웹(react-native-web)을 폰 화면 크기로 띄워 검증한다.
module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 0, // 재시도로 플래키를 숨기지 않는다. 불안정하면 --repeat-each로 잡아서 고친다.
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'CI=1 npx expo start --web --port 8081',
    url: 'http://localhost:8081',
    reuseExistingServer: true,
    timeout: 180_000, // 첫 번들링이 느리다
  },
})
