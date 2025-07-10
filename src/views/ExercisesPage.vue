<!-- filepath: src/views/ExercisesPage.vue -->
<template>
  <div class="exercises-page">
    <div class="exercises-container">
      <div class="exercises-header">
        <!-- Conditional display based on patient presence -->
        <div v-if="patientId" class="patient-info-header">
          <div v-if="patient?.photo" class="patient-avatar">
            <img :src="patient.photo" :alt="`${patient.firstName} ${patient.lastName}`" class="patient-avatar-img">
          </div>
          <div v-else class="patient-avatar-placeholder">
            👤
          </div>
          <div class="patient-details">
            <h2>{{ patient ? `${patient.firstName} ${patient.lastName}` : 'Loading...' }}</h2>
            <div class="patient-id-badge">ID: {{ patientId }}</div>
          </div>
        </div>
        
        <!-- Generic display when no patient selected -->
        <div v-else class="general-info-header">
          <div class="general-icon">🎯</div>
          <div class="general-details">
            <h2>Exercise Library</h2>
            <div class="general-subtitle">Available exercises for all patients</div>
          </div>
        </div>
        
        <div class="header-actions">
          <!-- Create button - now always available -->
          <button 
            class="btn-create-exercise" 
            @click="showCreateModal = true"
          >
            ➕ Create New Exercise
          </button>
          
          <!-- Adaptive back button -->
          <router-link 
            :to="patientId ? '/patients' : '/patients'" 
            class="btn-back"
          >
            ← Back to Patients
          </router-link>
        </div>
      </div>

      <div class="exercises-content">
        <h2 class="exercises-title">🎯 Available Exercises</h2>
        
        <!-- Loading state only if waiting for patient data -->
        <div v-if="patientId && !patient" class="loading-state">
          <p>Loading patient information...</p>
        </div>
        
        <!-- Error state only if patient expected but not found -->
        <div v-else-if="patientId && !patient" class="error-state">
          <p>Patient not found</p>
        </div>
        
        <!-- Exercises always displayed -->
        <div class="exercises-grid">
          <!-- Default exercises - always visible -->
          <!-- Neck Extension Exercise -->
          <div class="exercise-card neck-extension">
            <div class="exercise-header">
              <div class="exercise-icon">
                <img 
                  :src="getNeckExtensionImage()" 
                  alt="Neck Extension" 
                  @error="onImageError"
                  class="exercise-image"
                >
                <span class="fallback-icon">🔵</span>
              </div>
              <div class="exercise-info">
                <h3>Neck Extension</h3>
                <span class="exercise-duration">⏱️ 2 minutes</span>
              </div>
            </div>
            
            <div class="exercise-description">
              Improve neck mobility and strengthen posterior neck muscles through controlled extension movements with real-time motion tracking and automated performance analysis.
            </div>
            
            <div class="exercise-actions">
              <button 
                class="btn-exercise btn-start-exercise" 
                @click="startExercise('neck-extension')"
                :disabled="!patientId"
              >
                {{ patientId ? '▶️ Start Exercise' : '👥 Select Patient First' }}
              </button>
            </div>
          </div>

          <!-- Head Rotation Exercise -->
          <div class="exercise-card head-rotation">
            <div class="exercise-header">
              <div class="exercise-icon">
                <img 
                  :src="getHeadRotationImage()" 
                  alt="Head Rotation" 
                  @error="onImageError"
                  class="exercise-image"
                >
                <span class="fallback-icon">🟢</span>
              </div>
              <div class="exercise-info">
                <h3>Head Rotation</h3>
                <span class="exercise-duration">⏱️ 2 minutes</span>
              </div>
            </div>
            
            <div class="exercise-description">
              Enhance cervical rotation mobility and improve neck flexibility through controlled rotational movements with motion guidance and automatic good/bad movement detection.
            </div>
            
            <div class="exercise-actions">
              <button 
                class="btn-exercise btn-start-exercise" 
                @click="startExercise('head-rotation')"
                :disabled="!patientId"
              >
                {{ patientId ? '▶️ Start Exercise' : '👥 Select Patient First' }}
              </button>
            </div>
          </div>

          <!-- Unilateral Arm Flexion Exercise - Updated duration -->
          <div class="exercise-card unilateral-arm-flexion">
            <div class="exercise-header">
              <div class="exercise-icon">
                <img 
                  :src="getUnilateralArmFlexionImage()" 
                  alt="Unilateral Arm Flexion" 
                  @error="onImageError"
                  class="exercise-image"
                >
                <span class="fallback-icon">🟡</span>
              </div>
              <div class="exercise-info">
                <h3>Unilateral Arm Flexion</h3>
                <span class="exercise-duration">⏱️ 2 minutes</span>
              </div>
            </div>
            
            <div class="exercise-description">
              Strengthen arm and shoulder muscles through controlled unilateral flexion movements. This exercise focuses on improving upper limb mobility, coordination, and muscle strength with precise motion tracking and real-time feedback.
            </div>
            
            <div class="exercise-actions">
              <button 
                class="btn-exercise btn-start-exercise" 
                @click="startExercise('unilateral-arm-flexion')"
                :disabled="!patientId"
              >
                {{ patientId ? '▶️ Start Exercise' : '👥 Select Patient First' }}
              </button>
            </div>
          </div>

          <!-- Global exercises - always visible -->
          <div 
            v-for="exercise in globalExercises" 
            :key="exercise.id"
            class="exercise-card global-exercise"
          >
            <div class="exercise-header">
              <div class="exercise-icon">
                <img 
                  v-if="exercise.image"
                  :src="exercise.image" 
                  :alt="exercise.name" 
                  @error="onImageError"
                  class="exercise-image"
                >
                <span class="fallback-icon">🌟</span>
              </div>
              <div class="exercise-info">
                <h3>{{ exercise.name }}</h3>
                <span class="exercise-duration">⏱️ {{ exercise.duration }} minutes</span>
                <span class="exercise-type-badge">Global</span>
              </div>
            </div>
            
            <div class="exercise-description">
              {{ exercise.description }}
            </div>
            
            <div class="exercise-actions">
              <button 
                class="btn-exercise btn-start-exercise" 
                @click="startExercise(exercise.id)"
                :disabled="!patientId"
              >
                {{ patientId ? '▶️ Start Exercise' : '👥 Select Patient First' }}
              </button>
              <button class="btn-exercise btn-delete-exercise" @click="deleteGlobalExercise(exercise.id)">
                🗑️ Delete
              </button>
            </div>
          </div>

          <!-- Custom exercises - only if patient selected -->
          <div 
            v-if="patientId"
            v-for="exercise in customExercises" 
            :key="exercise.id"
            class="exercise-card custom-exercise"
          >
            <div class="exercise-header">
              <div class="exercise-icon">
                <img 
                  v-if="exercise.image"
                  :src="exercise.image" 
                  :alt="exercise.name" 
                  @error="onImageError"
                  class="exercise-image"
                >
                <span class="fallback-icon">🎯</span>
              </div>
              <div class="exercise-info">
                <h3>{{ exercise.name }}</h3>
                <span class="exercise-duration">⏱️ {{ exercise.duration }} minutes</span>
                <span class="exercise-type-badge">Patient-specific</span>
              </div>
            </div>
            
            <div class="exercise-description">
              {{ exercise.description }}
            </div>
            
            <div class="exercise-actions">
              <button class="btn-exercise btn-start-exercise" @click="startExercise(exercise.id)">
                ▶️ Start Exercise
              </button>
              <button class="btn-exercise btn-delete-exercise" @click="deleteExercise(exercise.id)">
                🗑️ Delete
              </button>
            </div>
          </div>
          
          <!-- Information message if no patient selected -->
          <div v-if="!patientId" class="info-card">
            <div class="info-icon">ℹ️</div>
            <div class="info-content">
              <h3>Patient Selection for Exercise Execution</h3>
              <p>You can create global exercises for all patients, but to start an exercise session, please select a specific patient first.</p>
              <router-link to="/patients" class="btn-info-action">
                👥 Go to Patients
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Exercise Modal - now always available -->
    <div v-if="showCreateModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>➕ Create New Exercise</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        
        <div class="modal-body">
          <!-- Exercise type selector -->
          <div class="form-group">
            <label for="exercise-type">Exercise Type *</label>
            <select 
              id="exercise-type"
              v-model="newExercise.type"
              class="form-input"
              required
            >
              <option value="global">Global Exercise (Available for all patients)</option>
              <option value="patient" :disabled="!patientId">Patient-specific Exercise {{ !patientId ? '(Select a patient first)' : '' }}</option>
            </select>
          </div>

          <div class="form-group">
            <label for="exercise-name">Exercise Name *</label>
            <input 
              id="exercise-name"
              v-model="newExercise.name"
              type="text" 
              placeholder="Enter exercise name"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="exercise-duration">Duration (minutes) *</label>
            <input 
              id="exercise-duration"
              v-model="newExercise.duration"
              type="number" 
              min="1"
              max="60"
              placeholder="Enter duration in minutes"
              class="form-input"
              required
            >
          </div>
          
          <div class="form-group">
            <label for="exercise-image">Exercise Image</label>
            <input 
              id="exercise-image"
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="form-input-file"
            >
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Preview" class="preview-image">
              <button @click="removeImage" class="remove-image">✕</button>
            </div>
          </div>
          
          <div class="form-group">
            <label for="exercise-description">Description *</label>
            <textarea 
              id="exercise-description"
              v-model="newExercise.description"
              placeholder="Enter detailed description of the exercise"
              class="form-textarea"
              rows="4"
              required
            ></textarea>
          </div>

          <!-- Information display based on type -->
          <div v-if="newExercise.type === 'global'" class="info-banner global-info">
            <span class="info-icon">🌟</span>
            <div class="info-text">
              <strong>Global Exercise:</strong> This exercise will be available for all patients in the system.
            </div>
          </div>
          
          <div v-else-if="newExercise.type === 'patient'" class="info-banner patient-info">
            <span class="info-icon">👤</span>
            <div class="info-text">
              <strong>Patient-specific Exercise:</strong> This exercise will only be available for {{ patient?.firstName }} {{ patient?.lastName }}.
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn-modal btn-cancel" @click="closeModal">
            Cancel
          </button>
          <button 
            class="btn-modal btn-create" 
            @click="createExercise"
            :disabled="!isFormValid"
          >
            Create Exercise
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Reactive state
const patient = ref(null)
const patientId = computed(() => route.params.patientId || null)
const customExercises = ref([])
const globalExercises = ref([])
const showCreateModal = ref(false)
const imagePreview = ref(null)

