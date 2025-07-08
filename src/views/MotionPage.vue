<!-- filepath: src/views/MotionPage.vue -->
<template>
  <div class="motion-page">
    
    
    <div class="motion-container">
      <!-- Main Motion component -->
      <Motion :nordic-data="nordicData" />
      
      <!-- Recording Section -->
      <div class="recording-section">
        <div class="recording-header">
          <h3>📹 Recording</h3>
          <div class="recording-status" :class="recordingStatusClass">
            {{ recordingStatusText }}
          </div>
        </div>
        
        <div class="recording-controls">
          <button 
            class="btn-recording btn-start" 
            :disabled="isRecording"
            @click="startRecording"
          >
            ▶️ Start Recording
          </button>
          <button 
            class="btn-recording btn-stop" 
            :disabled="!isRecording"
            @click="stopRecording"
          >
            ⏹️ Stop Recording
          </button>
          <button 
            class="btn-recording btn-download" 
            :disabled="!downloadUrl"
            @click="downloadSession"
          >
            💾 Download CSV
          </button>
        </div>
        
        <div v-if="isRecording || recordingComplete" class="recording-info">
          <div class="recording-stats">
            <div class="stat-item">
              <strong>{{ formatDuration(recordingDuration) }}</strong>
              <span>Duration</span>
            </div>
            <div class="stat-item">
              <strong>{{ recordingCount }}</strong>
              <span>Data Points</span>
            </div>
          </div>
          
          <div class="movement-counters">
            <div class="counter-item good">
              <strong>{{ goodMovementCount }}</strong>
              <span>Good Movements</span>
            </div>
            <div class="counter-item bad">
              <strong>{{ badMovementCount }}</strong>
              <span>Bad Movements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Motion from '../components/Motion.vue'
import { inject, ref, watch, computed } from 'vue'

const nordicData = inject('nordicData')
const motionHistory = ref([])

// Recording state
const isRecording = ref(false)
const recordingComplete = ref(false)
const currentSessionId = ref(null)
const recordingStartTime = ref(null)
const recordingDuration = ref(0)
const recordingCount = ref(0)
const downloadUrl = ref(null)
const goodMovementCount = ref(0)
const badMovementCount = ref(0)

// Data structure to store all Nordic sensor data
const recordedData = ref([])

// Timers
let durationTimer = null

// Computed properties
const recordingStatusClass = computed(() => {
  if (isRecording.value) return 'recording'
  if (recordingComplete.value) return 'complete'
  return 'idle'
})

const recordingStatusText = computed(() => {
  if (isRecording.value) return '🔴 Recording active'
  if (recordingComplete.value) return '✅ Recording complete'
  return '🔴 Ready to record'
})

// Methods
const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const analyzeMovement = (motionalert) => {
  if (!isRecording.value || !motionalert) return
  
  // Define neutral positions that don't count as movements
  const neutralPositions = [
    'neutral',
    'center_0',
    'mid_center_0',
    'high_center_0', 
    'down_center_0'
  ]
  
  const normalized = motionalert.toLowerCase()
  const isNeutralPosition = neutralPositions.some(neutral => 
    normalized.includes(neutral)
  )
  
  // Only count actual movements
  if (!isNeutralPosition) {
    if (motionalert.includes('BAD MOVEMENT')) {
      badMovementCount.value++
    } else {
      goodMovementCount.value++
    }
  }
}

const startRecording = async () => {
  try {
    console.log('🎬 Starting recording session...')
    
    // Generate unique session ID
    const sessionId = `motion-${Date.now()}`
    
    // Simulate positive response
    currentSessionId.value = sessionId
    isRecording.value = true
    recordingComplete.value = false
    recordingStartTime.value = Date.now()
    recordingDuration.value = 0
    recordingCount.value = 0
    goodMovementCount.value = 0
    badMovementCount.value = 0
    downloadUrl.value = null
    
    // Reset recorded data
    recordedData.value = []
    
    // Start duration timer
    durationTimer = setInterval(() => {
      if (recordingStartTime.value) {
        recordingDuration.value = Math.floor((Date.now() - recordingStartTime.value) / 1000)
      }
    }, 1000)
    
    console.log('✅ Recording started (simulation):', currentSessionId.value)
  } catch (error) {
    console.error('❌ Recording start error:', error)
    alert('Error starting recording: ' + error.message)
  }
}

const stopRecording = async () => {
  if (!currentSessionId.value) return
  
  try {
    console.log('🛑 Stopping recording session...')
    
    // Generate CSV with collected data
    const csvData = generateCSV()
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    downloadUrl.value = url
    isRecording.value = false
    recordingComplete.value = true
    
    // Stop timer
    if (durationTimer) {
      clearInterval(durationTimer)
      durationTimer = null
    }
    
    console.log('✅ Recording stopped (simulation):', currentSessionId.value)
    console.log('📊 Total data points recorded:', recordingCount.value)
    console.log('📈 Good movements:', goodMovementCount.value)
    console.log('📉 Bad movements:', badMovementCount.value)
    console.log('🗄️ Nordic data points:', recordedData.value.length)
  } catch (error) {
    console.error('❌ Recording stop error:', error)
    alert('Error stopping recording: ' + error.message)
  }
}

