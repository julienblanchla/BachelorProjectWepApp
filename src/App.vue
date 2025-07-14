<script setup>
import { ref, onMounted, onUnmounted, provide, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth.js'

const route = useRoute()
const router = useRouter()
const { currentUser, isAuthenticated, userDisplayName, userInitials, initAuth, logout } = useAuth()

// Reactive data
const nordicData = ref(null)
const mbientData = ref(null)
const error = ref(null)
const isLoading = ref(true)

// Chart data
const chartData = ref({
  labels: [],
  xData: [],
  yData: [],
  zData: []
})

// Mbient chart data
const mbientChartData = ref({
  labels: [],
  xData: [],
  yData: [],
  zData: []
})

// Constants
const maxPoints = 30

// Timer for data refresh
let intervalId = null

// Object to track value animations
const valueUpdated = ref({
  accelX: false,
  accelY: false,
  accelZ: false,
  temperature: false,
  humidity: false,
  co2: false,
  tvoc: false
})

// Provide data to child components
provide('nordicData', nordicData)
provide('mbientData', mbientData)
provide('chartData', chartData)
provide('mbientChartData', mbientChartData)
provide('maxPoints', maxPoints)
provide('valueUpdated', valueUpdated)

// Check if current route is login page
const isLoginPage = computed(() => route.name === 'Login')

// Nordic data fetching function
const fetchNordicData = async () => {
  try {
    const response = await fetch('http://153.109.22.167:8088/multi-sensor/properties/nordicCount')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    nordicData.value = data
    console.log('✅ Nordic data received:', data)
    
    // Add data to Nordic chart
    if (data.accelerometer && data.timestamp) {
      addDataPoint(data.accelerometer, data.timestamp)
    }
    
  } catch (err) {
    console.error('❌ Error fetching Nordic data:', err)
    error.value = err.message
  }
}

// Mbient data fetching function
const fetchMbientData = async () => {
  try {
    const response = await fetch('http://153.109.22.167:8088/multi-sensor/properties/mbientCount')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    mbientData.value = data
    console.log('✅ Mbient data received:', data)
    
    // Add data to Mbient chart
    if (data.accelerometer && data.timestamp) {
      addMbientDataPoint(data.accelerometer, data.timestamp)
    }
    
  } catch (err) {
    console.error('❌ Error fetching Mbient data:', err)
    error.value = err.message
  }
}

// Function to add Nordic data point
const addDataPoint = (accelerometer, timestamp) => {
  const timeLabel = new Date(timestamp).toLocaleTimeString()
  
  chartData.value.labels.push(timeLabel)
  chartData.value.xData.push(accelerometer.x)
  chartData.value.yData.push(accelerometer.y)
  chartData.value.zData.push(accelerometer.z)
  
  // Keep only last N points
  if (chartData.value.labels.length > maxPoints) {
    chartData.value.labels.shift()
    chartData.value.xData.shift()
    chartData.value.yData.shift()
    chartData.value.zData.shift()
  }
}

// Function to add Mbient data point
const addMbientDataPoint = (accelerometer, timestamp) => {
  const timeLabel = new Date(timestamp).toLocaleTimeString()
  
  mbientChartData.value.labels.push(timeLabel)
  mbientChartData.value.xData.push(accelerometer.x)
  mbientChartData.value.yData.push(accelerometer.y)
  mbientChartData.value.zData.push(accelerometer.z)
  
  // Keep only last N points
  if (mbientChartData.value.labels.length > maxPoints) {
    mbientChartData.value.labels.shift()
    mbientChartData.value.xData.shift()
    mbientChartData.value.yData.shift()
    mbientChartData.value.zData.shift()
  }
}

// Function to trigger value animations
const triggerValueAnimation = (valueType) => {
  valueUpdated.value[valueType] = true
  setTimeout(() => {
    valueUpdated.value[valueType] = false
  }, 500)
}

// Watch for changes to trigger animations
const watchForChanges = () => {
  // Watch nordicData for animations
  if (nordicData.value) {
    if (nordicData.value.accelerometer) {
      triggerValueAnimation('accelX')
      triggerValueAnimation('accelY')
      triggerValueAnimation('accelZ')
    }
    if (nordicData.value.temperature) {
      triggerValueAnimation('temperature')
    }
    if (nordicData.value.humidity) {
      triggerValueAnimation('humidity')
    }
  }
}

// Main data refresh cycle
const updateData = async () => {
  // Only fetch data if user is authenticated and not on login page
  if (isAuthenticated.value && !isLoginPage.value) {
    await Promise.all([
      fetchNordicData(),
      fetchMbientData()
    ])
    
    watchForChanges()
  }
  isLoading.value = false
}

// Handle logout
const handleLogout = () => {
  // Stop data fetching
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  
  // Logout user with router
  logout(router)
}

// Automatic startup
onMounted(async () => {
  console.log('🚀 Application started')
  
  // Initialize authentication
  const isLoggedIn = initAuth()
  
  if (isLoggedIn && !isLoginPage.value) {
    console.log('🚀 Starting data fetch cycle for authenticated user')
    updateData() // First immediate call
    intervalId = setInterval(updateData, 3000) // Then every 3 seconds
  } else if (!isLoggedIn && !isLoginPage.value) {
    // Redirect to login if not authenticated
    console.log('🔒 No session found, redirecting to login')
    router.push('/login')
  }
})

// Cleanup
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    console.log('🛑 Data fetch cycle stopped')
  }
})

