import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    exclude: ['tests/e2e/**', 'node_modules/**'],
    setupFiles: ['./tests/setup/server-only.ts'],
    server: { deps: { inline: ['next-intl'] } },
    coverage: {
      provider: 'v8',
      include: ['src/modules/**/*.ts'],
      exclude: [
        '**/*.test.ts',
        '**/*.repository.ts',
        '**/*.service.ts',
        '**/*.server.ts',
        'src/modules/admin/session.ts',
        'src/modules/booking/booking-view.ts',
        'src/modules/booking/manage-view.ts',
        'src/modules/notifications/channel.ts',
        'src/modules/notifications/notifier.ts',
        'src/modules/schedule/next-slot.ts',
      ],
      thresholds: { lines: 90, functions: 90, branches: 80, statements: 90 },
    },
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: ['src/**/*.test.ts', 'scripts/**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'db',
          include: ['tests/db/**/*.test.ts'],
          fileParallelism: false,
          testTimeout: 20_000,
        },
      },
    ],
  },
})
