<!-- src/views/Dashboard.vue -->
<template>
  <div class="dashboard-page">
    <div class="main-container">
      <!-- Column 1: Nordic Thingy Accelerometer -->
      <div class="widget nordic-widget">
        <Charts
          variant="nordic"
          :nordic-data="nordicData"
          :chart-data="chartData"
          :max-points="maxPoints"
        />
      </div>

      <!-- Column 2: Mbient Accelerometer -->
      <div class="widget mbient-widget">
        <Charts
          variant="mbient"
          :mbient-data="mbientData"
          :mbient-chart-data="mbientChartData"
          :max-points="maxPoints"
        />
      </div>

      <!-- Column 3: Motion Detection -->
      <div class="widget motion-box">
        <Motion :nordic-data="nordicData" />
      </div>

      <!-- Row 2: Live Sensor Data -->
      <div class="widget sensor-box">
        <Sensors
          :nordic-data="nordicData"
          :value-updated="valueUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Charts from '../components/Charts.vue'
import Motion from '../components/Motion.vue'
import Sensors from '../components/Sensors.vue'
import { inject } from 'vue'

// Injected data from App.vue
const nordicData      = inject('nordicData')
const mbientData      = inject('mbientData')
const chartData       = inject('chartData')
const mbientChartData = inject('mbientChartData')
const maxPoints       = inject('maxPoints')
const valueUpdated    = inject('valueUpdated')
</script>

<style scoped>
.dashboard-page {
  width: 100%;
  height: 100vh;
}

.main-container {
  display: grid;
  grid-template-areas:
    "nordic mbient motion"
    "sensor sensor sensor";
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 1rem;
  padding: 1rem;
  box-sizing: border-box;
}

/* Grid area assignments */
.nordic-widget { grid-area: nordic; }
.mbient-widget { grid-area: mbient; }
.motion-box    { grid-area: motion; }
.sensor-box    { grid-area: sensor; }

.widget {
  display: flex;
  flex-direction: column;
  align-items: center;      /* center horizontally */
  justify-content: center;  /* center vertically */
  background: #fff;
  padding: 0.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: 1px solid rgba(0,0,0,0.05);
  overflow: hidden;
}

/* Enlarged chart size */
.widget :deep(.svg-chart-container) {
  height: 240px;
}

/* Title and legend adjustments */
.widget :deep(.chart-container h2) {
  font-size: 0.95rem;
  margin-bottom: 0.3rem;
}
.widget :deep(.chart-legend) {
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}

/* Responsive media queries */
@media (min-width: 1200px) {
  .widget :deep(.svg-chart-container) {
    height: 300px;
  }
}

@media (max-width: 768px) {
  .widget :deep(.svg-chart-container) {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .widget :deep(.svg-chart-container) {
    height: 160px;
  }
}

/* Adjust padding for Motion and Sensors modules */
.motion-box,
.sensor-box {
  padding: 0.4rem;
}
</style>
