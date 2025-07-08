<!-- filepath: src/views/SensorsPage.vue -->
<template>
  <div class="sensors-page">
    <div class="page-header">
      <h2>🌡️ Sensors Monitor</h2>
    </div>
    
    <div class="sensors-container">
      <!-- Main Sensors component -->
      <div class="sensors-wrapper">
        <Sensors 
          :nordic-data="nordicData" 
          :value-updated="valueUpdated" 
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Sensors from '../components/Sensors.vue'
import { inject } from 'vue'

// Injected data from App.vue
const nordicData = inject('nordicData')
const mbientData = inject('mbientData')
const chartData = inject('chartData')
const maxPoints = inject('maxPoints')
const valueUpdated = inject('valueUpdated')
</script>

<style scoped>
.sensors-page {
  width: 100%;
  padding: 1rem;
  min-height: 100vh;
  /* Allow content to expand beyond viewport if necessary */
}

.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
  color: white;
}

.page-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 600;
}

.sensors-container {
  display: flex;
  justify-content: center;
  max-width: 1800px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.sensors-wrapper {
  width: 100%;
  max-width: 1200px;
  min-height: 700px;
  /* Allow container to grow according to content */
  height: auto;
}

/* Force expansion of the Sensors component */
.sensors-wrapper :deep(.sensors-container) {
  height: auto !important;
  min-height: 700px !important;
  max-height: none !important;
  overflow: visible !important;
}

/* Expansion of data list grid */
.sensors-wrapper :deep(.data-list) {
  max-height: none !important;
  overflow: visible !important;
  height: auto !important;
}

/* Expansion of sensor grids */
.sensors-wrapper :deep(.sensor-grid) {
  height: auto !important;
  min-height: auto !important;
  max-height: none !important;
  overflow: visible !important;
}

/* Adjust individual sensor items */
.sensors-wrapper :deep(.sensor-item) {
  height: auto !important;
  min-height: 80px !important;
  padding: 1rem !important;
}

/* Expansion of sensor sections */
.sensors-wrapper :deep(.sensor-section) {
  height: auto !important;
  max-height: none !important;
  overflow: visible !important;
  margin-bottom: 1.5rem !important;
}

/* Adjust section titles */
.sensors-wrapper :deep(.sensor-section h3) {
  font-size: 1.2rem !important;
  margin-bottom: 1rem !important;
}

/* Expansion of main containers */
.sensors-wrapper :deep(.main-sensor-container) {
  height: auto !important;
  min-height: 600px !important;
  max-height: none !important;
  overflow: visible !important;
}

/* Hide scrollbars if they appear */
.sensors-wrapper :deep(*) {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.sensors-wrapper :deep(*::-webkit-scrollbar) {
  display: none !important;
}

/* Responsive for medium screens */
@media (max-width: 1200px) {
  .sensors-wrapper {
    max-width: 1000px;
    min-height: 650px;
  }
  
  .sensors-wrapper :deep(.sensors-container) {
    min-height: 650px !important;
  }
}

@media (max-width: 768px) {
  .sensors-page {
    padding: 0.5rem;
  }
  
  .page-header h2 {
    font-size: 1.5rem;
  }
  
  .sensors-wrapper {
    max-width: 100%;
    min-height: 600px;
  }
  
  .sensors-wrapper :deep(.sensors-container) {
    min-height: 600px !important;
  }
  
  .sensors-wrapper :deep(.sensor-item) {
    min-height: 70px !important;
    padding: 0.8rem !important;
  }
}

@media (max-width: 480px) {
  .sensors-page {
    padding: 0.3rem;
  }
  
  .page-header h2 {
    font-size: 1.3rem;
  }
  
  .sensors-wrapper {
    min-height: 550px;
  }
  
  .sensors-wrapper :deep(.sensors-container) {
    min-height: 550px !important;
  }
  
  .sensors-wrapper :deep(.sensor-item) {
    min-height: 60px !important;
    padding: 0.6rem !important;
  }
}
</style>
