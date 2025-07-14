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
        <h2 class="exercises-title">🎯 Movement Control Tests</h2>
        
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
          
          <!-- 1) Active cervical flexion and extension -->
          <div class="exercise-card neck-extension">
            <div class="exercise-header">
              <div class="exercise-icon">
                <img 
                  :src="getNeckExtensionImage()" 
                  alt="Active cervical flexion and extension" 
                  @error="onImageError"
                  class="exercise-image"
                >
                <span class="fallback-icon">🔵</span>
              </div>
              <div class="exercise-info">
                <h3>Active Cervical Flexion and Extension</h3>
                <span class="exercise-duration">⏱️ 2 minutes</span>
              </div>
            </div>
            
            <div class="exercise-description">
              <div class="test-position">
                <strong>Test Position:</strong> Sitting on a height-adjustable stool with no back or armrests, hands on thighs.
              </div>
              <div class="test-description">
                <strong>Test Description:</strong> The patient flexes the cervical spine so that the chin moves towards the sternum. The patient then extends the cervical spine into extension as far as possible and finally returns to the upright position.
              </div>
            </div>
            
            <div class="exercise-actions">
              <button 
                class="btn-exercise btn-start-exercise" 
                @click="startExercise('neck-extension')"
                :disabled="!patientId"
              >
                {{ patientId ? '▶️ Start Test' : '👥 Select Patient First' }}
              </button>
            </div>
          </div>

          <!-- 2) Active cervical rotation -->
          <div class="exercise-card head-rotation">
            <div class="exercise-header">
              <div class="exercise-icon">
                <img 
                  :src="getHeadRotationImage()" 
                  alt="Active cervical rotation" 
                  @error="onImageError"
                  class="exercise-image"
                >
                <span class="fallback-icon">🟢</span>
              </div>
              <div class="exercise-info">
                <h3>Active Cervical Rotation</h3>
                <span class="exercise-duration">⏱️ 2 minutes</span>
              </div>
            </div>
            
            <div class="exercise-description">
              <div class="test-position">
                <strong>Test Position:</strong> Sitting on a height-adjustable stool with no back or armrests, hands on thighs.
              </div>
              <div class="test-description">
                <strong>Test Description:</strong> The patient is asked to turn the head as far as possible to the right and back to the middle position, then to the left and back to the middle position. Then, the patient is asked to turn the head once through the whole range from the middle position to the right and to the left without stopping in the middle position, and finally to come back to the middle position. The cervical rotation should be a pure axial rotation with the eyes remaining horizontal and without moving the upper body or the shoulders.
              </div>
            </div>
            
            <div class="exercise-actions">
              <button 
                class="btn-exercise btn-start-exercise" 
                @click="startExercise('head-rotation')"
                :disabled="!patientId"
              >
                {{ patientId ? '▶️ Start Test' : '👥 Select Patient First' }}
              </button>
            </div>
          </div>

          <!-- 3) Unilateral arm flexion (180°) -->
          <div class="exercise-card unilateral-arm-flexion">
            <div class="exercise-header">
              <div class="exercise-icon">
                <img 
                  :src="getUnilateralArmFlexionImage()" 
                  alt="Unilateral arm flexion (180°)" 
                  @error="onImageError"
                  class="exercise-image"
                >
                <span class="fallback-icon">🟡</span>
              </div>
              <div class="exercise-info">
                <h3>Unilateral Arm Flexion (180°)</h3>
                <span class="exercise-duration">⏱️ 2 minutes</span>
              </div>
            </div>
            
            <div class="exercise-description">
              <div class="test-position">
                <strong>Test Position:</strong> Standing.
              </div>
              <div class="test-description">
                <strong>Test Description:</strong> The patient is asked to raise and lower the extended right arm (palm in) as far as possible while keeping the head in a neutral position. The patient is then asked to raise and lower the extended left arm in the same way.
              </div>
            </div>
            
            <div class="exercise-actions">
              <button 
                class="btn-exercise btn-start-exercise" 
                @click="startExercise('unilateral-arm-flexion')"
                :disabled="!patientId"
              >
                {{ patientId ? '▶️ Start Test' : '👥 Select Patient First' }}
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

          <!-- Custom exercises -->
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
          
          <!-- Information message -->
          <div v-if="!patientId" class="info-card">
            <div class="info-icon">ℹ️</div>
            <div class="info-content">
              <h3>Patient Selection for Movement Control Tests</h3>
              <p>You can create global tests for all patients, but to start a movement control test session, please select a specific patient first.</p>
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
  text-align: left; /* Changed from center to left for better readability */
  background: rgba(248, 250, 252, 0.8);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(203, 213, 225, 0.3);
  flex: 1;
}

.test-position {
  margin-bottom: 0.8rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid rgba(203, 213, 225, 0.4);
}

.test-description {
  margin-bottom: 0;
}

.test-position strong,
.test-description strong {
  color: #1e293b;
  font-weight: 600;
  display: block;
  margin-bottom: 0.3rem;
}

/* Enhanced button styling for exercise actions */
.exercise-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
  flex-wrap: wrap;
}

.btn-exercise {
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
}

/* Enhanced universal button styling */
.btn-exercise,
.btn-create-exercise,
.btn-back,
.btn-modal,
.btn-info-action {
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
}

/* Universal shine effect */
.btn-exercise::before,
.btn-create-exercise::before,
.btn-back::before,
.btn-modal::before,
.btn-info-action::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  transition: left 0.6s ease;
}

.btn-exercise:hover::before,
.btn-create-exercise:hover::before,
.btn-back:hover::before,
.btn-modal:hover::before,
.btn-info-action:hover::before {
  left: 100%;
}

