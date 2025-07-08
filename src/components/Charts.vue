<!-- filepath: src/components/Charts.vue -->
<template>
  <div class="charts-container">
    <!-- Nordic Thingy Chart - Display only if variant="nordic" -->
    <div v-if="!variant || variant === 'nordic'" class="chart-container">
      <h2>📈 Nordic Thingy Accelerometer - Real Time</h2>
      
      <!-- Legend -->
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color x-axis"></div>
          <span>X-axis</span>
        </div>
        <div class="legend-item">
          <div class="legend-color y-axis"></div>
          <span>Y-axis</span>
        </div>
        <div class="legend-item">
          <div class="legend-color z-axis"></div>
          <span>Z-axis</span>
        </div>
      </div>
      
      <!-- SVG Chart -->
      <div class="svg-chart-container" ref="chartContainer">
        <svg viewBox="0 0 800 300" class="acceleration-chart">
          <!-- Grid pattern -->
          <defs>
            <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="800" height="300" fill="url(#grid)" />
          
          <!-- Y-axis with scale -->
          <g class="y-axis">
            <line x1="50" y1="0" x2="50" y2="300" stroke="#94a3b8" stroke-width="2"/>
            <text v-for="i in 5" :key="i" 
                  x="40" 
                  :y="60 * i - 15" 
                  text-anchor="end" 
                  font-size="12" 
                  fill="#64748b">
              {{ (getMinMaxValues().max - (getMinMaxValues().max - getMinMaxValues().min) * (i - 1) / 4).toFixed(1) }}
            </text>
          </g>
          
          <!-- X-axis with time labels -->
          <g class="x-axis">
            <line x1="50" y1="300" x2="800" y2="300" stroke="#94a3b8" stroke-width="2"/>
            <text v-for="(label, i) in chartData.labels.filter((_, idx) => idx % 5 === 0)" 
                  :key="i" 
                  :x="50 + (i * 5 * 750 / Math.max(chartData.labels.length - 1, 1))" 
                  y="295" 
                  text-anchor="middle" 
                  font-size="10" 
                  fill="#64748b">
              {{ label.split(':').slice(1).join(':') }}
            </text>
          </g>
          
          <!-- Data lines -->
          <g class="data-lines" transform="translate(50, 0)">
            <!-- X-axis line -->
            <path v-if="chartData.xData.length > 1"
                  :d="createPath(chartData.xData, getMinMaxValues().min, getMinMaxValues().max, 300, 750)"
                  stroke="#ef4444" 
                  stroke-width="3" 
                  fill="none"/>
            
            <!-- Y-axis line -->
            <path v-if="chartData.yData.length > 1"
                  :d="createPath(chartData.yData, getMinMaxValues().min, getMinMaxValues().max, 300, 750)"
                  stroke="#3b82f6" 
                  stroke-width="3" 
                  fill="none"/>
            
            <!-- Z-axis line -->
            <path v-if="chartData.zData.length > 1"
                  :d="createPath(chartData.zData, getMinMaxValues().min, getMinMaxValues().max, 300, 750)"
                  stroke="#10b981" 
                  stroke-width="3" 
                  fill="none"/>
            
            <!-- Current data points -->
            <circle v-if="chartData.xData.length > 0"
                    :cx="750 * (chartData.xData.length - 1) / Math.max(chartData.xData.length - 1, 1)"
                    :cy="300 - ((chartData.xData[chartData.xData.length - 1] - getMinMaxValues().min) / (getMinMaxValues().max - getMinMaxValues().min)) * 300"
                    r="4" 
                    fill="#ef4444"/>
            
            <circle v-if="chartData.yData.length > 0"
                    :cx="750 * (chartData.yData.length - 1) / Math.max(chartData.yData.length - 1, 1)"
                    :cy="300 - ((chartData.yData[chartData.yData.length - 1] - getMinMaxValues().min) / (getMinMaxValues().max - getMinMaxValues().min)) * 300"
                    r="4" 
                    fill="#3b82f6"/>
            
            <circle v-if="chartData.zData.length > 0"
                    :cx="750 * (chartData.zData.length - 1) / Math.max(chartData.zData.length - 1, 1)"
                    :cy="300 - ((chartData.zData[chartData.zData.length - 1] - getMinMaxValues().min) / (getMinMaxValues().max - getMinMaxValues().min)) * 300"
                    r="4" 
                    fill="#10b981"/>
          </g>
          
          <!-- Axis labels -->
          <text x="400" y="290" text-anchor="middle" font-size="14" font-weight="bold" fill="#374151">Time</text>
          <text x="25" y="150" text-anchor="middle" font-size="14" font-weight="bold" fill="#374151" transform="rotate(-90, 25, 150)">Acceleration (g)</text>
        </svg>
      </div>
    </div>
    
    <!-- Mbient Chart - Display only if variant="mbient" -->
    <div v-if="variant === 'mbient'" class="chart-container">
      <h2>📊 Mbient Accelerometer - Real Time</h2>
      
      <!-- Legend -->
      <div class="chart-legend">
        <div class="legend-item">
          <div class="legend-color x-axis"></div>
          <span>X-axis</span>
        </div>
        <div class="legend-item">
          <div class="legend-color y-axis"></div>
          <span>Y-axis</span>
        </div>
        <div class="legend-item">
          <div class="legend-color z-axis"></div>
          <span>Z-axis</span>
        </div>
      </div>
      
      <!-- SVG Chart -->
      <div class="svg-chart-container" ref="mbientChartContainer">
        <svg viewBox="0 0 800 300" class="acceleration-chart">
          <!-- Grid pattern -->
          <defs>
            <pattern id="mbientGrid" width="40" height="30" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="800" height="300" fill="url(#mbientGrid)" />
          
          <!-- Y-axis with scale -->
          <g class="y-axis">
            <line x1="50" y1="0" x2="50" y2="300" stroke="#94a3b8" stroke-width="2"/>
            <text v-for="i in 5" :key="i" 
                  x="40" 
                  :y="60 * i - 15" 
                  text-anchor="end" 
                  font-size="12" 
                  fill="#64748b">
              {{ (getMbientMinMaxValues().max - (getMbientMinMaxValues().max - getMbientMinMaxValues().min) * (i - 1) / 4).toFixed(1) }}
            </text>
          </g>
          
          <!-- X-axis with time labels -->
          <g class="x-axis">
            <line x1="50" y1="300" x2="800" y2="300" stroke="#94a3b8" stroke-width="2"/>
            <text v-for="(label, i) in mbientChartData.labels.filter((_, idx) => idx % 5 === 0)" 
                  :key="i" 
                  :x="50 + (i * 5 * 750 / Math.max(mbientChartData.labels.length - 1, 1))" 
                  y="295" 
                  text-anchor="middle" 
                  font-size="10" 
                  fill="#64748b">
              {{ label.split(':').slice(1).join(':') }}
            </text>
          </g>
          
          <!-- Data lines -->
          <g class="data-lines" transform="translate(50, 0)">
            <!-- X-axis line -->
            <path v-if="mbientChartData.xData.length > 1"
                  :d="createPath(mbientChartData.xData, getMbientMinMaxValues().min, getMbientMinMaxValues().max, 300, 750)"
                  stroke="#ef4444" 
                  stroke-width="3" 
                  fill="none"/>
            
            <!-- Y-axis line -->
            <path v-if="mbientChartData.yData.length > 1"
                  :d="createPath(mbientChartData.yData, getMbientMinMaxValues().min, getMbientMinMaxValues().max, 300, 750)"
                  stroke="#3b82f6" 
                  stroke-width="3" 
                  fill="none"/>
            
            <!-- Z-axis line -->
            <path v-if="mbientChartData.zData.length > 1"
                  :d="createPath(mbientChartData.zData, getMbientMinMaxValues().min, getMbientMinMaxValues().max, 300, 750)"
                  stroke="#10b981" 
                  stroke-width="3" 
                  fill="none"/>
            
            <!-- Current data points -->
            <circle v-if="mbientChartData.xData.length > 0"
                    :cx="750 * (mbientChartData.xData.length - 1) / Math.max(mbientChartData.xData.length - 1, 1)"
                    :cy="300 - ((mbientChartData.xData[mbientChartData.xData.length - 1] - getMbientMinMaxValues().min) / (getMbientMinMaxValues().max - getMbientMinMaxValues().min)) * 300"
                    r="4" 
                    fill="#ef4444"/>
            
            <circle v-if="mbientChartData.yData.length > 0"
                    :cx="750 * (mbientChartData.yData.length - 1) / Math.max(mbientChartData.yData.length - 1, 1)"
                    :cy="300 - ((mbientChartData.yData[mbientChartData.yData.length - 1] - getMbientMinMaxValues().min) / (getMbientMinMaxValues().max - getMbientMinMaxValues().min)) * 300"
                    r="4" 
                    fill="#3b82f6"/>
            
            <circle v-if="mbientChartData.zData.length > 0"
                    :cx="750 * (mbientChartData.zData.length - 1) / Math.max(mbientChartData.zData.length - 1, 1)"
                    :cy="300 - ((mbientChartData.zData[mbientChartData.zData.length - 1] - getMbientMinMaxValues().min) / (getMbientMinMaxValues().max - getMbientMinMaxValues().min)) * 300"
                    r="4" 
                    fill="#10b981"/>
          </g>
          
          <!-- Axis labels -->
          <text x="400" y="290" text-anchor="middle" font-size="14" font-weight="bold" fill="#374151">Time</text>
          <text x="25" y="150" text-anchor="middle" font-size="14" font-weight="bold" fill="#374151" transform="rotate(-90, 25, 150)">Acceleration (g)</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props received from parent component
