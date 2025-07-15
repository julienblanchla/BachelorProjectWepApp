<template>
  <div class="current-exercise-page">
    <div class="exercise-session-container">
      <div class="exercise-header">
        <div class="exercise-info">
          <div class="exercise-icon" ref="exerciseIcon">
            <img 
              v-if="exerciseConfig.icon" 
              :src="exerciseConfig.icon" 
              :alt="exerciseConfig.name"
              @error="onIconError"
              class="exercise-icon-img"
            >
            <span v-else class="exercise-icon-fallback">{{ exerciseConfig.fallback }}</span>
          </div>
          <div class="exercise-details">
            <h1>{{ exerciseConfig.name }}</h1>
            <div class="exercise-patient">
              Patient: {{ patient ? `${patient.firstName} ${patient.lastName}` : patientId }}
            </div>
          </div>
        </div>
        <div class="exercise-controls">
          <button 
            v-if="!isActive" 
            class="btn-exercise-action btn-start-session" 
            @click="startExercise"
          >
            ▶️ Start Movement Test
          </button>
          <button 
            v-if="isActive" 
            class="btn-exercise-action btn-stop-session" 
            @click="stopExercise"
          >
            ⏹️ Stop Test
          </button>
          <button 
            v-if="downloadUrl && !isActive" 
            class="btn-exercise-action btn-download-session" 
            @click="downloadSession"
          >
            💾 Download CSV
          </button>
          <router-link 
            :to="backLink" 
            class="btn-exercise-action btn-back-exercises"
          >
            ← Back to Tests
          </router-link>
          <button 
            class="btn-exercise-action" 
            @click="openAnnotationModal"
          >
            📝 Add Note
          </button>
        </div>
      </div>

      <div class="motion-display" :class="{ 
        'exercise-active': isActive, 
        'bad-movement': isActive && isBadMovement 
      }">
        <div class="motion-visual-large" :class="{ 
          'no-image': !currentMotionImage, 
          'exercise-active': isActive,
          'bad-movement': isActive && isBadMovement 
        }">
          <img 
            v-if="currentMotionImage" 
            :src="currentMotionImage" 
            alt="Motion" 
            class="motion-image"
            @error="onMotionImageError"
          >
          <span v-else class="motion-fallback">{{ motionFallback }}</span>
        </div>
        <div class="motion-description-large" :class="{ 
          'exercise-active': isActive,
          'bad-movement': isActive && isBadMovement 
        }">
          {{ motionDescription }}
        </div>
      </div>

      <div class="exercise-status">
        <div v-if="isActive" class="status-info">
          <div class="status-item">
            <strong>{{ formatTime(remainingTime) }}</strong>
            <span>Remaining</span>
          </div>
          <div class="status-item">
            <strong>{{ movementCount }}</strong>
            <span>Movements</span>
          </div>
          <div class="status-item">
            <strong>{{ correctCount }}</strong>
            <span>Correct</span>
          </div>
          <div class="status-item">
            <strong>{{ incorrectCount }}</strong>
            <span>Incorrect</span>
          </div>
        </div>
        <div class="status-message" :class="{ 
          'waiting': !isActive, 
          'active': isActive && !isBadMovement,
          'bad-movement': isActive && isBadMovement
        }">
          {{ statusMessage }}
        </div>
      </div>
    </div>

    <!-- Annotation Modal -->
    <teleport to="body">
      <div v-if="showAnnotationModal" class="modal-backdrop" @click="closeAnnotationModal">
        <div class="annotation-modal" @click.stop>
          <h3>Add Session Note</h3>
          <textarea 
            v-model="annotationText" 
            placeholder="Enter your observation..." 
            rows="4"
            @keyup.enter.ctrl="saveAnnotation"
            ref="annotationTextarea"
          ></textarea>
          <select v-model="annotationType">
            <option value="observation">Observation</option>
            <option value="concern">Concern</option>
            <option value="improvement">Improvement</option>
            <option value="goal">Goal</option>
          </select>
          <div class="modal-actions">
            <button @click="saveAnnotation" class="btn-save">Save</button>
            <button @click="closeAnnotationModal" class="btn-cancel">Cancel</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Success Toast -->
    <teleport to="body">
      <div v-if="showSuccessToast" class="success-toast">
        {{ successMessage }}
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, inject, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Injection of data from App.vue
const nordicData = inject('nordicData')

