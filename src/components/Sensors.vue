<!-- filepath: src/components/Sensors.vue -->
<template>
  <div class="data-list">
    <h2>📊 Live Sensor Data</h2>
    <div class="sensor-row">
      <!-- Accelerometer Card -->
      <div class="sensor-card accelerometer">
        <div class="sensor-title">🏃 Accelerometer</div>
        <div class="sensor-value" :class="{ updated: valueUpdated.accelX }">
          X: {{ nordicData?.accelerometer?.x?.toFixed(2) || '--' }}
        </div>
        <div class="sensor-value" :class="{ updated: valueUpdated.accelY }">
          Y: {{ nordicData?.accelerometer?.y?.toFixed(2) || '--' }}
        </div>
        <div class="sensor-value" :class="{ updated: valueUpdated.accelZ }">
          Z: {{ nordicData?.accelerometer?.z?.toFixed(2) || '--' }}
        </div>
      </div>
      
      <!-- Temperature Card -->
      <div class="sensor-card temperature">
        <div class="sensor-title">🌡️ Temperature</div>
        <div class="sensor-value" :class="{ updated: valueUpdated.temperature }">
          {{ nordicData?.temperature?.toFixed(1) || '--' }} °C
        </div>
        <div 
          v-if="nordicData?.temperaturealert" 
          :class="getAlertClass(nordicData.temperaturealert)"
        >
          {{ truncateAlert(nordicData.temperaturealert) }}
        </div>
      </div>
      
      <!-- Humidity Card -->
      <div class="sensor-card humidity">
        <div class="sensor-title">💧 Humidity</div>
        <div class="sensor-value" :class="{ updated: valueUpdated.humidity }">
          {{ nordicData?.humidity || '--' }} %
        </div>
        <div 
          v-if="nordicData?.humidityalert" 
          :class="getAlertClass(nordicData.humidityalert)"
        >
          {{ truncateAlert(nordicData.humidityalert) }}
        </div>
      </div>
      
      <!-- Air Quality Card -->
      <div class="sensor-card air-quality">
        <div class="sensor-title">🌬️ Air Quality</div>
        <div class="sensor-value" :class="{ updated: valueUpdated.co2 }">
          CO₂: {{ nordicData?.air_quality?.CO2 || '--' }}
        </div>
        <div class="sensor-value" :class="{ updated: valueUpdated.tvoc }">
          TVOC: {{ nordicData?.air_quality?.TVOC || '--' }}
        </div>
        <div 
          v-if="getAirQualityAlert(nordicData)" 
          :class="getAlertClass(getAirQualityAlert(nordicData))"
        >
          {{ truncateAlert(getAirQualityAlert(nordicData)) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props received from parent component
const props = defineProps({
  nordicData: Object,
  valueUpdated: Object
})

// Utility functions
const getAlertClass = (alertText) => {
  if (!alertText) return 'alert-message'
  
  const text = alertText.toLowerCase()
  if (text.includes('no alert') || text.includes('good') || text.includes('excellent')) {
    return 'alert-message good'
  } else if (text.includes('poor') || text.includes('bad') || text.includes('high') || text.includes('danger')) {
    return 'alert-message danger'
  } else if (text.includes('moderate') || text.includes('medium') || text.includes('consider')) {
    return 'alert-message warning'
  } else {
    return 'alert-message warning'
  }
}

const truncateAlert = (alertText) => {
  if (!alertText) return ''
  return alertText.length > 35 ? alertText.substring(0, 32) + '...' : alertText
}

const getAirQualityAlert = (data) => {
  if (!data?.air_quality) return null
  
  if (data.air_qualityalert) return data.air_qualityalert
  
  const co2Value = parseInt(data.air_quality.CO2) || 0
  const tvocValue = parseInt(data.air_quality.TVOC) || 0
  
  if (co2Value > 1000 || tvocValue > 1000) {
    return 'Poor air quality detected'
  } else if (co2Value > 800 || tvocValue > 500) {
    return 'Moderate air quality'
  } else if (co2Value > 0 || tvocValue > 0) {
    return 'Good air quality'
  }
  
  return null
}
</script>

<style scoped>
.data-list {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: clamp(1rem, 2vw, 1.5rem);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  width: 100%;
}

/* Switch grid to flex row layout */
.sensor-row {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 1rem;
  overflow-x: auto;  /* horizontal scroll if screen too small */
  padding-bottom: 0.5rem;
}

/* Ensure identical width for each card */
.sensor-card {
  flex: 1 0 180px;  /* grows if possible, but min 180px */
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 16px;
  padding: 1rem;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0;
  max-height: none;
  position: relative;
}

/* Sensor card color themes */

.sensor-card.accelerometer { 
  border-left-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}

.sensor-card.temperature { 
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
}

.sensor-card.humidity { 
  border-left-color: #06b6d4;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
}

.sensor-card.air-quality { 
  border-left-color: #8b5cf6;
  background: linear-gradient(135deg, #faf5ff, #f3e8ff);
}

.sensor-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
  text-align: center;
  padding-bottom: 0.3rem;
  border-bottom: 2px solid rgba(203, 213, 225, 0.2);
}

.sensor-value {
  font-size: 0.8rem;
  color: #374151;
  margin: 0.1rem 0;
  font-weight: 500;
  font-family: 'SF Mono', 'Monaco', 'Cascadia Code', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.3;
  flex-shrink: 0;
  text-align: center;
  background: rgba(255, 255, 255, 0.5);
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(203, 213, 225, 0.2);
}

.sensor-card.accelerometer .sensor-value {
  font-size: 0.75rem;
  margin: 0.05rem 0;
  padding: 0.25rem 0.4rem;
}

.alert-message {
  font-size: 0.7rem;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  margin-top: auto;
  font-weight: 500;
  text-align: center;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  line-height: 1.2;
  max-height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  flex-shrink: 0;
}

/* Alert message color themes */
.alert-message.good { 
  background: #dcfce7; 
  color: #166534; 
  border: 1px solid #bbf7d0;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
}

.alert-message.warning { 
  background: #fef3c7; 
  color: #92400e; 
  border: 1px solid #fde68a;
  box-shadow: 0 2px 4px rgba(245, 158, 11, 0.1);
}

.alert-message.danger { 
  background: #fee2e2; 
  color: #dc2626; 
  border: 1px solid #fecaca;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.1);
}

/* Value update animation */
.sensor-value.updated {
  animation: valueUpdate 0.3s ease-in-out;
}

@keyframes valueUpdate {
  0% { 
    background: rgba(59, 130, 246, 0.2);
    transform: scale(1.02);
  }
  100% { 
    background: rgba(255, 255, 255, 0.5);
    transform: scale(1);
  }
}

/* Hover effect overlay */
.sensor-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.sensor-card:hover::before {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .data-list {
    padding: 1rem;
  }
  
  .sensor-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    gap: 0.6rem;
    max-height: none;
  }
  
  .sensor-card {
    padding: 0.7rem;
    max-height: 120px;
    gap: 0.4rem;
  }
  
  .sensor-title {
    font-size: 0.8rem;
    padding-bottom: 0.2rem;
  }
  
  .sensor-value {
    font-size: 0.7rem;
    margin: 0.05rem 0;
    padding: 0.2rem 0.3rem;
  }
  
  .sensor-card.accelerometer .sensor-value {
    font-size: 0.65rem;
    padding: 0.15rem 0.25rem;
  }
  
  .alert-message {
    font-size: 0.65rem;
    padding: 0.3rem 0.4rem;
    max-height: 35px;
    -webkit-line-clamp: 2;
  }
}
</style>