const props = defineProps({
  variant: {
    type: String,
    default: null, // null = shows both (for compatibility), "nordic" or "mbient" = shows only one
    validator: (value) => [null, 'nordic', 'mbient'].includes(value)
  },
  nordicData: Object,
  mbientData: Object,
  chartData: Object,
  mbientChartData: Object,
  maxPoints: {
    type: Number,
    default: 30
  }
})

// References for SVG charts
const chartContainer = ref(null)
const mbientChartContainer = ref(null)

// Create SVG path from data points
const createPath = (data, minVal, maxVal, height, width) => {
  if (data.length === 0) return ''
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - minVal) / (maxVal - minVal)) * height
    return `${x},${y}`
  })
  
  return `M ${points.join(' L ')}`
}

// Calculate min/max values for Nordic chart scale
const getMinMaxValues = () => {
  if (!props.chartData) return { min: -2, max: 2 }
  
  const allValues = [...props.chartData.xData, ...props.chartData.yData, ...props.chartData.zData]
  if (allValues.length === 0) return { min: -2, max: 2 }
  
  const min = Math.min(...allValues, -2)
  const max = Math.max(...allValues, 2)
  const padding = (max - min) * 0.1
  
  return { min: min - padding, max: max + padding }
}

// Calculate min/max values for Mbient chart scale
const getMbientMinMaxValues = () => {
  if (!props.mbientChartData) return { min: -2, max: 2 }
  
  const allValues = [...props.mbientChartData.xData, ...props.mbientChartData.yData, ...props.mbientChartData.zData]
  if (allValues.length === 0) return { min: -2, max: 2 }
  
  const min = Math.min(...allValues, -2)
  const max = Math.max(...allValues, 2)
  const padding = (max - min) * 0.1
  
  return { min: min - padding, max: max + padding }
}
</script>

