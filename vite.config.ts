import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.GITHUB_REPOSITORY ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/` : '/',
  plugins: [
    vue(),
    vuetify({
      autoImport: true,
    }),
  ],
  test: {
    environment: 'node',
    globals: true,
  },
})
