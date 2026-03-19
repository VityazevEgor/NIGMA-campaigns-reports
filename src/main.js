import { createApp } from 'vue'
import './style.css'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import App from './App.vue'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'nigmaTheme',
    themes: {
      nigmaTheme: {
        dark: false,
        colors: {
          primary: '#1976d2',
          secondary: '#4db6ac',
          background: '#f3f5f8',
          surface: '#ffffff',
        },
      },
    },
  },
})

createApp(App).use(vuetify).mount('#app')