// New exercise data
const newExercise = ref({
  type: 'global', // 'global' or 'patient'
  name: '',
  duration: 5,
  description: '',
  image: null
})

// Form validation
const isFormValid = computed(() => {
  return newExercise.value.name.trim() !== '' &&
         newExercise.value.duration > 0 &&
         newExercise.value.description.trim() !== '' &&
         newExercise.value.type !== ''
})

// Load patient information
const loadPatientInfo = () => {
  if (!patientId.value) {
    console.log('No patient ID - showing general exercises page')
    patient.value = null
    return
  }

  try {
    const stored = localStorage.getItem('nordic-thingy-patients')
    const patients = stored ? JSON.parse(stored) : []
    
    patient.value = patients.find(p => p.id === patientId.value)
    
    if (!patient.value) {
      console.error('Patient not found:', patientId.value)
    }
  } catch (error) {
    console.error('Error loading patient data:', error)
  }
}

// Load global exercises
const loadGlobalExercises = () => {
  try {
    const stored = localStorage.getItem('global-exercises')
    globalExercises.value = stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading global exercises:', error)
    globalExercises.value = []
  }
}

// Save global exercises
const saveGlobalExercises = () => {
  try {
    localStorage.setItem('global-exercises', JSON.stringify(globalExercises.value))
  } catch (error) {
    console.error('Error saving global exercises:', error)
  }
}