const generateCSV = () => {
  // Complete CSV headers including all Nordic data
  const headers = [
    'Timestamp',
    'Session_ID',
    'Duration_From_Start_Seconds',
    'Motion_Alert',
    'Movement_Type',
    'Movement_Status',
    // Nordic sensor data
    'Temperature',
    'Humidity', 
    'Pressure',
    'Gas_Resistance',
    'Color_Red',
    'Color_Green',
    'Color_Blue',
    'Color_Clear',
    'Accelerometer_X',
    'Accelerometer_Y',
    'Accelerometer_Z',
    'Gyroscope_X',
    'Gyroscope_Y',
    'Gyroscope_Z',
    'Magnetometer_X',
    'Magnetometer_Y',
    'Magnetometer_Z',
    'Quaternion_W',
    'Quaternion_X',
    'Quaternion_Y',
    'Quaternion_Z',
    'Euler_Roll',
    'Euler_Pitch',
    'Euler_Yaw',
    'Heading',
    'Tap_Count',
    'Tap_Direction',
    'Orientation',
    'Step_Count',
    'Activity',
    'Motion_Alert_Raw'
  ]
  
  // Session summary row
  const sessionSummary = [
    new Date().toISOString(),
    currentSessionId.value,
    recordingDuration.value,
    'SESSION_SUMMARY',
    'summary',
    'complete',
    // Session statistics for Nordic columns
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', recordedData.value.length
  ]
  
  // Convert recorded data to CSV rows
  const dataRows = recordedData.value.map(dataPoint => {
    const nordicData = dataPoint.nordicData || {}
    const durationFromStart = Math.floor((new Date(dataPoint.timestamp) - recordingStartTime.value) / 1000)
    
    return [
      dataPoint.timestamp,
      currentSessionId.value,
      durationFromStart,
      dataPoint.motionalert || 'No alert',
      dataPoint.movementType || 'unknown',
      dataPoint.status || 'active',
      // Nordic sensor data
      nordicData.temperature || '',
      nordicData.humidity || '',
      nordicData.pressure || '',
      nordicData.gas || '',
      nordicData.accelerometer?.x || '',
      nordicData.accelerometer?.y || '',
      nordicData.accelerometer?.z || '',
      nordicData.activity || '',
      nordicData.motionalert || ''
    ]
  })
  
  // Create CSV content
  const csvContent = [headers, sessionSummary, ...dataRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return csvContent
}

const downloadSession = () => {
  if (!downloadUrl.value) {
    console.warn('⚠️ No download URL available')
    return
  }
  
  try {
    const link = document.createElement('a')
    link.href = downloadUrl.value
    link.download = `nordic-motion-recording-${currentSessionId.value}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('📥 Downloaded:', `nordic-motion-recording-${currentSessionId.value}.csv`)
    
    // Display detailed success message
    alert(`✅ Nordic Motion CSV downloaded successfully!\n\nSession: ${currentSessionId.value}\nDuration: ${formatDuration(recordingDuration.value)}\nMotion Data Points: ${recordingCount.value}\nNordic Sensor Data Points: ${recordedData.value.length}\nGood Movements: ${goodMovementCount.value}\nBad Movements: ${badMovementCount.value}`)
  } catch (error) {
    console.error('❌ Download error:', error)
    alert('Error downloading file: ' + error.message)
  }
}

const recordDataPoint = () => {
  if (!isRecording.value || !currentSessionId.value) return
  
  try {
    const timestamp = new Date().toISOString()
    const currentAlert = nordicData.value?.motionalert
    
    // Create complete data point
    const dataPoint = {
      timestamp: timestamp,
      sessionId: currentSessionId.value,
      motionalert: currentAlert,
      movementType: currentAlert?.includes('BAD MOVEMENT') ? 'Bad' : 'Good',
      status: currentAlert === 'No alert' ? 'inactive' : 'active',
      nordicData: {
        // Capture all Nordic sensor data
        temperature: nordicData.value?.temperature,
        humidity: nordicData.value?.humidity,
        pressure: nordicData.value?.pressure,
        gas: nordicData.value?.gas,
        color: {
          red: nordicData.value?.color?.red,
          green: nordicData.value?.color?.green,
          blue: nordicData.value?.color?.blue,
          clear: nordicData.value?.color?.clear
        },
        accelerometer: {
          x: nordicData.value?.accelerometer?.x,
          y: nordicData.value?.accelerometer?.y,
          z: nordicData.value?.accelerometer?.z
        },
        gyroscope: {
          x: nordicData.value?.gyroscope?.x,
          y: nordicData.value?.gyroscope?.y,
          z: nordicData.value?.gyroscope?.z
        },
        magnetometer: {
          x: nordicData.value?.magnetometer?.x,
          y: nordicData.value?.magnetometer?.y,
          z: nordicData.value?.magnetometer?.z
        },
        quaternion: {
          w: nordicData.value?.quaternion?.w,
          x: nordicData.value?.quaternion?.x,
          y: nordicData.value?.quaternion?.y,
          z: nordicData.value?.quaternion?.z
        },
        euler: {
          roll: nordicData.value?.euler?.roll,
          pitch: nordicData.value?.euler?.pitch,
          yaw: nordicData.value?.euler?.yaw
        },
        heading: nordicData.value?.heading,
        tap: {
          count: nordicData.value?.tap?.count,
          direction: nordicData.value?.tap?.direction
        },
        orientation: nordicData.value?.orientation,
        stepcount: nordicData.value?.stepcount,
        activity: nordicData.value?.activity,
        motionalert: nordicData.value?.motionalert
      }
    }
    
    // Add data point to collection
    recordedData.value.push(dataPoint)
    
    console.log('📝 Recording Nordic data point:', {
      timestamp: timestamp,
      motionalert: currentAlert,
      dataCount: recordedData.value.length
    })
    
    recordingCount.value++
  } catch (error) {
    console.error('❌ Recording data point error:', error)
  }
}

// Watch Nordic data changes for recording
watch(() => nordicData.value, (newData, oldData) => {
  // Record on every Nordic data change during recording
  if (isRecording.value && newData) {
    recordDataPoint()
  }
}, { deep: true })

// Watch motion alert changes for history
watch(() => nordicData.value?.motionalert, (newAlert, oldAlert) => {
  if (newAlert && newAlert !== oldAlert) {
    console.log('🔄 Motion alert changed:', newAlert)
    
    // Add to history
    motionHistory.value.unshift({
      time: new Date().toLocaleTimeString(),
      alert: newAlert,
      status: newAlert === 'No alert' ? 'inactive' : 'active'
    })
    
    // Keep only last 20 entries
    if (motionHistory.value.length > 20) {
      motionHistory.value = motionHistory.value.slice(0, 20)
    }
    
    // Analyze movement for counters
    analyzeMovement(newAlert)
  }
}, { immediate: true })
</script>

<style scoped>
.motion-page {
  width: 100%;
  padding: 1rem;
  height: calc(100vh - 120px);
}

.page-header {
  text-align: center;
  margin-bottom: 1rem;
  color: white;
}

.page-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.page-header p {
  font-size: 1rem;
  opacity: 0.9;
}

.motion-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 1200px;
  margin: 0 auto;
  height: calc(100% - 80px);
}

.recording-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.recording-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.recording-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 1.1rem;
}

.recording-status {
  padding: 0.4rem 0.8rem;
  border-radius: 16px;
  font-size: 0.8rem;
  font-weight: 600;
}

.recording-status.idle {
  background: #f1f5f9;
  color: #475569;
}

.recording-status.recording {
  background: #fee2e2;
  color: #dc2626;
  animation: pulse 2s infinite;
}

.recording-status.complete {
  background: #dcfce7;
  color: #16a34a;
}

.recording-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.btn-recording {
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 120px;
}

.btn-start {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-stop {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-download {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.btn-recording:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-recording:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.recording-info {
  display: grid;
  gap: 0.8rem;
}

.recording-stats {
  display: flex;
  gap: 0.8rem;
}

.stat-item {
  background: #f8fafc;
  padding: 0.6rem;
  border-radius: 6px;
  text-align: center;
  flex: 1;
}

.stat-item strong {
  display: block;
  font-size: 1.1rem;
  color: #1e293b;
  margin-bottom: 0.2rem;
}

.stat-item span {
  font-size: 0.7rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
}

.movement-counters {
  display: flex;
  gap: 0.8rem;
}

.counter-item {
  padding: 0.6rem;
  border-radius: 6px;
  text-align: center;
  flex: 1;
}

.counter-item.good {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  border: 1px solid #10b981;
}

.counter-item.bad {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  border: 1px solid #ef4444;
}

.counter-item strong {
  display: block;
  font-size: 1rem;
  margin-bottom: 0.2rem;
}

.counter-item.good strong {
  color: #059669;
}

.counter-item.bad strong {
  color: #dc2626;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .motion-page {
    padding: 0.5rem;
  }
  
  .recording-controls {
    flex-direction: column;
  }
  
  .btn-recording {
    min-width: auto;
  }
  
  .recording-stats,
  .movement-counters {
    flex-direction: column;
  }
}
</style>