// Reactive state
const exerciseType = computed(() => route.params.exerciseType)
const patientId = computed(() => route.params.patientId)
const patient = ref(null)
const customExercise = ref(null)
const isActive = ref(false)
const startTime = ref(null)
const movementCount = ref(0)
const correctCount = ref(0)
const incorrectCount = ref(0)
const remainingTime = ref(120)
const currentSessionId = ref(null)
const isRecording = ref(false)
const downloadUrl = ref(null)
const annotations = ref([])

// Track bad movement state
const isBadMovement = ref(false)
const lastProcessedAlert = ref('')

// Nordic data recording structure
const recordedData = ref([])
const recordingStartTime = ref(null)
const recordingDuration = ref(0)
const recordingCount = ref(0)

// Motion display
const currentMotionImage = ref(null)
const motionFallback = ref('⚪')
const motionDescription = ref('Ready to start exercise...')

// Annotation modal
const showAnnotationModal = ref(false)
const annotationText = ref('')
const annotationType = ref('observation')
const annotationTextarea = ref(null)

// Success toast
const showSuccessToast = ref(false)
const successMessage = ref('')

// Timers
let timer = null
let updateTimer = null
let exerciseTimer = null
let recordingTimer = null

// Default exercise configurations
const defaultExerciseConfigs = {
  'neck-extension': {
    name: 'Active Cervical Flexion and Extension',
    icon: null,
    fallback: '🔵',
    duration: 120
  },
  'head-rotation': {
    name: 'Active Cervical Rotation',
    icon: null,
    fallback: '🟢',
    duration: 120
  },
  'unilateral-arm-flexion': {
    name: 'Unilateral Arm Flexion (180°)',
    icon: null,
    fallback: '🟡',
    duration: 120 
  }
}

// Exercise configuration
const exerciseConfig = computed(() => {
  if (customExercise.value) {
    return {
      name: customExercise.value.name,
      icon: customExercise.value.image,
      fallback: '🎯',
      duration: (customExercise.value.duration || 2) * 60
    }
  }
  
  const config = defaultExerciseConfigs[exerciseType.value] || {
    name: 'Unknown Exercise',
    icon: null,
    fallback: '❓',
    duration: 120
  }
  
  // Load exercise icons
  if (exerciseType.value === 'neck-extension') {
    try {
      config.icon = new URL('../assets/NeckExtension.png', import.meta.url).href
    } catch (e) {
      console.warn('NeckExtension image not found')
    }
  } else if (exerciseType.value === 'head-rotation') {
    try {
      config.icon = new URL('../assets/HeadRotation.PNG', import.meta.url).href
    } catch (e) {
      console.warn('HeadRotation image not found')
    }
  } else if (exerciseType.value === 'unilateral-arm-flexion') {
    try {
      config.icon = new URL('../assets/UnilateralArmFlexion.png', import.meta.url).href
    } catch (e) {
      console.warn('UnilateralArmFlexion image not found')
    }
  }
  
  return config
})

const backLink = computed(() => {
  return patient.value ? `/exercises/${patientId.value}` : '/patients'
})

const statusMessage = computed(() => {
  if (isActive.value) {
    return `Exercise in progress - ${formatTime(remainingTime.value)} remaining - Recording: ${recordingCount.value} data points`
  } else if (downloadUrl.value) {
    return 'Exercise completed and recorded - Download available'
  } else {
    const duration = exerciseConfig.value.duration / 60
    return `Click "Start Exercise" to begin ${duration}-minute motion tracking and recording`
  }
})