// Load custom exercises
const loadCustomExercises = () => {
  if (!patientId.value) {
    customExercises.value = []
    return
  }

  try {
    const stored = localStorage.getItem(`custom-exercises-${patientId.value}`)
    customExercises.value = stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error loading custom exercises:', error)
    customExercises.value = []
  }
}

// Save custom exercises
const saveCustomExercises = () => {
  if (!patientId.value) return

  try {
    localStorage.setItem(`custom-exercises-${patientId.value}`, JSON.stringify(customExercises.value))
  } catch (error) {
    console.error('Error saving custom exercises:', error)
  }
}

// Image helper functions
const getNeckExtensionImage = () => {
  try {
    return new URL('../assets/NeckExtension.png', import.meta.url).href
  } catch {
    return ''
  }
}

const getHeadRotationImage = () => {
  try {
    return new URL('../assets/HeadRotation.PNG', import.meta.url).href
  } catch {
    return ''
  }
}

// NEW: Add image helper for Unilateral Arm Flexion
const getUnilateralArmFlexionImage = () => {
  try {
    return new URL('../assets/UnilateralArmFlexion.png', import.meta.url).href
  } catch {
    return ''
  }
}

const onImageError = (event) => {
  console.warn('Image not found:', event.target.src)
  event.target.style.display = 'none'
  const fallback = event.target.nextElementSibling
  if (fallback && fallback.classList.contains('fallback-icon')) {
    fallback.style.display = 'flex'
  }
}

