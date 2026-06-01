import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import './styles.css'

import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import App from './App.vue'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'garden',
    themes: {
      garden: {
        dark: false,
        colors: {
          background: '#f7f3e8',
          surface: '#fffdf7',
          primary: '#28684b',
          secondary: '#b84f3b',
          accent: '#e3b23c',
          info: '#386f8f',
          success: '#4f7d3a',
          warning: '#c98224',
          error: '#b23a48',
        },
      },
    },
  },
})

createApp(App).use(vuetify).mount('#app')
