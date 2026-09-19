import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './test',
  testMatch: '**/*.spec.js',
  use: { baseURL: 'http://127.0.0.1:8123' },
  webServer: {
    command: 'node test/server.js',
    url: 'http://127.0.0.1:8123',
  },
})
