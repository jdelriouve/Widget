// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import { createVuetify } from 'vuetify'
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import store from './store'

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'light',
  },
})

const mount = ({ sku, price, packType, selector = '#app', onLoaded = () => {}, onError = () => {} }) => {
  try {
    const el = document.querySelector(selector)
    if (!el) throw new Error(`No se encontró el selector ${selector}`)

    const app = createApp(App, { sku, price, packType })
    app.use(store)
    app.use(vuetify)
    app.mount(el)

    onLoaded()
  } catch (err) {
    onError(err)
  }
}

// ✅ Exportar el SDK para producción
const sdk = { mount }
export default sdk
window.widget = sdk

// ✅ Auto-montaje SOLO en desarrollo (npm run serve)
if (process.env.NODE_ENV === 'development') {
  mount({
    sku: '10860860',
    price: 2500,
    packType: 'basic',
    selector: '#app',
    onLoaded: () => console.log('🔧 Widget montado automáticamente en desarrollo'),
  })
}