// Methods
const loadPatientInfo = () => {
  try {
    const stored = localStorage.getItem('nordic-thingy-patients')
    const patients = stored ? JSON.parse(stored) : []
    patient.value = patients.find(p => p.id === patientId.value)
    
    if (!patient.value) {
      console.warn('Patient not found:', patientId.value)
    }
  } catch (error) {
    console.error('Error loading patient data:', error)
  }
}

const loadCustomExercise = () => {
  try {
    if (exerciseType.value && exerciseType.value.startsWith('custom-')) {
      const stored = localStorage.getItem(`custom-exercises-${patientId.value}`)
      const customExercises = stored ? JSON.parse(stored) : []
      
      customExercise.value = customExercises.find(ex => ex.id === exerciseType.value)
      
      if (customExercise.value) {
        console.log('✅ Custom exercise loaded:', customExercise.value.name)
        remainingTime.value = (customExercise.value.duration || 2) * 60
      } else {
        console.warn('❌ Custom exercise not found:', exerciseType.value)
      }
    } else {
      customExercise.value = null
      console.log('✅ Default exercise type:', exerciseType.value)
    }
  } catch (error) {
    console.error('❌ Error loading custom exercise:', error)
  }
}

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const onIconError = (event) => {
  event.target.style.display = 'none'
}

const onMotionImageError = (event) => {
  currentMotionImage.value = null
  motionFallback.value = '❓'
}

const startExercise = async () => {
  console.log('🚀 Starting exercise session...')
  
  isActive.value = true
  startTime.value = Date.now()
  movementCount.value = 0
  correctCount.value = 0
  incorrectCount.value = 0
  remainingTime.value = exerciseConfig.value.duration
  isBadMovement.value = false
  lastProcessedAlert.value = '' // Reset last processed alert

  await startRecording()

  // Start timers
  timer = setInterval(() => fetchMotionData(), 1000)
  updateTimer = setInterval(() => updateDisplay(), 1000)
  exerciseTimer = setTimeout(() => stopExercise(), exerciseConfig.value.duration * 1000)

  motionDescription.value = 'Exercise started! Perform your movements...'
  
  const durationMinutes = exerciseConfig.value.duration / 60
  console.log(`✅ Exercise started for ${durationMinutes} minutes with recording`)
}

const stopExercise = async () => {
  console.log('🛑 Stopping exercise session...')
  
  isActive.value = false
  isBadMovement.value = false
  
  // Clear all timers
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  if (updateTimer) {
    clearInterval(updateTimer)
    updateTimer = null
  }
  if (exerciseTimer) {
    clearTimeout(exerciseTimer)
    exerciseTimer = null
  }

  await stopRecording()

  motionDescription.value = 'Exercise session ended - CSV file ready for download'

  const duration = Math.floor((Date.now() - startTime.value) / 1000)
  const accuracy = movementCount.value > 0 ? Math.round((correctCount.value / movementCount.value) * 100) : 0
  
  const summary = {
    duration: formatTime(duration),
    totalMovements: movementCount.value,
    correctMovements: correctCount.value,
    incorrectMovements: incorrectCount.value,
    accuracy: accuracy,
    dataPoints: recordedData.value.length
  }

  console.log('✅ Exercise completed:', summary)
  
  if (currentSessionId.value) {
    console.log(`📄 Session recorded as: ${currentSessionId.value}.csv`)
    console.log(`📊 Total Nordic data points: ${recordedData.value.length}`)
  }
}

