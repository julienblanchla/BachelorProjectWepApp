<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reactive data
const nordicData = ref(null)
const mbientData = ref(null)
const error = ref(null)
const isLoading = ref(true)

let intervalId = null

// Fetch Nordic sensor data
const fetchNordicData = async () => {
  try {
    const response = await fetch('http://153.109.22.167:8088/multi-sensor/properties/nordicCount')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    nordicData.value = data
  } catch (err) {
    console.error('Error fetching Nordic data:', err)
    error.value = err.message
  }
}

// Fetch Mbient sensor data
const fetchMbientData = async () => {
  try {
    const response = await fetch('http://153.109.22.167:8088/multi-sensor/properties/mbientCount')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    mbientData.value = data
  } catch (err) {
    console.error('Error fetching Mbient data:', err)
    error.value = err.message
  }
}

// Fetch all sensor data
const fetchAllData = async () => {
  await Promise.all([fetchNordicData(), fetchMbientData()])
  isLoading.value = false
}

// Get alert color based on alert content
const getAlertColor = (alert) => {
  if (!alert || alert === 'No alert') return 'green'
  if (alert.includes('Poor') || alert.includes('High')) return 'orange'
  return 'red'
}

// Format timestamp for display
const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'N/A'
  return new Date(timestamp).toLocaleString()
}

onMounted(() => {
  fetchAllData()
  // Refresh data every 5 seconds
  intervalId = setInterval(fetchAllData, 5000)
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>

<template>
  <div class="sensor-dashboard">
    <h2>Sensor Data Dashboard</h2>
    
    <div v-if="isLoading" class="loading">
      Loading sensor data...
    </div>

    <div v-if="error" class="error">
      Error: {{ error }}
    </div>

    <div class="sensors-container">
      <!-- Nordic Sensor Data -->
      <div class="sensor-card" v-if="nordicData">
        <h3>Nordic Sensor</h3>
        <div class="sensor-data">
          <div class="data-group">
            <h4>Accelerometer</h4>
            <div class="data-row">
              <span>X: {{ nordicData.accelerometer?.x || 'N/A' }}</span>
              <span>Y: {{ nordicData.accelerometer?.y || 'N/A' }}</span>
              <span>Z: {{ nordicData.accelerometer?.z || 'N/A' }}</span>
            </div>
          </div>
          
          <div class="data-group">
            <h4>Alerts</h4>
            <div class="alert" :class="getAlertColor(nordicData.motionalert)">
              Motion: {{ nordicData.motionalert || 'N/A' }}
            </div>
          </div>
          
          <div class="data-group">
            <h4>Last Update</h4>
            <span class="timestamp">{{ formatTimestamp(nordicData.timestamp) }}</span>
          </div>
        </div>
      </div>

      <!-- Mbient Sensor Data -->
      <div class="sensor-card" v-if="mbientData">
        <h3>Mbient Sensor</h3>
        <div class="sensor-data">
          <div class="data-group">
            <h4>Accelerometer</h4>
            <div class="data-row">
              <span>X: {{ mbientData.accelerometer?.x || 'N/A' }}</span>
              <span>Y: {{ mbientData.accelerometer?.y || 'N/A' }}</span>
              <span>Z: {{ mbientData.accelerometer?.z || 'N/A' }}</span>
            </div>
          </div>

          <div class="data-group">
            <h4>Gyroscope</h4>
            <div class="data-row">
              <span>X: {{ mbientData.gyroscope?.x || 'N/A' }}</span>
              <span>Y: {{ mbientData.gyroscope?.y || 'N/A' }}</span>
              <span>Z: {{ mbientData.gyroscope?.z || 'N/A' }}</span>
            </div>
          </div>

          <div class="data-group">
            <h4>Environmental</h4>
            <div class="data-row">
              <span>Temperature: {{ mbientData.temperature || 'N/A' }}°C</span>
              <span>Humidity: {{ mbientData.humidity || 'N/A' }}%</span>
            </div>
          </div>

          <div class="data-group">
            <h4>Air Quality</h4>
            <div class="data-row">
              <span>CO2: {{ mbientData.air_quality?.CO2 || 'N/A' }} ppm</span>
              <span>TVOC: {{ mbientData.air_quality?.TVOC || 'N/A' }} ppb</span>
            </div>
          </div>

          <div class="data-group">
            <h4>Alerts</h4>
            <div class="alert" :class="getAlertColor(mbientData.motionalert)">
              Motion: {{ mbientData.motionalert || 'N/A' }}
            </div>
            <div class="alert" :class="getAlertColor(mbientData.temperaturealert)">
              Temperature: {{ mbientData.temperaturealert || 'N/A' }}
            </div>
            <div class="alert" :class="getAlertColor(mbientData.humidityalert)">
              Humidity: {{ mbientData.humidityalert || 'N/A' }}
            </div>
            <div class="alert" :class="getAlertColor(mbientData.air_qualityalert)">
              Air Quality: {{ mbientData.air_qualityalert || 'N/A' }}
            </div>
          </div>

          <div class="data-group">
            <h4>Last Update</h4>
            <span class="timestamp">{{ formatTimestamp(mbientData.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sensor-dashboard {
  padding: 2rem;
}

.sensor-dashboard h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: var(--color-heading);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: var(--color-text);
}

.error {
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  background-color: #fdf2f2;
  border: 1px solid #e74c3c;
  border-radius: 8px;
  margin-bottom: 2rem;
}

.sensors-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
}

.sensor-card {
  background: var(--color-background-soft);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sensor-card h3 {
  color: var(--color-heading);
  margin-bottom: 1rem;
  text-align: center;
  font-size: 1.5rem;
}

.data-group {
  margin-bottom: 1.5rem;
}

.data-group h4 {
  color: var(--color-heading);
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.25rem;
}

.data-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.data-row span {
  background: var(--color-background);
  padding: 0.5rem;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.9rem;
  border: 1px solid var(--color-border);
}

.alert {
  padding: 0.5rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

/* Alert color classes */
.alert.green {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert.orange {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.alert.red {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.timestamp {
  font-family: monospace;
  font-size: 0.9rem;
  color: var(--color-text);
  background: var(--color-background);
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  display: inline-block;
}

/* Responsive design */
@media (max-width: 768px) {
  .sensors-container {
    grid-template-columns: 1fr;
  }
  
  .data-row {
    flex-direction: column;
  }
}
</style>