// Watch route changes to handle authentication
const handleRouteChange = () => {
  if (isAuthenticated.value && !isLoginPage.value && !intervalId) {
    // Start data fetching for authenticated users
    console.log('🚀 Starting data fetch cycle after route change')
    updateData()
    intervalId = setInterval(updateData, 3000)
  } else if (isLoginPage.value && intervalId) {
    // Stop data fetching on login page
    clearInterval(intervalId)
    intervalId = null
  }
}

// Watch for route changes
router.afterEach(() => {
  handleRouteChange()
})
</script>

<template>
  <div class="app">
    <!-- Show navigation only if not on login page -->
    <template v-if="!isLoginPage">
      <div class="dashboard">
        <h1>🔬 Nordic Thingy Dashboard - Professional Sensor Monitoring</h1>
        
        <!-- Navigation Menu with User Info -->
        <div class="navigation">
          <div class="nav-links">
            <router-link to="/" class="nav-btn" :class="{ active: route.name === 'Dashboard' }">
              🏠 Dashboard
            </router-link>
            <router-link to="/charts" class="nav-btn" :class="{ active: route.name === 'Charts' }">
              📈 Charts
            </router-link>
            <router-link to="/sensors" class="nav-btn" :class="{ active: route.name === 'Sensors' }">
              🌡️ Sensors
            </router-link>
            <router-link to="/motion" class="nav-btn" :class="{ active: route.name === 'Motion' }">
              🏃 Motion
            </router-link>
            <router-link to="/patients" class="nav-btn" :class="{ active: route.name === 'Patients' }">
              👥 Patients
            </router-link>
            <router-link to="/exercises" class="nav-btn" :class="{ active: route.name === 'Exercises' }">
              🎯 Exercises
            </router-link>
          </div>
          
          <!-- User Menu -->
          <div class="user-menu" v-if="isAuthenticated">
            <div class="user-info">
              <div class="user-avatar">{{ userInitials }}</div>
              <div class="user-details">
                <div class="user-name">{{ userDisplayName }}</div>
                <div class="user-role">{{ currentUser?.role }}</div>
              </div>
            </div>
            <button @click="handleLogout" class="logout-btn">
              🚪 Logout
            </button>
          </div>
        </div>
        
        <!-- Vue Router Outlet - Page content displays here -->
        <div class="page-content">
          <router-view />
        </div>
      </div>
    </template>

    <!-- Show login page without navigation -->
    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<style>