<style scoped>
.charts-container {
  display: contents;
}

/* SVG chart container */
.svg-chart-container {
  width: 100%;
  height: 220px; /* Reduced from 300px to 220px */
  margin: 0.3rem 0 0 0; /* Reduced from 0.5rem to 0.3rem */
}

.acceleration-chart {
  width: 100%;
  height: 100%;
  background: #f8fafc;
  border-radius: 6px; /* Reduced from 8px to 6px */
  border: 1px solid #e2e8f0;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 1rem; /* Reduced from 1.5rem to 1rem */
  margin: 0.3rem 0; /* Reduced from 0.5rem to 0.3rem */
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem; /* Reduced from 0.5rem to 0.3rem */
  font-size: 0.7rem; /* Reduced from 0.8rem to 0.7rem */
  font-weight: 500;
}

.legend-color {
  width: 12px; /* Reduced from 16px to 12px */
  height: 3px; /* Reduced from 4px to 3px */
  border-radius: 2px;
}

/* Color mapping for axes */
.legend-color.x-axis {
  background: #ef4444;
}

.legend-color.y-axis {
  background: #3b82f6;
}

.legend-color.z-axis {
  background: #10b981;
}

.chart-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 8px; /* Reduced from 12px to 8px */
  padding: 0.5rem; /* Reduced from 0.8rem to 0.5rem */
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08); /* Reduced from 0 4px 20px to 0 2px 12px */
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-bottom: 0.6rem; /* Reduced from 1rem to 0.6rem */
}

.chart-container h2 {
  color: #1e293b;
  margin-bottom: 0.3rem; /* Reduced from 0.2rem to 0.3rem to compensate for title reduction */
  text-align: center;
  font-size: 0.85rem; /* Reduced from 1rem to 0.85rem */
  font-weight: 600;
}

/* Animated data lines */
.data-lines path {
  stroke-dasharray: 5;
  animation: dash 20s linear infinite;
}

@keyframes dash {
  to {
    stroke-dashoffset: -1000;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .svg-chart-container {
    height: 180px; /* Reduced from 250px to 180px */
    margin: 0.3rem 0 0 0;
  }
  
  .chart-legend {
    gap: 0.8rem; /* Reduced from 1rem to 0.8rem */
  }
  
  .legend-item {
    font-size: 0.65rem; /* Reduced from 0.7rem to 0.65rem */
  }
  
  .chart-container {
    padding: 0.4rem; /* Reduced from 0.6rem to 0.4rem */
  }
  
  .chart-container h2 {
    font-size: 0.8rem; /* Reduced from 0.9rem to 0.8rem */
  }
}

@media (max-width: 480px) {
  .svg-chart-container {
    height: 150px; /* Reduced from 200px to 150px */
    margin: 0.2rem 0 0 0;
  }
  
  .chart-legend {
    gap: 0.4rem; /* Reduced from 0.5rem to 0.4rem */
    flex-wrap: wrap;
  }
  
  .legend-item {
    font-size: 0.6rem; /* Reduced from 0.65rem to 0.6rem */
  }
  
  .chart-container {
    padding: 0.3rem; /* Reduced from 0.5rem to 0.3rem */
  }
  
  .chart-container h2 {
    font-size: 0.75rem; /* Reduced from 0.8rem to 0.75rem */
  }
}
</style>