// Image upload handling
const handleImageUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target.result
      newExercise.value.image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeImage = () => {
  imagePreview.value = null
  newExercise.value.image = null
}

// Modal management
const closeModal = () => {
  showCreateModal.value = false
  resetForm()
}

const resetForm = () => {
  newExercise.value = {
    type: 'global',
    name: '',
    duration: 5,
    description: '',
    image: null
  }
  imagePreview.value = null
}

// Create new exercise
const createExercise = () => {
  if (!isFormValid.value) {
    alert('Please fill in all required fields')
    return
  }

  const exercise = {
    id: `${newExercise.value.type}-${Date.now()}`,
    name: newExercise.value.name.trim(),
    duration: parseInt(newExercise.value.duration),
    description: newExercise.value.description.trim(),
    image: newExercise.value.image,
    createdAt: new Date().toISOString(),
    type: newExercise.value.type
  }

  if (newExercise.value.type === 'global') {
    globalExercises.value.push(exercise)
    saveGlobalExercises()
    console.log('Global exercise created:', exercise)
    alert(`Global exercise "${exercise.name}" created successfully!`)
  } else {
    if (!patientId.value) {
      alert('Patient selection required for patient-specific exercises')
      return
    }
    exercise.patientId = patientId.value
    customExercises.value.push(exercise)
    saveCustomExercises()
    console.log('Patient-specific exercise created:', exercise)
    alert(`Patient-specific exercise "${exercise.name}" created successfully!`)
  }
  
  closeModal()
}

// Delete custom exercise
const deleteExercise = (exerciseId) => {
  const exercise = customExercises.value.find(ex => ex.id === exerciseId)
  if (exercise && confirm(`Are you sure you want to delete "${exercise.name}"?`)) {
    customExercises.value = customExercises.value.filter(ex => ex.id !== exerciseId)
    saveCustomExercises()
    console.log('Patient-specific exercise deleted:', exerciseId)
  }
}

// Delete global exercise
const deleteGlobalExercise = (exerciseId) => {
  const exercise = globalExercises.value.find(ex => ex.id === exerciseId)
  if (exercise && confirm(`Are you sure you want to delete the global exercise "${exercise.name}"? This will affect all patients.`)) {
    globalExercises.value = globalExercises.value.filter(ex => ex.id !== exerciseId)
    saveGlobalExercises()
    console.log('Global exercise deleted:', exerciseId)
  }
}

// Start exercise session
const startExercise = (exerciseType) => {
  if (!patientId.value) {
    alert('Please select a patient first to start an exercise')
    router.push('/patients')
    return
  }
  
  console.log(`Starting ${exerciseType} exercise for patient ${patientId.value}`)
  
  // Create new exercise session
  const session = {
    id: `session-${Date.now()}`,
    patientId: patientId.value,
    exerciseType: exerciseType,
    date: new Date().toISOString(),
    status: 'started',
    startTime: new Date().toISOString()
  }
  
  // Save session
  const sessions = JSON.parse(localStorage.getItem('exercise-sessions') || '[]')
  sessions.push(session)
  localStorage.setItem('exercise-sessions', JSON.stringify(sessions))
  
  // Navigate to exercise page
  router.push(`/exercise/${exerciseType}/${patientId.value}`)
}

