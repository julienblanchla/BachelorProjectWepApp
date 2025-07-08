<!-- filepath: src/components/Motion.vue -->
<template>
  <div class="motion-card">
    <div class="motion-header">
      <h3>🏃 Motion Detection</h3>
    </div>
    
    <div class="motion-content">
      <!-- Motion visualization -->
      <div class="motion-display">
        <div class="motion-visual">
          <img 
            v-if="currentMotionImage" 
            :src="currentMotionImage" 
            :alt="motionDescription"
            class="motion-image"
            @error="onMotionImageError"
          />
          <div v-else class="motion-fallback">{{ motionFallback }}</div>
        </div>
        
        <!-- Motion description -->
        <div class="motion-description">
          {{ motionDescription }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps } from 'vue'

// Props received from parent component
const props = defineProps({
  nordicData: {
    type: Object,
    default: null
  }
})

// Motion display data
const currentMotionImage = ref(null)
const motionFallback = ref('⚪')
const motionDescription = ref('Waiting for motion data...')
const motionCount = ref(0)
const goodMovementCount = ref(0)
const badMovementCount = ref(0)

// Update motion display based on alert
const updateMotionDisplay = (motionAlert) => {
  if (!motionAlert) return
  
  motionDescription.value = motionAlert
  
  // Extract image name (remove " - BAD MOVEMENT" if present)
  const imageName = motionAlert.replace(/ - BAD MOVEMENT$/i, '')
  
  try {
    currentMotionImage.value = new URL(`../assets/${imageName}.png`, import.meta.url).href
    motionFallback.value = '⚪'
  } catch (error) {
    currentMotionImage.value = null
    motionFallback.value = '❓'
  }
}

// Analyze movement and count good/bad movements
const analyzeMovement = (motionAlert) => {
  if (!motionAlert) return
  
  const normalized = motionAlert.toLowerCase()
  
  // Define neutral/static positions to ignore
  const neutralPositions = [
    'neutral',
    'center_0',
    'mid_center_0',
    'high_center_0', 
    'down_center_0'
  ]
  
  // Check if it's a neutral position
  const isNeutralPosition = neutralPositions.some(neutral => 
    normalized.includes(neutral)
  )
  
  // Only count actual movements (not neutral positions)
  if (!isNeutralPosition) {
    motionCount.value++
    
    // Check if movement contains "BAD MOVEMENT"
    if (motionAlert.includes('- BAD MOVEMENT')) {
      badMovementCount.value++
    } else {
      goodMovementCount.value++
    }
  }
}

// Handle image loading error
const onMotionImageError = (event) => {
  currentMotionImage.value = null
  motionFallback.value = '❓'
}

// Watch for motion alert changes
watch(() => props.nordicData?.motionalert, (newAlert, oldAlert) => {
  if (newAlert && newAlert !== oldAlert) {
    updateMotionDisplay(newAlert)
    analyzeMovement(newAlert)
  }
}, { immediate: true })
</script>

<style scoped>
.motion-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.motion-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.motion-header h3 {
  margin: 0;
  font-size: 1.5rem;
  color: #1e293b;
  font-weight: 700;
}

.motion-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}

.motion-display {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.motion-visual {
  width: 300px;
  height: 300px;
  border-radius: 20px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0);
  border: 3px solid rgba(255, 255, 255, 0.9);
}

.motion-image {
  max-width: 100%;
  max-height: 100%;
  width: 70%;
  height: auto;
  object-fit: contain;
  border-radius: 16px;
}

.motion-fallback {
  font-size: 6rem;
  color: #94a3b8;
  font-weight: bold;
}

.motion-description {
  font-size: 1.1rem;
  color: #475569;
  background: rgba(248, 250, 252, 0.8);
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  border-left: 4px solid #3b82f6;
  max-width: 400px;
  text-align: center;
  word-wrap: break-word;
  line-height: 1.4;
  font-weight: 500;
}

.motion-stats {
  display: flex;
  gap: 1rem;
  justify-content: center;
  width: 100%;
  margin-top: auto;
}

.stat-item {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
  flex: 1;
  max-width: 120px;
  border: 1px solid rgba(203, 213, 225, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.stat-item strong {
  display: block;
  font-size: 1.8rem;
  color: #1e293b;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.stat-item span {
  font-size: 0.8rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .motion-card {
    padding: 1rem;
  }
  
  .motion-header h3 {
    font-size: 1.2rem;
  }
  
  .motion-visual {
    width: 250px;
    height: 250px;
  }
  
  .motion-fallback {
    font-size: 5rem;
  }
  
  .motion-description {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
    max-width: 350px;
  }
  
  .motion-stats {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .stat-item {
    max-width: none;
    padding: 0.8rem;
  }
  
  .stat-item strong {
    font-size: 1.5rem;
  }
  
  .stat-item span {
    font-size: 0.7rem;
  }
}

@media (max-width: 480px) {
  .motion-card {
    padding: 0.8rem;
  }
  
  .motion-header {
    margin-bottom: 1rem;
  }
  
  .motion-header h3 {
    font-size: 1.1rem;
  }
  
  .motion-visual {
    width: 200px;
    height: 200px;
  }
  
  .motion-fallback {
    font-size: 4rem;
  }
  
  .motion-description {
    font-size: 0.8rem;
    padding: 0.5rem 0.8rem;
    max-width: 280px;
  }
  
  .stat-item {
    padding: 0.6rem;
  }
  
  .stat-item strong {
    font-size: 1.3rem;
  }
  
  .stat-item span {
    font-size: 0.65rem;
  }
}
</style>