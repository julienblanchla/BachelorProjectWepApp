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
            ▶️ Start Exercise
          </button>
          <button 
            v-if="isActive" 
            class="btn-exercise-action btn-stop-session" 
            @click="stopExercise"
          >
            ⏹️ Stop Exercise
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
            ← Back to Exercises
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
    name: 'Neck Extension',
    icon: null,
    fallback: '🔵',
    duration: 120
  },
  'head-rotation': {
    name: 'Head Rotation',
    icon: null,
    fallback: '🟢',
    duration: 120
  },
  'unilateral-arm-flexion': {
    name: 'Unilateral Arm Flexion',
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
    // NEW: Add icon loading for Unilateral Arm Flexion
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
  isBadMovement.value = false // Reset bad movement state

  await startRecording()

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
  isBadMovement.value = false // Reset bad movement state
  
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
    console.log('🎬 Starting exercise recording session...')
    
    // Exercise name mapping
    const exerciseNames = {
      'neck-extension': 'NeckExtension',
      'head-rotation': 'HeadRotation',
      'unilateral-arm-flexion': 'UnilateralArmFlexion' // NEW: Add mapping
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

    console.log('✅ Exercise recording started:', currentSessionId.value)
  } catch (error) {
    console.error('❌ Recording start error:', error)
    console.warn('Warning: Could not start recording session, but exercise will continue.')
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
    'Timestamp',
    'Session_ID',
    'Patient_ID',
    'Exercise_Type',
    'Duration_From_Start_Seconds',
    'Motion_Alert',
    'Movement_Type',
    'Movement_Status',
    'Exercise_Active',
    'Remaining_Time',
    'Total_Movements',
    'Correct_Movements',
    'Incorrect_Movements',
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
  
  const sessionSummary = [
    new Date().toISOString(),
    currentSessionId.value,
    patientId.value,
    customExercise.value ? customExercise.value.name : exerciseType.value,
    recordingDuration.value,
    'SESSION_SUMMARY',
    'summary',
    'complete',
    'false',
    0,
    movementCount.value,
    correctCount.value,
    incorrectCount.value,
    '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', recordedData.value.length
  ]
  
  const dataRows = recordedData.value.map(dataPoint => {
    const nordicDataPoint = dataPoint.nordicData || {}
    const durationFromStart = Math.floor((new Date(dataPoint.timestamp) - recordingStartTime.value) / 1000)
    
    return [
      dataPoint.timestamp,
      currentSessionId.value,
      patientId.value,
      customExercise.value ? customExercise.value.name : exerciseType.value,
      durationFromStart,
      dataPoint.motionalert || 'No alert',
      dataPoint.movementType || 'unknown',
      dataPoint.status || 'active',
      isActive.value ? 'true' : 'false',
      remainingTime.value,
      movementCount.value,
      correctCount.value,
      incorrectCount.value,
      nordicDataPoint.temperature || '',
      nordicDataPoint.humidity || '',
      nordicDataPoint.pressure || '',
      nordicDataPoint.gas || '',
      nordicDataPoint.color?.red || '',
      nordicDataPoint.color?.green || '',
      nordicDataPoint.color?.blue || '',
      nordicDataPoint.color?.clear || '',
      nordicDataPoint.accelerometer?.x || '',
      nordicDataPoint.accelerometer?.y || '',
      nordicDataPoint.accelerometer?.z || '',
      nordicDataPoint.gyroscope?.x || '',
      nordicDataPoint.gyroscope?.y || '',
      nordicDataPoint.gyroscope?.z || '',
      nordicDataPoint.magnetometer?.x || '',
      nordicDataPoint.magnetometer?.y || '',
      nordicDataPoint.magnetometer?.z || '',
      nordicDataPoint.quaternion?.w || '',
      nordicDataPoint.quaternion?.x || '',
      nordicDataPoint.quaternion?.y || '',
      nordicDataPoint.quaternion?.z || '',
      nordicDataPoint.euler?.roll || '',
      nordicDataPoint.euler?.pitch || '',
      nordicDataPoint.euler?.yaw || '',
      nordicDataPoint.heading || '',
      nordicDataPoint.tap?.count || '',
      nordicDataPoint.tap?.direction || '',
      nordicDataPoint.orientation || '',
      nordicDataPoint.stepcount || '',
      nordicDataPoint.activity || '',
      nordicDataPoint.motionalert || ''
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
      updateMotionDisplay(nordicData.value.motionalert)
      analyzeMovement(nordicData.value.motionalert)
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
    
    console.log('📝 Recording exercise data point:', {
      timestamp: timestamp,
      motionalert: currentAlert,
      dataCount: recordedData.value.length
    })
    
    recordingCount.value++
  } catch (error) {
    console.error('❌ Recording data point error:', error)
  }
}

const analyzeMovement = (motionAlert) => {
  if (!motionAlert) return
  
  const normalized = motionAlert.toLowerCase()
  
  const neutralPositions = [
    'neutral',
    'center_0',
    'mid_center_0',
    'high_center_0', 
    'down_center_0'
  ]
  
  const isNeutralPosition = neutralPositions.some(neutral => 
    normalized.includes(neutral)
  )
  
  if (!isNeutralPosition) {
    movementCount.value++
    
    if (motionAlert.includes('- BAD MOVEMENT')) {
      incorrectCount.value++
      console.log('❌ Bad movement detected:', motionAlert)
    } else {
      correctCount.value++
      console.log('✅ Good movement detected:', motionAlert)
    }
    
    console.log(`Movement analysis: Total=${movementCount.value}, Correct=${correctCount.value}, Incorrect=${incorrectCount.value}`)
  } else {
    console.log('⚪ Neutral position (not counted):', motionAlert)
  }
}

const updateMotionDisplay = (motionAlert) => {
  motionDescription.value = motionAlert
  
  // Update bad movement state
  isBadMovement.value = motionAlert.includes('- BAD MOVEMENT')
  
  const imageName = motionAlert.replace(/ - BAD MOVEMENT$/i, '')
  
  try {
    currentMotionImage.value = new URL(`../assets/${imageName}.png`, import.meta.url).href
    motionFallback.value = '⚪'
  } catch (error) {
    currentMotionImage.value = null
    motionFallback.value = '❓'
  }
}

// Watch for motion alert changes
watch(() => nordicData.value?.motionalert, (newAlert, oldAlert) => {
  // Process only if alert actually changed
  if (newAlert && newAlert !== oldAlert) {
    console.log('🔄 Motion alert changed during exercise:', newAlert)
  }
}, { immediate: false })

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

.btn-exercise-action {
  padding: 0.5rem 0.8rem;
  border: none;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  box-shadow: 0 3px 12px rgba(0,0,0,0.08);
  text-decoration: none;
  color: white;
}

.btn-start-session {
  background: linear-gradient(135deg, #28a745, #20c997);
}

.btn-stop-session {
  background: linear-gradient(135deg, #dc3545, #c82333);
}

.btn-download-session {
  background: linear-gradient(135deg, #17a2b8, #138496);
}

.btn-back-exercises {
  background: linear-gradient(135deg, #6c757d, #495057);
}

.btn-exercise-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.motion-display {
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 0;
  transition: all 0.4s ease;
}

/* Container enlargement during exercise - good movement */
.motion-display.exercise-active {
  padding: 1.2rem;
  box-shadow: 0 10px 40px rgba(0,0,0,0.15);
  border: 2px solid rgba(40, 167, 69, 0.3);
  background: rgba(255, 255, 255, 0.98);
}

/* Container enlargement during exercise - bad movement */
.motion-display.exercise-active.bad-movement {
  border: 2px solid rgba(220, 53, 69, 0.4);
  background: rgba(255, 248, 249, 0.98);
  box-shadow: 0 10px 40px rgba(220, 53, 69, 0.15);
}

.motion-visual-large {
  width: 150px;
  height: 150px;
  border-radius: 10px;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  overflow: hidden;
  position: relative;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  border: 3px solid rgba(255, 255, 255, 0.9);
  transition: all 0.4s ease;
}

/* Image enlargement during exercise - good movement */
.motion-visual-large.exercise-active {
  width: 220px;
  height: 220px;
  border-radius: 15px;
  margin: 0.8rem 0;
  box-shadow: 0 12px 30px rgba(0,0,0,0.18);
  border: 4px solid rgba(40, 167, 69, 0.4);
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  transform: scale(1.05);
}

/* Image enlargement during exercise - bad movement */
.motion-visual-large.exercise-active.bad-movement {
  border: 4px solid rgba(220, 53, 69, 0.5);
  background: linear-gradient(135deg, #fff5f5, #fed7d7);
  box-shadow: 0 12px 30px rgba(220, 53, 69, 0.2);
}

.motion-image {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  border-radius: 6px;
  transition: all 0.3s ease;
}

/* Image improvement during exercise - good movement */
.motion-visual-large.exercise-active .motion-image {
  border-radius: 10px;
  filter: brightness(1.1) contrast(1.05);
}

/* Image improvement during exercise - bad movement */
.motion-visual-large.exercise-active.bad-movement .motion-image {
  border-radius: 10px;
  filter: brightness(1.1) contrast(1.1) saturate(1.2);
}

.motion-visual-large.no-image {
  font-size: 2.5rem;
  color: #666;
  font-weight: bold;
}

/* Fallback text enlargement during exercise - good movement */
.motion-visual-large.exercise-active.no-image {
  font-size: 3.5rem;
  color: #28a745;
  font-weight: bold;
}

/* Fallback text enlargement during exercise - bad movement */
.motion-visual-large.exercise-active.bad-movement.no-image {
  font-size: 3.5rem;
  color: #dc3545;
  font-weight: bold;
}

.motion-fallback {
  font-size: 2.5rem;
  color: #666;
  font-weight: bold;
  transition: all 0.3s ease;
}

/* Fallback text improvement during exercise - good movement */
.motion-visual-large.exercise-active .motion-fallback {
  font-size: 3.5rem;
  color: #28a745;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Fallback text improvement during exercise - bad movement */
.motion-visual-large.exercise-active.bad-movement .motion-fallback {
  font-size: 3.5rem;
  color: #dc3545;
  text-shadow: 0 2px 4px rgba(220, 53, 69, 0.3);
}

.motion-description-large {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.4rem;
  padding: 0.4rem 0.6rem;
  background: rgba(248, 249, 250, 0.8);
  border-radius: 5px;
  border-left: 3px solid #e9ecef;
  max-width: 250px;
  text-align: center;
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Description improvement during exercise - good movement */
.motion-description-large.exercise-active {
  font-size: 0.9rem;
  color: #333;
  margin-top: 0.6rem;
  padding: 0.6rem 0.8rem;
  background: rgba(40, 167, 69, 0.1);
  border-radius: 8px;
  border-left: 4px solid #28a745;
  max-width: 320px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* Description improvement during exercise - bad movement */
.motion-description-large.exercise-active.bad-movement {
  background: rgba(220, 53, 69, 0.1);
  border-left: 4px solid #dc3545;
  color: #721c24;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.1);
}

.exercise-status {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 10px;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
  padding: 0.8rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
  flex-shrink: 0;
}

.status-info {
  display: flex;
  gap: 0.8rem;
  align-items: center;
}

.status-item {
  text-align: center;
  background: #f8fafc;
  padding: 0.4rem 0.6rem;
  border-radius: 6px;
  min-width: 50px;
}

.status-item strong {
  display: block;
  color: #007bff;
  font-size: 0.9rem;
  font-weight: 700;
}

.status-item span {
  font-size: 0.6rem;
  color: #666;
  font-weight: 500;
}

.status-message {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.4rem 0.6rem;
  border-radius: 5px;
  background: rgba(248, 249, 250, 0.8);
  transition: all 0.3s ease;
}

.status-message.waiting {
  color: #666;
  background: rgba(248, 249, 250, 0.8);
}

.status-message.active {
  color: #28a745;
  background: rgba(40, 167, 69, 0.1);
}

/* Style for bad movements */
.status-message.bad-movement {
  color: #dc3545;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
}

/* Modal styles */
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
}

.annotation-modal {
  background: white;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  padding: 1.5rem;
  width: 90%;
  max-width: 350px;
  max-height: 90vh;
  overflow-y: auto;
}

.annotation-modal h3 {
  margin-top: 0;
  margin-bottom: 0.8rem;
  font-size: 1rem;
  color: #333;
}

.annotation-modal textarea {
  width: 100%;
  height: 60px;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.6rem;
  font-size: 0.8rem;
  margin-bottom: 0.8rem;
  resize: vertical;
  font-family: inherit;
}

.annotation-modal select {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem;
  font-size: 0.8rem;
  margin-bottom: 0.8rem;
}

.modal-actions {
  display: flex;
  gap: 0.8rem;
}

.modal-actions button {
  flex: 1;
  padding: 0.6rem;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-save {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.btn-save:hover {
  background: linear-gradient(135deg, #0056b3, #004494);
}

.btn-cancel {
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
}

.btn-cancel:hover {
  background: linear-gradient(135deg, #495057, #343a40);
}

/* Success toast */
.success-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  background: #10b981;
  color: white;
  padding: 0.8rem 1.2rem;
  border-radius: 6px;
  z-index: 10000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  font-size: 0.8rem;
  font-weight: 500;
  max-width: 250px;
  word-wrap: break-word;
  animation: slideIn 0.3s ease;
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
  .exercise-session-container {
    gap: 0.5rem;
  }

  .exercise-header {
    flex-direction: column;
    text-align: center;
    padding: 0.6rem;
  }

  .exercise-info {
    flex-direction: column;
    gap: 0.5rem;
  }

  .exercise-icon {
    width: 45px;
    height: 45px;
    font-size: 1.8rem;
  }

  .exercise-details h1 {
    font-size: 1rem;
  }

  .exercise-controls {
    width: 100%;
    justify-content: center;
    gap: 0.3rem;
  }

  .btn-exercise-action {
    padding: 0.4rem 0.6rem;
    font-size: 0.65rem;
  }

  .motion-display {
    padding: 0.6rem;
  }

  .motion-display.exercise-active {
    padding: 0.8rem;
  }

  .motion-visual-large {
    width: 120px;
    height: 120px;
    margin: 0.4rem 0;
  }

  .motion-visual-large.exercise-active {
    width: 180px;
    height: 180px;
    margin: 0.6rem 0;
  }

  .motion-visual-large.no-image {
    font-size: 2rem;
  }

  .motion-visual-large.exercise-active.no-image {
    font-size: 3rem;
  }

  .motion-visual-large.exercise-active .motion-fallback {
    font-size: 3rem;
  }

  .motion-visual-large.exercise-active.bad-movement .motion-fallback {
    font-size: 3rem;
  }

  .motion-description-large {
    font-size: 0.7rem;
    padding: 0.3rem 0.5rem;
    max-width: 200px;
  }

  .motion-description-large.exercise-active {
    font-size: 0.8rem;
    padding: 0.4rem 0.6rem;
    max-width: 250px;
  }

  .exercise-status {
    flex-direction: column;
    padding: 0.6rem;
  }

  .status-info {
    width: 100%;
    justify-content: center;
    gap: 0.6rem;
  }

  .status-item {
    padding: 0.3rem 0.5rem;
    min-width: 45px;
  }

  .status-item strong {
    font-size: 0.8rem;
  }

  .status-item span {
    font-size: 0.55rem;
  }

  .status-message {
    font-size: 0.65rem;
    padding: 0.3rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .current-exercise-page {
    padding: 0.5rem;
  }

  .exercise-header {
    padding: 0.5rem;
  }

  .exercise-icon {
    width: 40px;
    height: 40px;
    font-size: 1.6rem;
  }

  .exercise-details h1 {
    font-size: 0.9rem;
  }

  .exercise-patient {
    font-size: 0.65rem;
    padding: 0.1rem 0.4rem;
  }

  .btn-exercise-action {
    padding: 0.3rem 0.5rem;
    font-size: 0.6rem;
    gap: 0.15rem;
  }

  .motion-display {
    padding: 0.5rem;
  }

  .motion-display.exercise-active {
    padding: 0.7rem;
  }

  .motion-visual-large {
    width: 100px;
    height: 100px;
    margin: 0.3rem 0;
  }

  .motion-visual-large.exercise-active {
    width: 150px;
    height: 150px;
    margin: 0.5rem 0;
  }

  .motion-visual-large.no-image {
    font-size: 1.8rem;
  }

  .motion-visual-large.exercise-active.no-image {
    font-size: 2.5rem;
  }

  .motion-visual-large.exercise-active .motion-fallback {
    font-size: 2.5rem;
  }

  .motion-visual-large.exercise-active.bad-movement .motion-fallback {
    font-size: 2.5rem;
  }

  .motion-description-large {
    font-size: 0.65rem;
    padding: 0.25rem 0.4rem;
    max-width: 180px;
    margin-top: 0.3rem;
  }

  .motion-description-large.exercise-active {
    font-size: 0.7rem;
    padding: 0.3rem 0.5rem;
    max-width: 200px;
  }

  .exercise-status {
    padding: 0.5rem;
  }

  .status-info {
    gap: 0.5rem;
  }

  .status-item {
    padding: 0.25rem 0.4rem;
    min-width: 40px;
  }

  .status-item strong {
    font-size: 0.75rem;
  }

  .status-item span {
    font-size: 0.5rem;
  }

  .status-message {
    font-size: 0.6rem;
    padding: 0.25rem 0.4rem;
  }
}
</style>