/* Import must be first */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  width: 100%;
  height: 100%;
}

.app {
  width: 100%;
  height: 100%;
}

:root {
  --primary-color: #3b82f6;
  --secondary-color: #10b981;
  --accent-color: #f59e0b;
  --danger-color: #ef4444;
  --warning-color: #f59e0b;
  --success-color: #10b981;
  --background-color: #f8fafc;
  --card-background: rgba(255, 255, 255, 0.95);
  --text-color: #1e293b;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.dashboard {
  width: 100%;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--gradient);
  color: var(--text-color);
  display: flex;
  flex-direction: column;
}

h1 {
  text-align: center;
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin: 0;
  padding: 0.8rem 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  letter-spacing: -0.025em;
}

/* Navigation sur une seule ligne avec menu utilisateur à droite */
.navigation {
  display: flex;
  justify-content: space-between; /* Espace entre nav-links et user-menu */
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
  flex-wrap: nowrap; /* Empêche le wrap sur desktop */
  position: relative;
  width: 100%;
}

/* Navigation links centrées */
.nav-links {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  justify-content: center; /* Centre les liens de navigation */
  flex: 1; /* Prend l'espace disponible */
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  font-size: 0.8rem;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.nav-btn.active {
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-color);
}

.router-link-active {
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-color);
}

/* User Menu - maintenant à droite de la navbar */
.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0; /* Ne rétrécit pas */
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffffff, #f1f5f9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  line-height: 1.2;
}

.user-role {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.75rem;
  text-transform: capitalize;
}

.logout-btn {
  background: rgba(239, 68, 68, 0.2);
  color: white;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.3);
  transform: translateY(-1px);
}

/* Page content styles */
.page-content {
  width: 100%;
  min-height: calc(100vh - 120px);
}

/* Responsive design */
@media (max-width: 1024px) {
  .navigation {
    flex-wrap: wrap; /* Permet le wrap sur tablettes */
    justify-content: center;
    gap: 0.8rem;
  }
  
  .nav-links {
    order: 1;
    width: 100%;
    justify-content: center;
  }
  
  .user-menu {
    order: 2;
    margin-top: 0.5rem;
  }
}

@media (max-width: 768px) {
  .navigation {
    flex-direction: column;
    gap: 0.8rem;
    align-items: center;
  }
  
  .nav-links {
    justify-content: center;
    width: 100%;
    order: 1;
  }
  
  .user-menu {
    justify-content: center;
    width: auto;
    order: 2;
  }
  
  h1 {
    font-size: 1.5rem;
    padding: 0.6rem 1rem;
  }
}

@media (max-width: 480px) {
  .nav-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.5rem;
    width: 100%;
    max-width: 400px;
  }
  
  .nav-btn {
    text-align: center;
    padding: 0.6rem 0.4rem;
    font-size: 0.75rem;
  }
  
  .user-details {
    display: none;
  }

  .navigation {
    padding: 0 0.5rem;
  }
  
  .user-menu {
    padding: 0.4rem 0.8rem;
  }
}

/* Amélioration visuelle pour le centrage sur grands écrans */
@media (min-width: 1200px) {
  .navigation {
    max-width: 1200px;
    margin: 0 auto 1rem auto;
    padding: 0 2rem;
  }
  
  .nav-links {
    gap: 0.5rem;
  }
  
  .nav-btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .user-menu {
    padding: 0.6rem 1.2rem;
  }
}

/* Animation pour une meilleure UX */
.nav-links {
  transition: all 0.3s ease;
}

.nav-btn {
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s ease;
}

.nav-btn:hover::before {
  left: 100%;
}

/* Focus states pour l'accessibilité */
.nav-btn:focus {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}

.logout-btn:focus {
  outline: 2px solid rgba(255, 255, 255, 0.8);
  outline-offset: 2px;
}
</style>