const startRecording = async () => {
  try {
    console.log('🎬 Starting movement control test recording session...')
    
    const exerciseNames = {
      'neck-extension': 'ActiveCervicalFlexionExtension',
      'head-rotation': 'ActiveCervicalRotation',
      'unilateral-arm-flexion': 'UnilateralArmFlexion180'
    }
    
    const patientName = patient.value ? 
      `${patient.value.firstName}_${patient.value.lastName}` : 
      patientId.value
    
    const today = new Date().toISOString().split('T')[0]
    
    const exerciseName = customExercise.value ? 
      customExercise.value.name.replace(/\s+/g, '_') : 
      (exerciseNames[exerciseType.value] || exerciseType.value)
    
    const customSessionId = `${patientName}_${today}_${exerciseName}`

    currentSessionId.value = customSessionId
    isRecording.value = true
    recordingStartTime.value = Date.now()
    recordingDuration.value = 0
    recordingCount.value = 0
    downloadUrl.value = null
    
    recordedData.value = []

    recordingTimer = setInterval(() => {
      if (isRecording.value && nordicData.value) {
        recordDataPoint()
        
        if (recordingStartTime.value) {
          recordingDuration.value = Math.floor((Date.now() - recordingStartTime.value) / 1000)
        }
      }
    }, 1000)

    console.log('✅ Movement control test recording started:', currentSessionId.value)
  } catch (error) {
    console.error('❌ Recording start error:', error)
    console.warn('Warning: Could not start recording session, but test will continue.')
  }
}

const stopRecording = async () => {
  if (!isRecording.value || !currentSessionId.value) return

  try {
    console.log('🛑 Stopping exercise recording session...')
    
    if (recordingTimer) {
      clearInterval(recordingTimer)
      recordingTimer = null
    }
    
    const csvData = generateCSV()
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    
    downloadUrl.value = url
    isRecording.value = false
    
    console.log('✅ Exercise recording stopped:', currentSessionId.value)
    console.log('📊 Total data points recorded:', recordingCount.value)
    console.log('📈 Good movements:', correctCount.value)
    console.log('📉 Bad movements:', incorrectCount.value)
    console.log('🗄️ Nordic data points:', recordedData.value.length)
  } catch (error) {
    console.error('❌ Recording stop error:', error)
  }
}

