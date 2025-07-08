<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue'
import { useRoute } from 'vue-router'

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
const route = useRoute()

provide('nordicData', nordicData)
provide('mbientData', mbientData)
provide('chartData', chartData)
provide('mbientChartData', mbientChartData)
provide('maxPoints', maxPoints)
provide('valueUpdated', valueUpdated)

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
  
  // Keep only the last points
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
  
  // Keep only the last points
  if (mbientChartData.value.labels.length > maxPoints) {
    mbientChartData.value.labels.shift()
    mbientChartData.value.xData.shift()
    mbientChartData.value.yData.shift()
    mbientChartData.value.zData.shift()
  }
}

// Function to trigger value animation
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
  await Promise.all([
    fetchNordicData(),
    fetchMbientData()
  ])
  
  watchForChanges()
  isLoading.value = false
}

// Automatic startup
onMounted(() => {
  console.log('🚀 Application started - Starting data fetch cycle')
  updateData() // First immediate call
  intervalId = setInterval(updateData, 3000) // Then every 3 seconds
})

// Cleanup
onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
    console.log('🛑 Data fetch cycle stopped')
  }
})
</script>

<template>
  <div class="dashboard">
    <h1>🔬 Nordic Thingy Dashboard - Professional Sensor Monitoring</h1>
    
    <!-- Navigation Menu -->
    <div class="navigation">
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
    
    <!-- Vue Router Outlet - Page content displays here -->
    <div class="page-content">
      <router-view />
    </div>
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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--gradient);
  min-height: 100vh;
  width: 100%;
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

.navigation {
  display: flex;
  justify-content: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
  padding: 0 1rem;
  flex-wrap: wrap;
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

/* Page content styles */
.page-content {
  width: 100%;
  min-height: calc(100vh - 120px);
}
</style>