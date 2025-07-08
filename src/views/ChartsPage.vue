<!-- filepath: src/views/ChartsPage.vue -->
<template>
  <div class="charts-page">
    <div class="page-header">
      <h2>📈 Charts Analysis</h2>
    </div>
    
    <div class="charts-container">
      <!-- Nordic Chart -->
      <Charts 
        variant="nordic"
        :nordic-data="nordicData" 
        :mbient-data="mbientData" 
        :chart-data="chartData" 
        :mbient-chart-data="mbientChartData"
        :max-points="maxPoints"
      />
      
      <!-- Mbient Chart -->
      <Charts 
        variant="mbient"
        :nordic-data="nordicData" 
        :mbient-data="mbientData" 
        :chart-data="chartData" 
        :mbient-chart-data="mbientChartData"
        :max-points="maxPoints"
      />
    </div>
  </div>
</template>

<script setup>
import Charts from '../components/Charts.vue'
import { inject } from 'vue'

const nordicData = inject('nordicData')
const mbientData = inject('mbientData')
const chartData = inject('chartData')
const mbientChartData = inject('mbientChartData')
const maxPoints = inject('maxPoints')
</script>

<style scoped>
.charts-page {
  width: 100%;
  padding: 1.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow-y: auto;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
  color: white;
  position: relative;
}

.page-header::before {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, rgba(255,255,255,0.8), rgba(255,255,255,0.3));
  border-radius: 2px;
}

.page-header h2 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  font-weight: 600;
}

.page-header p {
  font-size: 1.2rem;
  opacity: 0.9;
  font-weight: 300;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Chart container improvements */
.charts-container :deep(.chart-container) {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.charts-container :deep(.chart-container):hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1);
}

.charts-container :deep(.chart-container)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 16px 16px 0 0;
}

/* Title improvements */
.charts-container :deep(.chart-container h2) {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  padding: 0;
  color: #2d3748;
  font-weight: 600;
  text-align: center;
  letter-spacing: -0.3px;
}

/* Legend improvements */
.charts-container :deep(.chart-legend) {
  margin: 1rem 0;
  gap: 1.5rem;
  padding: 0.8rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(226, 232, 240, 0.6);
}

.charts-container :deep(.legend-item) {
  font-size: 0.9rem;
  font-weight: 500;
  color: #4a5568;
  gap: 0.5rem;
}

.charts-container :deep(.legend-color) {
  width: 16px;
  height: 4px;
  border-radius: 2px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* SVG container improvements */
.charts-container :deep(.svg-chart-container) {
  margin: 1rem 0 0 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
}

.charts-container :deep(.acceleration-chart) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.charts-container :deep(.acceleration-chart):hover {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-color: rgba(102, 126, 234, 0.3);
}

/* Animation improvements */
.charts-container :deep(.data-lines path) {
  stroke-width: 2.5px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
}

.charts-container :deep(.data-lines path):hover {
  stroke-width: 3px;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.15));
}

/* Enhanced responsive design */
@media (max-width: 1200px) {
  .charts-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 0;
  }
  
  .page-header h2 {
    font-size: 2.2rem;
  }
  
  .charts-container :deep(.chart-container) {
    padding: 1.2rem;
  }
}

@media (max-width: 768px) {
  .charts-page {
    padding: 1rem;
  }
  
  .page-header {
    margin-bottom: 1.5rem;
  }
  
  .page-header h2 {
    font-size: 1.8rem;
  }
  
  .page-header p {
    font-size: 1rem;
  }
  
  .charts-container {
    gap: 1rem;
  }
  
  .charts-container :deep(.chart-container) {
    padding: 1rem;
    border-radius: 12px;
  }
  
  .charts-container :deep(.chart-container h2) {
    font-size: 1.1rem;
    margin-bottom: 0.8rem;
  }
  
  .charts-container :deep(.chart-legend) {
    margin: 0.8rem 0;
    gap: 1rem;
    padding: 0.6rem;
  }
  
  .charts-container :deep(.legend-item) {
    font-size: 0.8rem;
  }
}

@media (max-width: 480px) {
  .charts-page {
    padding: 0.8rem;
  }
  
  .page-header h2 {
    font-size: 1.5rem;
  }
  
  .page-header p {
    font-size: 0.9rem;
  }
  
  .charts-container {
    gap: 0.8rem;
  }
  
  .charts-container :deep(.chart-container) {
    padding: 0.8rem;
    border-radius: 8px;
  }
  
  .charts-container :deep(.chart-container h2) {
    font-size: 1rem;
    margin-bottom: 0.6rem;
  }
  
  .charts-container :deep(.chart-legend) {
    margin: 0.6rem 0;
    gap: 0.8rem;
    padding: 0.5rem;
    flex-wrap: wrap;
  }
  
  .charts-container :deep(.legend-item) {
    font-size: 0.75rem;
  }
}

/* Entry animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.charts-container :deep(.chart-container) {
  animation: fadeInUp 0.6s ease forwards;
}

.charts-container :deep(.chart-container:nth-child(1)) {
  animation-delay: 0.1s;
}

.charts-container :deep(.chart-container:nth-child(2)) {
  animation-delay: 0.2s;
}

/* Custom scrollbar */
.charts-page::-webkit-scrollbar {
  width: 8px;
}

.charts-page::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.charts-page::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.charts-page::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}
</style>