// Initialize component
onMounted(() => {
  loadPatientInfo()
  loadCustomExercises()
  loadGlobalExercises()
})
</script>

<style scoped>
.exercises-page {
  width: 100%;
  padding: 2rem;
  height: auto;
}

.exercises-container {
  display: flex;
  flex-direction: column;
  max-width: 1200px;
  margin: 0 auto;
  gap: 0.8rem;
}

.exercises-header {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
  flex-shrink: 0;
}

.patient-info-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

/* New style for generic header */
.general-info-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.general-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 2rem;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.general-details h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.2rem 0;
}

.general-subtitle {
  font-size: 0.8rem;
  color: #64748b;
  background: rgba(102, 126, 234, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  display: inline-block;
  font-weight: 500;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.patient-avatar,
.patient-avatar-placeholder {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  overflow: hidden;
  font-size: 1.5rem;
  color: #64748b;
  border: 3px solid rgba(255, 255, 255, 0.8);
}

.patient-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.patient-details h2 {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.2rem 0;
}

.patient-id-badge {
  font-size: 0.8rem;
  color: #64748b;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  display: inline-block;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.header-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-create-exercise {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 3px 12px rgba(16, 185, 105, 0.2);
}

.btn-back {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #6c757d, #495057);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 3px 12px rgba(108, 117, 125, 0.2);
}

.btn-create-exercise:hover,
.btn-back:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
}

.exercises-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: visible;
}

.exercises-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
  text-align: center;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 1.1rem;
  text-align: center;
}

.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
  overflow: visible;
  padding-right: 0;
}

.exercise-card {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px;
  padding: 1.2rem;
  border-left: 4px solid #10b981;
  box-shadow: 0 6px 24px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  height: auto;
}

.exercise-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(0,0,0,0.12);
}

.exercise-card.head-rotation {
  border-left-color: #3b82f6;
}

.exercise-card.custom-exercise {
  border-left-color: #8b5cf6;
}

.exercise-card.global-exercise {
  border-left-color: #f59e0b;
}

.exercise-card.unilateral-arm-flexion {
  border-left-color: #f59e0b; /* Orange/yellow border */
}

.exercise-header {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-shrink: 0;
}

.exercise-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ffffff, #f8fafc);
  box-shadow: 0 4px 16px rgba(0,0,0,0.12);
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.8);
  overflow: hidden;
  position: relative;
}

.exercise-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.fallback-icon {
  font-size: 2.2rem;
  color: #64748b;
  display: none;
}

.exercise-info {
  flex: 1;
}

.exercise-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.3rem 0;
  letter-spacing: -0.025em;
}

.exercise-duration {
  font-size: 0.8rem;
  color: #64748b;
  background: rgba(59, 130, 246, 0.1);
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  display: inline-block;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.2);
  margin-right: 0.5rem;
}

