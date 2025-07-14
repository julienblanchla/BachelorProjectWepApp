import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import test users utility
import { createTestUsers } from './utils/createTestUsers.js'

// Create test users in development
if (import.meta.env.DEV) {
  createTestUsers()
}

const app = createApp(App)

app.use(router)
app.mount('#app')