const generateCSV = () => {
  const headers = [
    'Timestamp', 'Session_ID', 'Patient_ID', 'Exercise_Type', 'Duration_From_Start_Seconds',
    'Motion_Alert', 'Movement_Type', 'Movement_Status', 'Exercise_Active', 'Remaining_Time',
    'Total_Movements', 'Correct_Movements', 'Incorrect_Movements', 'Temperature', 'Humidity', 
    'Pressure', 'Gas_Resistance', 'Color_Red', 'Color_Green', 'Color_Blue', 'Color_Clear',
    'Accelerometer_X', 'Accelerometer_Y', 'Accelerometer_Z', 'Gyroscope_X', 'Gyroscope_Y', 'Gyroscope_Z',
    'Magnetometer_X', 'Magnetometer_Y', 'Magnetometer_Z', 'Quaternion_W', 'Quaternion_X', 
    'Quaternion_Y', 'Quaternion_Z', 'Euler_Roll', 'Euler_Pitch', 'Euler_Yaw', 'Heading',
    'Tap_Count', 'Tap_Direction', 'Orientation', 'Step_Count', 'Activity', 'Motion_Alert_Raw'
  ]
  
  const sessionSummary = [
    new Date().toISOString(), currentSessionId.value, patientId.value,
    customExercise.value ? customExercise.value.name : exerciseType.value,
    recordingDuration.value, 'SESSION_SUMMARY', 'summary', 'complete', 'false', 0,
    movementCount.value, correctCount.value, incorrectCount.value,
    ...Array(30).fill(''), recordedData.value.length
  ]
  
  const dataRows = recordedData.value.map(dataPoint => {
    const nordicDataPoint = dataPoint.nordicData || {}
    const durationFromStart = Math.floor((new Date(dataPoint.timestamp) - recordingStartTime.value) / 1000)
    
    return [
      dataPoint.timestamp, currentSessionId.value, patientId.value,
      customExercise.value ? customExercise.value.name : exerciseType.value,
      durationFromStart, dataPoint.motionalert || 'No alert',
      dataPoint.movementType || 'unknown', dataPoint.status || 'active',
      isActive.value ? 'true' : 'false', remainingTime.value,
      movementCount.value, correctCount.value, incorrectCount.value,
      nordicDataPoint.temperature || '', nordicDataPoint.humidity || '', nordicDataPoint.pressure || '', nordicDataPoint.gas || '',
      nordicDataPoint.color?.red || '', nordicDataPoint.color?.green || '', nordicDataPoint.color?.blue || '', nordicDataPoint.color?.clear || '',
      nordicDataPoint.accelerometer?.x || '', nordicDataPoint.accelerometer?.y || '', nordicDataPoint.accelerometer?.z || '',
      nordicDataPoint.gyroscope?.x || '', nordicDataPoint.gyroscope?.y || '', nordicDataPoint.gyroscope?.z || '',
      nordicDataPoint.magnetometer?.x || '', nordicDataPoint.magnetometer?.y || '', nordicDataPoint.magnetometer?.z || '',
      nordicDataPoint.quaternion?.w || '', nordicDataPoint.quaternion?.x || '', nordicDataPoint.quaternion?.y || '', nordicDataPoint.quaternion?.z || '',
      nordicDataPoint.euler?.roll || '', nordicDataPoint.euler?.pitch || '', nordicDataPoint.euler?.yaw || '',
      nordicDataPoint.heading || '', nordicDataPoint.tap?.count || '', nordicDataPoint.tap?.direction || '',
      nordicDataPoint.orientation || '', nordicDataPoint.stepcount || '', nordicDataPoint.activity || '', nordicDataPoint.motionalert || ''
    ]
  })
  
  const csvContent = [headers, sessionSummary, ...dataRows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  return csvContent
}

const downloadSession = () => {
  if (downloadUrl.value && currentSessionId.value) {
    const link = document.createElement('a')
    link.href = downloadUrl.value
    link.download = `${currentSessionId.value}-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    console.log('📥 Downloaded:', `${currentSessionId.value}.csv`)
    
    alert(`✅ Exercise CSV downloaded successfully!\n\nSession: ${currentSessionId.value}\nDuration: ${formatTime(recordingDuration.value)}\nTotal Movements: ${movementCount.value}\nCorrect Movements: ${correctCount.value}\nIncorrect Movements: ${incorrectCount.value}\nNordic Data Points: ${recordedData.value.length}`)
  } else {
    console.warn('⚠️ No download URL available')
  }
}

const updateDisplay = () => {
  if (!isActive.value || !startTime.value) return

  const elapsed = Math.floor((Date.now() - startTime.value) / 1000)
  remainingTime.value = Math.max(0, exerciseConfig.value.duration - elapsed)
}

const fetchMotionData = async () => {
  if (!isActive.value) return

  try {
    if (nordicData.value?.motionalert) {
      const currentAlert = nordicData.value.motionalert
      
      // Only process if the alert has changed
      if (currentAlert !== lastProcessedAlert.value) {
        updateMotionDisplay(currentAlert)
        analyzeMovement(currentAlert)
        lastProcessedAlert.value = currentAlert
      }
    }
  } catch (error) {
    console.error('Error processing motion data:', error)
  }
}

const recordDataPoint = () => {
  if (!isRecording.value || !currentSessionId.value) return
  
  try {
    const timestamp = new Date().toISOString()
    const currentAlert = nordicData.value?.motionalert
    
    const dataPoint = {
      timestamp: timestamp,
      sessionId: currentSessionId.value,
      motionalert: currentAlert,
      movementType: currentAlert?.includes('BAD MOVEMENT') ? 'Bad' : 'Good',
      status: currentAlert === 'No alert' ? 'inactive' : 'active',
      nordicData: {
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
    
    recordedData.value.push(dataPoint)
    recordingCount.value++
  } catch (error) {
    console.error('❌ Recording data point error:', error)
  }
}

const analyzeMovement = (motionAlert) => {
  if (!motionAlert || !isActive.value) return
  
  const normalized = motionAlert.toLowerCase()
  
  // Define neutral positions that shouldn't be counted
  const neutralPositions = [
    'neutral', 'center_0', 'mid_center_0', 'high_center_0', 'down_center_0', 'no alert'
  ]
  
  const isNeutralPosition = neutralPositions.some(neutral => 
    normalized.includes(neutral)
  )
  
  if (!isNeutralPosition) {
    movementCount.value++
    
    if (motionAlert.includes('- BAD MOVEMENT')) {
      incorrectCount.value++
      isBadMovement.value = true
      console.log('❌ Bad movement detected:', motionAlert)
      
      // Reset bad movement indicator after 2 seconds
      setTimeout(() => {
        isBadMovement.value = false
      }, 2000)
    } else {
      correctCount.value++
      isBadMovement.value = false
      console.log('✅ Good movement detected:', motionAlert)
    }
    
    console.log(`Movement analysis: Total=${movementCount.value}, Correct=${correctCount.value}, Incorrect=${incorrectCount.value}`)
  } else {
    isBadMovement.value = false
    console.log('⚪ Neutral position (not counted):', motionAlert)
  }
}

const updateMotionDisplay = (motionAlert) => {
  motionDescription.value = motionAlert
  
  const imageName = motionAlert.replace(/ - BAD MOVEMENT$/i, '')
  
  try {
    currentMotionImage.value = new URL(`../assets/${imageName}.png`, import.meta.url).href
    motionFallback.value = '⚪'
  } catch (error) {
    currentMotionImage.value = null
    motionFallback.value = '❓'
  }
}

// Annotation methods
const openAnnotationModal = async () => {
  showAnnotationModal.value = true
  await nextTick()
  if (annotationTextarea.value) {
    annotationTextarea.value.focus()
  }
}

const closeAnnotationModal = () => {
  showAnnotationModal.value = false
  annotationText.value = ''
  annotationType.value = 'observation'
}

const saveAnnotation = () => {
  const text = annotationText.value.trim()
  
  if (!text) {
    alert('Please enter an annotation text.')
    return
  }
  
  const annotation = {
    id: Date.now(),
    sessionId: currentSessionId.value || 'no-session',
    patientId: patientId.value,
    exerciseType: customExercise.value ? customExercise.value.name : exerciseType.value,
    text: text,
    type: annotationType.value,
    timestamp: new Date().toISOString(),
    author: 'Medical Staff'
  }
  
  annotations.value.push(annotation)
  saveAnnotationsToStorage()
  
  console.log('📝 Annotation saved:', annotation)
  
  closeAnnotationModal()
  
  showSuccessMessage(`Note saved: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`)
}

const saveAnnotationsToStorage = () => {
  try {
    const existingAnnotations = JSON.parse(localStorage.getItem('exercise-annotations') || '[]')
    const allAnnotations = [...existingAnnotations, ...annotations.value.filter(a => 
      !existingAnnotations.find(existing => existing.id === a.id)
    )]
    localStorage.setItem('exercise-annotations', JSON.stringify(allAnnotations))
  } catch (error) {
    console.error('Error saving annotations:', error)
  }
}

const showSuccessMessage = (message) => {
  successMessage.value = message
  showSuccessToast.value = true
  
  setTimeout(() => {
    showSuccessToast.value = false
  }, 3000)
}

// Lifecycle hooks
onMounted(() => {
  console.log('🎯 CurrentExercisePage mounted for exercise:', exerciseType.value)
  loadPatientInfo()
  loadCustomExercise()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
  if (updateTimer) clearInterval(updateTimer)
  if (exerciseTimer) clearTimeout(exerciseTimer)
  if (recordingTimer) clearInterval(recordingTimer)
})
</script>

<style scoped>
.current-exercise-page {
  width: 100%;
  padding: 1rem;
  height: calc(100vh - 120px);
}

.exercise-session-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  max-width: 900px;
  margin: 0 auto;
  gap: 0.6rem;
}

.exercise-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  flex-shrink: 0;
}

.exercise-info {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.exercise-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  overflow: hidden;
  position: relative;
}

.exercise-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.exercise-icon-fallback {
  font-size: 2rem;
}

.exercise-details h1 {
  margin: 0 0 0.2rem 0;
  font-size: 1.1rem;
  color: #333;
}

.exercise-patient {
  font-size: 0.7rem;
  color: #666;
  background: rgba(0, 123, 255, 0.1);
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
}

.exercise-controls {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-wrap: wrap;
}

/* Motion Display Section - GARDE LE MÊME FOND BLANC */
.motion-display {
  background: rgba(255, 255, 255, 0.95); /* Toujours blanc */
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 300px;
  transition: all 0.3s ease;
}

.motion-display.exercise-active {
  border-left: 4px solid #10b981; /* Juste une bordure verte */
  background: rgba(255, 255, 255, 0.95); /* GARDE LE FOND BLANC */
}

.motion-display.bad-movement {
  border-left: 4px solid #ef4444; /* Bordure rouge pour mauvais mouvement */
  background: rgba(255, 255, 255, 0.95); /* GARDE LE FOND BLANC */
  animation: badMovementPulse 1s ease-in-out;
}

@keyframes badMovementPulse {
  0%, 100% { 
    box-shadow: 0 8px 24px rgba(0,0,0,0.08); 
  }
  50% { 
    box-shadow: 0 8px 24px rgba(239, 68, 68, 0.3); 
  }
}

/* Motion Visual - GARDE LE MÊME FOND BLANC */
.motion-visual-large {
  width: 300px;
  height: 200px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0); /* Fond gris clair neutre */
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.motion-visual-large.exercise-active {
  transform: scale(1.02);
  border-color: #10b981; /* Bordure verte active */
  box-shadow: 0 12px 40px rgba(16, 185, 129, 0.2);
  background: linear-gradient(135deg, #f8fafc, #e2e8f0); /* GARDE LE MÊME FOND */
}

.motion-visual-large.bad-movement {
  border-color: #ef4444; /* Bordure rouge pour erreur */
  box-shadow: 0 12px 40px rgba(239, 68, 68, 0.2);
  animation: shake 0.5s ease-in-out;
  background: linear-gradient(135deg, #f8fafc, #e2e8f0); /* GARDE LE MÊME FOND */
}

@keyframes shake {
  0%, 100% { transform: scale(1.02) translateX(0); }
  25% { transform: scale(1.02) translateX(-5px); }
  75% { transform: scale(1.02) translateX(5px); }
}

.motion-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.motion-fallback {
  font-size: 4rem;
  color: #64748b;
}

.motion-visual-large.no-image .motion-fallback {
  color: #94a3b8;
}

/* Motion Description - GARDE LE MÊME FOND BLANC */
.motion-description-large {
  text-align: center;
  font-size: 1rem;
  color: #475569;
  font-weight: 500;
  max-width: 600px;
  line-height: 1.5;
  padding: 1rem;
  background: rgba(248, 250, 252, 0.8); /* Fond blanc cassé neutre */
  border-radius: 12px;
  border: 1px solid rgba(203, 213, 225, 0.3);
  transition: all 0.3s ease;
}

.motion-description-large.exercise-active {
  background: rgba(248, 250, 252, 0.8); /* GARDE LE MÊME FOND BLANC */
  color: #047857; /* Juste le texte en vert */
  border-color: rgba(16, 185, 129, 0.2); /* Bordure verte subtile */
}

.motion-description-large.bad-movement {
  background: rgba(248, 250, 252, 0.8); /* GARDE LE MÊME FOND BLANC */
  color: #dc2626; /* Juste le texte en rouge */
  border-color: rgba(239, 68, 68, 0.2); /* Bordure rouge subtile */
  animation: textPulse 0.5s ease-in-out;
}

@keyframes textPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

/* Exercise Status Section */
.exercise-status {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  flex-shrink: 0;
}

.status-info {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.status-item {
  text-align: center;
  padding: 0.8rem;
  background: rgba(248, 250, 252, 0.8);
  border-radius: 8px;
  border: 1px solid rgba(203, 213, 225, 0.3);
  transition: all 0.3s ease;
}

.status-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.status-item strong {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.2rem;
}

.status-item span {
  font-size: 0.75rem;
  color: #64748b;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.status-message {
  text-align: center;
  font-size: 0.9rem;
  padding: 0.8rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status-message.waiting {
  background: rgba(148, 163, 184, 0.1);
  color: #475569;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

.status-message.active {
  background: rgba(248, 250, 252, 0.8); /* GARDE FOND BLANC */
  color: #047857; /* Texte vert pour indiquer actif */
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.status-message.bad-movement {
  background: rgba(248, 250, 252, 0.8); /* GARDE FOND BLANC */
  color: #dc2626; /* Texte rouge pour erreur */
  border: 1px solid rgba(239, 68, 68, 0.2);
  animation: statusPulse 1s ease-in-out infinite;
}

@keyframes statusPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

/* Button Styles */
.btn-exercise-action {
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  text-transform: none;
  letter-spacing: 0.025em;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  border: 2px solid transparent;
  min-width: 120px;
}

.btn-start-session {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-start-session:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.btn-stop-session {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-stop-session:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.btn-download-session {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
}

.btn-download-session:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4);
}

.btn-back-exercises {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
}

.btn-back-exercises:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  color: white;
}

.btn-exercise-action:not(.btn-start-session):not(.btn-stop-session):not(.btn-download-session):not(.btn-back-exercises) {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
  color: white;
}

.btn-exercise-action:not(.btn-start-session):not(.btn-stop-session):not(.btn-download-session):not(.btn-back-exercises):hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
}

.btn-save {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-save:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
}

.btn-cancel {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  flex: 1;
  padding: 0.8rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-cancel:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.annotation-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.annotation-modal h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  color: #333;
  font-weight: 700;
}

.annotation-modal textarea {
  width: 100%;
  height: 80px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.8rem;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  resize: vertical;
  font-family: inherit;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.annotation-modal textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.annotation-modal select {
  width: 100%;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 0.8rem;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.annotation-modal select:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.modal-actions {
  display: flex;
  gap: 0.8rem;
}

/* Success Toast */
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  z-index: 10000;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  font-size: 0.9rem;
  font-weight: 600;
  max-width: 300px;
  word-wrap: break-word;
  animation: slideIn 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .exercise-header {
    flex-direction: column;
    text-align: center;
  }

  .exercise-controls {
    width: 100%;
    justify-content: center;
    gap: 0.3rem;
    flex-wrap: wrap;
  }

  .btn-exercise-action {
    padding: 0.7rem 1rem;
    font-size: 0.8rem;
    min-width: 100px;
  }

  .motion-visual-large {
    width: 250px;
    height: 150px;
  }

  .motion-fallback {
    font-size: 3rem;
  }

  .status-info {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.8rem;
  }

  .motion-description-large {
    font-size: 0.9rem;
    padding: 0.8rem;
  }
}

@media (max-width: 480px) {
  .current-exercise-page {
    padding: 0.5rem;
  }

  .exercise-controls {
    flex-direction: column;
    gap: 0.5rem;
  }

  .btn-exercise-action {
    padding: 0.8rem 1rem;
    font-size: 0.75rem;
    width: 100%;
    min-width: auto;
  }

  .motion-visual-large {
    width: 200px;
    height: 120px;
  }

  .motion-fallback {
    font-size: 2.5rem;
  }

  .status-info {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
  }

  .motion-description-large {
    font-size: 0.8rem;
    padding: 0.6rem;
  }
}
</style>