/* Enhanced Start Test button */
.btn-start-exercise {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  flex: 1;
  min-width: 160px;
}

.btn-start-exercise:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* Enhanced Create Exercise button */
.btn-create-exercise {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  min-width: auto;
  padding: 0.8rem 1.2rem;
}

.btn-create-exercise:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

/* Enhanced Back button */
.btn-back {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
  min-width: auto;
  padding: 0.8rem 1.2rem;
}

.btn-back:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
  color: white;
}

/* Enhanced Delete button */
.btn-delete-exercise {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  flex: 0 0 auto;
  min-width: auto;
  padding: 0.8rem 1rem;
}

.btn-delete-exercise:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
}

/* Enhanced Modal buttons */
.btn-modal {
  min-width: 120px;
  padding: 0.8rem 1.2rem;
}

.btn-cancel {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  color: white;
}

.btn-cancel:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(108, 117, 125, 0.4);
  background: linear-gradient(135deg, #495057 0%, #343a40 100%);
}

.btn-create {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-create:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
}

.btn-create:disabled {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #64748b;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Enhanced Info Action button */
.btn-info-action {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  padding: 0.8rem 1.5rem;
  min-width: auto;
}

.btn-info-action:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 25px rgba(14, 165, 233, 0.4);
  background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
  color: white;
}

/* Enhanced disabled state for Start Test button */
.btn-start-exercise:disabled {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  color: #64748b;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 2px solid #f1f5f9;
}

.btn-start-exercise:disabled::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 2px,
    rgba(148, 163, 184, 0.1) 2px,
    rgba(148, 163, 184, 0.1) 4px
  );
  pointer-events: none;
}

.btn-start-exercise:disabled:hover {
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  transform: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Universal active state */
.btn-exercise:active:not(:disabled),
.btn-create-exercise:active,
.btn-back:active,
.btn-modal:active:not(:disabled),
.btn-info-action:active {
  transform: translateY(0) scale(0.98);
  transition: all 0.1s ease;
}

/* Universal ripple effect */
.btn-exercise:not(:disabled),
.btn-create-exercise,
.btn-back,
.btn-modal:not(:disabled),
.btn-info-action {
  position: relative;
  overflow: hidden;
}

.btn-exercise:not(:disabled):active::after,
.btn-create-exercise:active::after,
.btn-back:active::after,
.btn-modal:not(:disabled):active::after,
.btn-info-action:active::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  animation: ripple 0.6s ease-out;
}

@keyframes ripple {
  to {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

/* Universal focus states */
.btn-exercise:focus,
.btn-create-exercise:focus,
.btn-back:focus,
.btn-modal:focus,
.btn-info-action:focus {
  outline: 3px solid rgba(59, 130, 246, 0.5);
  outline-offset: 2px;
}

.btn-start-exercise:disabled:focus {
  outline: 3px solid rgba(148, 163, 184, 0.5);
}

/* Tooltip for disabled Start Test button */
.btn-start-exercise:disabled:hover::after {
  content: "Please select a patient from the Patients page first";
  position: absolute;
  bottom: 120%;
  left: 50%;
  transform: translateX(-50%);
  background: #1f2937;
  color: white;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 1000;
  opacity: 0;
  animation: fadeInTooltip 0.3s ease forwards;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-start-exercise:disabled:hover::before {
  content: "";
  position: absolute;
  bottom: 110%;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #1f2937;
  z-index: 1000;
  opacity: 0;
  animation: fadeInTooltip 0.3s ease forwards;
}

@keyframes fadeInTooltip {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Loading state for all buttons */
.btn-exercise.loading,
.btn-create-exercise.loading,
.btn-modal.loading {
  color: transparent;
}

.btn-exercise.loading::after,
.btn-create-exercise.loading::after,
.btn-modal.loading::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive design for all buttons */
@media (max-width: 768px) {
  .exercise-actions {
    flex-direction: column;
    gap: 0.6rem;
  }
  
  .btn-exercise,
  .btn-create-exercise,
  .btn-back,
  .btn-modal {
    padding: 0.9rem 1rem;
    font-size: 0.8rem;
    min-width: auto;
    width: 100%;
  }
  
  .btn-delete-exercise {
    width: 100%;
    min-width: auto;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .btn-exercise,
  .btn-create-exercise,
  .btn-back,
  .btn-modal {
    padding: 0.8rem 0.9rem;
    font-size: 0.75rem;
    gap: 0.4rem;
  }
}

/* Enhanced Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 500px;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem;
  border-bottom: 1px solid #eee;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-radius: 12px 12px 0 0;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #aaa;
  padding: 0.2rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  color: #333;
  background: rgba(0,0,0,0.1);
}

.modal-body {
  padding: 1.2rem;
}

.modal-footer {
  display: flex;
  gap: 0.8rem;
  justify-content: flex-end;
  padding: 1.2rem;
  border-top: 1px solid #eee;
  background: #f8fafc;
  border-radius: 0 0 12px 12px;
}

/* Form styles */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

/* Info banners */
.info-banner {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 0.8rem;
  font-size: 0.85rem;
}

.global-info {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #047857;
}

.patient-info {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #1d4ed8;
}

.info-icon {
  font-size: 1.2rem;
}

/* Info card */
.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid rgba(14, 165, 233, 0.2);
  border-radius: 12px;
  text-align: left;
}

.info-card .info-icon {
  font-size: 2rem;
  color: #0ea5e9;
}

.info-content h3 {
  margin: 0 0 0.5rem 0;
  color: #0c4a6e;
  font-size: 1.1rem;
}

.info-content p {
  margin: 0 0 1rem 0;
  color: #075985;
  line-height: 1.5;
}

/* ...rest of existing styles... */
</style>