.exercise-type-badge {
  font-size: 0.75rem;
  color: #374151;
  background: rgba(156, 163, 175, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  display: inline-block;
  font-weight: 500;
  border: 1px solid rgba(156, 163, 175, 0.2);
}

.exercise-description {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.5;
  text-align: center;
  background: rgba(248, 250, 252, 0.8);
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid rgba(203, 213, 225, 0.3);
  flex: 1;
}

.exercise-actions {
  display: flex;
  gap: 0.6rem;
  margin-top: auto;
  flex-shrink: 0;
}

.btn-exercise {
  flex: 1;
  padding: 0.8rem 1rem;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 3px 12px rgba(0,0,0,0.1);
}

.btn-start-exercise {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-start-exercise:disabled {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: #d1d5db;
  cursor: not-allowed;
  transform: none;
}

.btn-delete-exercise {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  flex: 0 0 auto;
}

.btn-exercise:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

/* New information card */
.info-card {
  background: linear-gradient(135deg, #e0f2fe, #f0f9ff);
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #0ea5e9;
  display: flex;
  align-items: center;
  gap: 1rem;
  text-align: left;
  grid-column: 1 / -1;
}

.info-icon {
  font-size: 2.5rem;
  flex-shrink: 0;
}

.info-content h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0c4a6e;
  margin: 0 0 0.5rem 0;
}

.info-content p {
  font-size: 0.9rem;
  color: #0369a1;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.btn-info-action {
  padding: 0.6rem 1.2rem;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 3px 12px rgba(14, 165, 233, 0.2);
}

.btn-info-action:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(14, 165, 233, 0.3);
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f1f5f9;
  color: #334155;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.2rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #f9fafb;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background: white;
}

.form-input-file {
  width: 100%;
  padding: 0.75rem;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  background: #f8fafc;
  cursor: pointer;
  font-size: 0.9rem;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input-file:hover {
  border-color: #3b82f6;
}

.image-preview {
  margin-top: 1rem;
  position: relative;
  display: inline-block;
}

.preview-image {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.remove-image {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Information banners */
.info-banner {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  border: 1px solid;
}

.global-info {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.3);
  color: #92400e;
}

.patient-info {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #1e40af;
}

.info-banner .info-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-banner .info-text {
  font-size: 0.85rem;
  line-height: 1.4;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
}

.btn-modal {
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-create {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 3px 12px rgba(16, 185, 129, 0.2);
}

.btn-create:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(16, 185, 129, 0.3);
}

.btn-create:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .exercises-grid {
    grid-template-columns: 1fr;
    gap: 0.8rem;
  }
  
  .exercise-card {
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .exercises-container {
    gap: 0.6rem;
  }

  .exercises-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0.8rem;
    gap: 0.6rem;
  }

  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
  }

  .btn-create-exercise,
  .btn-back {
    width: 100%;
    justify-content: center;
  }

  .patient-info-header,
  .general-info-header {
    flex-direction: column;
    gap: 0.5rem;
  }

  .patient-avatar,
  .patient-avatar-placeholder,
  .general-icon {
    width: 45px;
    height: 45px;
    font-size: 1.1rem;
  }

  .patient-details h2,
  .general-details h2 {
    font-size: 1.1rem;
    text-align: center;
  }

  .exercises-content {
    padding: 1rem;
  }

  .exercises-title {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }

  .exercises-grid {
    gap: 0.8rem;
  }

  .exercise-card {
    padding: 1rem;
    gap: 0.6rem;
  }

  .exercise-header {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .exercise-icon {
    width: 50px;
    height: 50px;
  }

  .fallback-icon {
    font-size: 1.8rem;
  }

  .exercise-info h3 {
    font-size: 1.1rem;
    text-align: center;
  }

  .exercise-description {
    font-size: 0.8rem;
    padding: 0.6rem;
  }

  .btn-exercise {
    padding: 0.7rem 0.8rem;
    font-size: 0.75rem;
  }

  .exercise-actions {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }

  .info-card {
    flex-direction: column;
    text-align: center;
    padding: 1.2rem;
  }

  .info-icon {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .exercises-content {
    padding: 0.8rem;
  }

  .exercise-card {
    padding: 0.8rem;
    gap: 0.5rem;
  }

  .exercises-title {
    font-size: 1.1rem;
    margin-bottom: 0.6rem;
  }

  .exercise-info h3 {
    font-size: 1rem;
  }

  .exercise-description {
    font-size: 0.75rem;
    padding: 0.5rem;
    line-height: 1.4;
  }

  .btn-exercise {
    padding: 0.6rem 0.7rem;
    font-size: 0.7rem;
  }

  .exercise-icon {
    width: 40px;
    height: 40px;
  }

  .fallback-icon {
    font-size: 1.5rem;
  }

  .exercise-duration {
    font-size: 0.7rem;
    padding: 0.2rem 0.6rem;
  }

  .exercise-type-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.5rem;
  }

  .patient-id-badge,
  .general-subtitle {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }

  .btn-create-exercise,
  .btn-back {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }
}
</style>